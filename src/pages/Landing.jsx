import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsModal from '../components/TermsModal';
import Toast from '../components/Toast';

const STUDENT_PORTAL_URL = '/student/login';
const ADMIN_PORTAL_URL = '/admin/login';

const FEATURES = [
    {
        title: 'Track Service Hours',
        desc: 'View required service hours, pending tasks, and completed work in an organized dashboard.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
        span: 'lg:col-span-2',
        accent: 'from-blue-500 to-cyan-400',
    },
    {
        title: 'Real-time Updates',
        desc: 'Monitor deadlines and stay informed about your status with instant updates.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
            </svg>
        ),
        span: 'lg:col-span-1',
        accent: 'from-indigo-500 to-purple-400',
    },
    {
        title: 'Secure Access',
        desc: 'Role-based access control for students and administrators.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        span: 'lg:col-span-1',
        accent: 'from-emerald-500 to-teal-400',
    },
    {
        title: 'Efficient Management',
        desc: 'Streamlined recording, verification, and updating of all student service requirements.',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
        span: 'lg:col-span-2',
        accent: 'from-orange-500 to-amber-400',
    },
];

const STEPS = [
    { num: '01', title: 'Sign In', desc: 'Access the portal using your official student credentials.' },
    { num: '02', title: 'Review', desc: 'See your assigned service hours, deadlines, and records.' },
    { num: '03', title: 'Complete', desc: 'Submit activities and track your progress in real-time.' },
];

const NAV_LINKS = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '#about' },
];

