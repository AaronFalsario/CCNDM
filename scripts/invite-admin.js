import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2]?.trim().toLowerCase();

if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the local environment.');
}

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Usage: node scripts/invite-admin.js <administrator-email>');
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
});
const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: process.env.AUTH_REDIRECT_URL || undefined,
});

if (error) throw error;
console.log(`Invitation sent to ${email}. The address must match an active public.admins profile.`);
