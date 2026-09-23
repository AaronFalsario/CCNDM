import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';

/* ICONS */
const I = {
    close: <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    logout: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>,
    bell: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    cap: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    home: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
    rect: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>,
    clock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    mail: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>,
    doc: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    check: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    star: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    info: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    trash: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    download: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    eye: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    lock: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    key: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>,
    alert: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    success: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>,
    bellRing: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M2 8a10 10 0 0 1 2-6" /><path d="M22 8a10 10 0 0 0-2-6" /></svg>,
    warning: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    fileText: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    checkCircle: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    calendar: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    trophy: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>,
    chart: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
    helpCircle: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    target: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
    zap: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    shield: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    award: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
    flame: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
    book: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
    phone: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
    trendUp: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    userEdit: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M18 11l3-3-1.5-1.5L16.5 9.5" /></svg>,
    refresh: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
};

/* HELPERS */
const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const formatDate = (s) => (!s ? 'N/A' : new Date(s).toLocaleDateString());
const formatDateTime = (s) => {
    if (!s) return 'N/A';
    const d = new Date(s);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' · ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const sec = Math.floor((now - d) / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day === 1) return 'Yesterday';
    if (day < 7) return `${day}d ago`;
    if (day < 30) return `${Math.floor(day / 7)}w ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const getInitials = (name) => {
    if (!name || name === 'Student') return 'ST';
    const p = name.trim().split(/\s+/);
    return p.length === 1 ? p[0].substring(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};
const parseDbDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const s = String(value);
    if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
    return new Date(s + 'Z');
};
const calculateRemainingTime = (penalty) => {
    if (!penalty) return null;
    const s = (penalty.status || '').toLowerCase();
    if (s === 'completed' || s === 'resolved') return null;
    if (s !== 'in-progress' && s !== 'active') return null;
    const hours = parseInt(penalty.hours, 10) || 0;
    if (hours <= 0) return null;
    const src = penalty.started_at || penalty.updated_at || penalty.created_at;
    if (!src) return null;
    const started = parseDbDate(src);
    if (!started) return null;
    const elapsed = Math.floor((Date.now() - started.getTime()) / 1000);
    const total = hours * 3600;
    const remaining = Math.max(0, total - elapsed);
    if (remaining <= 0) return { hours: 0, minutes: 0, seconds: 0, completed: true };
    return {
        hours: Math.floor(remaining / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60,
        completed: false,
    };
};
const calculateProgress = (penalty) => {
    if (!penalty) return 0;
    const s = (penalty.status || '').toLowerCase();
    if (s === 'completed' || s === 'resolved') return 100;
    if (s !== 'in-progress' && s !== 'active') return 0;
    const hours = parseInt(penalty.hours, 10) || 0;
    if (hours <= 0) return 0;
    const src = penalty.started_at || penalty.updated_at || penalty.created_at || Date.now();
    const started = parseDbDate(src) || new Date();
    const elapsed = Math.floor((Date.now() - started.getTime()) / 1000);
    return Math.round(Math.min(100, Math.max(0, (elapsed / (hours * 3600)) * 100)));
};
const formatCountdown = (t) => {
    if (!t) return '—';
    if (t.completed) return 'Complete!';
    return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}`;
};
const fadeInStyle = { animation: 'fadeIn 0.3s ease-out' };

/*ACHIEVEMENTS RESET WINDOW*/
const RESET_WINDOW_MONTHS = 4;
const windowStart = () => {
    const d = new Date();
    d.setMonth(d.getMonth() - RESET_WINDOW_MONTHS);
    return d;
};
const isWithinWindow = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= windowStart();
};

