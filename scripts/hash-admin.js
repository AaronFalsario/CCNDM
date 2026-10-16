import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
);

const adminId = process.argv[2]?.trim();
const plainPassword = process.env.ADMIN_PASSWORD;
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the local environment.');
}
if (!adminId || !plainPassword || plainPassword.length < 8) {
    throw new Error('Usage: ADMIN_PASSWORD=<password> node scripts/hash-admin.js <administrator-id>; password must be at least 8 characters.');
}

const hash = await bcrypt.hash(plainPassword, 12);

const { data, error } = await supabase
    .from('admins')
    .update({ password_hash: hash })
    .eq('admin_id', adminId)
    .select('id')
    .maybeSingle();

if (error) throw error;
if (!data) throw new Error(`No administrator profile found for ${adminId}.`);
console.log(`Password updated for ${adminId}.`);