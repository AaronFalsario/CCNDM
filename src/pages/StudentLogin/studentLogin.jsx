import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import DashboardSkeleton from '../../components/DashboardSkeleton';
import logo from '../../assets/CC.png';

const Icon = {
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    idCard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="2" y="3" width="20" height="18" rx="2" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="12" y2="12" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    eye: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    book: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    calendar: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

export default function StudentLogin() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [panel, setPanel] = useState('login');
    const [showPassword, setShowPassword] = useState({});
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [rememberMe, setRememberMe] = useState(
        () => Boolean(localStorage.getItem('rememberedStudentId'))
    );

    const [loginId, setLoginId] = useState(
        () => localStorage.getItem('rememberedStudentId') || ''
    );
    const [loginPassword, setLoginPassword] = useState('');
    const [loginAlert, setLoginAlert] = useState(null); // { type: 'success' | 'error' | 'info', message: string }

    const [signupId, setSignupId] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupCourse, setSignupCourse] = useState('BS Nursing');
    const [signupYearLevel, setSignupYearLevel] = useState('1st Year');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirm, setSignupConfirm] = useState('');
    const [signupSuccessData, setSignupSuccessData] = useState(null);

    // Check if user came from email confirmation redirect
    useEffect(() => {
        if (searchParams.get('confirmed') === 'true') {
            setLoginAlert({
                type: 'success',
                message: 'Your email has been successfully confirmed! You can now sign in.',
            });
        }
    }, [searchParams]);

    /* DARK MODE FIX */
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }, []);

    useEffect(() => {
        api.get('/api/auth/me')
            .then(({ user }) => {
                if (user?.account_type === 'student') navigate('/student/dashboard', { replace: true });
            })
            .catch((error) => {
                if (error.status !== 401) console.error('[check student session]', error);
            });
    }, [navigate]);

    const togglePassword = (key) => {
        setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogin = async (e) => {
        e?.preventDefault();
        setLoginAlert(null);
        const studentId = loginId.trim();
        const password = loginPassword;

        if (!studentId || !password) return alert('Please enter both Student ID and password');
        if (!/^\d{8}$/.test(studentId)) return alert('Student ID must be exactly 8 digits');

        try {
            setLoading(true);
            await api.post('/api/auth/student/login', {
                studentId,
                password,
                remember: rememberMe,
            });

            if (rememberMe) localStorage.setItem('rememberedStudentId', studentId);
            else localStorage.removeItem('rememberedStudentId');

            setRedirecting(true);
            setTimeout(() => navigate('/student/dashboard'), 600);
        } catch (error) {
            setLoginAlert({
                type: 'error',
                message: error.message || 'Login failed',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e?.preventDefault();
        const studentId = signupId.trim();
        const name = signupName.trim();
        const email = signupEmail.trim().toLowerCase();
        const course = signupCourse.trim();
        const yearLevel = signupYearLevel.trim();

        if (!studentId || !name || !email || !course || !yearLevel || !signupPassword || !signupConfirm)
            return alert('Please fill in all fields');
        if (signupPassword !== signupConfirm) return alert('Passwords do not match!');
        if (signupPassword.length < 8) return alert('Password must be at least 8 characters');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Please enter a valid email address (e.g. name@gmail.com)');
        if (name.length < 2) return alert('Please enter your full name');
        if (!/^\d{8}$/.test(studentId)) return alert('Student ID must be exactly 8 digits');

        try {
            setLoading(true);

            const res = await api.post('/api/auth/student/register', {
                studentId,
                name,
                email,
                course,
                yearLevel,
                password: signupPassword,
            });

            setSignupSuccessData({
                message: res.message || 'Account registered! Please check your email inbox to confirm your account.',
                email,
                confirmUrl: res.confirmUrl,
            });

            setSignupId('');
            setSignupName('');
            setSignupEmail('');
            setSignupPassword('');
            setSignupConfirm('');
            setLoginId(studentId);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        'Access your disciplinary records',
        'View community service hours',
        'Track pending penalties',
        'Submit and monitor appeals',
    ];

    const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    if (redirecting) return <DashboardSkeleton />;

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="w-full max-w-[1100px] min-h-[660px] bg-white rounded-none md:rounded-3xl shadow-none md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] overflow-hidden flex flex-col md:flex-row border-0 md:border border-slate-100">

                {/* LEFT HERO */}
                <div
                    className="relative md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between overflow-hidden min-h-[360px] md:min-h-auto bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950"
                >
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide uppercase mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Official Portal
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-lg flex-shrink-0">
                                <img src={logo} alt="Columban College Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">COLUMBAN COLLEGE</h2>
                                <p className="text-blue-200 text-xs sm:text-sm font-semibold tracking-wider uppercase">Nursing Discipline Monitoring</p>
                            </div>
                        </div>

                        <p className="text-blue-100/90 text-sm leading-relaxed max-w-sm mt-4">
                            Student Portal for disciplinary record monitoring, community service tracking, and appeal management.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8 space-y-3">
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm text-blue-100/90">
                                <div className="w-5 h-5 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-emerald-300 font-bold text-xs flex-shrink-0">✓</div>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-10 pt-8 mt-8 border-t border-white/15 flex items-center justify-between text-xs text-blue-200/80">
                        <span>CCNDM • Student Portal</span>
                    </div>
                </div>

                {/* RIGHT FORM */}
                <div className="md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center bg-white">
                    <div className="max-w-[420px] w-full mx-auto">
                        <div className="min-h-[460px] flex flex-col justify-center">

                            {/* Alert banner if present */}
                            {loginAlert && (
                                <div className={`mb-6 p-4 rounded-xl border text-sm ${
                                    loginAlert.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-red-50 border-red-200 text-red-800'
                                }`}>
                                    <p className="font-semibold">{loginAlert.message}</p>
                                </div>
                            )}

                            {/* SIGNUP SUCCESS BANNER */}
                            {signupSuccessData && (
                                <div className="mb-6 p-5 rounded-2xl bg-blue-50 border border-blue-200 text-slate-800">
                                    <div className="flex items-center gap-2.5 text-blue-700 font-bold text-base mb-1.5">
                                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">✓</span>
                                        Check Your Email!
                                    </div>
                                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                                        We sent a confirmation link to <strong className="text-blue-900">{signupSuccessData.email}</strong>. You can log in now, but please confirm your email to secure your account.
                                    </p>

                                    {signupSuccessData.confirmUrl && (
                                        <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 text-xs">
                                            <p className="font-bold text-blue-800 mb-1">Testing Locally (Dev Mode):</p>
                                            <a
                                                href={signupSuccessData.confirmUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 font-semibold underline break-all block hover:text-blue-800"
                                            >
                                                Click here to verify email directly
                                            </a>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSignupSuccessData(null);
                                            setPanel('login');
                                        }}
                                        className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
                                    >
                                        Proceed to Login
                                    </button>
                                </div>
                            )}

                            {panel === 'login' && (
                                <form onSubmit={handleLogin} className="anim-panel">
                                    <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 text-center mb-2">Student Login</h1>
                                    <p className="text-sm text-slate-500 text-center mb-8">Sign in with your Student ID to access your records</p>

                                    <div className="relative mb-5">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Student ID <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.idCard}</span>
                                                <input
                                                    type="text"
                                                    value={loginId}
                                                    onChange={(e) => setLoginId(e.target.value)}
                                                    placeholder="Enter your 8-digit Student ID"
                                                    maxLength={8}
                                                    required
                                                    className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5"
                                                />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-4">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Password <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                                <input
                                                    type={showPassword.login ? 'text' : 'password'}
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    placeholder="Enter your password"
                                                    required
                                                    className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5"
                                                />
                                                <button type="button" onClick={() => togglePassword('login')} className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors">
                                                    {showPassword.login ? Icon.eyeOff : Icon.eye}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="flex items-center justify-between mb-7">
                                        <label className="flex items-center gap-2 text-[13px] text-slate-500 cursor-pointer">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                                            Remember Me
                                        </label>
                                        <Link
                                            to="/student/ForgotPassword"
                                            className="text-[13px] text-blue-600 font-semibold hover:underline"
                                        >
                                            Forgot Password?
                                        </Link>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-xl mb-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                                        {loading ? 'Logging in...' : 'Login'}
                                    </button>

                                    <p className="text-center text-[13.5px] text-slate-500 mb-6">
                                        Don't have an account?{' '}
                                        <button type="button" onClick={() => { setSignupSuccessData(null); setPanel('signup'); }} className="text-blue-600 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0">Sign Up</button>
                                    </p>

                                    <p className="text-[11.5px] text-slate-400 leading-relaxed text-center">
                                        By clicking the login button, you recognize the authority of Columban College to process your personal and sensitive information, pursuant to the Columban College General Privacy Notice and applicable laws.
                                    </p>
                                </form>
                            )}

                            {panel === 'signup' && (
                                <form onSubmit={handleSignup} className="anim-panel">
                                    <div className="mb-4 rounded-xl bg-blue-50/80 border border-blue-100 p-3.5 text-xs text-blue-900 leading-relaxed">
                                        Enter your <strong>Student ID</strong> and your active <strong>email address (e.g. Gmail)</strong>. A verification link will be sent to complete your registration.
                                    </div>
                                    <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 text-center mb-1">Student Sign Up</h1>
                                    <p className="text-xs text-slate-500 text-center mb-6">Create your student account to get started</p>

                                    <div className="relative mb-3">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Student ID <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.idCard}</span>
                                                <input
                                                    type="text"
                                                    value={signupId}
                                                    onChange={(e) => setSignupId(e.target.value)}
                                                    placeholder="8-digit ID (e.g., 26012345)"
                                                    maxLength={8}
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 py-1"
                                                />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-3">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Full Name <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.user}</span>
                                                <input
                                                    type="text"
                                                    value={signupName}
                                                    onChange={(e) => setSignupName(e.target.value)}
                                                    placeholder="Enter your full name"
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 py-1"
                                                />
                                            </div>
                                        </fieldset>
                                    </div>

                                    {/* Email with support for gmail.com or any email */}
                                    <div className="relative mb-3">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Email Address (Gmail, School, etc.) <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.mail}</span>
                                                <input
                                                    type="email"
                                                    value={signupEmail}
                                                    onChange={(e) => setSignupEmail(e.target.value)}
                                                    placeholder="e.g. studentname@gmail.com"
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 py-1 min-w-0"
                                                />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Course <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2 flex-shrink-0">{Icon.book}</span>
                                                <input
                                                    type="text"
                                                    value={signupCourse}
                                                    onChange={(e) => setSignupCourse(e.target.value)}
                                                    placeholder="BS Nursing"
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none py-1"
                                                />
                                            </div>
                                        </fieldset>

                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Year Level <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2 flex-shrink-0">{Icon.calendar}</span>
                                                <select
                                                    value={signupYearLevel}
                                                    onChange={(e) => setSignupYearLevel(e.target.value)}
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none py-1 cursor-pointer appearance-none"
                                                >
                                                    {yearLevels.map((year) => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-3">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Password <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                                <input
                                                    type={showPassword.signup ? 'text' : 'password'}
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    placeholder="Min. 8 characters"
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 py-1"
                                                />
                                                <button type="button" onClick={() => togglePassword('signup')} className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors">
                                                    {showPassword.signup ? Icon.eyeOff : Icon.eye}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-5">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Confirm Password <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                                <input
                                                    type={showPassword.confirm ? 'text' : 'password'}
                                                    value={signupConfirm}
                                                    onChange={(e) => setSignupConfirm(e.target.value)}
                                                    placeholder="Confirm password"
                                                    required
                                                    className="flex-1 bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400 py-1"
                                                />
                                                <button type="button" onClick={() => togglePassword('confirm')} className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors">
                                                    {showPassword.confirm ? Icon.eyeOff : Icon.eye}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-xl mb-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </button>

                                    <p className="text-center text-[13px] text-slate-500">
                                        Already have an account?{' '}
                                        <button type="button" onClick={() => { setSignupSuccessData(null); setPanel('login'); }} className="text-blue-600 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0">Login</button>
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}