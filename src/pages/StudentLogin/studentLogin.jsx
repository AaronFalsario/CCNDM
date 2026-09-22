import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { hashPassword, verifyPassword, isBcryptHash } from '../../lib/password';

/*SVG ICONS*/
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
    idCard: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="M15 11h4M15 15h4M6 16c.5-1.5 1.8-2.5 3-2.5s2.5 1 3 2.5" />
        </svg>
    ),
    user: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    lock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
};

export default function StudentLogin() {
    const navigate = useNavigate();
    const [panel, setPanel] = useState('login');
    const [showPassword, setShowPassword] = useState({});
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [loginId, setLoginId] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const [signupId, setSignupId] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirm, setSignupConfirm] = useState('');

    /* DARK MODE FIX */
    useEffect(() => {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark');
    }, []);

    useEffect(() => {
        const remembered = localStorage.getItem('rememberedStudentId');
        if (remembered) {
            setLoginId(remembered);
            setRememberMe(true);
        }
    }, []);

    useEffect(() => {
        if (sessionStorage.getItem('currentStudent')) {
            navigate('/student/dashboard', { replace: true });
        }
    }, [navigate]);

    const togglePassword = (key) => {
        setShowPassword((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogin = async (e) => {
        e?.preventDefault();
        const studentId = loginId.trim();
        const password = loginPassword;

        if (!studentId || !password) return alert('Please enter both Student ID and password');
        if (!/^\d{8}$/.test(studentId)) return alert('Student ID must be exactly 8 digits');

        try {
            setLoading(true);

            const { data: studentData, error: studentError } = await supabase
                .from('students').select('*').eq('student_id_number', studentId).maybeSingle();

            if (studentError) throw new Error('Database error: ' + studentError.message);
            if (!studentData) throw new Error('Invalid Student ID or password');

            console.log('=== LOGIN DEBUG ===');
            console.log('Stored password:', studentData.password);
            console.log('Is bcrypt hash?', isBcryptHash(studentData.password));

            let passwordMatches = false;

            if (isBcryptHash(studentData.password)) {
                passwordMatches = await verifyPassword(password, studentData.password);
                console.log('bcrypt compare result:', passwordMatches);
            } else {
                passwordMatches = studentData.password === password;
                console.log('Plaintext compare result:', passwordMatches);
                if (passwordMatches) {
                    try {
                        const newHash = await hashPassword(password);
                        await supabase
                            .from('students')
                            .update({ password: newHash })
                            .eq('student_id_number', studentId);
                        console.log('[LOGIN] Auto-upgraded password to hash');
                    } catch (e) {
                        console.warn('[LOGIN] Auto-upgrade failed:', e);
                    }
                }
            }

            if (!passwordMatches) throw new Error('Invalid Student ID or password');

            if (studentData.status === 'inactive' || studentData.status === 'suspended')
                throw new Error('Your account is inactive. Please contact the administrator.');

            await supabase.from('students')
                .update({ last_login: new Date().toISOString() })
                .eq('student_id_number', studentId);

            const studentInfo = {
                id: studentData.id,
                student_id_number: studentData.student_id_number,
                email: studentData.email,
                name: studentData.name,
                course: studentData.course || '',
                year_level: studentData.year_level || '',
                status: studentData.status || 'active',
                role: 'student',
            };

            sessionStorage.setItem('currentStudent', JSON.stringify(studentInfo));

            if (rememberMe) localStorage.setItem('rememberedStudentId', studentId);
            else localStorage.removeItem('rememberedStudentId');

            navigate('/student/dashboard');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e?.preventDefault();
        const studentId = signupId.trim();
        const name = signupName.trim();
        const email = signupEmail.trim();

        if (!studentId || !name || !email || !signupPassword || !signupConfirm)
            return alert('Please fill in all fields');
        if (signupPassword !== signupConfirm) return alert('Passwords do not match!');
        if (signupPassword.length < 6) return alert('Password must be at least 6 characters');
        if (!email.includes('@')) return alert('Please enter a valid email address');
        if (name.length < 2) return alert('Please enter your full name');
        if (!/^\d{8}$/.test(studentId)) return alert('Student ID must be exactly 8 digits');

        try {
            setLoading(true);

            console.log('=== SIGNUP START ===');
            console.log('hashPassword type:', typeof hashPassword);

            const { data: existingId } = await supabase
                .from('students').select('student_id_number').eq('student_id_number', studentId).maybeSingle();
            if (existingId) throw new Error('Student ID already registered');

            const { data: existingEmail } = await supabase
                .from('students').select('email').eq('email', email).maybeSingle();
            if (existingEmail) throw new Error('Email already registered');

            console.log('[SIGNUP] Plain:', signupPassword);
            const hashedPassword = await hashPassword(signupPassword);
            console.log('[SIGNUP] Hashed:', hashedPassword);
            console.log('[SIGNUP] Hash length:', hashedPassword.length);

            const { error: insertError } = await supabase.from('students').insert([{
                student_id_number: studentId,
                name,
                email,
                password: hashedPassword,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }]);

            if (insertError) {
                console.error('=== SIGNUP ERROR ===');
                console.error('Message:', insertError.message);
                console.error('Code:', insertError.code);
                console.error('Details:', insertError.details);
                console.error('Hint:', insertError.hint);
                throw new Error('Failed to create account: ' + insertError.message);
            }

            alert('Account created successfully! You can now login with your Student ID.');
            setSignupId(''); setSignupName(''); setSignupEmail('');
            setSignupPassword(''); setSignupConfirm('');
            setPanel('login');
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

    return (
        <div className="min-h-screen w-full bg-[#EEF3FF] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
            <style>{`
        @keyframes slideUpCard { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rotateIn { from { opacity: 0; transform: rotate(-180deg) scale(0.5); } to { opacity: 1; transform: rotate(0) scale(1); } }
        @keyframes panelFade { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .anim-card { animation: slideUpCard 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; }
        .anim-left { animation: slideInLeft 0.6s ease-out 0.1s both; }
        .anim-right { animation: slideInRight 0.6s ease-out 0.15s both; }
        .anim-logo { animation: rotateIn 0.6s ease-out 0.2s both; }
        .anim-feature { animation: fadeInUp 0.5s ease-out both; }
        .anim-panel { animation: panelFade 0.4s ease-out both; }
      `}</style>

            <div className="w-full max-w-[1200px] anim-card">
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(37,99,235,0.15)] overflow-hidden flex flex-col md:flex-row min-h-[640px]">

                    <div className="w-full md:w-[45%] relative flex flex-col items-center justify-center p-8 sm:p-12 md:p-14 text-center bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1741B0] border-b md:border-b-0 md:border-r border-slate-100 anim-left overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <img src="/CC.png" alt="CCNDM Logo" className="w-28 h-28 sm:w-32 sm:h-32 object-contain mb-6 anim-logo drop-shadow-lg" />
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 tracking-wide">COLUMBAN COLLEGE</h2>
                            <h3 className="text-sm sm:text-base font-semibold text-blue-100 tracking-wide uppercase mb-2">Nursing Discipline Monitoring</h3>
                            <p className="text-[11px] text-blue-200 mb-10 font-medium tracking-widest">VERSION 1.0.0</p>

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

                    <div className="w-full md:w-[55%] p-8 sm:p-10 md:p-14 flex flex-col justify-center anim-right">
                        <div className="w-full max-w-[440px] mx-auto">

                            {panel === 'login' && (
                                <form onSubmit={handleLogin} className="anim-panel">
                                    <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 text-center mb-2">Student Login</h1>
                                    <p className="text-sm text-slate-500 text-center mb-9">Sign in to access your student portal</p>

                                    <div className="relative mb-5">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Student ID <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.idCard}</span>
                                                <input type="text" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="Enter your Student ID" className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-3">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Password <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                                <input type={showPassword.login ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Your password" className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                                <button type="button" onClick={() => togglePassword('login')} className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors">
                                                    {showPassword.login ? Icon.eyeOff : Icon.eye}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="flex items-center justify-between mb-7">
                                        <label className="flex items-center gap-2 text-[13px] text-slate-500 cursor-pointer">
                                            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 accent-blue-600" />
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
                                        <button type="button" onClick={() => setPanel('signup')} className="text-blue-600 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0">Sign Up</button>
                                    </p>

                                    <p className="text-[11.5px] text-slate-400 leading-relaxed text-center">
                                        By clicking the login button, you recognize the authority of Columban College to process your personal and sensitive information, pursuant to the Columban College General Privacy Notice and applicable laws.
                                    </p>
                                </form>
                            )}

                            {panel === 'signup' && (
                                <form onSubmit={handleSignup} className="anim-panel">
                                    <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-800 text-center mb-2">Student Sign Up</h1>
                                    <p className="text-sm text-slate-500 text-center mb-9">Create your account to get started</p>

                                    <div className="relative mb-4">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Student ID <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.idCard}</span>
                                                <input type="text" value={signupId} onChange={(e) => setSignupId(e.target.value)} placeholder="Enter your Student ID" required className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                            </div>
                                        </fieldset>
                                    </div>
                                    <p className="text-[10.5px] text-slate-400 mb-5 pl-1">Format: 8 digits (e.g., 26012345)</p>

                                    <div className="relative mb-5">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Full Name <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.user}</span>
                                                <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Enter your full name" required className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-5">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Email Address <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.mail}</span>
                                                <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="student@gmail.com" required className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-5">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Password <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                                <input type={showPassword.signup ? 'text' : 'password'} value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Create a password (min. 6 chars)" required className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                                <button type="button" onClick={() => togglePassword('signup')} className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors">
                                                    {showPassword.signup ? Icon.eyeOff : Icon.eye}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <div className="relative mb-7">
                                        <fieldset className="relative border-[1.5px] border-slate-300 rounded-xl px-3 pt-1 pb-1.5 transition-colors focus-within:border-blue-500">
                                            <legend className="text-[11px] text-slate-500 px-1 font-semibold">Confirm Password <span className="text-red-500">*</span></legend>
                                            <div className="flex items-center">
                                                <span className="text-slate-400 mr-2.5 flex-shrink-0">{Icon.lock}</span>
                                                <input type={showPassword.confirm ? 'text' : 'password'} value={signupConfirm} onChange={(e) => setSignupConfirm(e.target.value)} placeholder="Confirm your password" required className="flex-1 bg-transparent text-[15px] text-slate-800 outline-none placeholder:text-slate-400 py-1.5" />
                                                <button type="button" onClick={() => togglePassword('confirm')} className="text-slate-400 hover:text-blue-500 p-1 flex items-center transition-colors">
                                                    {showPassword.confirm ? Icon.eyeOff : Icon.eye}
                                                </button>
                                            </div>
                                        </fieldset>
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-bold rounded-xl mb-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                                        {loading ? 'Creating account...' : 'Sign Up'}
                                    </button>

                                    <p className="text-center text-[13.5px] text-slate-500">
                                        Already have an account?{' '}
                                        <button type="button" onClick={() => setPanel('login')} className="text-blue-600 font-semibold cursor-pointer hover:underline bg-transparent border-none p-0">Login</button>
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