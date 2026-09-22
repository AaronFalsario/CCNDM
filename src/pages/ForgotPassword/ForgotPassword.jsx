import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const I = {
    mail: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>,
    arrowLeft: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    checkCircle: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
};

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return setError('Please enter your email address.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return setError('Please enter a valid email address.');

        setLoading(true);
        try {
            const { error: sbError } = await supabase.auth.resetPasswordForEmail(trimmed, {
                redirectTo: `${window.location.origin}/student/ResetPassword`,
            });
            if (sbError) throw sbError;
            setSent(true);
        } catch (err) {
            const msg = err?.message || 'Something went wrong. Please try again.';
            if (/rate|too many/i.test(msg)) {
                setError('Too many requests. Please wait a moment and try again.');
            } else {
                setSent(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src="/CC.png" alt="CCNDM" className="w-14 h-14 object-contain rounded-xl bg-blue-50 p-2 mb-3" />
                        <h1 className="text-xl font-bold text-slate-800">
                            {sent ? 'Check Your Email' : 'Forgot Password?'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1.5">
                            {sent
                                ? `We've sent a password reset link to ${email}.`
                                : "Enter your registered email and we'll send you a reset link."}
                        </p>
                    </div>

                    {sent ? (
                        <div className="space-y-5">
                            <div className="flex flex-col items-center gap-3 py-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    {I.checkCircle}
                                </div>
                                <p className="text-xs text-slate-500 text-center max-w-xs">
                                    Didn't get the email? Check your spam folder, or make sure you entered the correct address.
                                </p>
                            </div>

                            <button
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="w-full py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                            >
                                Try a different email
                            </button>

                            <Link
                                to="/student/StudentLogin"
                                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                            >
                                {I.arrowLeft} Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                                    Student Email
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        {I.mail}
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="student@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>

                            <Link
                                to="/student/login"
                                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
                            >
                                {I.arrowLeft} Back to Sign In
                            </Link>
                        </form>
                    )}
                </div>

                <p className="text-center text-[11px] text-slate-400 mt-6">
                    CCNDM Student Portal · Password Recovery
                </p>
            </div>
        </div>
    );
}