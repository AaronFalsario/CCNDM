import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Router } from 'express';
import { supabase } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { sendEmail } from '../lib/email.js';

const router = Router();
const uploadTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const allowedBuckets = new Set(['penalties', 'announcement']);
const maxImageBytes = 5 * 1024 * 1024;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

router.post('/students', requireAuth, requireRole('admin'), async (req, res, next) => {
  const studentId = String(req.body?.studentId || '').trim();
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const course = String(req.body?.course || '').trim();
  const yearLevel = String(req.body?.yearLevel || '').trim();

  if (!/^\d{8}$/.test(studentId)) {
    return res.status(400).json({ message: 'Student ID must be exactly 8 digits.' });
  }
  if (name.length < 2 || name.length > 160) {
    return res.status(400).json({ message: 'Name must be between 2 and 160 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  if (!course || course.length > 120 || !yearLevel || yearLevel.length > 40) {
    return res.status(400).json({ message: 'Enter a valid course and year level.' });
  }
  const frontendUrl = process.env.FRONTEND_URL?.trim().replace(/\/+$/, '');
  if (!frontendUrl) {
    return res.status(503).json({ message: 'The student portal URL is not configured.' });
  }
  if (!supabase) return res.status(503).json({ message: 'Authentication service is not configured.' });

  try {
    const { data: existing, error: lookupError } = await supabase
      .from('students')
      .select('id, password')
      .eq('student_id_number', studentId)
      .maybeSingle();
    if (lookupError) return next(lookupError);
    if (existing?.password) {
      return res.status(409).json({ message: 'This student already has an account.' });
    }

    const now = new Date().toISOString();
    const accountValues = {
      name,
      email,
      course,
      year_level: yearLevel,
      password: null,
      email_confirmed: false,
      confirmation_token: null,
      must_change_password: true,
      session_version: randomUUID(),
      updated_at: now,
    };

    let accountError;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('students')
        .update(accountValues)
        .eq('id', existing.id)
        .is('password', null)
        .select('id')
        .maybeSingle();
      accountError = error;
      if (!error && !updated) {
        return res.status(409).json({ message: 'This student already has an account.' });
      }
    } else {
      const { error } = await supabase
        .from('students')
        .insert([{
          student_id_number: studentId,
          ...accountValues,
          status: 'active',
          created_at: now,
        }]);
      accountError = error;
    }
    if (accountError) {
      if (accountError.code === '23505') {
        return res.status(409).json({ message: 'A student account with this ID or email already exists.' });
      }
      return next(accountError);
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('student_id_number', studentId)
      .maybeSingle();
    if (studentError) return next(studentError);
    if (!student) return res.status(500).json({ message: 'Student account could not be loaded after creation.' });

    const { error: expiredTokensError } = await supabase
      .from('student_invitation_tokens')
      .delete()
      .lt('expires_at', now);
    if (expiredTokensError) return next(expiredTokensError);

    const { error: revokeError } = await supabase
      .from('student_invitation_tokens')
      .delete()
      .eq('student_profile_id', student.id)
      .is('used_at', null);
    if (revokeError) return next(revokeError);

    const invitationToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(invitationToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { error: tokenError } = await supabase
      .from('student_invitation_tokens')
      .insert({
        student_profile_id: student.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
    if (tokenError) return next(tokenError);

    const invitationUrl = `${frontendUrl}/student/accept-invitation#token=${encodeURIComponent(invitationToken)}`;
    const safeName = escapeHtml(name);
    const safeUrl = escapeHtml(invitationUrl);
    const emailResult = await sendEmail({
      to: [{ email, name }],
      subject: 'Set up your CCNDM student account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Columban College</h2>
          <h3 style="color: #3b82f6; margin-top: -8px; font-weight: normal;">Nursing Discipline Monitoring</h3>
          <p style="color: #334155;">Hello <strong>${safeName}</strong>,</p>
          <p style="color: #475569; line-height: 1.6;">The Nursing Discipline Office invited you to set up your student portal account. Use the secure link below within 24 hours to create your password.</p>
          <p style="margin: 28px 0; text-align: center;">
            <a href="${safeUrl}" style="background-color: #2563eb; color: #ffffff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Create My Password</a>
          </p>
          <p style="color: #94a3b8; font-size: 12px;">If you were not expecting this invitation, contact the Nursing Discipline Office.</p>
        </div>
      `,
    });
    if (!emailResult.sent) {
      console.warn('[student invitation email] No mail provider is configured; returning invitation link for local testing.');
    }

    return res.status(201).json({
      message: emailResult.sent
        ? `An account setup invitation was sent to ${email}. The link expires in 24 hours.`
        : `The student account was created. Email delivery is not configured in this environment, so the invitation link is available for manual use.`,
      invitationUrl,
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/suggest-caption', requireAuth, requireRole('admin'), async (req, res, next) => {
  const title = String(req.body?.title || '').trim();
  if (title.length < 2 || title.length > 200) {
    return res.status(400).json({ message: 'Title must be between 2 and 200 characters.' });
  }
  if (!supabase) return res.status(503).json({ message: 'AI service is not configured.' });

  try {
    const { data, error } = await supabase.functions.invoke('suggest-caption', {
      body: { title },
    });
    if (error) return next(error);
    if (!data || data.error) {
      return res.status(502).json({ message: data?.error || 'The caption service returned no result.' });
    }
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post('/uploads/signed', requireAuth, requireRole('admin'), async (req, res, next) => {
  const bucket = String(req.body?.bucket || '');
  const contentType = String(req.body?.contentType || '').toLowerCase();
  const size = Number(req.body?.size);
  if (!allowedBuckets.has(bucket)) {
    return res.status(400).json({ message: 'The requested upload bucket is not allowed.' });
  }
  if (!Object.hasOwn(uploadTypes, contentType)) {
    return res.status(400).json({ message: 'Only JPEG, PNG, and WebP images can be uploaded.' });
  }
  if (!Number.isInteger(size) || size < 1 || size > maxImageBytes) {
    return res.status(400).json({ message: 'Images must be 5 MB or smaller.' });
  }
  if (!supabase) return res.status(503).json({ message: 'Storage service is not configured.' });

  const filename = `${randomUUID()}.${uploadTypes[contentType]}`;
  try {
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(filename);
    if (error) return next(error);
    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return res.json({ signedUrl: data.signedUrl, publicUrl: publicData.publicUrl });
  } catch (error) {
    return next(error);
  }
});

export default router;
