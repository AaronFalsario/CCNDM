import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isBcryptHash, hashPassword, verifyPassword } from '../../lib/password';
import { supabase } from '../../lib/supabase';

const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const EyeIcon = ({ hidden }) => hidden ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default function ChangePassword() {
    const navigate = useNavigate();
    const { user } = useAuth('student');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Please complete all password fields.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Your new password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('The new passwords do not match.');
            return;
        }
        if (newPassword === currentPassword) {
            setError('Choose a new password that is different from your current one.');
            return;
        }
        if (!supabase) {
            setError('The student database is not configured. Please contact your administrator.');
            return;
        }
        if (!user?.student_id_number) {
            setError('Your student session is missing an ID. Sign in again and retry.');
            return;
        }

        setLoading(true);
        try {
            const { data: student, error: lookupError } = await supabase
                .from('students')
                .select('password')
                .eq('student_id_number', user.student_id_number)
                .maybeSingle();

            if (lookupError) throw lookupError;
            if (!student) throw new Error('Could not find your student account. Please sign in again.');

            const passwordMatches = isBcryptHash(student.password)
                ? await verifyPassword(currentPassword, student.password)
                : student.password === currentPassword;

            if (!passwordMatches) {
                setError('Your current password is incorrect.');
                return;
            }

            const passwordHash = await hashPassword(newPassword);
            const { data: updatedStudent, error: updateError } = await supabase
                .from('students')
                .update({ password: passwordHash })
                .eq('student_id_number', user.student_id_number)
                .select('id')
                .maybeSingle();

            if (updateError) throw updateError;
            if (!updatedStudent) {
                throw new Error('Your password was not updated. Check your database permissions and try again.');
            }

            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccess('Your password has been changed successfully.');
        } catch (err) {
            setError(err?.message || 'Could not change your password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10';

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-10 font-sans">
            <div className="mx-auto w-full max-w-xl">
                <Link
                    to="/student/dashboard"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back to dashboard
                </Link>

                <section className="overflow-hidden rounded-3xl border border-white/80 bg-white shadow-xl shadow-slate-900/10">
                    <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-7 py-8 text-white sm:px-10">
                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                            <LockIcon />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-100">Student account</p>
                        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Change your password</h1>
                        <p className="mt-2 max-w-md text-sm leading-6 text-blue-100">
                            Confirm your current password, then choose a new one to keep your account secure.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 px-7 py-8 sm:px-10">
                        {[
                            { label: 'Current password', value: currentPassword, setValue: setCurrentPassword, autocomplete: 'current-password' },
                            { label: 'New password', value: newPassword, setValue: setNewPassword, autocomplete: 'new-password' },
                            { label: 'Confirm new password', value: confirmPassword, setValue: setConfirmPassword, autocomplete: 'new-password' },
                        ].map((field, index) => (
                            <div key={field.label}>
                                <label htmlFor={`password-${index}`} className="mb-2 block text-sm font-semibold text-slate-700">
                                    {field.label}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <LockIcon />
                                    </span>
                                    <input
                                        id={`password-${index}`}
                                        type={showPasswords ? 'text' : 'password'}
                                        value={field.value}
                                        onChange={(event) => field.setValue(event.target.value)}
                                        autoComplete={field.autocomplete}
                                        className={inputClass}
                                        required
                                    />
                                    {index === 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords((visible) => !visible)}
                                            aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
                                        >
                                            <EyeIcon hidden={showPasswords} />
                                        </button>
                                    )}
                                </div>
                                {index === 1 && (
                                    <p className="mt-2 text-xs text-slate-500">Use at least 6 characters.</p>
                                )}
                            </div>
                        ))}

                        {error && (
                            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? 'Updating password…' : 'Update password'}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/student/dashboard')}
                                className="text-sm font-semibold text-slate-500 transition hover:text-slate-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
                <p className="mt-6 text-center text-xs text-slate-500">CCNDM Student Portal</p>
            </div>
        </main>
    );
}