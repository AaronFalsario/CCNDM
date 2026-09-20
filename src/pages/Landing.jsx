import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TermsModal from '../components/TermsModal';
import Toast from '../components/Toast';

const STUDENT_PORTAL_URL = '/student/login';
const ADMIN_PORTAL_URL = '/admin/login';

const FEATURES = [
    {
        title: 'Track Service Hours',
        desc: 'View required Service hours, pending task, and completed work in an organized dashboard',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        ),
    },
    {
        title: 'Real-time Access',
        desc: 'Monitor Deadline and stay informed about your Disciplinary status with instant update',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l4 2" />
            </svg>
        ),
    },
    {
        title: 'Secure Access',
        desc: 'Dedicated portal for student, and administrators with role-based access control',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        title: 'Efficient Management',
        desc: 'Streamlined recording, verification and updating of student community service requirements',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <circle cx="12" cy="12" r="10" />
                <path d="M9 12l2 2 4-4" />
            </svg>
        ),
    },
];

function useScrollAnimation() {
    useEffect(() => {
        const elements = document.querySelectorAll('.scroll-animate');
        if (!elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
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

    useScrollAnimation();

    useEffect(() => {
        document.body.style.overflow = showTerms ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showTerms]);

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
        setToast({ message: 'Redirecting to Admin Portal...' });
        setTimeout(() => navigate(ADMIN_PORTAL_URL), 1000);
        setTimeout(() => setToast(null), 1500);
    };

    return (
        <div className="min-h-screen w-full bg-white font-sans text-slate-800">

            {/* ===== SCROLL + LOAD ANIMATIONS ===== */}
            <style>{`
        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scrollFadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .nav-animate   { animation: navSlideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .hero-animate  { animation: heroFadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .hero-animate-delayed   { animation: heroFadeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
        .hero-animate-delayed-2 { animation: heroFadeIn 1s   cubic-bezier(0.22, 1, 0.36, 1) 0.4s both; }

        .scroll-animate {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .scroll-animate.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .scroll-animate[data-delay="1"] { transition-delay: 0.1s; }
        .scroll-animate[data-delay="2"] { transition-delay: 0.2s; }
        .scroll-animate[data-delay="3"] { transition-delay: 0.3s; }
        .scroll-animate[data-delay="4"] { transition-delay: 0.4s; }
      `}</style>

            {/* ===== NAVBAR ===== */}
            <nav className="nav-animate sticky top-0 z-50 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between px-5 sm:px-10 py-4">
                    {/* Logo */}
                    <a href="/" className="flex items-center gap-3 no-underline">
                        <img src="/CC.png" alt="CCNDM Logo" className="w-10 h-10 object-contain" />
                        <span className="text-xl font-bold text-blue-600">CCNDM</span>
                    </a>

                    {/* Desktop Portal link */}
                    <div className="hidden md:flex items-center gap-5">
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-blue-600 font-semibold cursor-pointer hover:text-blue-800 transition"
                            onClick={handlePortalAccess}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
                            </svg>
                            Portal
                        </a>
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2"
                        aria-label="Toggle menu"
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        <span className="w-6 h-[3px] bg-slate-800 rounded-sm"></span>
                        <span className="w-6 h-[3px] bg-slate-800 rounded-sm"></span>
                        <span className="w-6 h-[3px] bg-slate-800 rounded-sm"></span>
                    </button>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-100 px-5 py-4">
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-blue-600 font-semibold py-2"
                            onClick={handlePortalAccess}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
                            </svg>
                            Portal
                        </a>
                    </div>
                )}
            </nav>

            {/* ===== HERO ===== */}
            <section className="bg-gradient-to-br from-[#eff6ff] to-white px-5 sm:px-10 py-16 sm:py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="hero-animate text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-blue-600 leading-tight mb-6 tracking-tight">
                        Columban College Nursing Discipline Monitoring
                    </h1>
                    <p className="hero-animate-delayed text-base sm:text-lg text-slate-600 leading-relaxed mb-10 max-w-3xl mx-auto">
                        A centralized Digital System for managing and tracking Student Community
                        Service Requirements with real-time Access and Record keeping
                    </p>
                    <a
                        href="#"
                        className="btn-get-started hero-animate-delayed-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-base shadow-[0_6px_16px_rgba(37,99,235,0.35)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.45)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                        onClick={handlePortalAccess}
                    >
                        Get Started
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </a>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section id="categories" className="bg-white px-5 sm:px-10 py-14 sm:py-20">
                <h2 className="scroll-animate text-3xl sm:text-4xl font-extrabold text-[#0b1e3a] text-center mb-12 tracking-tight">
                    Key Features
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {FEATURES.map((f, index) => (
                        <div
                            className="scroll-animate bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-blue-600 hover:shadow-[0_8px_24px_rgba(37,99,235,0.12)] hover:-translate-y-1"
                            key={f.title}
                            data-delay={index + 1}
                        >
                            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                                {f.icon}
                            </div>
                            <div className="text-lg font-bold text-[#0b1e3a] mb-2.5">
                                {f.title}
                            </div>
                            <div className="text-[14.5px] text-slate-500 leading-relaxed">
                                {f.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="bg-[#0b1e3a] text-slate-400 px-5 sm:px-10 pt-14 sm:pt-16 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8 sm:gap-10 max-w-6xl mx-auto mb-10">
                    {/* Brand */}
                    <div className="scroll-animate">
                        <h3 className="text-white text-base font-semibold mb-4">CCNDM</h3>
                        <p className="text-sm leading-relaxed text-slate-400">
                            Columban College Nursing Discipline Monitoring - A centralized digital
                            system for managing student community service requirements with real-time
                            access and record keeping.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="scroll-animate" data-delay="1">
                        <h3 className="text-white text-base font-semibold mb-4">Quick Links</h3>
                        <ul className="list-none p-0 m-0 flex flex-col gap-2">
                            <li>
                                <a href="/" className="text-sm text-slate-400 hover:text-white transition cursor-pointer no-underline">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#categories" className="text-sm text-slate-400 hover:text-white transition cursor-pointer no-underline">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    onClick={handlePortalAccess}
                                    className="text-sm text-slate-400 hover:text-white transition cursor-pointer no-underline"
                                >
                                    Student Portal
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div className="scroll-animate" data-delay="2">
                        <h3 className="text-white text-base font-semibold mb-4">Follow Us</h3>
                        <div className="flex">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.08] hover:bg-blue-600 text-white transition"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
                                </svg>
                            </a>
                        </div>
                        <p className="mt-4 text-sm text-slate-400">📧 ccndm@gmail.com</p>
                    </div>
                </div>

                {/* Footer bottom */}
                <div className="border-t border-white/10 pt-5 text-center text-[13px] text-slate-500 max-w-6xl mx-auto">
                    <p>© 2026 CCNDM - Columban College Nursing Discipline Monitoring. All rights reserved.</p>
                    <p className="mt-2">
                        <span
                            className="secret-admin inline-block cursor-pointer px-2 py-1 rounded-full bg-white/5 hover:bg-white/10 transition select-none"
                            title="Admin Access (Double Click)"
                            onDoubleClick={handleSecretAdmin}
                        >
                            🔧 <span className="text-[10px]">v1.0.0</span>
                        </span>
                    </p>
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