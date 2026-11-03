import { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import PasswordStrength from '../../components/PasswordStrength';

const I = {
    lock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    eye: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12C5 4 19 4 23 12C19 20 5 20 1 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
    eyeOff: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    checkCircle: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    alert: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
};

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [invitationAccount, setInvitationAccount] = useState(null);
    const [error, setError] = useState('');
    const adminInvitationMode = location.pathname === '/admin/accept-invitation';
    const studentInvitationMode = location.pathname === '/student/accept-invitation';
    const invitationMode = adminInvitationMode || studentInvitationMode;
    const token = invitationMode
        ? new URLSearchParams(location.hash.slice(1)).get('token') || ''
        : searchParams.get('token') || '';
    const role = adminInvitationMode ? 'admin' : studentInvitationMode ? 'student' : searchParams.get('role') || 'student';
    const ready = Boolean(token) && (invitationMode || ['student', 'admin'].includes(role));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) return setError('Password must be at least 8 characters.');
        if (password !== confirm) return setError('Passwords do not match.');

        setLoading(true);
        try {
            if (adminInvitationMode) {
                const { adminId } = await api.post('/api/auth/admin/accept-invitation', {
                    token,
                    password,
                });
                setInvitationAccount({ adminId });
                setDone(true);
                return;
            }

            if (studentInvitationMode) {
                const { studentId } = await api.post('/api/auth/student/accept-invitation', {
                    token,
                    password,
                });
                setInvitationAccount({ studentId, password });
                setDone(true);
                return;
            }

            await api.post('/api/auth/reset-password', {
                role,
                token,
                newPassword: password,
            });
            setDone(true);
            setTimeout(() => {
                navigate(role === 'admin' ? '/admin/login' : '/student/login', { replace: true });
            }, 2500);
        } catch (err) {
            setError(err?.message || 'Could not update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputWrap = 'w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src="/CC.png" alt="CCNDM" className="w-14 h-14 object-contain rounded-xl bg-blue-50 p-2 mb-3" />
                        <h1 className="text-xl font-bold text-slate-800">
                            {done && invitationMode ? 'Your Account Is Ready' : done ? 'Password Updated' : invitationMode ? 'Create Your Password' : 'Set New Password'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5">
                            {done && invitationMode
                                ? adminInvitationMode
                                    ? 'Your administrator account is ready. Sign in with your Admin ID or email.'
                                    : 'Keep these sign-in details, then continue to the student portal.'
                                : done
                                    ? 'Redirecting you to sign in...'
                                    : invitationMode
                                        ? `Choose a password for your ${role} account.`
                                        : 'Choose a new password for your account.'}
                        </p>
                    </div>

                    {done ? (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                {I.checkCircle}
                            </div>
                            {invitationAccount && adminInvitationMode ? (
                                <div className="w-full space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-sm font-semibold text-emerald-900">Your administrator sign-in ID</p>
                                    <code className="block rounded-lg bg-white px-3 py-2 font-mono text-base text-slate-900">
                                        {invitationAccount.adminId}
                                    </code>
                                    <p className="text-xs text-emerald-800">You can also sign in with the email address that received this invitation.</p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/admin/login', { replace: true })}
                                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                                    >
                                        Continue to Admin Login
                                    </button>
                                </div>
                            ) : invitationAccount ? (
                                <div className="w-full space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                    <p className="text-sm font-semibold text-emerald-900">Your sign-in details (shown only on this screen)</p>
                                    <div>
                                        <p className="text-xs font-medium text-emerald-800">Student ID</p>
                                        <code className="mt-1 block rounded-lg bg-white px-3 py-2 font-mono text-base text-slate-900">
                                            {invitationAccount.studentId}
                                        </code>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-emerald-800">Password</p>
                                        <code className="mt-1 block break-all rounded-lg bg-white px-3 py-2 font-mono text-base text-slate-900">
                                            {invitationAccount.password}
                                        </code>
                                    </div>
                                    <p className="text-xs text-emerald-800">Save these details somewhere private. Your password is never sent back by the server.</p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/student/login', { replace: true })}
                                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                                    >
                                        Continue to Student Login
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-slate-500 text-center">
                                        Your password has been changed. You'll be redirected shortly.
                                    </p>
                                    <Link to={role === 'admin' ? '/admin/login' : '/student/login'} className="text-xs font-semibold text-blue-600 hover:underline">
                                        Go to Sign In now
                                    </Link>
                                </>
                            )}
                        </div>
                    ) : !ready ? (
                        <div className="space-y-5">
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    {I.alert}
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Invalid or expired link</p>
                                <p className="text-xs text-slate-500 text-center max-w-xs">
                                    This {invitationMode ? 'invitation' : 'password reset'} link is no longer valid. {invitationMode ? 'Contact the administrator who invited you for a new link.' : 'Please request a new one.'}
                                </p>
                            </div>
                            {!invitationMode && (
                                <Link
                                    to={role === 'admin' ? '/admin/login' : '/student/forgot-password'}
                                    className="block w-full text-center py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition"
                                >
                                    {role === 'admin' ? 'Return to Admin Sign In' : 'Request New Link'}
                                </Link>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.lock}</span>
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 8 characters"
                                        autoComplete="new-password"
                                        className={inputWrap}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(v => !v)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-600 transition"
                                        tabIndex={-1}
                                    >
                                        {showPw ? I.eyeOff : I.eye}
                                    </button>
                                </div>
                                <PasswordStrength password={password} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.lock}</span>
                                    <input
                                        type={showPw ? 'text' : 'password'}
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder="Re-enter new password"
                                        autoComplete="new-password"
                                        className={inputWrap}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                    <p className="text-xs font-medium text-red-600">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition shadow-lg shadow-blue-500/20"
                            >
                                {loading ? 'Saving...' : invitationMode ? 'Create Account' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-[11px] text-slate-400 mt-6">
                    {role === 'admin' ? 'CCNDM Admin Portal' : 'CCNDM Student Portal'} · {invitationMode ? 'Account Setup' : 'Password Reset'}
                </p>
            </div>
        </div>
    );
}