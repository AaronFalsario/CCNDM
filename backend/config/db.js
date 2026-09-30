import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

// Strip any accidental whitespace or trailing slashes
const cleanUrl = supabaseUrl?.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
const cleanKey = supabaseKey?.trim();

export const supabase =
  cleanUrl && cleanKey
    ? createClient(cleanUrl, cleanKey, {
        auth: { persistSession: false },
      })
    : null;

export const isSupabaseConfigured = Boolean(supabase);

export const getDbStatus = () => ({
  connected: isSupabaseConfigured,
  message: isSupabaseConfigured
    ? 'Supabase is connected.'
    : 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the backend environment.',
  // Debug info
  urlPreview: cleanUrl ? `${cleanUrl.slice(0, 30)}...` : null,
  urlHasRestPath: cleanUrl?.includes('/rest/'),
  urlHasTrailingSlash: supabaseUrl?.endsWith('/'),
  keyPresent: Boolean(cleanKey),
});