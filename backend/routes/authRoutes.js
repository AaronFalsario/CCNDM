import { Router } from 'express';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import nodemailer from 'nodemailer';
import { supabase } from '../config/db.js';
import { COOKIE_NAME, getJwtSecret, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
const PASSWORD_ROUNDS = 12;
const SESSION_HOURS = 12;
const REMEMBER_DAYS = 7;

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Please wait and try again.' },
});

function cookieOptions(remember) {
  const maxAge = remember
    ? REMEMBER_DAYS * 24 * 60 * 60 * 1000
    : SESSION_HOURS * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge,
  };
}

function safeProfile(profile, role) {
  if (role === 'student') {
    return {
      id: String(profile.id),
      student_id_number: profile.student_id_number,
      email: profile.email,
      name: profile.name,
      course: profile.course || '',
      year_level: profile.year_level || '',
      status: profile.status || 'active',
      role,
      account_type: role,
    };
  }

  return {
    id: String(profile.id),
    admin_id: profile.admin_id,
    full_name: profile.full_name,
    email: profile.email,
    role: profile.role || 'Discipline Officer',
    account_type: role,
    status: profile.status,
  };
}

function setSession(res, profile, role, remember) {
  const expiresIn = remember ? `${REMEMBER_DAYS}d` : `${SESSION_HOURS}h`;
  const token = jwt.sign(
    { role, sv: profile.session_version },
    getJwtSecret(),
    {
      subject: String(profile.id),
      issuer: 'ccndm-backend',
      expiresIn,
    }
  );

  res.cookie(COOKIE_NAME, token, cookieOptions(remember));
}

function passwordMatches(password, storedPassword) {
  if (typeof storedPassword !== 'string' || !storedPassword) return false;
  if (/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
    return bcrypt.compare(password, storedPassword);
  }
  return Promise.resolve(password === storedPassword);
}

function isInactive(profile) {
  return ['inactive', 'suspended'].includes(String(profile.status || '').toLowerCase());
}

function hashResetToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

// NEW: Helper to generate a secure confirmation token
function generateConfirmationToken() {
  return randomBytes(32).toString('base64url');
}

function mailTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass || !process.env.SMTP_FROM) {
    throw new Error('Email is not configured.');
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    Number(process.env.SMTP_PORT) &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM &&
    process.env.FRONTEND_URL
  );
}

function respondWithError(res, status, message) {
  return res.status(status).json({ message });
}

router.post('/student/login', loginLimiter, async (req, res, next) => {
  const studentId = String(req.body?.studentId || '').trim();
  const password = req.body?.password;
  if (!/^\d{8}$/.test(studentId) || typeof password !== 'string' || !password) {
    return respondWithError(res, 400, 'Enter a valid Student ID and password.');
  }
  if (!supabase) return respondWithError(res, 503, 'Authentication service is not configured.');

  try {
    const { data: profile, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id_number', studentId)
      .maybeSingle();

    if (error) return next(error);
    if (!profile || isInactive(profile)) {
      return respondWithError(res, 401, 'Invalid Student ID or password.');
    }

    const matches = await passwordMatches(password, profile.password);
    if (!matches) return respondWithError(res, 401, 'Invalid Student ID or password.');

    // NEW: Check if the student has confirmed their email
    if (!profile.email_confirmed) {
      return respondWithError(res, 403, 'Please confirm your email address before logging in. Check your inbox for the link.');
    }

    if (!/^\$2[aby]\$\d{2}\$/.test(profile.password)) {
      const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
      const { error: hashError } = await supabase
        .from('students')
        .update({ password: passwordHash })
        .eq('id', profile.id);
      if (hashError) return next(hashError);
    }

    const { error: updateError } = await supabase
      .from('students')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id);
    if (updateError) return next(updateError);

    setSession(res, profile, 'student', Boolean(req.body?.remember));
    return res.json({ user: safeProfile(profile, 'student') });
  } catch (error) {
    return next(error);
  }
});

