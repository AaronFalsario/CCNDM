const DashboardSkeleton = ({ variant = 'student', isDark = false }) => {
    const isAdmin = variant === 'admin';
    const cardCount = isAdmin ? 4 : 3;

    return (
        <div
            className={`${isDark ? 'dark' : ''} campus-loading min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
            role="status"
            aria-label={`Loading ${isAdmin ? 'admin' : 'student'} dashboard`}
            aria-busy="true"
        >
            <span className="sr-only">Loading dashboard...</span>
            <style>{`
                @keyframes campus-float {
                    0%, 100% { transform: translate3d(0, 0, 0) rotate(-.5deg); }
                    50% { transform: translate3d(0, -5px, 0) rotate(.5deg); }
                }
                @keyframes campus-orbit { to { transform: rotate(360deg); } }
                @keyframes campus-appear { from { opacity: 0; } to { opacity: 1; } }
                @keyframes campus-page {
                    0%, 100% { transform: rotateY(0); }
                    50% { transform: rotateY(-12deg); }
                }
                @keyframes campus-tassel {
                    0%, 100% { transform: rotate(0); }
                    50% { transform: rotate(6deg); }
                }
                @keyframes campus-dot {
                    0%, 80%, 100% { opacity: .4; transform: translateY(0) scale(.85); }
                    40% { opacity: 1; transform: translateY(-2px) scale(1); }
                }
                .campus-overlay { animation: campus-appear 280ms ease-out both; }
                .campus-mascot { animation: campus-float 3s cubic-bezier(.45, 0, .55, 1) infinite; will-change: transform; }
                .campus-orbit { animation: campus-orbit 20s linear infinite; }
                .campus-page { transform-origin: 82px 121px; animation: campus-page 2.8s cubic-bezier(.45, 0, .55, 1) infinite; }
                .campus-tassel { transform-origin: 103px 25px; animation: campus-tassel 2.2s ease-in-out infinite; }
                .campus-dot { animation: campus-dot 1.5s ease-in-out infinite; }
                .campus-dot:nth-child(2) { animation-delay: 180ms; }
                .campus-dot:nth-child(3) { animation-delay: 360ms; }
                @media (prefers-reduced-motion: reduce) {
                    .campus-loading *, .campus-loading *::before, .campus-loading *::after { animation: none !important; }
                }
            `}</style>
            <div className="campus-overlay fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-slate-50/80 px-4 text-center backdrop-blur-[2px] dark:bg-slate-950/80">
                <div className="relative h-44 w-44">
                    <div className="campus-orbit absolute inset-2 rounded-full border border-dashed border-blue-300 dark:border-blue-700">
                        <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="absolute bottom-5 -left-1 h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                    <svg className="campus-mascot absolute inset-0 h-full w-full" viewBox="0 0 160 160" fill="none" aria-hidden="true">
                        <ellipse cx="80" cy="148" rx="33" ry="6" fill="#0F172A" fillOpacity=".12" />
                        <path d="M51 99c3-12 14-19 29-19s26 7 29 19l7 33H44l7-33Z" fill="#2563EB" />
                        <path d="m68 83 12 12 12-12" fill="#DBEAFE" />
                        <path d="M54 103 43 117m63-14 11 14" stroke="#F2B88B" strokeWidth="9" strokeLinecap="round" />
                        <circle cx="80" cy="57" r="23" fill="#F2B88B" />
                        <path d="M57 57c0-18 10-28 24-28 13 0 22 10 22 25-5-2-9-6-12-10-6 7-17 11-34 11v2Z" fill="#202A44" />
                        <circle cx="72" cy="60" r="1.8" fill="#172033" />
                        <circle cx="88" cy="60" r="1.8" fill="#172033" />
                        <path d="M75 69c3 3 7 3 10 0" stroke="#9A4E48" strokeWidth="2" strokeLinecap="round" />
                        <path d="m53 31 27-13 29 13-29 13-27-13Z" fill="#1D4ED8" />
                        <path d="M63 34v7c10 7 21 7 32 0v-7" fill="#1E40AF" />
                        <path className="campus-tassel" d="M109 31v18" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="109" cy="50" r="3" fill="#FBBF24" />
                        <path d="m47 119 25-8 8 6-25 10-8-8Z" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
                        <path className="campus-page" d="m80 117 27-8 6 8-29 10-4-10Z" fill="#FFFDF5" stroke="#CBD5E1" strokeWidth="1.5" />
                        <path d="m56 120 13-4m-8 8 13-4m15 0 14-5" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="m43 117 6-3 7 13-6 3-7-13Zm68 0 7-3 7 13-6 3-8-13Z" fill="#F2B88B" />
                    </svg>
                </div>
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Your dashboard is getting ready</div>
                <div className="flex items-center gap-1.5" aria-hidden="true">
                    <span className="campus-dot h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span className="campus-dot h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span className="campus-dot h-1.5 w-1.5 rounded-full bg-blue-600" />
                </div>
            </div>
            <aside className="fixed inset-y-0 left-0 hidden w-[68px] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:block">
                <div className="mx-auto mt-5 h-11 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="mt-10 space-y-5 px-6">
                    {Array.from({ length: 7 }, (_, index) => (
                        <div key={index} className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    ))}
                </div>
            </aside>

            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:ml-[68px] md:px-8">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="hidden h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800 sm:block" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                </div>
            </header>

            <main className="space-y-6 px-4 py-6 md:ml-[68px] md:px-8 md:py-8" aria-hidden="true">
                <div className="space-y-3">
                    <div className="h-7 w-56 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${isAdmin ? 'xl:grid-cols-4' : 'lg:grid-cols-3'}`}>
                    {Array.from({ length: cardCount }, (_, index) => (
                        <section key={index} className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                            <div className="mt-5 h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-4 h-3 w-36 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                        </section>
                    ))}
                </div>

                <div className={`grid grid-cols-1 gap-5 ${isAdmin ? 'xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]' : 'lg:grid-cols-2'}`}>
                    {Array.from({ length: 2 }, (_, panelIndex) => (
                        <section key={panelIndex} className="min-h-64 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                            <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                            <div className="mt-6 space-y-4">
                                {Array.from({ length: 4 }, (_, rowIndex) => (
                                    <div key={rowIndex} className="flex items-center gap-3">
                                        <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                                            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default DashboardSkeleton;