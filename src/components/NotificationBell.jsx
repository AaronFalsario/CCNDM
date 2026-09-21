import { useState, useEffect, useRef, useCallback } from 'react';

//SVG ICONS
const Icons = {
    bell: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    ),
    close: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
    check: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    trash: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    alert: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    fileText: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    clock: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    shield: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
};

//FORMAT RELATIVE TIME
function formatRelativeTime(dateStr) {
    if (!dateStr) return 'Just now';
    const d = dateStr instanceof Date ? dateStr : new Date(String(dateStr).replace(' ', 'T') + (String(dateStr).includes('Z') ? '' : 'Z'));
    if (isNaN(d.getTime())) return 'Just now';
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
}

//PER-TYPE STYLING
const typeTheme = {
    penalty: {
        icon: Icons.alert,
        ring: 'bg-amber-100 text-amber-600',
        dot: 'bg-amber-500',
    },
    appeal: {
        icon: Icons.fileText,
        ring: 'bg-blue-100 text-blue-600',
        dot: 'bg-blue-500',
    },
    deadline: {
        icon: Icons.clock,
        ring: 'bg-red-100 text-red-600',
        dot: 'bg-red-500',
    },
    system: {
        icon: Icons.shield,
        ring: 'bg-purple-100 text-purple-600',
        dot: 'bg-purple-500',
    },
    success: {
        icon: Icons.check,
        ring: 'bg-emerald-100 text-emerald-600',
        dot: 'bg-emerald-500',
    },
};

export default function NotificationBell({
    notifications = [],
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onClearAll,
    onItemClick,
}) {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const wrapRef = useRef(null);

    const unread = notifications.filter((n) => !n.is_read);
    const unreadCount = unread.length;

    //ENTRANCE ANIMATION
    useEffect(() => {
        if (open) {
            const id = requestAnimationFrame(() => setMounted(true));
            return () => cancelAnimationFrame(id);
        } else {
            setMounted(false);
        }
    }, [open]);

    //CLOSE ON OUTSIDE CLICK
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    //CLOSE ON ESC
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open]);

    const handleItemClick = useCallback((n) => {
        if (!n.is_read) onMarkAsRead?.(n.id);
        onItemClick?.(n);
    }, [onMarkAsRead, onItemClick]);

    return (
        <div ref={wrapRef} className="relative">
            <style>{`
                @keyframes bellRing {
                    0%, 100% { transform: rotate(0); }
                    15%       { transform: rotate(14deg); }
                    30%       { transform: rotate(-12deg); }
                    45%       { transform: rotate(9deg); }
                    60%       { transform: rotate(-6deg); }
                    75%       { transform: rotate(3deg); }
                }
                @keyframes badgePulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.55); }
                    50%      { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(239,68,68,0); }
                }
                @keyframes dropdownIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .bell-ring { animation: bellRing 1s ease-in-out; }
                .badge-pulse { animation: badgePulse 2s ease-in-out infinite; }
                .dropdown-in { animation: dropdownIn 0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; }
            `}</style>

            {/*BELL BUTTON*/}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${open
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
            >
                <Icons.bell className={`w-5 h-5 ${unreadCount > 0 ? 'bell-ring' : ''}`} />

                {/*BADGE*/}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full badge-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/*DROPDOWN*/}
            {open && (
                <div className="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.18)] border border-slate-100 overflow-hidden z-[9998] dropdown-in">
                    {/*HEADER*/}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-2">
                            <h3 className="text-[15px] font-bold text-slate-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10.5px] font-black rounded-full tracking-wide">
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close notifications"
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <Icons.close className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/*BODY*/}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-3">
                                    <Icons.bell className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="text-[14px] font-semibold text-slate-700">No notifications</p>
                                <p className="text-[12.5px] text-slate-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((n) => {
                                    const t = typeTheme[n.type] || typeTheme.system;
                                    const Icon = t.icon;
                                    return (
                                        <div
                                            key={n.id}
                                            onClick={() => handleItemClick(n)}
                                            className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${!n.is_read
                                                    ? 'bg-blue-50/40 hover:bg-blue-50'
                                                    : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            {/*UNREAD DOT*/}
                                            {!n.is_read && (
                                                <span className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${t.dot}`} />
                                            )}

                                            {/*ICON RING*/}
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${t.ring}`}>
                                                <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                                            </div>

                                            {/*CONTENT*/}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-[13.5px] leading-tight truncate ${!n.is_read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                        {n.title || 'Notification'}
                                                    </p>
                                                    <span className="flex-shrink-0 text-[10.5px] font-medium text-slate-400 whitespace-nowrap mt-0.5">
                                                        {formatRelativeTime(n.created_at)}
                                                    </span>
                                                </div>
                                                {n.message && (
                                                    <p className="text-[12.5px] text-slate-500 leading-snug mt-1 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                )}
                                            </div>

                                            {/*DELETE BUTTON*/}
                                            {onDelete && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(n.id);
                                                    }}
                                                    aria-label="Dismiss"
                                                    className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <Icons.trash className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/*FOOTER*/}
                    {notifications.length > 0 && (
                        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => onMarkAllAsRead?.()}
                                disabled={unreadCount === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold text-blue-600 rounded-lg hover:bg-blue-100 disabled:text-slate-300 disabled:hover:bg-transparent transition-colors"
                            >
                                <Icons.check className="w-3.5 h-3.5" />
                                Mark all as read
                            </button>
                            <button
                                onClick={() => onClearAll?.()}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold text-slate-500 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                                <Icons.trash className="w-3.5 h-3.5" />
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}