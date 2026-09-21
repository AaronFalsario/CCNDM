import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';

//SVG ICONS
const Icon = {
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    userShield: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    graduationCap: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    ),
    arrowRight: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
};

export default function AdminLogin() {
    const navigate = useNavigate();

    //FORM STATE
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);

    //FORGOT PASSWORD MODAL STATE
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    //TOAST STATE
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'info', title = null) => {
        setToast({ message, type, title });
    };

    //SESSION CHECK ON MOUNT
    useEffect(() => {
        const init = async () => {
            const hasSession = await checkExistingSession();
            if (hasSession) {
                navigate('/admin/dashboard', { replace: true });
                return;
            }

            const remembered = localStorage.getItem('rememberedAdmin');
            if (remembered) {
                setUsername(remembered);
                setRememberMe(true);
            }
        };
        init();
    }, [navigate]);

    const checkExistingSession = async () => {
        const storedAdmin = localStorage.getItem('currentAdmin');
        if (!storedAdmin) return false;

        try {
            const expiry = localStorage.getItem('adminSessionExpiry');
            if (expiry && new Date(expiry) < new Date()) {
                localStorage.removeItem('currentAdmin');
                localStorage.removeItem('adminSessionExpiry');
                return false;
            }

            const admin = JSON.parse(storedAdmin);
            const { data, error } = await supabase
                .from('admins')
                .select('id, status, role, full_name')
                .eq('id', admin.id)
                .single();

            if (error || !data || data.status !== 'active') {
                localStorage.removeItem('currentAdmin');
                localStorage.removeItem('adminSessionExpiry');
                return false;
            }
            return true;
        } catch {
            localStorage.removeItem('currentAdmin');
            localStorage.removeItem('adminSessionExpiry');
            return false;
        }
    };

    //LOGIN
    const handleLogin = async (e) => {
        e?.preventDefault();

        const u = username.trim();
        const p = password.trim();

        if (!u) return showToast('Enter Admin ID or Email', 'error', 'Missing Field');
        if (!p) return showToast('Enter Password', 'error', 'Missing Field');

        setLoading(true);

        try {
            const { data: admin, error } = await supabase
                .from('admins')
                .select('*')
                .or(`admin_id.ilike.${u},email.ilike.${u}`)
                .maybeSingle();

            if (error || !admin) {
                showToast('Admin not found. Please check your credentials.', 'error', 'Login Failed');
                setLoading(false);
                return;
            }

            if (admin.password_hash !== p) {
                showToast('Wrong password. Please try again.', 'error', 'Authentication Failed');
                setLoading(false);
                return;
            }

            if (admin.status !== 'active') {
                showToast('Your account is inactive. Please contact support.', 'error', 'Account Inactive');
                setLoading(false);
                return;
            }

            await supabase
                .from('admins')
                .update({ last_login: new Date().toISOString() })
                .eq('id', admin.id);

            const sessionExpiry = new Date();
            sessionExpiry.setHours(sessionExpiry.getHours() + 24);

            const adminSession = {
                id: admin.id,
                admin_id: admin.admin_id,
                full_name: admin.full_name,
                email: admin.email,
                role: admin.role,
                status: admin.status,
                login_time: new Date().toISOString(),
                expires: sessionExpiry.toISOString(),
            };

            localStorage.setItem('currentAdmin', JSON.stringify(adminSession));
            localStorage.setItem('adminSessionExpiry', sessionExpiry.toISOString());

            if (rememberMe) {
                localStorage.setItem('rememberedAdmin', admin.admin_id);
            } else {
                localStorage.removeItem('rememberedAdmin');
            }

            showToast(
                `Welcome back, ${admin.full_name || admin.admin_id}! Redirecting...`,
                'success',
                'Login Successful'
            );

            setTimeout(() => navigate('/admin/dashboard'), 1200);
        } catch (err) {
            console.error(err);
            showToast('Login failed. Please try again.', 'error', 'Error');
            setLoading(false);
        }
    };

    //FORGOT PASSWORD
    const handleForgotPassword = async (e) => {
        e?.preventDefault();

        const email = forgotEmail.trim();
        if (!email) return showToast('Please enter your email address', 'error', 'Email Required');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return showToast('Please enter a valid email address', 'error', 'Invalid Email');
        }

        setForgotLoading(true);

        try {
            const { data: admin, error: adminError } = await supabase
                .from('admins')
                .select('email, full_name')
                .eq('email', email)
                .maybeSingle();

            if (adminError || !admin) {
                showToast('No admin account found with this email', 'error', 'Account Not Found');
                setForgotLoading(false);
                return;
            }

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/Assets/Admin_dashboard/password/password.html`,
            });

            if (resetError) {
                showToast('Failed to send reset email. Please try again.', 'error', 'Reset Failed');
                setForgotLoading(false);
                return;
            }

            showToast(`Password reset link sent to ${email}. Check your inbox!`, 'success', 'Email Sent');
            setForgotEmail('');
            setShowForgot(false);
        } catch (err) {
            console.error(err);
            showToast('An error occurred. Please try again.', 'error', 'Error');
        } finally {
            setForgotLoading(false);
        }
    };

    const features = [
        'Manage student disciplinary records',
        'Review and resolve student appeals',
        'Track violations and penalties',
        'Generate reports and analytics',
    ];

    return (
        <div className="min-h-screen w-full bg-[#EEF3FF] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
            <style>{`
        @keyframes slideUpCard { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rotateIn { from { opacity: 0; transform: rotate(-180deg) scale(0.5); } to { opacity: 1; transform: rotate(0) scale(1); } }
        @keyframes panelFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes modalFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalScale { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        .anim-card { animation: slideUpCard 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; }
        .anim-left { animation: slideInLeft 0.6s ease-out 0.1s both; }
        .anim-right { animation: slideInRight 0.6s ease-out 0.15s both; }
        .anim-logo { animation: rotateIn 0.6s ease-out 0.2s both; }
        .anim-feature { animation: fadeInUp 0.5s ease-out both; }
        .anim-panel { animation: panelFade 0.4s ease-out both; }
        .anim-modal-overlay { animation: modalFade 0.25s ease-out both; }
        .anim-modal { animation: modalScale 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; }
      `}</style>

            <div className="w-full max-w-[1200px] anim-card">
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(37,99,235,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[640px]">

                    {/*LEFT PANEL*/}
                    <div className="w-full md:w-[45%] relative flex flex-col items-center justify-center p-8 sm:p-12 md:p-14 text-center bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1741B0] border-b md:border-b-0 md:border-r border-slate-100 anim-left overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <img
                                src="/CC.png"
                                alt="CCNDM Logo"
                                className="w-28 h-28 sm:w-32 sm:h-32 object-contain mb-6 anim-logo drop-shadow-lg"
                            />
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-wide">COLUMBAN COLLEGE</h2>
                            <h3 className="text-sm sm:text-base font-semibold text-blue-100 tracking-wide uppercase mb-2">Nursing Discipline Monitoring</h3>
                            <p className="text-[11px] text-blue-200 mb-10 font-medium tracking-widest">ADMIN PORTAL · V1.0.0</p>

                            <ul className="flex flex-col gap-4 text-left w-full max-w-[300px]">
                                {features.map((f, i) => (
                                    <li key={f} className="flex items-start gap-3 anim-feature" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
                                        <span className="text-white flex-shrink-0 mt-0.5">{Icon.check}</span>
                                        <span className="text-sm sm:text-[15px] text-white/95 leading-snug font-medium">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/*RIGHT PANEL*/}
                    <div className="w-full md:w-[55%] p-8 sm:p-10 md:p-14 flex flex-col justify-center anim-right">
                        <div className="w-full max-w-[440px] mx-auto">

                            <form onSubmit={handleLogin} className="anim-panel">
                                <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 text-center mb-2">Admin Login</h1>
                                <p className="text-sm text-slate-500 text-center mb-5">Sign in to access the admin dashboard</p>

                                <div className="flex justify-center mb-5">
                                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 text-[11.5px] font-bold rounded-full tracking-wide">
                                        {Icon.shield}
                                        ADMIN PORTAL
                                    </span>
                                </div>

                                <div className="flex items-start gap-2.5 p-3 mb-7 bg-amber-50 border border-amber-200 rounded-xl">
                                    <span className="text-amber-500 flex-shrink-0 mt-0.5">{Icon.warning}</span>
                                    <div>
                                        <div className="text-[12.5px] font-bold text-amber-800 mb-0.5">Restricted Access</div>
                                        <div className="text-[11.5px] text-amber-700 leading-snug">
                                            This portal is for authorized administrators only. All login attempts are logged.
                                        </div>
                                    </div>
                                </div>

                                <div className="relative mb-5">
                                    <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                        <legend className="text-[11px] text-slate-500 px-1 font-semibold">Admin ID or Email <span className="text-red-500">*</span></legend>
                                        <div className="flex items-center">
                                            <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.userShield}</span>
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="ADMIN-001 or admin@ccndm.edu.ph"
                                                autoComplete="username"
                                                className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5"
                                            />
                                        </div>
                                    </fieldset>
                                </div>

                                <div className="relative mb-5">
                                    <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                        <legend className="text-[11px] text-slate-500 px-1 font-semibold">Password <span className="text-red-500">*</span></legend>
                                        <div className="flex items-center">
                                            <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors"
                                            >
                                                {showPassword ? Icon.eyeOff : Icon.eye}
                                            </button>
                                        </div>
                                    </fieldset>
                                </div>

                                <div className="flex items-center justify-between mb-7">
                                    <label className="flex items-center gap-2 text-[13px] text-slate-500 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        Keep me signed in
                                    </label>
                                    <a
                                        href="#"
                                        className="text-[13px] text-blue-600 font-semibold hover:underline"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowForgot(true);
                                        }}
                                    >
                                        Forgot Password?
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-xl mb-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Logging in...' : (<>Login {Icon.arrowRight}</>)}
                                </button>

                                <p className="text-[11.5px] text-slate-400 leading-relaxed text-center">
                                    By clicking the login button, you recognize the authority of Columban College to process your personal and sensitive information, pursuant to the Columban College General Privacy Notice and applicable laws.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/*FORGOT PASSWORD MODAL*/}
            {showForgot && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-modal-overlay"
                    onClick={() => setShowForgot(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-2xl anim-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">Reset Password</h3>
                            <button
                                onClick={() => setShowForgot(false)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-500">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleForgotPassword} className="p-5">
                            <p className="text-[13px] text-slate-500 mb-5">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <div className="relative mb-5">
                                <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                    <legend className="text-[11px] text-slate-500 px-1 font-semibold">Email Address <span className="text-red-500">*</span></legend>
                                    <div className="flex items-center">
                                        <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.mail}</span>
                                        <input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="admin@ccndm.edu.ph"
                                            className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5"
                                        />
                                    </div>
                                </fieldset>
                            </div>

                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[14.5px] font-bold rounded-xl mb-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                {forgotLoading ? 'Checking...' : 'Send Reset Link'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowForgot(false)}
                                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14.5px] font-semibold rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/*TOAST*/}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    title={toast.title}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}