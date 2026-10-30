import { Router } from 'express';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import { Resend } from 'resend';
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

function generateConfirmationToken() {
  return randomBytes(32).toString('base64url');
}

// RESEND SETUP
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function isMailConfigured() {
  return Boolean(resend);
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
    return respondWithError(res, 400, 'Enter your valid 8-digit Student ID and a valid email address (e.g. your Gmail).');
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return respondWithError(res, 400, 'Password must be between 8 and 128 characters.');
  }
  if (!supabase) return respondWithError(res, 503, 'Authentication service is not configured.');

  try {
    const { data: profile, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id_number', studentId)
      .maybeSingle();

    if (error) return next(error);

    if (profile && profile.password) {
      return respondWithError(res, 409, 'This student profile is already registered. Sign in or contact an administrator.');
    }

    const confirmationToken = generateConfirmationToken();
    const passwordHash = await bcrypt.hash(password, PASSWORD_ROUNDS);

    if (profile) {
      const { error: updateError } = await supabase
        .from('students')
        .update({
          password: passwordHash,
          email: email,
          updated_at: new Date().toISOString(),
          confirmation_token: confirmationToken,
          email_confirmed: false,
        })
        .eq('id', profile.id);

      if (updateError) return next(updateError);
    } else {
      const { error: insertError } = await supabase
        .from('students')
        .insert([{
          student_id_number: studentId,
          name: String(req.body?.name || 'Student').trim(),
          email: email,
          course: String(req.body?.course || 'BS Nursing').trim(),
          year_level: String(req.body?.yearLevel || '1st Year').trim(),
          password: passwordHash,
          email_confirmed: false,
          confirmation_token: confirmationToken,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (insertError) return next(insertError);
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const confirmUrl = `${frontendUrl}/student/confirm-email?token=${encodeURIComponent(confirmationToken)}`;

    let emailSent = false;
    if (isMailConfigured()) {
      try {
        const { error: mailError } = await resend.emails.send({
          from: 'CCNDM <onboarding@resend.dev>',
          to: [email],
          subject: 'CCNDM - Confirm Your Student Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #1e3a8a; margin-top: 0;">Columban College</h2>
              <h3 style="color: #3b82f6; margin-top: -8px; font-weight: normal;">Nursing Discipline Monitoring (CCNDM)</h3>
              <p style="color: #334155; font-size: 15px;">Hello <strong>${req.body?.name || 'Student'}</strong>,</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">
                Thank you for registering. Please confirm your email address to activate your CCNDM account and access your student discipline portal:
              </p>
              <div style="margin: 28px 0; text-align: center;">
                <a href="${confirmUrl}" style="background-color: #2563eb; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
                  Confirm Email Address
                </a>
              </div>
              <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; word-break: break-all;">
                Or copy and paste this URL into your browser:<br/>
                <a href="${confirmUrl}" style="color: #2563eb;">${confirmUrl}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">Columban College Nursing Discipline Office • Automated Message</p>
            </div>
          `,
        });

        if (mailError) throw mailError;
        emailSent = true;
      } catch (mailError) {
        console.error('[registration email error]', mailError);
      }
    }

    console.log('\n=============================================================');
    console.log(`[EMAIL CONFIRMATION] ${emailSent ? 'Sent to' : 'Link for'}: ${email}`);
    console.log(`Confirm URL: ${confirmUrl}`);
    console.log('=============================================================\n');

    return res.status(201).json({
      message: emailSent
        ? 'Account registered! A confirmation link has been sent to your email.'
        : 'Account registered! Please check your email (or use the link from the server console) to confirm.',
      requiresConfirmation: true,
      confirmUrl: process.env.NODE_ENV !== 'production' ? confirmUrl : undefined,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/student/confirm-email', async (req, res, next) => {
  const token = String(req.query?.token || '').trim();
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
  if (!token) return res.redirect(`${frontendUrl}/student/login?error=invalid_token`);

  try {
    const { data: profile, error } = await supabase
      .from('students')
      .select('id')
      .eq('confirmation_token', token)
      .maybeSingle();

    if (error || !profile) {
      return res.redirect(`${frontendUrl}/student/login?error=invalid_or_expired`);
    }

    await supabase
      .from('students')
      .update({ email_confirmed: true, confirmation_token: null })
      .eq('id', profile.id);

    return res.redirect(`${frontendUrl}/student/login?confirmed=true`);
  } catch (err) {
    return next(err);
  }
});

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

router.post('/student/resend-confirmation', loginLimiter, async (req, res, next) => {
  const studentId = String(req.body?.studentId || '').trim();
  if (!/^\d{8}$/.test(studentId)) {
    return respondWithError(res, 400, 'Enter a valid Student ID.');
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

      const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
      const confirmUrl = `${frontendUrl}/student/confirm-email?token=${encodeURIComponent(newToken)}`;

      let emailSent = false;
      if (isMailConfigured()) {
        try {
          const { error: mailErr } = await resend.emails.send({
            from: 'CCNDM <onboarding@resend.dev>',
            to: [profile.email],
            subject: 'CCNDM - Confirm Your Student Account (Resent)',
            html: `
              <p>Hello ${profile.name},</p>
              <p>Here is your confirmation link:</p>
              <p><a href="${confirmUrl}">${confirmUrl}</a></p>
              <p>If you did not request this, please ignore this email.</p>
            `,
          });
          if (mailErr) throw mailErr;
          emailSent = true;
        } catch (mailErr) {
          console.error('[resend email error]', mailErr);
        }
      }

      console.log('\n=============================================================');
      console.log(`[EMAIL CONFIRMATION RESENT] ${emailSent ? 'Sent to' : 'Link for'}: ${profile.email}`);
      console.log(`Confirm URL: ${confirmUrl}`);
      console.log('=============================================================\n');

      return res.status(202).json({
        message: 'A new confirmation email has been sent to your registered address.',
        confirmUrl: process.env.NODE_ENV !== 'production' ? confirmUrl : undefined,
      });
    }

    return res.status(202).json({
      message: 'If this account requires confirmation, a link has been sent.',
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
        const { error: mailError } = await resend.emails.send({
          from: 'CCNDM <onboarding@resend.dev>',
          to: [profile.email],
          subject: 'CCNDM Password Reset',
          html: `
            <p>Use this link to reset your password. It expires in 30 minutes:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, ignore this email.</p>
          `,
        });

        if (mailError) throw mailError;
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