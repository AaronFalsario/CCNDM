import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const I = {
    lock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    eye: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    eyeOff: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
    checkCircle: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    alert: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
};

export default function ResetPassword() {
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [checking, setChecking] = useState(true);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
                setReady(true);
                setChecking(false);
            }
        });

        (async () => {
            const { data } = await supabase.auth.getSession();
            const hash = window.location.hash || '';
            const isRecoveryLink = hash.includes('type=recovery') || hash.includes('access_token');
            if (data?.session && isRecoveryLink) {
                setReady(true);
            }
            setChecking(false);
        })();

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) return setError('Password must be at least 6 characters.');
        if (password !== confirm) return setError('Passwords do not match.');

        setLoading(true);
        try {
            const { error: sbError } = await supabase.auth.updateUser({ password });
            if (sbError) throw sbError;
            setDone(true);
            setTimeout(async () => {
                await supabase.auth.signOut();
                navigate('/student/login', { replace: true });
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
                            {done ? 'Password Updated' : 'Set New Password'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5">
                            {done ? 'Redirecting you to sign in...' : 'Choose a new password for your account.'}
                        </p>
                    </div>

                    {checking ? (
                        <div className="py-10 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-slate-500">Verifying reset link...</p>
                        </div>
                    ) : done ? (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                {I.checkCircle}
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                                Your password has been changed. You'll be redirected shortly.
                            </p>
                            <Link to="/student/login" className="text-xs font-semibold text-blue-600 hover:underline">
                                Go to Sign In now
                            </Link>
                        </div>
                    ) : !ready ? (
                        <div className="space-y-5">
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                    {I.alert}
                                </div>
                                <p className="text-sm font-semibold text-slate-700">Invalid or expired link</p>
                                <p className="text-xs text-slate-500 text-center max-w-xs">
                                    This password reset link is no longer valid. Please request a new one.
                                </p>
                            </div>
                            <Link
                                to="/student/forgot-password"
                                className="block w-full text-center py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition"
                            >
                                Request New Link
                            </Link>
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
                                        placeholder="Min 6 characters"
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
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center text-[11px] text-slate-400 mt-6">
                    CCNDM Student Portal · Password Reset
                </p>
            </div>
        </div>
    );
}