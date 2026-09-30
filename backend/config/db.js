import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export const isSupabaseConfigured = Boolean(supabase);

export const getDbStatus = () => ({
  connected: isSupabaseConfigured,
  message: isSupabaseConfigured
    ? 'Supabase is connected.'
    : 'Missing SUPABASE_URL or SUPABASE_ANON_KEY in the backend environment.',
});
