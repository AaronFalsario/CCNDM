import { useEffect, useState } from 'react';

export default function Toast({
    message,
    type = 'info',
    title = null,
    duration = 3000,
    onClose,
}) {
    const [removing, setRemoving] = useState(false);
    const [progress, setProgress] = useState(100);
    const [mounted, setMounted] = useState(false);

    //ICON + LABEL + COLOR PER TYPE
    const config = {
        success: {
            icon: 'fas fa-check',
            label: 'SUCCESS',
            accent: 'from-emerald-400 to-green-500',
            ring: 'bg-gradient-to-br from-emerald-400 to-green-500',
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
            labelColor: 'text-emerald-600',
            surface: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/70 dark:border-emerald-800',
        },
        error: {
            icon: 'fas fa-times',
            label: 'ERROR',
            accent: 'from-red-400 to-rose-500',
            ring: 'bg-gradient-to-br from-red-400 to-rose-500',
            glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]',
            labelColor: 'text-red-600',
            surface: 'bg-red-50 border-red-200 dark:bg-red-950/70 dark:border-red-800',
        },
        warning: {
            icon: 'fas fa-exclamation',
            label: 'WARNING',
            accent: 'from-amber-400 to-orange-500',
            ring: 'bg-gradient-to-br from-amber-400 to-orange-500',
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)]',
            labelColor: 'text-amber-600',
            surface: 'bg-amber-50 border-amber-200 dark:bg-amber-950/70 dark:border-amber-800',
        },
        info: {
            icon: 'fas fa-info',
            label: 'INFO',
            accent: 'from-blue-400 to-indigo-500',
            ring: 'bg-gradient-to-br from-blue-400 to-indigo-500',
            glow: 'shadow-[0_0_20px_rgba(59,130,246,0.35)]',
            labelColor: 'text-blue-600',
            surface: 'bg-blue-50 border-blue-200 dark:bg-blue-950/70 dark:border-blue-800',
        },
    };

    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
    };

    const c = config[type] || config.info;
    const finalTitle = title || defaultTitles[type] || 'Information';

    //CLOSE
    const close = () => {
        setRemoving(true);
        setTimeout(() => onClose?.(), 220);
    };

    //MOUNT ENTRANCE
    useEffect(() => {
        const id = requestAnimationFrame(() => setMounted(true));
        return () => cancelAnimationFrame(id);
    }, []);

    //AUTO-DISMISS TIMER + PROGRESS
    useEffect(() => {
        if (!duration || duration <= 0) return;
        const start = Date.now();
        const tick = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
        }, 30);
        const timeout = setTimeout(close, duration);
        return () => {
            clearTimeout(timeout);
            clearInterval(tick);
        };
    }, [duration]);

    return (
        <div
            className={`fixed top-6 right-6 z-[9999] w-full max-w-[400px] transition-all duration-300 ${mounted && !removing
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-8 opacity-0'
                }`}
            role="status"
        >
            <style>{`
                @keyframes toastCheckPop {
                    0%   { transform: scale(0.4); opacity: 0; }
                    60%  { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); }
                }
                @keyframes toastShine {
                    0%   { transform: translateX(-120%); }
                    100% { transform: translateX(220%); }
                }
                .toast-check-pop { animation: toastCheckPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s both; }
                .toast-shine { animation: toastShine 1.1s ease-out 0.15s both; }
            `}</style>

            <div
                onClick={close}
                className={`relative rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.18)] border overflow-hidden cursor-pointer ${c.surface}`}
            >
                {/*ACCENT TOP STRIP*/}
                <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${c.accent}`} />

                {/*SHIMMER SWEEP*/}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -left-1/3 h-full w-1/3 bg-gradient-to-r from-transparent via-white/60 to-transparent toast-shine" />
                </div>

                <div className="relative flex items-start gap-3.5 p-4 pr-3">
                    {/*ICON RING*/}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white ${c.ring} ${c.glow} toast-check-pop`}>
                        <i className={`${c.icon} text-[17px]`} />
                    </div>

                    {/*CONTENT*/}
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className={`text-[10px] font-black tracking-[0.12em] ${c.labelColor} mb-0.5`}>
                            {c.label}
                        </div>
                        <div className="text-[14.5px] font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                            {finalTitle}
                        </div>
                        {message && (
                            <div className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-snug mt-1 line-clamp-2">
                                {message}
                            </div>
                        )}
                    </div>

                    {/*CLOSE BUTTON*/}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            close();
                        }}
                        aria-label="Close"
                        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <i className="fas fa-times text-[12px]" />
                    </button>
                </div>

                {/*PROGRESS BAR*/}
                <div className="relative h-[3px] bg-slate-100">
                    <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${c.accent} transition-[width] duration-75 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
}