/* COUNTDOWN TIMER */
function CountdownTimer({ penalty }) {
    const time = calculateRemainingTime(penalty);
    const progress = calculateProgress(penalty);
    if (!time) return <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>;
    if (time.completed) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                {I.check} Complete!
            </span>
        );
    }
    return (
        <div className="min-w-[110px]">
            <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                </span>
                <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    {formatCountdown(time)}
                </span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000 rounded-full"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

/* NOTIFICATION META */
const notifMeta = (n) => {
    const type = (n.type || n.notification_type || '').toLowerCase();
    if (type.includes('penalty') || type.includes('violation'))
        return { icon: 'warning', bg: 'bg-amber-100 dark:bg-amber-900/40', fg: 'text-amber-600 dark:text-amber-300' };
    if (type.includes('appeal'))
        return { icon: 'fileText', bg: 'bg-violet-100 dark:bg-violet-900/40', fg: 'text-violet-600 dark:text-violet-300' };
    if (type.includes('completed') || type.includes('approved') || type.includes('resolved'))
        return { icon: 'checkCircle', bg: 'bg-emerald-100 dark:bg-emerald-900/40', fg: 'text-emerald-600 dark:text-emerald-300' };
    if (type.includes('reminder') || type.includes('deadline'))
        return { icon: 'clock', bg: 'bg-blue-100 dark:bg-blue-900/40', fg: 'text-blue-600 dark:text-blue-300' };
    return { icon: 'info', bg: 'bg-slate-100 dark:bg-slate-700', fg: 'text-slate-600 dark:text-slate-300' };
};

function NotificationItem({ notification: n, onMarkRead, onDelete, onAction }) {
    const meta = notifMeta(n);
    const IconEl = I[meta.icon] || I.info;
    return (
        <div
            onClick={() => {
                if (!n.is_read) onMarkRead(n.id);
                if (onAction) onAction(n);
            }}
            className={`group relative flex items-start gap-3 p-3 rounded-xl mx-1 mb-1 transition cursor-pointer ${!n.is_read
                ? 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
        >
            {!n.is_read && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500" />
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.fg}`}>
                {IconEl}
            </div>
            <div className="flex-1 min-w-0 pr-8">
                <p className={`text-sm truncate ${!n.is_read ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                    {n.title || 'Notification'}
                </p>
                {n.message && (
                    <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${!n.is_read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {n.message}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {timeAgo(n.created_at)}
                    </span>
                    {!n.is_read && (
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            New
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition"
                title="Delete"
            >
                {I.trash}
            </button>
        </div>
    );
}

/*ACHIEVEMENT BADGES*/
const BADGE_DEFS = [
    // Tier 1 — starter
    { key: 'first_step', name: 'First Step', desc: 'Complete your first hour', icon: 'award', color: 'from-emerald-400 to-emerald-600', tier: 'starter' },
    { key: 'getting_started', name: 'Getting Started', desc: 'Complete 5 hours', icon: 'zap', color: 'from-blue-400 to-blue-600', tier: 'starter' },
    { key: 'on_fire', name: 'On Fire', desc: 'Complete 10 hours', icon: 'flame', color: 'from-orange-400 to-red-600', tier: 'starter' },
    { key: 'marathon', name: 'Marathon', desc: 'Complete 20 hours', icon: 'trendUp', color: 'from-cyan-400 to-blue-600', tier: 'milestone' },

    // Tier 2 — compliance
    { key: 'halfway_hero', name: 'Halfway Hero', desc: 'Reach 50% compliance', icon: 'shield', color: 'from-violet-400 to-violet-600', tier: 'compliance' },
    { key: 'compliance_pro', name: 'Compliance Pro', desc: 'Reach 75% compliance', icon: 'star', color: 'from-amber-400 to-amber-600', tier: 'compliance' },
    { key: 'perfect_record', name: 'Perfect Record', desc: 'Reach 100% compliance', icon: 'trophy', color: 'from-yellow-400 to-orange-600', tier: 'compliance' },
    { key: 'zero_pending', name: 'Zero Pending', desc: 'Clear all pending penalties', icon: 'checkCircle', color: 'from-cyan-400 to-cyan-600', tier: 'compliance' },

    // Tier 3 — speed & streaks
    { key: 'speed_demon', name: 'Speed Demon', desc: 'Finish a 5+ hr penalty in under 24h', icon: 'zap', color: 'from-pink-400 to-rose-600', tier: 'speed' },
    { key: 'perfect_week', name: 'Perfect Week', desc: 'Log a service session 7 days in a row', icon: 'calendar', color: 'from-indigo-400 to-purple-600', tier: 'streak' },

    // Tier 4 — comeback & resolve
    { key: 'comeback_kid', name: 'Comeback Kid', desc: 'Go from 3+ pending to 0 pending', icon: 'refresh', color: 'from-teal-400 to-emerald-600', tier: 'comeback' },
    { key: 'early_bird', name: 'Early Bird', desc: 'Complete every penalty before its deadline', icon: 'target', color: 'from-sky-400 to-blue-600', tier: 'resolve' },
    { key: 'appeal_master', name: 'Appeal Master', desc: 'Win an appeal', icon: 'fileText', color: 'from-fuchsia-400 to-purple-600', tier: 'appeal' },

    // Tier 5 — long game
    { key: 'century', name: 'Century', desc: 'Complete 100 total hours', icon: 'award', color: 'from-amber-400 to-yellow-600', tier: 'legendary' },
];

/* MAIN */
export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user: student, setUser: setStudent, logout } = useAuth('student');

    const [currentTab, setCurrentTab] = useState('dashboard');
    const [penalties, setPenalties] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifFilter, setNotifFilter] = useState('all');
    const [now, setNow] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    const [appealPenaltyId, setAppealPenaltyId] = useState('');
    const [appealReason, setAppealReason] = useState('');
    const [appealStatement, setAppealStatement] = useState('');
    const [historySubTab, setHistorySubTab] = useState('penalties');

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showIdleWarning, setShowIdleWarning] = useState(false);
    const [idleCountdown, setIdleCountdown] = useState(30);

    /* NEW: View Violation Details modal */
    const [selectedPenalty, setSelectedPenalty] = useState(null);

    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);

    const showToast = useCallback((type, title, message = '') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ type, title, message });
        toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
    }, []);

    const closeToast = () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast(null);
    };

    /* DARK MODE */
    useEffect(() => {
        const saved = localStorage.getItem('docst_dark_mode');
        let initial;
        if (saved === 'true') initial = true;
        else if (saved === 'false') initial = false;
        else initial = window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;

        setDarkMode(initial);
        document.documentElement.classList.toggle('dark', initial);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode((v) => {
            const next = !v;
            document.documentElement.classList.toggle('dark', next);
            localStorage.setItem('docst_dark_mode', String(next));
            return next;
        });
    };

    /* CLOCK */
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    /* LIVE TICK for countdowns */
    useEffect(() => {
        const id = setInterval(() => setPenalties((prev) => [...prev]), 1000);
        return () => clearInterval(id);
    }, []);

    /* DATA LOADERS */
    const loadPenalties = useCallback(async () => {
        if (!student) return;
        const sid = student.student_id_number || student.studentId || student.id;
        try {
            const { data, error } = await supabase
                .from('penalties')
                .select('*')
                .eq('student_id', sid)
                .order('created_at', { ascending: false });
            if (error) console.error('[loadPenalties]', error);
            setPenalties(data || []);
        } catch (e) {
            console.error('loadPenalties:', e);
        }
    }, [student]);

    const loadAppeals = useCallback(async () => {
        if (!student) return;
        const sid = student.student_id_number || student.studentId || student.id;
        try {
            let { data } = await supabase
                .from('appeals')
                .select('*')
                .eq('student_id', sid)
                .order('created_at', { ascending: false });
            if ((!data || !data.length) && student.email) {
                const r = await supabase
                    .from('appeals')
                    .select('*')
                    .eq('student_email', student.email)
                    .order('created_at', { ascending: false });
                if (r.data) data = r.data;
            }
            setAppeals(data || []);
        } catch (e) {
            console.error('loadAppeals:', e);
        }
    }, [student]);

    const loadNotifications = useCallback(async () => {
        if (!student) return;
        const sid = student.student_id_number || student.studentId || student.id;

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .or(`student_id.eq.${sid},student_id.is.null`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('[loadNotifications] error:', error);
                setNotifications([]);
                return;
            }

            setNotifications(data || []);
        } catch (e) {
            console.error('loadNotifications:', e);
            setNotifications([]);
        }
    }, [student]);

    const loadSessions = useCallback(async () => {
        if (!student) return;
        const sid = student.student_id_number || student.studentId || student.id;
        try {
            const { data, error } = await supabase
                .from('service_sessions')
                .select('*')
                .eq('student_id', sid)
                .order('scheduled_date', { ascending: true });
            if (error) console.error(error);
            setSessions(data || []);
        } catch (e) {
            console.error('loadSessions:', e);
        }
    }, [student]);

    const loadAchievements = useCallback(async () => {
        if (!student) return;
        const sid = student.student_id_number || student.studentId || student.id;
        try {
            const { data, error } = await supabase
                .from('achievements')
                .select('*')
                .eq('student_id', sid);
            if (error) console.error(error);
            setAchievements(data || []);
        } catch (e) {
            console.error('loadAchievements:', e);
        }
    }, [student]);

    useEffect(() => {
        if (!student) return;
        setLoading(true);
        Promise.all([
            loadPenalties(),
            loadAppeals(),
            loadNotifications(),
            loadSessions(),
            loadAchievements(),
        ]).finally(() => setLoading(false));
    }, [student, loadPenalties, loadAppeals, loadNotifications, loadSessions, loadAchievements]);

    useEffect(() => {
        if (!student) return undefined;
        const sid = student.student_id_number || student.studentId || student.id;
        const channel = supabase
            .channel(`student-penalties-${sid}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'penalties', filter: `student_id=eq.${sid}` },
                () => loadPenalties()
            )
            .subscribe();

        const fallbackId = setInterval(loadPenalties, 15000);

        return () => {
            clearInterval(fallbackId);
            supabase.removeChannel(channel);
        };
    }, [student, loadPenalties]);

    useEffect(() => {
        if (!student) return undefined;
        const sid = student.student_id_number || student.studentId || student.id;
        const channel = supabase
            .channel(`student-notifications-${sid}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                (payload) => {
                    const row = payload.new || payload.old;
                    if (!row || row.student_id === null || String(row.student_id) === String(sid)) {
                        loadNotifications();
                    }
                }
            )
            .subscribe();

        const fallbackId = setInterval(loadNotifications, 15000);

        return () => {
            clearInterval(fallbackId);
            supabase.removeChannel(channel);
        };
    }, [student, loadNotifications]);

    useEffect(() => {
        if (!student) return;
        const id = setInterval(() => {
            loadNotifications();
        }, 60000);
        return () => clearInterval(id);
    }, [student, loadNotifications]);

    /* DERIVED STATS */
    const pendingCount = penalties.filter((p) =>
        ['pending', 'Pending', 'in-progress', 'Active'].includes(p.status)
    ).length;

    const completedHours = penalties
        .filter((p) => ['completed', 'Completed', 'Resolved'].includes(p.status))
        .reduce((s, p) => s + (parseInt(p.hours) || 0), 0);

    const totalHours = penalties.reduce((s, p) => s + (parseInt(p.hours) || 0), 0);
    const complianceRate = totalHours ? Math.round((completedHours / totalHours) * 100) : 100;
    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const filteredNotifications = notifFilter === 'unread'
        ? notifications.filter((n) => !n.is_read)
        : notifications;
    const newNotifs = filteredNotifications.filter((n) => !n.is_read);
    const earlierNotifs = filteredNotifications.filter((n) => n.is_read);

    /* ACHIEVEMENTS — time-windowed + expanded */
    const activeAchievements = achievements.filter((a) => isWithinWindow(a.unlocked_at));
    const unlockedKeys = new Set(activeAchievements.map((a) => a.badge_key));

    /* Speed Demon: find any penalty completed in < 24h from creation */
    const hasSpeedDemon = penalties.some((p) => {
        const s = (p.status || '').toLowerCase();
        if (s !== 'completed' && s !== 'resolved') return false;
        const start = p.started_at || p.created_at;
        const end = p.completed_at || p.updated_at;
        if (!start || !end) return false;
        const hrs = (new Date(end) - new Date(start)) / (1000 * 60 * 60);
        const ph = parseInt(p.hours, 10) || 0;
        return hrs > 0 && hrs < 24 && ph >= 5;
    });

    /* Perfect Week: 7 consecutive days with at least 1 completed session */
    const hasPerfectWeek = (() => {
        if (sessions.length === 0) return false;
        const days = new Set(
            sessions
                .filter((s) => (s.status || '').toLowerCase() === 'completed')
                .map((s) => {
                    const d = parseDbDate(s.completed_at || s.scheduled_date);
                    return d ? d.toISOString().slice(0, 10) : null;
                })
                .filter(Boolean)
        );
        if (days.size < 7) return false;
        const sorted = [...days].sort();
        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1]);
            const cur = new Date(sorted[i]);
            const diff = (cur - prev) / (1000 * 60 * 60 * 24);
            streak = diff === 1 ? streak + 1 : 1;
            if (streak >= 7) return true;
        }
        return false;
    })();

    /* Comeback Kid: has resolved penalties AND currently no pending */
    const hasComebackKid = penalties.length >= 3
        && penalties.some((p) => ['completed', 'resolved'].includes((p.status || '').toLowerCase()))
        && pendingCount === 0;

    /* Early Bird: all penalties have completed_at before their deadline */
    const hasEarlyBird = penalties.length > 0 && penalties.every((p) => {
        const s = (p.status || '').toLowerCase();
        if (s !== 'completed' && s !== 'resolved') return false;
        if (!p.deadline || !p.completed_at) return false;
        return new Date(p.completed_at) < new Date(p.deadline);
    });

    /* Appeal Master: any approved appeal within window */
    const hasAppealMaster = appeals.some(
        (a) => ['approved', 'accepted', 'granted'].includes((a.status || '').toLowerCase())
            && isWithinWindow(a.created_at)
    );

    /* AUTO-UNLOCK ACHIEVEMENTS */
    useEffect(() => {
        if (!student || loading) return;
        const sid = student.student_id_number || student.studentId || student.id;

        const checkMap = {
            first_step: completedHours >= 1,
            getting_started: completedHours >= 5,
            on_fire: completedHours >= 10,
            marathon: completedHours >= 20,
            halfway_hero: complianceRate >= 50,
            compliance_pro: complianceRate >= 75,
            perfect_record: complianceRate >= 100 && totalHours > 0,
            zero_pending: pendingCount === 0 && penalties.length > 0,
            speed_demon: hasSpeedDemon,
            perfect_week: hasPerfectWeek,
            comeback_kid: hasComebackKid,
            early_bird: hasEarlyBird,
            appeal_master: hasAppealMaster,
            century: completedHours >= 100,
        };

        const newlyUnlocked = BADGE_DEFS.filter((b) => !unlockedKeys.has(b.key) && checkMap[b.key]);
        if (newlyUnlocked.length === 0) return;

        (async () => {
            const rows = newlyUnlocked.map((b) => ({
                student_id: sid,
                badge_key: b.key,
                badge_name: b.name,
                badge_desc: b.desc,
                unlocked_at: new Date().toISOString(),
            }));
            const { error } = await supabase.from('achievements').insert(rows);
            if (error) {
                console.error('Failed to unlock achievements:', error);
                return;
            }
            await loadAchievements();
            newlyUnlocked.forEach((b) => {
                showToast('success', `🏆 Badge unlocked: ${b.name}`, b.desc);
            });
        })();
    }, [
        student, loading, completedHours, complianceRate, pendingCount,
        penalties.length, activeAchievements.length,
        hasSpeedDemon, hasPerfectWeek, hasComebackKid, hasEarlyBird, hasAppealMaster,
        loadAchievements, showToast, totalHours,
    ]);

    /* FILTER */
    let filteredPenalties = [...penalties];
    if (statusFilter !== 'all') {
        filteredPenalties = filteredPenalties.filter((p) => {
            const s = (p.status || '').toLowerCase();
            const f = statusFilter.toLowerCase();
            const isWarn = p.offense_level === '1st Offense' || p.is_warning === true;
            return (
                s === f ||
                (f === 'pending' && ['pending', 'in-progress', 'active'].includes(s)) ||
                (f === 'completed' && ['completed', 'resolved'].includes(s)) ||
                (f === 'warning' && isWarn)
            );
        });
    }
    if (searchTerm) {
        const t = searchTerm.toLowerCase();
        filteredPenalties = filteredPenalties.filter(
            (p) =>
                (p.violation || '').toLowerCase().includes(t) ||
                (p.service_type || '').toLowerCase().includes(t) ||
                (p.description || '').toLowerCase().includes(t)
        );
    }
    filteredPenalties.sort((a, b) => {
        if (sortOption === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
        if (sortOption === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
        if (sortOption === 'hours-desc') return (b.hours || 0) - (a.hours || 0);
        if (sortOption === 'hours-asc') return (a.hours || 0) - (b.hours || 0);
        return 0;
    });

    /* STATUS HELPERS */
    const statusClass = (p) => {
        if (p.offense_level === '1st Offense' || p.is_warning === true) return 'warning';
        const s = (p.status || 'pending').toLowerCase();
        if (s === 'in-progress' || s === 'active') return 'progress';
        if (s === 'completed' || s === 'resolved') return 'completed';
        return 'pending';
    };
    const statusLabel = (p) => {
        if (p.offense_level === '1st Offense' || p.is_warning === true) return 'Warning Only';
        const s = (p.status || 'Pending').toString();
        return s.charAt(0).toUpperCase() + s.slice(1);
    };
    const badgeCls = (cls) =>
    ({
        warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    }[cls] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300');

    /* SUBMIT APPEAL */
    const submitAppeal = async () => {
        if (!appealPenaltyId || !appealReason.trim()) {
            showToast('error', 'Missing fields', 'Please select a penalty and provide a reason');
            return;
        }
        const penalty = penalties.find((p) => String(p.id) === String(appealPenaltyId));
        if (!penalty) return;
        const sid = student.student_id_number || student.studentId || student.id;
        const { error } = await supabase.from('appeals').insert([
            {
                student_id: sid,
                student_name: student.name,
                student_email: student.email || '',
                penalty_id: penalty.id,
                penalty_violation: penalty.violation,
                penalty_hours: penalty.hours,
                penalty_deadline: penalty.deadline,
                appeal_reason: appealReason.trim(),
                supporting_statement: appealStatement.trim() || null,
                status: 'pending',
                created_at: new Date().toISOString(),
            },
        ]);
        if (error) {
            showToast('error', 'Submission failed', error.message);
            return;
        }
        showToast('success', 'Appeal submitted', 'Your appeal has been sent for review');
        setAppealPenaltyId('');
        setAppealReason('');
        setAppealStatement('');
        await loadAppeals();
    };

    /* EXPORT CSV */
    const exportPenalties = () => {
        if (!penalties.length) {
            showToast('warning', 'Nothing to export', 'You have no penalties recorded');
            return;
        }
        const headers = ['Date', 'Violation', 'Service Type', 'Hours', 'Status', 'Deadline', 'Offense Level'];
        const rows = penalties.map((p) => [
            formatDate(p.created_at),
            p.violation || 'N/A',
            p.service_type || 'Community Service',
            p.hours || 0,
            p.status || 'Pending',
            formatDate(p.deadline),
            p.offense_level || 'N/A',
        ]);
        let csv = headers.join(',') + '\n';
        rows.forEach((row) => {
            csv += row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
        });
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `saocst_penalties_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('success', 'Export complete', 'File downloaded successfully');
    };

    /* EDIT PROFILE */
    useEffect(() => {
        if (student) {
            setEditName(student.name || '');
            setEditEmail(student.email || '');
        }
    }, [student, showEditProfile]);

    const saveProfile = async () => {
        if (!editName.trim()) return showToast('error', 'Name required', 'Please enter your name');
        const sid = student.student_id_number || student.studentId || student.id;
        const { error } = await supabase
            .from('students')
            .update({ name: editName.trim(), email: student.email })
            .eq('student_id_number', sid);
        if (error) return showToast('error', 'Update failed', error.message);
        const updated = { ...student, name: editName.trim() };
        setStudent(updated);
        sessionStorage.setItem('currentStudent', JSON.stringify(updated));
        setShowEditProfile(false);
        showToast('success', 'Profile updated', 'Your info has been saved');
    };

    /* NOTIFICATIONS */
    const markAllRead = async () => {
        const sid = student.student_id_number || student.studentId || student.id;
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('student_id', sid)
            .eq('is_read', false);
        await loadNotifications();
        showToast('info', 'All marked as read', '');
    };

    const deleteNotif = async (id) => {
        await supabase.from('notifications').delete().eq('id', id);
        await loadNotifications();
    };

    const markNotifRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
        await loadNotifications();
    };

    /* IDLE TIMER */
    const idleTimer = useRef(null);
    const idleCountdownTimer = useRef(null);

    const resetIdleTimer = useCallback(() => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        if (idleCountdownTimer.current) clearInterval(idleCountdownTimer.current);
        setShowIdleWarning(false);
        setIdleCountdown(30);

        idleTimer.current = setTimeout(() => {
            setShowIdleWarning(true);
            setIdleCountdown(30);
            idleCountdownTimer.current = setInterval(() => {
                setIdleCountdown((s) => {
                    if (s <= 1) {
                        clearInterval(idleCountdownTimer.current);
                        sessionStorage.clear();
                        navigate('/student/login', { replace: true });
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        }, 5 * 60 * 1000);
    }, [navigate]);

    useEffect(() => {
        if (!student) return;
        const events = ['mousemove', 'mousedown', 'click', 'scroll', 'keydown', 'touchstart', 'touchmove', 'wheel'];
        resetIdleTimer();
        events.forEach((e) => document.addEventListener(e, resetIdleTimer, { passive: true }));
        return () => {
            events.forEach((e) => document.removeEventListener(e, resetIdleTimer));
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (idleCountdownTimer.current) clearInterval(idleCountdownTimer.current);
        };
    }, [student, resetIdleTimer]);

    const confirmLogout = () => {
        logout();
    };

    if (!student) return null;

    const studentName = student.name || 'Student';
    const studentIdNum = student.student_id_number || 'N/A';
    const appealable = penalties.filter(
        (p) => (p.status || '').toLowerCase() !== 'completed' && (p.hours || 0) > 0
    );
    const selectedAppealPenalty = appealable.find((p) => String(p.id) === String(appealPenaltyId));

    const cardCls = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl';
    const btnPrimary = 'px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed';
    const btnSecondary = 'px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition';
    const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

    const tabLabel =
        currentTab === 'dashboard' ? 'Dashboard'
            : currentTab === 'penalties' ? 'My Penalties'
                : currentTab === 'schedule' ? 'Service Schedule'
                    : currentTab === 'progress' ? 'My Progress'
                        : currentTab === 'achievements' ? 'Achievements'
                            : currentTab === 'history' ? 'History'
                                : currentTab === 'appeal' ? 'Submit Appeal'
                                    : currentTab === 'help' ? 'Help Center' : '';

    /* SCHEDULE COMPUTED VALUES */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });
    const upcomingSessions = sessions
        .filter(s => new Date(s.scheduled_date) >= today && s.status !== 'cancelled')
        .slice(0, 10);
    const completedSessionHours = sessions
        .filter(s => (s.status || '').toLowerCase() === 'completed')
        .reduce((sum, s) => sum + (parseInt(s.hours) || 0), 0);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    /*FIXED WEEKLY ACTIVITY */
    const toLocalDayKey = (dateInput) => {
        const d = parseDbDate(dateInput);
        if (!d) return null;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const sessionDayKey = (s) =>
        toLocalDayKey(s.completed_at || s.updated_at || s.scheduled_date);

    const weeklyActivity = dayLabels.map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const key = toLocalDayKey(d);
        return sessions
            .filter((s) => (s.status || '').toLowerCase() === 'completed' && sessionDayKey(s) === key)
            .reduce((sum, s) => sum + (parseInt(s.hours) || 0), 0);
    });
    const weeklyMax = Math.max(...weeklyActivity, 1);
    const weeklyTotal = weeklyActivity.reduce((a, b) => a + b, 0);
    const hasWeeklyData = weeklyTotal > 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans text-[15px] leading-relaxed">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes modalPop { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                .modal-pop { animation: modalPop 0.22s cubic-bezier(0.2, 0.9, 0.4, 1.1) both; }
                html.dark { color-scheme: dark; }
                html.dark body { background-color: #020617; }
            `}</style>

            {/* DRAWER OVERLAY */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] md:hidden"
                    onClick={() => setDrawerOpen(false)}
                />
            )}

            {/* DRAWER */}
            <aside
                className={`group fixed top-0 left-0 bottom-0 w-[68px] hover:w-[220px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-[300] flex flex-col transition-all duration-300 ease-out overflow-hidden md:translate-x-0 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col items-center pt-4 pb-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                        {getInitials(studentName)}
                    </div>
                    <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap px-3">
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">
                            {studentName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Student Portal</div>
                        <span className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800">
                            ID: {studentIdNum}
                        </span>
                    </div>
                </div>

                <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
                    {[
                        { tab: 'dashboard', label: 'Dashboard', icon: I.home },
                        { tab: 'penalties', label: 'Penalties', icon: I.rect },
                        { tab: 'schedule', label: 'Schedule', icon: I.calendar },
                        { tab: 'progress', label: 'My Progress', icon: I.chart },
                        { tab: 'achievements', label: 'Achievements', icon: I.trophy },
                        { tab: 'history', label: 'History', icon: I.clock },
                        { tab: 'appeal', label: 'Appeal', icon: I.doc },
                        { tab: 'help', label: 'Help', icon: I.helpCircle },
                    ].map((item) => (
                        <button
                            key={item.tab}
                            onClick={() => { setCurrentTab(item.tab); setDrawerOpen(false); }}
                            className={`relative flex items-center w-full h-12 transition-colors duration-150 ${currentTab === item.tab
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            {currentTab === item.tab && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r" />
                            )}
                            <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{item.icon}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm font-medium pr-4">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </nav>

                <div className="border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <button
                        onClick={() => setShowEditProfile(true)}
                        className="relative flex items-center w-full h-12 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 dark:hover:text-blue-400 transition-colors duration-150"
                    >
                        <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{I.userEdit}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm">
                            Edit Profile
                        </span>
                    </button>
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="relative flex items-center w-full h-12 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors duration-150"
                    >
                        <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{I.logout}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm">
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* TOPBAR */}
            <header className="sticky top-0 z-[100] h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 md:ml-[68px]">
                <div className="flex items-center gap-3">
                    <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setDrawerOpen(true)}>
                        <span className="w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rounded" />
                        <span className="w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rounded" />
                        <span className="w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rounded" />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/CC.png" alt="CCNDM" className="w-9 h-9 object-contain rounded-lg bg-blue-50 dark:bg-slate-800 p-1" />
                        <span className="text-lg font-bold text-blue-600">CCNDM</span>
                        <span className="hidden md:inline text-xs text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3 uppercase tracking-wide">
                            {tabLabel}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        onClick={toggleDarkMode}
                        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? I.sun : I.moon}
                    </button>
                    <button
                        className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
                        onClick={() => setShowNotifications(true)}
                        title="Notifications"
                    >
                        {I.bell}
                        {unreadCount > 0 && (
                            <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowEditProfile(true)}
                        className="ml-1.5 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-semibold shadow-sm hover:shadow-md transition"
                        title="Edit profile"
                    >
                        {I.cap}
                        Student
                    </button>
                </div>
            </header>

            {/* NOTIFICATIONS MODAL */}
            {showNotifications && (
                <div className="fixed inset-0 z-[20000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <span className="text-slate-700 dark:text-slate-200">{I.bellRing}</span>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                                    )}
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                    Notifications
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            <button
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                onClick={() => setShowNotifications(false)}
                            >
                                {I.close}
                            </button>
                        </div>

                        <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                            {[
                                { key: 'all', label: 'All', count: notifications.length },
                                { key: 'unread', label: 'Unread', count: unreadCount },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setNotifFilter(f.key)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${notifFilter === f.key
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                                        }`}
                                >
                                    {f.label}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${notifFilter === f.key
                                        ? 'bg-blue-200/70 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                        }`}>
                                        {f.count}
                                    </span>
                                </button>
                            ))}
                            <div className="flex-1" />
                            <button
                                onClick={markAllRead}
                                disabled={unreadCount === 0}
                                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed px-2 py-1"
                            >
                                Mark all read
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 py-2">
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center mb-4 relative">
                                        <span className="text-blue-400 dark:text-blue-500">{I.bell}</span>
                                        <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                            {I.check}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                        {notifFilter === 'unread' ? "You're all caught up!" : 'No notifications yet'}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
                                        {notifFilter === 'unread'
                                            ? "You've read everything. Nice work!"
                                            : 'Updates about your penalties and appeals will show up here.'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {newNotifs.length > 0 && (
                                        <div className="px-3 pt-2 pb-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                New
                                            </p>
                                        </div>
                                    )}

                                    {newNotifs.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onMarkRead={markNotifRead}
                                            onDelete={deleteNotif}
                                            onAction={(notif) => {
                                                setShowNotifications(false);
                                                if (notif.action_tab) setCurrentTab(notif.action_tab);
                                            }}
                                        />
                                    ))}

                                    {earlierNotifs.length > 0 && (
                                        <div className="px-3 pt-4 pb-1">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Earlier
                                            </p>
                                        </div>
                                    )}

                                    {earlierNotifs.map((n) => (
                                        <NotificationItem
                                            key={n.id}
                                            notification={n}
                                            onMarkRead={markNotifRead}
                                            onDelete={deleteNotif}
                                            onAction={(notif) => {
                                                setShowNotifications(false);
                                                if (notif.action_tab) setCurrentTab(notif.action_tab);
                                            }}
                                        />
                                    ))}
                                </>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-950/60">
                                <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
                                    Showing {filteredNotifications.length} of {notifications.length} notifications
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* MAIN */}
            <main className="md:ml-[68px] p-4 md:p-8 pb-20 md:pb-8">
                {/* DASHBOARD */}
                {currentTab === 'dashboard' && (
                    <div style={fadeInStyle}>
                        <div className="mb-6">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{studentName}</span>
                            </h1>
                            <p className="text-sm text-slate-400 dark:text-slate-400 mt-1.5 mb-4">
                                {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                                <strong className="text-slate-700 dark:text-slate-200">
                                    {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                </strong>
                            </p>
                        </div>

                        {pendingCount > 0 && (
                            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/60 dark:to-indigo-950/60 border border-blue-200 dark:border-blue-900">
                                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                                    {I.clock}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                        You have {pendingCount} pending {pendingCount === 1 ? 'penalty' : 'penalties'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Complete your service hours to stay compliant and avoid further action.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setCurrentTab('penalties')}
                                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition flex-shrink-0"
                                >
                                    View
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { icon: I.clock, value: pendingCount, label: 'Pending Penalties', bg: 'bg-blue-500' },
                                { icon: I.check, value: completedHours, label: 'Completed Hours', bg: 'bg-emerald-500' },
                                { icon: I.rect, value: penalties.length, label: 'Total Violations', bg: 'bg-amber-500' },
                                { icon: I.star, value: `${complianceRate}%`, label: 'Compliance Rate', bg: 'bg-violet-500' },
                            ].map((s, i) => (
                                <div key={i} className={`${cardCls} p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition cursor-default`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${s.bg}`}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold leading-tight">{s.value}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                { tab: 'penalties', icon: I.rect, title: 'View Penalties', desc: 'Check your active penalties and violations' },
                                { tab: 'history', icon: I.clock, title: 'View History', desc: 'See your completed penalties record' },
                                { tab: 'appeal', icon: I.doc, title: 'Submit Appeal', desc: 'Appeal a penalty decision' },
                            ].map((a) => (
                                <button
                                    key={a.tab}
                                    onClick={() => setCurrentTab(a.tab)}
                                    className={`${cardCls} p-6 text-center cursor-pointer hover:-translate-y-0.5 hover:border-blue-500 hover:shadow-md transition`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                                        {a.icon}
                                    </div>
                                    <h3 className="text-sm font-semibold mb-1">{a.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
                                </button>
                            ))}
                        </div>

                        <div className={`${cardCls} overflow-hidden mb-6`}>
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                    {I.rect}
                                    My Recent Penalties
                                </div>
                                <button
                                    onClick={() => setCurrentTab('penalties')}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                    View all →
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-950/60">
                                        <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Violation</th>
                                            <th className="px-5 py-3">Hours</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Progress</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr><td colSpan="6" className="text-center py-12 text-slate-400 text-sm">Loading...</td></tr>
                                        ) : penalties.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-12">
                                                    <div className="font-semibold text-slate-600 dark:text-slate-300">No Penalties</div>
                                                    <div className="text-xs text-slate-400 mt-1">You have no violations recorded. Great job!</div>
                                                </td>
                                            </tr>
                                        ) : (
                                            penalties.slice(0, 5).map((p) => (
                                                <tr
                                                    key={p.id}
                                                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                                                    onClick={() => setSelectedPenalty(p)}
                                                >
                                                    <td className="px-5 py-3 whitespace-nowrap">{formatDate(p.created_at)}</td>
                                                    <td className="px-5 py-3 font-medium">{p.violation}</td>
                                                    <td className="px-5 py-3">{p.hours || 0} hrs</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${badgeCls(statusClass(p))}`}>
                                                            {statusLabel(p)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <CountdownTimer penalty={p} />
                                                    </td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedPenalty(p); }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                                                            title="View details"
                                                        >
                                                            {I.eye} View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: I.info, title: '1st Offense', desc: 'Warning Only · No community service required', iconBg: 'bg-emerald-100 dark:bg-emerald-950/60', iconText: 'text-emerald-600 dark:text-emerald-400' },
                                { icon: I.clock, title: '2nd Offense', desc: '5 hours community service + Formal Notice', iconBg: 'bg-amber-100 dark:bg-amber-950/60', iconText: 'text-amber-600 dark:text-amber-400' },
                                { icon: I.rect, title: '3rd Offense', desc: '10 hours community service + Meeting with SAO', iconBg: 'bg-red-100 dark:bg-red-950/60', iconText: 'text-red-600 dark:text-red-400' },
                            ].map((c) => (
                                <div key={c.title} className={`${cardCls} p-5 text-center`}>
                                    <div className={`w-12 h-12 rounded-full ${c.iconBg} ${c.iconText} flex items-center justify-center mx-auto mb-3`}>
                                        {c.icon}
                                    </div>
                                    <h4 className="text-sm font-bold mb-1">{c.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PENALTIES */}
                {currentTab === 'penalties' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold">My Penalties</h1>
                                <p className="text-sm text-blue-100 mt-1">View your community service penalties and track your progress</p>
                            </div>
                            <button
                                onClick={exportPenalties}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-medium rounded-lg transition"
                            >
                                {I.download} Export CSV
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { icon: I.clock, value: pendingCount, label: 'Pending' },
                                { icon: I.check, value: completedHours, label: 'Completed Hours' },
                                { icon: I.rect, value: penalties.length, label: 'Total Violations' },
                                { icon: I.star, value: `${complianceRate}%`, label: 'Compliance Rate' },
                            ].map((s, i) => (
                                <div key={i} className={`${cardCls} p-5 flex items-center gap-4`}>
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold leading-tight">{s.value}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`${cardCls} p-4 mb-6 flex flex-wrap items-center gap-3`}>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Status:</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Search:</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search violations..."
                                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Sort:</label>
                                <select
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100"
                                >
                                    <option value="date-desc">Latest First</option>
                                    <option value="date-asc">Oldest First</option>
                                    <option value="hours-desc">Most Hours</option>
                                    <option value="hours-asc">Least Hours</option>
                                </select>
                            </div>
                            <button
                                onClick={() => { setStatusFilter('all'); setSearchTerm(''); setSortOption('date-desc'); }}
                                className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white underline"
                            >
                                Clear filters
                            </button>
                        </div>

                        <div className={`${cardCls} overflow-hidden`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-950/60">
                                        <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Violation</th>
                                            <th className="px-5 py-3">Service Type</th>
                                            <th className="px-5 py-3">Hours</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3">Progress</th>
                                            <th className="px-5 py-3">Deadline</th>
                                            <th className="px-5 py-3 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPenalties.length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-12">
                                                    <div className="font-semibold text-slate-600 dark:text-slate-300">No Penalty Records</div>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        {penalties.length ? 'Try adjusting your filters' : 'You have no violations recorded'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPenalties.map((p) => (
                                                <tr
                                                    key={p.id}
                                                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                                                    onClick={() => setSelectedPenalty(p)}
                                                >
                                                    <td className="px-5 py-3">{formatDate(p.created_at)}</td>
                                                    <td className="px-5 py-3 font-medium">{p.violation}</td>
                                                    <td className="px-5 py-3">{p.service_type || 'Community Service'}</td>
                                                    <td className="px-5 py-3 font-semibold text-blue-600 dark:text-blue-400">{p.hours || 0} hrs</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${badgeCls(statusClass(p))}`}>
                                                            {statusLabel(p)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <CountdownTimer penalty={p} />
                                                    </td>
                                                    <td className="px-5 py-3">{formatDate(p.deadline)}</td>
                                                    <td className="px-5 py-3 text-right">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedPenalty(p); }}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                                                            title="View details"
                                                        >
                                                            {I.eye} View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* SCHEDULE */}
                {currentTab === 'schedule' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white">
                            <h1 className="text-2xl font-bold">Service Schedule</h1>
                            <p className="text-sm text-blue-100 mt-1">Plan and track your community service sessions</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                { icon: I.calendar, value: upcomingSessions.length, label: 'Upcoming Sessions', color: 'bg-indigo-500' },
                                { icon: I.check, value: completedSessionHours, label: 'Hours Completed', color: 'bg-emerald-500' },
                                { icon: I.clock, value: Math.max(0, totalHours - completedSessionHours), label: 'Hours Remaining', color: 'bg-amber-500' },
                            ].map((s, i) => (
                                <div key={i} className={`${cardCls} p-5 flex items-center gap-4`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${s.color}`}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{s.value}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`${cardCls} overflow-hidden mb-6`}>
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <h3 className="text-base font-semibold flex items-center gap-2">{I.calendar} This Week's Schedule</h3>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800">
                                {weekDays.map((day, i) => {
                                    const daySessions = sessions.filter(s => {
                                        const sd = parseDbDate(s.scheduled_date);
                                        return sd && toLocalDayKey(sd) === toLocalDayKey(day) && (s.status || '').toLowerCase() !== 'cancelled';
                                    });
                                    const isToday = toLocalDayKey(day) === toLocalDayKey(new Date());
                                    return (
                                        <div key={i} className={`p-2 text-center min-h-[120px] ${isToday ? 'bg-blue-50/50 dark:bg-blue-950/40' : ''}`}>
                                            <div className={`text-[10px] font-bold uppercase mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                                {dayLabels[i]}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mb-2">{day.getDate()}</div>
                                            {daySessions.length > 0 ? (
                                                daySessions.slice(0, 2).map((s, j) => (
                                                    <div key={j} className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-lg p-1.5 text-left mb-1">
                                                        <div className="text-[9px] font-bold text-blue-700 dark:text-blue-300 truncate">
                                                            {s.start_time?.slice(0, 5) || '—'}
                                                        </div>
                                                        <div className="text-[9px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                            {s.title}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-[10px] text-slate-300 dark:text-slate-700 pt-4">—</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={`${cardCls} overflow-hidden`}>
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                                <h3 className="text-base font-semibold">Upcoming Sessions</h3>
                            </div>
                            {upcomingSessions.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-sm">No upcoming sessions scheduled</div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {upcomingSessions.map((s) => (
                                        <div key={s.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                                                {I.calendar}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold">{s.title}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                    {formatDate(s.scheduled_date)}
                                                    {s.start_time && ` · ${s.start_time.slice(0, 5)}`}
                                                    {s.end_time && ` – ${s.end_time.slice(0, 5)}`}
                                                </div>
                                                {s.venue && <div className="text-xs text-slate-400 mt-0.5">📍 {s.venue}</div>}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{s.hours || 0}h</div>
                                                <div className="text-[10px] text-slate-400 uppercase">
                                                    {(s.status || '').toLowerCase() === 'completed' ? 'Done' : 'Hours'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* PROGRESS */}
                {currentTab === 'progress' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-violet-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white">
                            <h1 className="text-2xl font-bold">My Progress</h1>
                            <p className="text-sm text-blue-100 mt-1">Visual breakdown of your compliance journey</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                            <div className={`${cardCls} p-6 flex flex-col items-center justify-center lg:col-span-1`}>
                                <div className="relative w-40 h-40">
                                    <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-800" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 42}`}
                                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - complianceRate / 100)}`}
                                        />
                                        <defs>
                                            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold">{complianceRate}%</span>
                                        <span className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">Compliance</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                                    {completedHours} of {totalHours} hours completed
                                </p>
                            </div>

                            <div className={`${cardCls} p-6 lg:col-span-2`}>
                                <h3 className="text-base font-semibold mb-5 flex items-center gap-2">{I.trendUp} Hour Breakdown</h3>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Completed Hours', value: completedHours, total: totalHours, color: 'from-emerald-400 to-emerald-600' },
                                        { label: 'Remaining Hours', value: Math.max(0, totalHours - completedHours), total: totalHours, color: 'from-amber-400 to-amber-600' },
                                    ].map((b) => {
                                        const pct = totalHours ? Math.round((b.value / totalHours) * 100) : 0;
                                        return (
                                            <div key={b.label}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">{b.label}</span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">{b.value} hrs · {pct}%</span>
                                                </div>
                                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${b.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                                    {[
                                        { label: 'Total', value: penalties.length, color: 'text-slate-700 dark:text-slate-200' },
                                        { label: 'Pending', value: pendingCount, color: 'text-amber-600 dark:text-amber-400' },
                                        { label: 'Done', value: penalties.filter(p => ['completed', 'Completed', 'Resolved'].includes(p.status)).length, color: 'text-emerald-600 dark:text-emerald-400' },
                                    ].map((s) => (
                                        <div key={s.label} className="text-center">
                                            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className={`${cardCls} p-6`}>
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-semibold flex items-center gap-2">{I.zap} Weekly Activity</h3>
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                    {weeklyTotal} hr{weeklyTotal === 1 ? '' : 's'} this week
                                </span>
                            </div>

                            {!hasWeeklyData ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                                        {I.chart}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        No activity yet this week
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                                        Completed service sessions for this week will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-end justify-between gap-2 h-40">
                                    {weeklyActivity.map((v, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                                {v > 0 ? `${v}h` : ''}
                                            </span>
                                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg relative overflow-hidden" style={{ height: '100%' }}>
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-violet-500 rounded-t-lg transition-all duration-700"
                                                    style={{ height: `${(v / weeklyMax) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{dayLabels[i].charAt(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                                Completed service hours per day (this week)
                            </p>
                        </div>
                    </div>
                )}

                {/* ACHIEVEMENTS */}
                {currentTab === 'achievements' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-amber-500 to-orange-700 rounded-xl p-6 md:p-7 mb-6 text-white">
                            <h1 className="text-2xl font-bold">Achievements</h1>
                            <p className="text-sm text-amber-100 mt-1">
                                Unlock badges as you complete your service hours · resets every {RESET_WINDOW_MONTHS} months
                            </p>
                        </div>

                        <div className={`${cardCls} p-6 mb-6`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold">Overall Progress</h3>
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {completedHours} / {totalHours || 0} hrs
                                </span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-700"
                                    style={{ width: `${totalHours ? Math.min(100, (completedHours / totalHours) * 100) : 0}%` }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                Keep going! You're making great progress.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {BADGE_DEFS.map((b) => {
                                const unlockedRecord = activeAchievements.find((a) => a.badge_key === b.key);
                                const isUnlocked = !!unlockedRecord;
                                return (
                                    <div
                                        key={b.key}
                                        className={`${cardCls} p-5 text-center transition ${isUnlocked
                                            ? 'hover:-translate-y-1 hover:shadow-lg'
                                            : 'opacity-50 grayscale'
                                            }`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white bg-gradient-to-br ${b.color} ${isUnlocked ? 'shadow-lg' : ''
                                            }`}>
                                            {I[b.icon]}
                                        </div>
                                        <h4 className="text-sm font-bold mb-1">{b.name}</h4>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{b.desc}</p>
                                        {isUnlocked ? (
                                            <span className="inline-block mt-3 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Unlocked{unlockedRecord?.unlocked_at ? ` · ${timeAgo(unlockedRecord.unlocked_at)}` : ''}
                                            </span>
                                        ) : (
                                            <span className="inline-block mt-3 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                Locked
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* HISTORY */}
                {currentTab === 'history' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white">
                            <h1 className="text-2xl font-bold">History</h1>
                            <p className="text-sm text-blue-100 mt-1">View your complete disciplinary record</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { value: penalties.filter((p) => (p.status || '').toLowerCase() === 'completed').length, label: 'Completed Penalties' },
                                { value: totalHours, label: 'Total Hours' },
                                { value: penalties.length, label: 'Total Violations' },
                                { value: appeals.length, label: 'Reports Filed' },
                            ].map((s, i) => (
                                <div key={i} className={`${cardCls} p-5`}>
                                    <div className="text-2xl font-bold">{s.value}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-5 border-b border-slate-200 dark:border-slate-800">
                            <button
                                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${historySubTab === 'penalties'
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                    }`}
                                onClick={() => setHistorySubTab('penalties')}
                            >
                                Penalty History
                            </button>
                            <button
                                className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition ${historySubTab === 'appeals'
                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                    }`}
                                onClick={() => setHistorySubTab('appeals')}
                            >
                                Appeal History
                            </button>
                        </div>

                        {historySubTab === 'penalties' && (
                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-950/60">
                                            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <th className="px-5 py-3">#</th>
                                                <th className="px-5 py-3">Violation</th>
                                                <th className="px-5 py-3">Service Type</th>
                                                <th className="px-5 py-3">Hours</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3">Progress</th>
                                                <th className="px-5 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {penalties.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-12 text-slate-400 text-sm">No penalties found</td></tr>
                                            ) : (
                                                penalties.map((p, i) => (
                                                    <tr
                                                        key={p.id}
                                                        className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                                                        onClick={() => setSelectedPenalty(p)}
                                                    >
                                                        <td className="px-5 py-3">
                                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                                {i + 1}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 font-medium">{p.violation}</td>
                                                        <td className="px-5 py-3">
                                                            <span className="inline-block px-3 py-1 rounded-full text-[11px] bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                                                                {p.service_type || 'Community Service'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3 font-semibold text-blue-600 dark:text-blue-400">{p.hours || 0} hrs</td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${badgeCls(statusClass(p))}`}>
                                                                {statusLabel(p)}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <CountdownTimer penalty={p} />
                                                        </td>
                                                        <td className="px-5 py-3 text-right">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setSelectedPenalty(p); }}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition"
                                                                title="View details"
                                                            >
                                                                {I.eye} View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {historySubTab === 'appeals' && (
                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-950/60">
                                            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <th className="px-5 py-3">#</th>
                                                <th className="px-5 py-3">Date</th>
                                                <th className="px-5 py-3">Penalty</th>
                                                <th className="px-5 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appeals.length === 0 ? (
                                                <tr><td colSpan="4" className="text-center py-12 text-slate-400 text-sm">No appeals found</td></tr>
                                            ) : (
                                                appeals.map((a, i) => {
                                                    const s = (a.status || 'pending').toLowerCase();
                                                    return (
                                                        <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">
                                                            <td className="px-5 py-3">{i + 1}</td>
                                                            <td className="px-5 py-3">{formatDate(a.created_at)}</td>
                                                            <td className="px-5 py-3 font-medium">{a.penalty_violation || a.violation || 'N/A'}</td>
                                                            <td className="px-5 py-3">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${badgeCls(s)}`}>
                                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* APPEAL */}
                {currentTab === 'appeal' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white">
                            <h1 className="text-2xl font-bold">Submit an Appeal</h1>
                            <p className="text-sm text-blue-100 mt-1">Request a review of your penalty decision</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.7fr] gap-5 mb-6">
                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                                    <h3 className="text-base font-semibold flex items-center gap-2">{I.doc} Appeal Form</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Fill out the form below to submit your appeal</p>
                                </div>
                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Select Penalty</label>
                                        <select
                                            value={appealPenaltyId}
                                            onChange={(e) => setAppealPenaltyId(e.target.value)}
                                            className={inputCls}
                                            disabled={appealable.length === 0}
                                        >
                                            <option value="">
                                                {appealable.length === 0 ? 'No penalties available for appeal' : 'Select a penalty to appeal'}
                                            </option>
                                            {appealable.map((p) => (
                                                <option key={p.id} value={p.id}>{p.violation} - {p.hours} hours</option>
                                            ))}
                                        </select>
                                    </div>

                                    {selectedAppealPenalty && (
                                        <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4 border border-slate-200 dark:border-slate-800 text-sm space-y-1.5">
                                            <div className="flex"><span className="w-32 font-semibold text-slate-500 dark:text-slate-400">Violation:</span><span>{selectedAppealPenalty.violation}</span></div>
                                            <div className="flex"><span className="w-32 font-semibold text-slate-500 dark:text-slate-400">Hours:</span><span>{selectedAppealPenalty.hours} hours</span></div>
                                            <div className="flex"><span className="w-32 font-semibold text-slate-500 dark:text-slate-400">Deadline:</span><span>{formatDate(selectedAppealPenalty.deadline)}</span></div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Appeal Reason</label>
                                        <textarea
                                            value={appealReason}
                                            onChange={(e) => setAppealReason(e.target.value)}
                                            rows={5}
                                            placeholder="Explain why you are appealing this penalty..."
                                            className={inputCls + ' resize-y'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-1.5">Supporting Statement</label>
                                        <textarea
                                            value={appealStatement}
                                            onChange={(e) => setAppealStatement(e.target.value)}
                                            rows={3}
                                            placeholder="Additional comments..."
                                            className={inputCls + ' resize-y'}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <button
                                            className={btnSecondary}
                                            onClick={() => {
                                                setAppealPenaltyId('');
                                                setAppealReason('');
                                                setAppealStatement('');
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button className={btnPrimary} onClick={submitAppeal} disabled={appealable.length === 0}>
                                            Submit Appeal
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                                    <h3 className="text-base font-semibold">Appeal Guidelines</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Important information before submitting</p>
                                </div>
                                <div className="p-5 space-y-4">
                                    {[
                                        { title: 'Time Limit', desc: 'Appeals must be submitted within 5 days of the penalty issuance date.' },
                                        { title: 'Required Information', desc: 'Provide a clear explanation and any supporting evidence for your appeal.' },
                                        { title: 'Processing Time', desc: 'Appeals are typically reviewed within 3-5 business days.' },
                                        { title: 'Notification', desc: 'You will be notified via email once your appeal has been reviewed.' },
                                    ].map((g) => (
                                        <div key={g.title} className="flex gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                                                {I.info}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold mb-0.5">{g.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{g.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-3 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border-l-4 border-amber-500">
                                        {I.info}
                                        <div className="text-xs text-amber-800 dark:text-amber-200">
                                            <strong>Important:</strong> Submitting false or misleading information may result in additional penalties.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`${cardCls} overflow-hidden`}>
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                                <h3 className="text-base font-semibold">My Recent Appeals</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-950/60">
                                        <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            <th className="px-5 py-3">Date</th>
                                            <th className="px-5 py-3">Violation</th>
                                            <th className="px-5 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appeals.length === 0 ? (
                                            <tr><td colSpan="3" className="text-center py-12 text-slate-400 text-sm">No appeals found</td></tr>
                                        ) : (
                                            appeals.slice(0, 5).map((a) => {
                                                const s = (a.status || 'pending').toLowerCase();
                                                return (
                                                    <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">
                                                        <td className="px-5 py-3">{formatDate(a.created_at)}</td>
                                                        <td className="px-5 py-3 font-medium">{a.penalty_violation || a.violation || 'N/A'}</td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${badgeCls(s)}`}>
                                                                {s.charAt(0).toUpperCase() + s.slice(1)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* HELP */}
                {currentTab === 'help' && (
                    <div style={fadeInStyle}>
                        <div className="bg-gradient-to-br from-teal-600 to-cyan-800 rounded-xl p-6 md:p-7 mb-6 text-white">
                            <h1 className="text-2xl font-bold">Help Center</h1>
                            <p className="text-sm text-teal-100 mt-1">Find answers or get in touch with us</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {[
                                { icon: I.phone, title: 'Call Us', info: '(123) 456-7890', sub: 'Mon–Fri, 8AM–5PM', bg: 'bg-teal-500' },
                                { icon: I.mail, title: 'Email', info: 'Ccndm@columban.edu', sub: 'Reply within 24h', bg: 'bg-blue-500' },
                                { icon: I.info, title: 'Visit Office', info: 'Nursing Department College', sub: 'Main Building, Rm 201', bg: 'bg-violet-500' },
                            ].map((c, i) => (
                                <div key={i} className={`${cardCls} p-6 flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-md transition`}>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${c.bg}`}>
                                        {c.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{c.title}</div>
                                        <div className="text-sm font-semibold mt-1 truncate">{c.info}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={`${cardCls} overflow-hidden`}>
                            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center gap-2">
                                {I.book}
                                <h3 className="text-base font-semibold">Frequently Asked Questions</h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { q: 'How do I check my remaining service hours?', a: 'Go to the Dashboard or My Progress tab to see a live counter of your completed and remaining hours.' },
                                    { q: 'Can I choose my own community service site?', a: 'No — all service sessions are assigned by the Student Affairs Office to ensure fairness and proper documentation.' },
                                    { q: 'What happens if I miss a scheduled session?', a: 'Missing a session without prior notice may result in an additional penalty. Notify your SAO coordinator at least 24 hours in advance.' },
                                    { q: 'How long does an appeal take?', a: 'Appeals are typically reviewed within 3–5 business days. You will be notified via email once a decision is made.' },
                                    { q: 'Is the first offense really just a warning?', a: 'Yes. First offenses are recorded as warnings only with no community service required — but they still appear on your record.' },
                                    { q: 'Can I request a certificate after completing?', a: 'Absolutely. Visit the SAO office after your final session to receive an official Certificate of Completion.' },
                                ].map((f, i) => (
                                    <details key={i} className="group">
                                        <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition list-none">
                                            <span className="text-sm font-medium">{f.q}</span>
                                            <span className="text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0">
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9" />
                                                </svg>
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {f.a}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/60 border-l-4 border-amber-500">
                            {I.alert}
                            <div className="text-xs text-amber-800 dark:text-amber-200">
                                <strong>Need urgent help?</strong> If you have an active deadline within 48 hours, contact the Nursing Department office directly by phone for immediate assistance.
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* VIEW VIOLATION DETAILS MODAL*/}
            {selectedPenalty && (
                <div className="fixed inset-0 z-[35000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
                    <div className="modal-pop bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                                    {I.rect}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold truncate">
                                        {selectedPenalty.violation || 'Violation Details'}
                                    </h3>
                                    <p className="text-xs text-blue-100 mt-0.5">
                                        Recorded on {formatDateTime(selectedPenalty.created_at)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPenalty(null)}
                                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition flex-shrink-0"
                                title="Close"
                            >
                                {I.close}
                            </button>
                        </div>

                        {/* Status strip */}
                        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold ${badgeCls(statusClass(selectedPenalty))}`}>
                                {statusLabel(selectedPenalty)}
                            </span>
                            {selectedPenalty.offense_level && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {selectedPenalty.offense_level}
                                </span>
                            )}
                            {selectedPenalty.service_type && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                    {selectedPenalty.service_type}
                                </span>
                            )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {/* Description */}
                            {selectedPenalty.description && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Description
                                    </h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                                        {selectedPenalty.description}
                                    </p>
                                </div>
                            )}

                            {/* Key facts grid */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                    Penalty Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { label: 'Hours Required', value: `${selectedPenalty.hours || 0} hrs`, icon: I.clock },
                                        { label: 'Deadline', value: formatDate(selectedPenalty.deadline), icon: I.calendar },
                                        { label: 'Date Issued', value: formatDate(selectedPenalty.created_at), icon: I.calendar },
                                        { label: 'Last Updated', value: formatDateTime(selectedPenalty.updated_at || selectedPenalty.created_at), icon: I.clock },
                                        ...(selectedPenalty.started_at ? [{ label: 'Started On', value: formatDateTime(selectedPenalty.started_at), icon: I.clock }] : []),
                                        ...(selectedPenalty.completed_at ? [{ label: 'Completed On', value: formatDateTime(selectedPenalty.completed_at), icon: I.checkCircle }] : []),
                                    ].map((f) => (
                                        <div key={f.label} className="flex items-center gap-3 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                                            <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-800">
                                                {f.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {f.label}
                                                </div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                    {f.value}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Progress */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Progress
                                    </h4>
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                        {calculateProgress(selectedPenalty)}%
                                    </span>
                                </div>
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-700"
                                        style={{ width: `${calculateProgress(selectedPenalty)}%` }}
                                    />
                                </div>
                                {calculateRemainingTime(selectedPenalty) && !calculateRemainingTime(selectedPenalty).completed && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        Time remaining:{' '}
                                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {formatCountdown(calculateRemainingTime(selectedPenalty))}
                                        </span>
                                    </p>
                                )}
                                {calculateRemainingTime(selectedPenalty)?.completed && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                                        ✓ Completed
                                    </p>
                                )}
                            </div>

                            {/* Notes */}
                            {(selectedPenalty.notes || selectedPenalty.admin_notes || selectedPenalty.remarks) && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Notes / Remarks
                                    </h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-amber-50 dark:bg-amber-950/40 rounded-lg p-4 border-l-4 border-amber-500">
                                        {selectedPenalty.notes || selectedPenalty.admin_notes || selectedPenalty.remarks}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                            <button
                                className={btnSecondary}
                                onClick={() => setSelectedPenalty(null)}
                            >
                                Close
                            </button>
                            {['pending', 'in-progress', 'active'].includes((selectedPenalty.status || '').toLowerCase()) && (
                                <button
                                    className={btnPrimary}
                                    onClick={() => {
                                        const p = selectedPenalty;
                                        setSelectedPenalty(null);
                                        setCurrentTab('appeal');
                                        setAppealPenaltyId(String(p.id));
                                    }}
                                >
                                    Appeal This Penalty
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LOGOUT MODAL */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[30000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-start gap-3 mb-5">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                                {I.alert}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Logout?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Are you sure you want to log out of your account?</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button className={btnSecondary} onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
                            <button
                                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                                onClick={confirmLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PROFILE MODAL */}
            {showEditProfile && (
                <div className="fixed inset-0 z-[30000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-bold flex items-center gap-2">{I.userEdit} Edit Profile</h3>
                            <button
                                onClick={() => setShowEditProfile(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title="Close"
                            >
                                {I.close}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                                    Email
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    Locked
                                    </span>
                                </label>
                                <input
                                    value={editEmail}
                                    readOnly
                                    disabled
                                    tabIndex={-1}
                                    className={inputCls + ' opacity-70 cursor-not-allowed select-none bg-slate-100 dark:bg-slate-900'}
                                />
                                <p className="text-xs text-slate-400 mt-1.5">Contact admin to change your email.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 flex items-center gap-1.5">
                                    Student ID
                                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                    Locked
                                    </span>
                                </label>
                                <input value={studentIdNum} disabled readOnly tabIndex={-1} className={inputCls + ' opacity-70 cursor-not-allowed select-none bg-slate-100 dark:bg-slate-900'} />
                                <p className="text-xs text-slate-400 mt-1.5">Contact admin to change your Student ID.</p>
                            </div>
                        </div>

                        {/* Change password link */}
                        <button
                            onClick={() => {
                                setShowEditProfile(false);
                                navigate('/student/change-password');
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                        >
                            {I.key}
                            Change password?
                        </button>

                        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                            <button className={btnSecondary} onClick={() => setShowEditProfile(false)}>Cancel</button>
                            <button className={btnPrimary} onClick={saveProfile}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* IDLE WARNING */}
            {showIdleWarning && (
                <div className="fixed inset-0 z-[40000] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-sm p-6 shadow-2xl text-center border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
                            {I.alert}
                        </div>
                        <h3 className="text-xl font-bold mb-2">Session Expiring Soon</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            You've been inactive. Your session will expire in{' '}
                            <strong className="text-red-600 dark:text-red-400">{idleCountdown}</strong> seconds.
                        </p>
                        <button className={btnPrimary + ' w-full'} onClick={resetIdleTimer}>
                            Stay Logged In
                        </button>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} title={toast.title} onClose={closeToast} duration={4000} />}
        </div>
    );
}