function useScrollAnimation() {
    useEffect(() => {
        const elements = document.querySelectorAll('.reveal');
        if (!elements.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -80px 0px' }
        );
        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);
}

export default function Landing() {
    const navigate = useNavigate();
    const [showTerms, setShowTerms] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useScrollAnimation();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = showTerms || mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showTerms, mobileOpen]);

    useEffect(() => {
        if (!showTerms) return;
        const onKey = (e) => e.key === 'Escape' && setShowTerms(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showTerms]);

    const handlePortalAccess = (e) => {
        e?.preventDefault();
        if (localStorage.getItem('saocst_terms_accepted') === 'true') {
            navigate(STUDENT_PORTAL_URL);
            return;
        }
        setShowTerms(true);
    };

    const handleAcceptTerms = () => {
        localStorage.setItem('saocst_terms_accepted', 'true');
        localStorage.setItem('saocst_terms_accepted_at', new Date().toISOString());
        navigate(STUDENT_PORTAL_URL);
    };

    const handleSecretAdmin = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setToast({ message: 'Redirecting to Admin Portal…' });
        setTimeout(() => navigate(ADMIN_PORTAL_URL), 1000);
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans text-slate-800 antialiased overflow-x-hidden">

            {/* ===== GLOBAL STYLES ===== */}
            <style>{`
        * { -webkit-tap-highlight-color: transparent; }
        html { scroll-behavior: smooth; }

        @keyframes navSlide {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nav-in { animation: navSlide 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .fade-up   { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .fade-up-2 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
        .fade-up-3 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both; }
        .fade-up-4 { animation: fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s both; }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal.in-view { opacity: 1; transform: translateY(0); }
        .reveal[data-delay="1"] { transition-delay: 0.08s; }
        .reveal[data-delay="2"] { transition-delay: 0.16s; }
        .reveal[data-delay="3"] { transition-delay: 0.24s; }
        .reveal[data-delay="4"] { transition-delay: 0.32s; }

        .text-gradient {
          background: linear-gradient(120deg, #2563eb 0%, #4f46e5 50%, #0891b2 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, black 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 70% 50% at 50% 0%, black 40%, transparent 100%);
        }

        .card-shine { position: relative; overflow: hidden; }
        .card-shine::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(500px circle at var(--mx, 50%) var(--my, 50%), rgba(37, 99, 235, 0.06), transparent 40%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .card-shine:hover::before { opacity: 1; }

        ::selection { background: #2563eb; color: white; }

        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        @media (prefers-reduced-motion: reduce) {
          .nav-in, .fade-up, .fade-up-2, .fade-up-3, .fade-up-4 { animation: none; }
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

            {/* ===== NAVBAR ===== */}
            <nav className={`nav-in fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm py-3' : 'bg-white/80 backdrop-blur-sm py-5'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 no-underline group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                            <img src="/CC.png" alt="CCNDM logo" className="w-7 h-7 object-contain" />
                        </div>
                        <div className="leading-none hidden sm:block">
                            <div className="text-base font-bold text-slate-900 tracking-tight">CCNDM</div>
                            <div className="text-[10px] font-medium text-slate-500 tracking-[0.15em] uppercase mt-0.5">Nursing Discipline</div>
                        </div>
                    </a>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="text-sm font-medium text-slate-600 hover:text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <a
                            href="#"
                            onClick={handlePortalAccess}
                            className="group inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                        >
                            Student Portal
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 group-hover:translate-x-0.5 transition-transform">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-[5px] bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        <span className={`w-5 h-[2px] bg-slate-800 rounded-sm transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
                        <span className={`w-5 h-[2px] bg-slate-800 rounded-sm transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-5 h-[2px] bg-slate-800 rounded-sm transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
                    </button>
                </div>
            </nav>

            {/* ===== MOBILE MENU ===== */}
            <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
                <div className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-white border-l border-slate-200 p-6 pt-24 transition-transform duration-300 shadow-2xl ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col gap-1">
                        {NAV_LINKS.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-base font-semibold text-slate-700 hover:text-blue-700 py-3 px-4 rounded-xl hover:bg-blue-50 transition-all"
                            >
                                {item.label}
                            </a>
                        ))}
                        <a
                            href="#"
                            onClick={(e) => { setMobileOpen(false); handlePortalAccess(e); }}
                            className="mt-4 inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20"
                        >
                            Student Portal
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* ===== HERO ===== */}
            <section className="relative z-10 pt-32 sm:pt-40 pb-20 sm:pb-24 px-5 sm:px-8 bg-gradient-to-b from-blue-50/50 to-white">
                <div className="absolute inset-0 grid-bg pointer-events-none" />

                <div className="relative max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 items-center">

                        {/* LEFT: copy */}
                        <div className="lg:col-span-6 text-center lg:text-left">
                            <div className="fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                </span>
                                <span className="text-xs font-semibold text-blue-700 tracking-wide">System Online · v1.0.0</span>
                            </div>

                            <h1 className="fade-up-2 text-4xl sm:text-5xl lg:text-[64px] font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
                                Nursing Discipline
                                <span className="block text-gradient mt-1">Monitoring System</span>
                            </h1>

                            <p className="fade-up-3 text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                                A centralized digital platform for Columban College nursing students to
                                track community service hours, monitor disciplinary records, and stay
                                on top of every requirement.
                            </p>

                            <div className="fade-up-4 flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
                                <a
                                    href="#"
                                    onClick={handlePortalAccess}
                                    className="group inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-4 rounded-xl font-bold text-base shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer w-full sm:w-auto justify-center"
                                >
                                    Get Started
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </a>
                                <a
                                    href="#features"
                                    className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 px-7 py-4 rounded-xl font-semibold text-base transition-all duration-200 w-full sm:w-auto justify-center"
                                >
                                    Explore Features
                                </a>
                            </div>
                        </div>

                        {/* RIGHT: product preview */}
                        <div className="lg:col-span-6 relative fade-up-3">
                            <div className="relative max-w-md mx-auto lg:max-w-none">
                                {/* Soft shadow */}
                                <div className="absolute -inset-6 bg-gradient-to-tr from-blue-200/40 via-indigo-100/30 to-cyan-100/40 rounded-[40px] blur-3xl" />

                                {/* App window */}
                                <div className="relative">
                                    <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2)] border border-slate-200 overflow-hidden">
                                        {/* Window bar */}
                                        <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                            <div className="ml-3 text-[10px] text-slate-400 font-mono">ccndm.portal / dashboard</div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 space-y-3">
                                            {/* Progress card */}
                                            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                                <div className="relative">
                                                    <div className="text-[10px] text-blue-100 font-medium uppercase tracking-wider">Progress</div>
                                                    <div className="text-3xl font-extrabold text-white mt-1">78%</div>
                                                    <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                                        <div className="h-full w-[78%] bg-white rounded-full" />
                                                    </div>
                                                    <div className="flex justify-between mt-2 text-[10px] text-blue-100">
                                                        <span>78 hrs completed</span>
                                                        <span>100 hrs required</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stats grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Pending</div>
                                                    <div className="text-2xl font-bold text-slate-900 mt-1">12</div>
                                                    <div className="text-[10px] text-orange-500 mt-1">↑ 3 this week</div>
                                                </div>
                                                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Status</div>
                                                    <div className="text-2xl font-bold text-emerald-600 mt-1">Good</div>
                                                    <div className="text-[10px] text-slate-500 mt-1">No violations</div>
                                                </div>
                                            </div>

                                            {/* Activity */}
                                            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                                                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2.5">Recent Activity</div>
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                                                        <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="h-1.5 bg-slate-200 rounded-full w-3/4" />
                                                            <div className="h-1 bg-slate-100 rounded-full w-1/2" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="features" className="relative z-10 px-5 sm:px-8 py-20 sm:py-28 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="max-w-3xl mb-14">
                        <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 tracking-wider uppercase mb-5">
                            <span className="w-1 h-1 rounded-full bg-blue-600" />
                            Key Features
                        </div>
                        <h2 className="reveal text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-5" data-delay="1">
                            Built for the way
                            <span className="block text-gradient">students actually work.</span>
                        </h2>
                        <p className="reveal text-slate-600 text-base sm:text-lg max-w-2xl" data-delay="2">
                            Every feature is designed to reduce friction, increase transparency, and keep everyone accountable — without paperwork.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {FEATURES.map((f, index) => (
                            <FeatureCard key={f.title} feature={f} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section id="how-it-works" className="relative z-10 px-5 sm:px-8 py-20 sm:py-28 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <div className="reveal inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700 tracking-wider uppercase mb-5">
                            <span className="w-1 h-1 rounded-full bg-blue-600" />
                            How It Works
                        </div>
                        <h2 className="reveal text-4xl sm:text-5xl lg:text-[56px] font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-5" data-delay="1">
                            Three steps.
                            <span className="text-gradient"> Zero confusion.</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map((step, index) => (
                            <div
                                key={step.num}
                                className="reveal group relative rounded-3xl border border-slate-200 bg-white p-8 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300"
                                data-delay={index + 1}
                            >
                                <div className="absolute top-6 right-6 text-[80px] font-black text-slate-300/60 leading-none select-none group-hover:text-blue-300/70 transition-colors">
                                    {step.num}
                                </div>

                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                        <span className="text-sm font-bold text-white">{step.num}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== ABOUT / CTA ===== */}
            <section id="about" className="relative z-10 px-5 sm:px-8 py-20 sm:py-28 bg-white">
                <div className="reveal max-w-6xl mx-auto relative overflow-hidden rounded-[32px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700" />
                    <div
                        className="absolute inset-0 opacity-25"
                        style={{
                            backgroundImage:
                                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.5), transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.35), transparent 50%)',
                        }}
                    />

                    <div className="relative px-8 sm:px-16 py-16 sm:py-20 text-center">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Ready to access your portal?
                        </h2>
                        <p className="text-blue-100 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
                            Sign in with your student credentials to view and manage your community service requirements.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="#"
                                onClick={handlePortalAccess}
                                className="group inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base shadow-2xl shadow-blue-900/20 hover:-translate-y-0.5 transition-all cursor-pointer w-full sm:w-auto justify-center"
                            >
                                Go to Student Portal
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </a>
                            <a
                                href="mailto:ccndm@gmail.com"
                                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-base backdrop-blur-sm transition-all w-full sm:w-auto justify-center"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="relative z-10 border-t border-slate-200 px-5 sm:px-8 pt-16 pb-8 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <img src="/CC.png" alt="CCNDM logo" className="w-7 h-7 object-contain" />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-slate-900 tracking-tight">CCNDM</div>
                                    <div className="text-[10px] text-slate-500 tracking-[0.15em] uppercase">Nursing Discipline</div>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
                                A centralized digital system for managing student community service requirements.
                            </p>
                        </div>

                        {/* Platform */}
                        <div>
                            <h3 className="text-slate-900 text-xs font-bold mb-5 uppercase tracking-widest">Platform</h3>
                            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                                <li>
                                    <a href="#features" className="text-sm text-slate-600 hover:text-blue-700 transition no-underline">Features</a>
                                </li>
                                <li>
                                    <a href="#how-it-works" className="text-sm text-slate-600 hover:text-blue-700 transition no-underline">How It Works</a>
                                </li>
                                <li>
                                    <a href="#" onClick={handlePortalAccess} className="text-sm text-slate-600 hover:text-blue-700 transition no-underline">Student Portal</a>
                                </li>
                            </ul>
                        </div>

                        {/* Institution */}
                        <div>
                            <h3 className="text-slate-900 text-xs font-bold mb-5 uppercase tracking-widest">Institution</h3>
                            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                                {['Columban College', 'Nursing Dept.', 'Student Affairs'].map((item) => (
                                    <li key={item}>
                                        <span className="text-sm text-slate-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h3 className="text-slate-900 text-xs font-bold mb-5 uppercase tracking-widest">Contact</h3>
                            <ul className="list-none p-0 m-0 flex flex-col gap-3">
                                <li className="flex items-center gap-2.5 text-sm text-slate-600">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-600 flex-shrink-0">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    ccndm@gmail.com
                                </li>
                            </ul>
                            <div className="flex gap-2.5 mt-5">
                                <a
                                    href="#"
                                    aria-label="Facebook"
                                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-slate-200 hover:bg-blue-600 hover:border-blue-600 text-slate-600 hover:text-white transition-all"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                            © 2026 CCNDM — Columban College Nursing Discipline Monitoring
                        </p>
                        <button
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 transition select-none text-[10px] font-medium"
                            title="Admin Access (Double Click)"
                            onDoubleClick={handleSecretAdmin}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            </svg>
                            v1.0.0
                        </button>
                    </div>
                </div>
            </footer>

            <TermsModal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                onAccept={handleAcceptTerms}
            />

            {toast && <Toast message={toast.message} />}
        </div>
    );
}

/* ===== Feature Card with mouse-tracking shine ===== */
function FeatureCard({ feature, index }) {
    const ref = useRef(null);

    const handleMouseMove = (e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        ref.current.style.setProperty('--mx', `${e.clientX - rect.left}px`);
        ref.current.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            className={`reveal card-shine group relative rounded-3xl border border-slate-200 bg-white p-7 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 ${feature.span}`}
            data-delay={index + 1}
        >
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/15 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2.5">{feature.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>

            <div className="absolute top-7 right-7 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-500">
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                </svg>
            </div>
        </div>
    );
}