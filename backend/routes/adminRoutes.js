import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { supabase } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();
const uploadTypes = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const allowedBuckets = new Set(['penalties', 'announcement']);
const maxImageBytes = 5 * 1024 * 1024;

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