router.post('/admin/login', loginLimiter, async (req, res, next) => {
  const username = String(req.body?.username || '').trim();
  const password = req.body?.password;
  if (!username || typeof password !== 'string' || !password) {
    return respondWithError(res, 400, 'Enter your administrator ID/email and password.');
  }
  if (!supabase) return respondWithError(res, 503, 'Authentication service is not configured.');

  try {
    let { data: profile, error } = await supabase
      .from('admins')
      .select('*')
      .eq('admin_id', username)
      .maybeSingle();

    if (error) return next(error);
    if (!profile) {
      ({ data: profile, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', username.toLowerCase())
        .maybeSingle());
      if (error) return next(error);
    }

    if (!profile || String(profile.status || '').toLowerCase() !== 'active') {
      return respondWithError(res, 401, 'Invalid administrator credentials.');
    }

    const matches = await passwordMatches(password, profile.password_hash);
    if (!matches) return respondWithError(res, 401, 'Invalid administrator credentials.');

    if (!/^\$2[aby]\$\d{2}\$/.test(profile.password_hash)) {
      const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
      const { error: hashError } = await supabase
        .from('admins')
        .update({ password_hash: passwordHash })
        .eq('id', profile.id);
      if (hashError) return next(hashError);
    }

    const { error: updateError } = await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id);
    if (updateError) return next(updateError);

    setSession(res, profile, 'admin', Boolean(req.body?.remember));
    return res.json({ user: safeProfile(profile, 'admin') });
  } catch (error) {
    return next(error);
  }
});

router.post('/student/register', loginLimiter, async (req, res, next) => {
  const studentId = String(req.body?.studentId || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = req.body?.password;

  if (!/^\d{8}$/.test(studentId) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respondWithError(res, 400, 'Enter your valid Student ID and school email.');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return respondWithError(res, 400, 'Password must be between 8 and 128 characters.');
  }
  if (!supabase) return respondWithError(res, 503, 'Authentication service is not configured.');
  
  // NEW: Ensure mail is configured before allowing registration
  if (!isMailConfigured()) {
    return respondWithError(res, 503, 'Registration is temporarily unavailable (email not configured).');
  }

  try {
    const { data: profile, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id_number', studentId)
      .maybeSingle();

    if (error) return next(error);
    const suppliedName = String(req.body?.name || '').trim().toLowerCase();
    if (
      !profile ||
      String(profile.email || '').trim().toLowerCase() !== email ||
      String(profile.name || '').trim().toLowerCase() !== suppliedName ||
      isInactive(profile)
    ) {
      return respondWithError(res, 403, 'No eligible student profile matches those details. Contact an administrator.');
    }
    if (profile.password) {
      return respondWithError(res, 409, 'This student profile is already registered. Sign in or contact an administrator.');
    }

    // NEW: Generate a confirmation token
    const confirmationToken = generateConfirmationToken();
    const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);
    
    let claim = supabase
      .from('students')
      .update({ 
        password: passwordHash, 
        updated_at: new Date().toISOString(),
        confirmation_token: confirmationToken, // Save token
        email_confirmed: false                 // Ensure it defaults to false
      })
      .eq('id', profile.id);
      
    claim = profile.password === null
      ? claim.is('password', null)
      : claim.eq('password', '');

    const { data: claimed, error: updateError } = await claim.select('id').maybeSingle();
    if (updateError) return next(updateError);
    if (!claimed) {
      return respondWithError(res, 409, 'This student profile is already registered. Sign in or contact an administrator.');
    }

    // NEW: Send the confirmation email
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
    const confirmUrl = `${frontendUrl}/student/confirm-email?token=${encodeURIComponent(confirmationToken)}`;

    try {
      await mailTransport().sendMail({
        from: process.env.SMTP_FROM,
        to: profile.email,
        subject: 'CCNDM - Confirm Your Student Account',
        text: `Hello ${profile.name},\n\nPlease confirm your email address by clicking the link below. This link expires in 24 hours:\n\n${confirmUrl}\n\nIf you did not register for CCNDM, please ignore this email.`,
      });
    } catch (mailError) {
      console.error('[registration email]', mailError);
      return respondWithError(res, 500, 'Account created, but we could not send the confirmation email. Please contact support.');
    }

    // IMPORTANT: Do NOT setSession() here. They must confirm email first.
    return res.status(201).json({ 
      message: 'Account claimed successfully. Please check your email to confirm your account before logging in.',
      requiresConfirmation: true 
    });

  } catch (error) {
    return next(error);
  }
});

// NEW: Route to handle the link click from the email
router.post('/student/confirm-email', loginLimiter, async (req, res, next) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return respondWithError(res, 400, 'Invalid confirmation token.');
  }

  try {
    const { data: profile, error } = await supabase
      .from('students')
      .select('id')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (error) return next(error);
    if (!profile) {
      return respondWithError(res, 400, 'The confirmation link is invalid or has already been used.');
    }

    const { error: updateError } = await supabase
      .from('students')
      .update({ email_confirmed: true, confirmation_token: null })
      .eq('id', profile.id);

    if (updateError) return next(updateError);

    return res.json({ message: 'Email successfully confirmed. You can now log in.' });
  } catch (error) {
    return next(error);
  }
});

