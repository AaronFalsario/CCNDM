import { supabase } from './supabase';

const profileTables = {
    student: 'students',
    admin: 'admins',
};

export async function getRoleProfile(role, userId, { linkIfMissing = false, studentId = null } = {}) {
    if (!supabase) throw new Error('Supabase is not configured.');
    if (!profileTables[role]) throw new Error('Unknown account role.');

    const table = profileTables[role];
    const loadProfile = () => supabase
        .from(table)
        .select('*')
        .eq('auth_user_id', userId)
        .maybeSingle();

    let { data, error } = await loadProfile();
    if (error) throw error;

    if (!data && linkIfMissing) {
        const rpc = role === 'student' ? 'link_current_student' : 'link_current_admin';
        const { error: linkError } = await supabase.rpc(
            rpc,
            role === 'student' ? { p_student_id: studentId } : {}
        );
        if (linkError) throw linkError;

        ({ data, error } = await loadProfile());
        if (error) throw error;
    }

    if (!data) throw new Error('Your account is not linked to an active CCNDM profile.');
    if (role === 'admin' && data.status !== 'active') {
        throw new Error('Your administrator account is inactive.');
    }
    if (role === 'student' && ['inactive', 'suspended'].includes(data.status)) {
        throw new Error('Your student account is inactive. Please contact the administrator.');
    }

    return { ...data, role };
}
