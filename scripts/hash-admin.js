import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 👇 ADMIN001
const adminId = 'ADMIN001';
const plainPassword = 'password321';

const hash = await bcrypt.hash(plainPassword, 10);

const { error } = await supabase
    .from('admins')
    .update({ password_hash: hash })
    .eq('admin_id', adminId);

if (error) console.error(error);
else console.log(`✅ Hashed password for ${adminId}`);