// NEW: Route to resend the email if they lost it
router.post('/student/resend-confirmation', loginLimiter, async (req, res, next) => {
  const studentId = String(req.body?.studentId || '').trim();
  if (!/^\d{8}$/.test(studentId)) {
    return respondWithError(res, 400, 'Enter a valid Student ID.');
  }
  if (!isMailConfigured()) {
    return respondWithError(res, 503, 'Email service is not configured.');
  }

  try {
    const { data: profile, error } = await supabase
      .from('students')
      .select('id, email, name, email_confirmed')
      .eq('student_id_number', studentId)
      .maybeSingle();

    if (error) return next(error);
    
    if (profile && !profile.email_confirmed) {
      const newToken = generateConfirmationToken();
      
      const { error: updateError } = await supabase
        .from('students')
        .update({ confirmation_token: newToken })
        .eq('id', profile.id);
        
      if (updateError) return next(updateError);

      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
      const confirmUrl = `${frontendUrl}/student/confirm-email?token=${encodeURIComponent(newToken)}`;

      await mailTransport().sendMail({
        from: process.env.SMTP_FROM,
        to: profile.email,
        subject: 'CCNDM - Confirm Your Student Account (Resent)',
        text: `Hello ${profile.name},\n\nHere is your new confirmation link. It expires in 24 hours:\n\n${confirmUrl}\n\nIf you did not request this, please ignore this email.`,
      });
    }

    // Always return generic success to prevent account enumeration
    return res.status(202).json({
      message: 'If this account requires confirmation, a new link has been sent.',
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/forgot-password', loginLimiter, async (req, res, next) => {
  const role = req.body?.role;
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!['student', 'admin'].includes(role) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respondWithError(res, 400, 'Enter a valid email address.');
  }
  if (!isMailConfigured()) {
    return respondWithError(res, 503, 'Password reset email is not configured.');
  }
  if (!supabase) return respondWithError(res, 503, 'Authentication service is not configured.');

  try {
    const table = role === 'student' ? 'students' : 'admins';
    const { data: profile, error } = await supabase
      .from(table)
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();
    if (error) return next(error);

    if (profile) {
      const { error: cleanupError } = await supabase
        .from('password_reset_tokens')
        .delete()
        .lt('expires_at', new Date().toISOString());
      if (cleanupError) return next(cleanupError);
      const { error: replaceError } = await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('account_id', String(profile.id))
        .eq('role', role)
        .is('used_at', null);
      if (replaceError) return next(replaceError);

      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
          account_id: String(profile.id),
          role,
          token_hash: hashResetToken(token),
          expires_at: expiresAt,
        });
      if (insertError) return next(insertError);

      const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, '');
      if (!frontendUrl) {
        await supabase.from('password_reset_tokens').delete().eq('token_hash', hashResetToken(token));
        return respondWithError(res, 503, 'Password reset email is not configured.');
      }
      const resetUrl = `${frontendUrl}/student/ResetPassword?role=${role}&token=${encodeURIComponent(token)}`;
      try {
        await mailTransport().sendMail({
          from: process.env.SMTP_FROM,
          to: profile.email,
          subject: 'CCNDM password reset',
          text: `Use this link to reset your password. It expires in 30 minutes:\n\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
        });
      } catch (mailError) {
        const { error: cleanupError } = await supabase
          .from('password_reset_tokens')
          .delete()
          .eq('token_hash', hashResetToken(token));
        if (cleanupError) console.error('[password reset cleanup]', cleanupError);
        return next(mailError);
      }
    }

    return res.status(202).json({
      message: 'If that account exists, password reset instructions have been sent.',
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/reset-password', loginLimiter, async (req, res, next) => {
  const { role, token, newPassword } = req.body || {};
  if (!['student', 'admin'].includes(role) || typeof token !== 'string' || token.length < 32) {
    return respondWithError(res, 400, 'The password reset link is invalid or expired.');
  }
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
    return respondWithError(res, 400, 'Password must be between 8 and 128 characters.');
  }
  if (!supabase) return respondWithError(res, 503, 'Authentication service is not configured.');

  try {
    const { data: reset, error } = await supabase
      .from('password_reset_tokens')
      .select('id, account_id')
      .eq('token_hash', hashResetToken(token))
      .eq('role', role)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    if (error) return next(error);
    if (!reset) return respondWithError(res, 400, 'The password reset link is invalid or expired.');

    const now = new Date().toISOString();
    const { data: claimed, error: claimError } = await supabase
      .from('password_reset_tokens')
      .update({ used_at: now })
      .eq('id', reset.id)
      .is('used_at', null)
      .select('id')
      .maybeSingle();
    if (claimError) return next(claimError);
    if (!claimed) return respondWithError(res, 400, 'The password reset link is invalid or expired.');

    const table = role === 'student' ? 'students' : 'admins';
    const passwordField = role === 'student' ? 'password' : 'password_hash';
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_ROUNDS);
    const { data: account, error: accountError } = await supabase
      .from(table)
      .select('id')
      .eq('id', reset.account_id)
      .maybeSingle();
    if (accountError) return next(accountError);
    if (!account) return respondWithError(res, 400, 'The account could not be found.');

    const { data: updated, error: updateError } = await supabase
      .from(table)
      .update({ [passwordField]: passwordHash, session_version: randomUUID() })
      .eq('id', reset.account_id)
      .select('id')
      .maybeSingle();
    if (updateError) return next(updateError);
    if (!updated) return respondWithError(res, 400, 'The account could not be found.');

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: safeProfile(req.user, req.user.role) });
});

router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  return res.json({ ok: true });
});

router.post('/change-password', requireAuth, async (req, res, next) => {
  const currentPassword = req.body?.currentPassword;
  const newPassword = req.body?.newPassword;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return respondWithError(res, 400, 'Enter your current password and a new password.');
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return respondWithError(res, 400, 'Password must be between 8 and 128 characters.');
  }

  try {
    const table = req.user.role === 'student' ? 'students' : 'admins';
    const field = req.user.role === 'student' ? 'password' : 'password_hash';
    const { data: profile, error } = await supabase
      .from(table)
      .select(`id, ${field}`)
      .eq('id', req.user.id)
      .single();
    if (error) return next(error);

    if (!(await passwordMatches(currentPassword, profile[field]))) {
      return respondWithError(res, 400, 'Your current password is incorrect.');
    }

    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_ROUNDS);
    const sessionVersion = randomUUID();
    const { error: updateError } = await supabase
      .from(table)
      .update({ [field]: passwordHash, session_version: sessionVersion })
      .eq('id', req.user.id);
    if (updateError) return next(updateError);

    setSession(res, { ...req.user, session_version: sessionVersion }, req.user.role, false);
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

export default router;