import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import api from '../../lib/api';
import { supabase } from '../../lib/supabase';
import Toast from '../../components/Toast';
import DashboardSkeleton from '../../components/DashboardSkeleton';
import { useAuth } from '../../hooks/useAuth';

//ICONS
const I = {
    close: <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    logout: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
    moon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>,
    sun: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /></svg>,
    bell: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    bellRing: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /><path d="M2 8a10 10 0 0 1 2-6" /><path d="M22 8a10 10 0 0 0-2-6" /></svg>,
    shield: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    home: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" /></svg>,
    rect: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="15" /><line x1="15" y1="9" x2="9" y2="15" /></svg>,
    users: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    clock: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
    mail: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></svg>,
    doc: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
    check: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
    checkCircle: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    xCircle: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>,
    star: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
    info: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    trash: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    download: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    upload: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    image: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    edit: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>,
    lock: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    alert: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
    success: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>,
    plus: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    search: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    cap: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    menu: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>,
    trendUp: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
    trendDown: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></svg>,
    chart: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
    printer: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>,
    refresh: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
    calendar: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    settings: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
    eye: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    award: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>,
    flame: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" /></svg>,
    zap: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    filter: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    copy: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>,
    archive: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>,
    messageCircle: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>,
    activity: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    megaphone: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>,
    tag: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
};

//HELPERS
const getGreeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};
const formatDate = (s) => (!s ? 'N/A' : new Date(s).toLocaleDateString());
const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const sec = Math.floor((Date.now() - d) / 1000);
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
    if (!name || name === 'Admin') return 'AD';
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
const generateStudentId = (students) => {
    const year = String(new Date().getFullYear()).slice(-2);
    let max = 0;
    for (const s of students) {
        const n = String(s.student_id_number || '');
        if (n.startsWith(year)) {
            const seq = parseInt(n.slice(2), 10);
            if (!isNaN(seq) && seq > max) max = seq;
        }
    }
    return `${year}${String(max + 1).padStart(6, '0')}`;
};
const calculateRemainingTime = (penalty) => {
    if (!penalty) return null;
    if (penalty.status === 'Completed' || penalty.status === 'Resolved') return null;
    if (penalty.status !== 'in-progress' && penalty.status !== 'Active') return null;
    if (!penalty.hours || penalty.hours <= 0) return null;
    const src = penalty.started_at || penalty.updated_at || penalty.created_at;
    if (!src) return null;
    const elapsed = Math.floor((Date.now() - parseDbDate(src)) / 1000);
    const total = penalty.hours * 3600;
    const remaining = Math.max(0, total - elapsed);
    if (remaining <= 0) return { hours: 0, minutes: 0, seconds: 0, completed: true };
    return {
        hours: Math.floor(remaining / 3600),
        minutes: Math.floor((remaining % 3600) / 60),
        seconds: remaining % 60,
        completed: false,
    };
};
const formatCountdown = (t) => {
    if (!t) return '—';
    if (t.completed) return 'Complete!';
    return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}`;
};
const calculateProgress = (penalty) => {
    if (!penalty || !penalty.hours || penalty.hours <= 0) return 0;
    if (penalty.status === 'Completed' || penalty.status === 'Resolved') return 100;
    if (penalty.status !== 'in-progress' && penalty.status !== 'Active') return 0;
    const src = penalty.started_at || penalty.updated_at || penalty.created_at || Date.now();
    const elapsed = Math.floor((Date.now() - parseDbDate(src)) / 1000);
    return Math.round(Math.min(100, Math.max(0, (elapsed / (penalty.hours * 3600)) * 100)));
};
const exportToCSV = (rows, filename) => {
    if (!rows || rows.length === 0) return false;
    const headers = Object.keys(rows[0]);
    const esc = (v) => {
        const s = v === null || v === undefined ? '' : String(v);
        return `"${s.replace(/"/g, '""')}"`;
    };
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
};
const exportToExcel = async (sheets, filename) => {
    if (!sheets?.some(sheet => sheet.rows?.length)) return false;
    const excelModule = await import('exceljs');
    const ExcelJS = excelModule.default || excelModule;
    const workbook = new ExcelJS.Workbook();
    sheets.forEach(({ name, rows }) => {
        const sheetName = name.replace(/[\\/*?:[\]]/g, '').slice(0, 31) || 'Data';
        const worksheet = workbook.addWorksheet(sheetName);
        const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
        worksheet.columns = columns.map(key => ({ header: key, key }));
        worksheet.addRows(rows);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
};
const exportReportToPDF = async ({ stats, students, penalties, appeals, department }) => {
    const [{ jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
    ]);
    const autoTable = autoTableModule.default;
    const pdf = new jsPDF({ orientation: 'landscape' });
    const reportDate = new Date().toLocaleDateString();
    pdf.setFontSize(18);
    pdf.text(`${department || 'Student Conduct'} Report`, 14, 18);
    pdf.setFontSize(10);
    pdf.text(`Generated ${reportDate}`, 14, 25);

    autoTable(pdf, {
        startY: 32,
        head: [['Metric', 'Value']],
        body: [
            ['Total cases', stats.totalCases],
            ['Active students', stats.activeStudents],
            ['Resolution rate', `${stats.resolutionRate}%`],
            ['Total service hours', stats.totalHours],
            ['In progress', stats.inProgress],
            ['Resolved', stats.resolved],
        ],
        theme: 'grid',
        styles: { fontSize: 9 },
        headStyles: { fillColor: [37, 99, 235] },
        tableWidth: 110,
    });

    let nextY = pdf.lastAutoTable.finalY + 9;
    const addSection = (title, headers, rows) => {
        if (nextY > 175) {
            pdf.addPage();
            nextY = 18;
        }
        pdf.setFontSize(12);
        pdf.text(title, 14, nextY);
        autoTable(pdf, {
            startY: nextY + 3,
            head: [headers],
            body: rows.length ? rows : [['No records', ...headers.slice(1).map(() => '')]],
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [37, 99, 235] },
            margin: { left: 14, right: 14 },
        });
        nextY = pdf.lastAutoTable.finalY + 9;
    };

    addSection('Students', ['Student ID', 'Name', 'Course', 'Year', 'Status'], students.map(student => [
        student.student_id_number || '', student.name || '', student.course || '', student.year_level || '', student.status || '',
    ]));
    addSection('Penalties', ['Date', 'Student', 'Violation', 'Level', 'Hours', 'Status'], penalties.map(penalty => [
        formatDate(penalty.created_at), penalty.student_name || '', penalty.violation_type || '',
        penalty.offense_level || '', penalty.hours ?? '', penalty.status || '',
    ]));
    addSection('Appeals', ['Student', 'Violation', 'Status', 'Submitted', 'Admin Comment'], appeals.map(appeal => [
        appeal.student_name || '', appeal.penalty_violation || appeal.violation || '', appeal.status || '',
        formatDate(appeal.created_at), appeal.admin_comment || '',
    ]));

    pdf.save(`report_${new Date().toISOString().slice(0, 10)}.pdf`);
    return true;
};
const fadeInStyle = { animation: 'fadeIn 0.3s ease-out' };

//UPLOAD HELPER
const uploadImageToBucket = async (bucket, file) => {
    if (!file) return { url: null, error: null };
    try {
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

        const { data: signed, error: signErr } = await supabase
            .storage
            .from(bucket)
            .createSignedUploadUrl(filename);

        if (signErr) {
            console.error('[upload] sign failed', signErr);
            return { url: null, error: signErr };
        }

        const uploadRes = await fetch(signed.signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
        });

        if (!uploadRes.ok) {
            const text = await uploadRes.text();
            console.error('[upload] PUT failed', uploadRes.status, text);
            return { url: null, error: { message: text || `HTTP ${uploadRes.status}` } };
        }

        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filename);
        console.log('[upload] OK', pub?.publicUrl);
        return { url: pub?.publicUrl || null, error: null };
    } catch (err) {
        console.error('[upload] THREW', err);
        return { url: null, error: err };
    }
};

//NOTIFICATION
const notifMeta = (n) => {
    const t = (n.type || n.notification_type || '').toLowerCase();
    if (t.includes('penalty') || t.includes('violation'))
        return { icon: 'alert', bg: 'bg-amber-100 dark:bg-amber-900/40', fg: 'text-amber-600 dark:text-amber-300' };
    if (t.includes('appeal'))
        return { icon: 'doc', bg: 'bg-violet-100 dark:bg-violet-900/40', fg: 'text-violet-600 dark:text-violet-300' };
    if (t.includes('completed') || t.includes('approved') || t.includes('resolved'))
        return { icon: 'checkCircle', bg: 'bg-emerald-100 dark:bg-emerald-900/40', fg: 'text-emerald-600 dark:text-emerald-300' };
    if (t.includes('rejected'))
        return { icon: 'xCircle', bg: 'bg-red-100 dark:bg-red-900/40', fg: 'text-red-600 dark:text-red-300' };
    if (t.includes('reminder') || t.includes('deadline'))
        return { icon: 'clock', bg: 'bg-blue-100 dark:bg-blue-900/40', fg: 'text-blue-600 dark:text-blue-300' };
    return { icon: 'info', bg: 'bg-slate-100 dark:bg-slate-700', fg: 'text-slate-600 dark:text-slate-300' };
};

function NotificationItem({ notification: n, onMarkRead, onDelete }) {
    const meta = notifMeta(n);
    const IconEl = I[meta.icon] || I.info;

    return (
        <div
            onClick={() => !n.is_read && onMarkRead(n.id)}
            className={`group relative flex items-start gap-3 p-4 rounded-xl mx-1 mb-1 transition cursor-pointer ${!n.is_read
                ? 'bg-blue-50/70 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'}`}
        >
            {!n.is_read && <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.fg}`}>
                {IconEl}
            </div>
            <div className="flex-1 min-w-0 pr-8">
                <p className={`text-base truncate ${!n.is_read ? 'font-bold text-slate-800 dark:text-slate-100' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    {n.title || 'Notification'}
                </p>
                {n.message && (
                    <p className={`text-sm mt-1 leading-relaxed line-clamp-2 ${!n.is_read ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {n.message}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">{timeAgo(n.created_at)}</span>
                    {!n.is_read && <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">New</span>}
                </div>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition"
                title="Delete"
            >
                {I.trash}
            </button>
        </div>
    );
}

//BADGE / STATUS
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
const badgeCls = (cls) => ({
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    probation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    suspended: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}[cls] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300');

//SHARED MODAL SHELL
function Modal({ open, onClose, title, icon, children, footer, maxWidth = 'max-w-3xl' }) {
    useEffect(() => {
        if (!open) return;
        const prevOverflow = document.body.style.overflow;
        const prevPointer = document.body.style.pointerEvents;
        document.body.style.overflow = 'hidden';
        document.body.style.pointerEvents = 'none';
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.pointerEvents = prevPointer;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[30000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none"
            style={{ pointerEvents: 'auto' }}
        >
            <div className={`bg-white dark:bg-slate-800 rounded-3xl w-full ${maxWidth} max-h-[94vh] flex flex-col shadow-2xl overflow-hidden`}>
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {icon && <span className="text-slate-700 dark:text-slate-200 scale-125">{icon}</span>}
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="Close">
                        {I.close}
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-7 py-6 text-[16px]">{children}</div>
                {footer && (
                    <div className="px-7 py-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

//MAIN
export default function AdminDashboard() {
    const { user: admin, setUser: setAdmin, logout } = useAuth('admin');

    const [currentTab, setCurrentTab] = useState(() => {
        return sessionStorage.getItem('admin_current_tab') || 'dashboard';
    });

    useEffect(() => {
        sessionStorage.setItem('admin_current_tab', currentTab);
    }, [currentTab]);

    const [students, setStudents] = useState([]);
    const [penalties, setPenalties] = useState([]);
    const [appeals, setAppeals] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifFilter, setNotifFilter] = useState('all');
    const [now, setNow] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const [penaltySearch, setPenaltySearch] = useState('');
    const [penaltyCategoryFilter, setPenaltyCategoryFilter] = useState('');
    const [penaltyStatusFilter, setPenaltyStatusFilter] = useState('');
    const [penaltyLevelFilter, setPenaltyLevelFilter] = useState('');
    const [studentSearch, setStudentSearch] = useState('');
    const [studentCourseFilter, setStudentCourseFilter] = useState('');
    const [studentStatusFilter, setStudentStatusFilter] = useState('');
    const [appealSearch, setAppealSearch] = useState('');
    const [appealStatusFilter, setAppealStatusFilter] = useState('');
    const [activityFilter, setActivityFilter] = useState('all');
    const [announcementSearch, setAnnouncementSearch] = useState('');

    const [selectedPenalties, setSelectedPenalties] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [completePenaltyId, setCompletePenaltyId] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [showAddPenalty, setShowAddPenalty] = useState(false);
    const [showEditPenalty, setShowEditPenalty] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [showEditStudent, setShowEditStudent] = useState(false);
    const [showViewStudent, setShowViewStudent] = useState(false);
    const [showViewAppeal, setShowViewAppeal] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showImportCSV, setShowImportCSV] = useState(false);
    const [showQuickNote, setShowQuickNote] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [suggesting, setSuggesting] = useState(false);
    const [selectedAnnouncementPreview, setSelectedAnnouncementPreview] = useState(null);

    const [showAppealActionModal, setShowAppealActionModal] = useState(false);
    const [appealActionType, setAppealActionType] = useState(null);
    const [appealActionComment, setAppealActionComment] = useState('');
    const [appealActionError, setAppealActionError] = useState('');

    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedPenalty, setSelectedPenalty] = useState(null);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const [penaltyForm, setPenaltyForm] = useState({
        violation: '', description: '', offenseLevel: '1st Offense',
        serviceType: 'Community Service', deadline: '', status: 'Pending', studentId: '', imageFile: null, imageUrl: ''
    });
    const [studentForm, setStudentForm] = useState({
        name: '', studentId: '', email: '', course: 'BSN', year: '1st', status: 'Good'
    });
    const [adminForm, setAdminForm] = useState({ name: '', email: '' });
    const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
    const [importFile, setImportFile] = useState(null);
    const [quickNote, setQuickNote] = useState({ title: '', message: '', targetStudent: '', type: 'info' });

    const [announcementForm, setAnnouncementForm] = useState({
        title: '', message: '', type: 'info', target: '', priority: 'normal',
        imageFile: null, imageUrl: '',
    });

    const [toast, setToast] = useState(null);
    const toastTimeoutRef = useRef(null);
    const countdownRef = useRef(null);

    const showToast = useCallback((type, title, message = '') => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast({ type, title, message });
        toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
    }, []);
    const closeToast = () => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToast(null);
    };

    // DARK MODE
    useEffect(() => {
        const saved = localStorage.getItem('admin_dark_mode');
        let initial;
        if (saved === 'true') initial = true;
        else if (saved === 'false') initial = false;
        else initial = window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
        setDarkMode(initial);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(v => {
            const next = !v;
            localStorage.setItem('admin_dark_mode', String(next));
            return next;
        });
    };

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const loadStudents = useCallback(async () => {
        try {
            const data = await api.get('/api/students');
            setStudents(data || []);
        } catch (e) {
            console.error('[loadStudents]', e);
            setStudents([]);
        }
    }, []);
    const loadPenalties = useCallback(async () => {
        try {
            const data = await api.get('/api/penalties');
            setPenalties(data || []);
        } catch (e) {
            console.error('[loadPenalties]', e);
            setPenalties([]);
        }
    }, []);
    const loadAppeals = useCallback(async () => {
        try {
            const data = await api.get('/api/appeals');
            setAppeals(data || []);
        } catch (e) {
            console.error('[loadAppeals]', e);
            setAppeals([]);
        }
    }, []);
    const loadNotifications = useCallback(async () => {
        try {
            const data = await api.get('/api/notifications');
            const filtered = (data || []).filter((item) => item.student_id !== null && item.student_id !== undefined && item.student_id !== '');
            setNotifications(filtered);
        } catch (e) {
            console.error('[loadNotifications]', e);
            setNotifications([]);
        }
    }, []);
    const loadActivity = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('activity_log')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (error) {
                console.error('[loadActivity]', error);
                setActivityLog([]);
                return;
            }
            setActivityLog(data || []);
        } catch (e) {
            console.error('[loadActivity]', e);
            setActivityLog([]);
        }
    }, []);
    const loadAnnouncements = useCallback(async () => {
        try {
            const data = await api.get('/api/notifications');
            const list = (data || []).filter((item) => item.student_id === null || item.student_id === undefined || item.student_id === '');
            setAnnouncements(list);
        } catch (e) {
            console.error('[loadAnnouncements]', e);
            setAnnouncements([]);
        }
    }, []);

    useEffect(() => {
        if (!admin) return;
        setLoading(true);
        Promise.all([
            loadStudents(), loadPenalties(), loadAppeals(), loadNotifications(),
            loadActivity(), loadAnnouncements(),
        ]).finally(() => setLoading(false));
    }, [admin, loadStudents, loadPenalties, loadAppeals, loadNotifications, loadActivity, loadAnnouncements]);

    useEffect(() => {
        countdownRef.current = setInterval(() => setPenalties(prev => [...prev]), 1000);
        return () => clearInterval(countdownRef.current);
    }, []);

    useEffect(() => {
        const id = setInterval(() => {
            loadPenalties();
            loadAppeals();
            loadNotifications();
            loadActivity();
        }, 60000);
        return () => clearInterval(id);
    }, [loadPenalties, loadAppeals, loadNotifications, loadActivity]);

    useEffect(() => {
        const channel = supabase
            .channel('admin-activity-log')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'activity_log' },
                () => loadActivity()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [loadActivity]);

    const stats = useMemo(() => {
        const pendingAppeals = appeals.filter(a => (a.status || '').toLowerCase() === 'pending').length;
        const approvedAppeals = appeals.filter(a => (a.status || '').toLowerCase() === 'approved').length;
        const rejectedAppeals = appeals.filter(a => (a.status || '').toLowerCase() === 'rejected').length;
        const totalViolations = penalties.length;
        const resolved = penalties.filter(p => p.status === 'Resolved' || p.status === 'Completed').length;
        const activeStudents = students.filter(s => s.status === 'Good').length;
        const activePenalties = penalties.filter(p => p.status === 'Active' || p.status === 'in-progress').length;
        const totalHours = penalties.reduce((sum, p) => sum + (p.hours || 0), 0);
        const completedHours = penalties.filter(p => p.status === 'Completed' || p.status === 'Resolved').reduce((sum, p) => sum + (p.hours || 0), 0);

        const last7 = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            return {
                date: d, count: penalties.filter(p => {
                    const pd = parseDbDate(p.created_at);
                    if (!pd) return false;
                    pd.setHours(0, 0, 0, 0);
                    return pd.getTime() === d.getTime();
                }).length
            };
        });

        const categories = ['Academic', 'Behavior', 'Attendance', 'Uniform', 'Other'];
        const categoryDist = categories.map(c => ({
            name: c,
            count: penalties.filter(p => (p.category || 'Other') === c).length,
        }));

        const offenseDist = ['1st Offense', '2nd Offense', '3rd Offense'].map(o => ({
            name: o,
            count: penalties.filter(p => p.offense_level === o).length,
        }));

        return {
            totalStudents: students.length,
            totalViolations,
            pendingAppeals,
            approvedAppeals,
            rejectedAppeals,
            totalCases: totalViolations + appeals.length,
            inProgress: activePenalties,
            resolved,
            complianceRate: students.length > 0 ? Math.round((students.length - activePenalties) / students.length * 100) : 0,
            activeStudents,
            resolutionRate: totalViolations > 0 ? Math.round((resolved / totalViolations) * 100) : 0,
            appealSuccessRate: appeals.length > 0 ? Math.round((approvedAppeals / appeals.length) * 100) : 0,
            engagementRate: students.length > 0 ? Math.round((activeStudents / students.length) * 100) : 0,
            totalHours,
            completedHours,
            last7,
            categoryDist,
            offenseDist,
        };
    }, [students, penalties, appeals]);

    const analytics = useMemo(() => {
        const months = Array.from({ length: 6 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            const monthEnd = new Date(d);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            return {
                label: d.toLocaleString('en-US', { month: 'short' }),
                count: penalties.filter(p => {
                    const pd = parseDbDate(p.created_at);
                    return pd && pd >= d && pd < monthEnd;
                }).length,
                resolved: penalties.filter(p => {
                    const pd = parseDbDate(p.created_at);
                    return pd && pd >= d && pd < monthEnd && (p.status === 'Completed' || p.status === 'Resolved');
                }).length,
            };
        });
        const maxMonth = Math.max(...months.map(m => m.count), 1);

        const resolvedWithTimes = penalties.filter(p =>
            (p.status === 'Completed' || p.status === 'Resolved') && p.created_at && p.completed_at
        );
        const avgResolutionDays = resolvedWithTimes.length === 0 ? 0 : Math.round(
            resolvedWithTimes.reduce((sum, p) => {
                const start = parseDbDate(p.created_at);
                const end = parseDbDate(p.completed_at);
                return sum + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / resolvedWithTimes.length
        );

        const violationCounts = {};
        penalties.forEach(p => {
            const v = p.violation_type || p.violation || 'Unknown';
            violationCounts[v] = (violationCounts[v] || 0) + 1;
        });
        const topViolations = Object.entries(violationCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
        const maxViolationCount = Math.max(...topViolations.map(v => v[1]), 1);

        const yearLevels = ['1st', '2nd', '3rd', '4th'];
        const byYearLevel = yearLevels.map(y => {
            const group = students.filter(s => {
                const yl = String(s.year_level || '').trim();
                return yl === y || yl.startsWith(y);
            });
            const studentIds = new Set(group.map(s => String(s.student_id_number || s.student_id || s.id)));
            const yearPenalties = penalties.filter(p => studentIds.has(String(p.student_id)));
            const resolved = yearPenalties.filter(p => p.status === 'Completed' || p.status === 'Resolved').length;
            return {
                year: y,
                students: group.length,
                cases: yearPenalties.length,
                resolutionRate: yearPenalties.length > 0 ? Math.round((resolved / yearPenalties.length) * 100) : 0,
            };
        });

        const appealRate = penalties.length > 0 ? Math.round((appeals.length / penalties.length) * 100) : 0;

        return { months, maxMonth, avgResolutionDays, topViolations, maxViolationCount, byYearLevel, appealRate, resolvedCount: resolvedWithTimes.length };
    }, [students, penalties, appeals]);

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const filteredNotifications = notifFilter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
    const newNotifs = filteredNotifications.filter(n => !n.is_read);
    const earlierNotifs = filteredNotifications.filter(n => n.is_read);

    const topStudents = useMemo(() => {
        const counts = {};
        penalties.forEach(p => {
            const name = p.student_name || 'Unknown';
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [penalties]);

    const filteredPenalties = useMemo(() => {
        let f = penalties;
        if (penaltySearch) {
            const s = penaltySearch.toLowerCase();
            f = f.filter(p =>
                p.student_name?.toLowerCase().includes(s) ||
                p.violation_type?.toLowerCase().includes(s) ||
                p.description?.toLowerCase().includes(s)
            );
        }
        if (penaltyCategoryFilter) f = f.filter(p => p.category === penaltyCategoryFilter);
        if (penaltyStatusFilter) f = f.filter(p => p.status === penaltyStatusFilter);
        if (penaltyLevelFilter) f = f.filter(p => p.offense_level === penaltyLevelFilter);
        return f;
    }, [penalties, penaltySearch, penaltyCategoryFilter, penaltyStatusFilter, penaltyLevelFilter]);

    const filteredStudents = useMemo(() => {
        let f = students;
        if (studentSearch) {
            const s = studentSearch.toLowerCase();
            f = f.filter(st =>
                st.name?.toLowerCase().includes(s) ||
                st.student_id_number?.toLowerCase().includes(s) ||
                st.email?.toLowerCase().includes(s)
            );
        }
        if (studentCourseFilter) f = f.filter(st => st.course === studentCourseFilter);
        if (studentStatusFilter) f = f.filter(st => st.status === studentStatusFilter);
        return f;
    }, [students, studentSearch, studentCourseFilter, studentStatusFilter]);

    const filteredAppeals = useMemo(() => {
        let f = appeals;
        if (appealSearch) {
            const s = appealSearch.toLowerCase();
            f = f.filter(a =>
                a.student_name?.toLowerCase().includes(s) ||
                (a.violation || a.penalty_violation || '').toLowerCase().includes(s)
            );
        }
        if (appealStatusFilter) f = f.filter(a => a.status === appealStatusFilter);
        return f;
    }, [appeals, appealSearch, appealStatusFilter]);

    const filteredActivity = useMemo(() => {
        if (activityFilter === 'all') return activityLog;
        return activityLog.filter(a => (a.type || '').toLowerCase() === activityFilter);
    }, [activityLog, activityFilter]);

    const filteredAnnouncements = useMemo(() => {
        let f = announcements;
        if (announcementSearch) {
            const s = announcementSearch.toLowerCase();
            f = f.filter(a => (a.title || '').toLowerCase().includes(s) || (a.message || '').toLowerCase().includes(s));
        }
        return f;
    }, [announcements, announcementSearch]);

    const logActivity = useCallback(async (type, description, targetId = null) => {
        const { data, error } = await supabase.from('activity_log').insert([{
            admin_id: admin?.id || null,
            admin_name: admin?.full_name || admin?.name || 'Admin',
            type,
            description,
            target_id: targetId,
            created_at: new Date().toISOString(),
        }]).select().single();
        if (error) {
            console.error('[logActivity]', error);
            return null;
        }
        return data;
    }, [admin]);

    const refreshAll = useCallback(async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            await Promise.all([
                loadStudents(),
                loadPenalties(),
                loadAppeals(),
                loadNotifications(),
                loadActivity(),
                loadAnnouncements(),
            ]);
            setLastUpdated(new Date());
            showToast('success', 'Refreshed', 'All data has been updated');
        } catch (err) {
            console.error('[refreshAll]', err);
            showToast('error', 'Refresh failed', err?.message || 'Please try again');
        } finally {
            setTimeout(() => setRefreshing(false), 400);
        }
    }, [refreshing, loadStudents, loadPenalties, loadAppeals, loadNotifications, loadActivity, loadAnnouncements, showToast]);

    const handleAddPenalty = async () => {
        const { violation, description, offenseLevel, serviceType, deadline, status, studentId, imageFile } = penaltyForm;
        if (!violation) return showToast('error', 'Missing fields', 'Please select a violation type');
        if (!studentId) return showToast('error', 'Missing fields', 'Please select a student');

        const selectedStudent = students.find(s =>
            String(s.student_id_number || s.student_id || s.id) === String(studentId)
        );
        if (!selectedStudent) return showToast('error', 'Not found', 'Selected student not found');

        const categoryMap = {
            'Academic Dishonesty': 'Academic', 'Cheating': 'Academic', 'Plagiarism': 'Academic',
            'Class Disruption': 'Behavior', 'Insubordination': 'Behavior', 'Bullying': 'Behavior', 'Fighting': 'Behavior',
            'Tardiness': 'Attendance', 'Absenteeism': 'Attendance', 'Uniform Violation': 'Uniform',
        };

        const isFirstOffense = offenseLevel === '1st Offense';
        const hours = offenseLevel === '1st Offense' ? 0 : offenseLevel === '2nd Offense' ? 5 : 10;
        const nowIso = new Date().toISOString();
        const sid = String(selectedStudent.student_id_number || selectedStudent.student_id || selectedStudent.id);

        let imageUrl = null;
        if (imageFile) {
            const { url, error: upErr } = await uploadImageToBucket('penalties', imageFile);
            if (upErr) {
                showToast('warning', 'Image upload skipped', upErr.message || 'Check Supabase Storage bucket "penalties"');
            } else {
                imageUrl = url;
            }
        }

        const data = {
            student_id: sid,
            student_name: selectedStudent.name,
            student_email: selectedStudent.email || '',
            violation,
            violation_type: violation,
            category: categoryMap[violation] || 'Other',
            hours,
            status: isFirstOffense ? 'Resolved' : status,
            offense_level: offenseLevel,
            is_warning: isFirstOffense,
            description: description || violation,
            created_at: nowIso,
            updated_at: nowIso,
        };
        if (imageUrl) data.image_url = imageUrl;
        if (!isFirstOffense && (status === 'in-progress' || status === 'Active')) data.started_at = nowIso;
        else if (!isFirstOffense && status === 'Completed') data.completed_at = nowIso;
        if (!isFirstOffense) {
            if (serviceType) data.service_type = serviceType;
            if (deadline) data.deadline = deadline;
        }

        const { error } = await supabase.from('penalties').insert([data]).select();
        if (error) return showToast('error', 'Failed', error.message);

        const { error: notificationError } = await supabase.from('notifications').insert([{
            student_id: sid,
            title: 'New violation assigned',
            message: `${violation} has been assigned to your account.`,
            type: 'violation',
            is_read: false,
            created_at: nowIso,
        }]);
        if (notificationError) {
            showToast('warning', 'Penalty added', 'The violation was saved, but its notification could not be sent');
        } else {
            showToast('success', 'Penalty added', `Recorded for ${selectedStudent.name}`);
        }
        await logActivity('penalty', `Added ${violation} (${offenseLevel}) for ${selectedStudent.name}`);
        setShowAddPenalty(false);
        resetPenaltyForm();
        await loadPenalties();
        await loadActivity();
    };

    const handleEditPenalty = async () => {
        if (!selectedPenalty) return;
        const { violation, description, offenseLevel, serviceType, deadline, status, studentId, imageFile } = penaltyForm;
        if (!violation || !studentId) return showToast('error', 'Missing fields', 'Fill all required fields');

        const selectedStudent = students.find(s =>
            String(s.student_id_number || s.student_id || s.id) === String(studentId)
        );
        if (!selectedStudent) return showToast('error', 'Not found', 'Student not found');

        const isFirstOffense = offenseLevel === '1st Offense';
        const hours = offenseLevel === '1st Offense' ? 0 : offenseLevel === '2nd Offense' ? 5 : 10;
        const nowIso = new Date().toISOString();
        const sid = String(selectedStudent.student_id_number || selectedStudent.student_id || selectedStudent.id);

        let imageUrl = selectedPenalty.image_url || null;
        if (imageFile) {
            const { url, error: upErr } = await uploadImageToBucket('penalties', imageFile);
            if (upErr) {
                showToast('warning', 'Image upload skipped', upErr.message || 'Check Supabase Storage bucket "penalties"');
            } else {
                imageUrl = url;
            }
        }

        const update = {
            student_id: sid,
            student_name: selectedStudent.name,
            student_email: selectedStudent.email || '',
            violation, violation_type: violation,
            hours, status: isFirstOffense ? 'Resolved' : status,
            offense_level: offenseLevel,
            is_warning: isFirstOffense,
            description: description || violation,
            updated_at: nowIso,
        };
        if (imageUrl) update.image_url = imageUrl;
        if (!isFirstOffense && (status === 'in-progress' || status === 'Active') && !selectedPenalty.started_at) {
            update.started_at = nowIso;
        }
        if (!isFirstOffense && status === 'Completed') update.completed_at = nowIso;
        if (!isFirstOffense) {
            if (serviceType) update.service_type = serviceType;
            if (deadline) update.deadline = deadline;
        }

        const { error } = await supabase.from('penalties').update(update).eq('id', selectedPenalty.id).select();
        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Updated', 'Penalty updated successfully');
        await logActivity('penalty', `Updated penalty for ${selectedStudent.name}`);
        setShowEditPenalty(false);
        setSelectedPenalty(null);
        resetPenaltyForm();
        await loadPenalties();
        await loadActivity();
    };

    const handleAddStudent = async () => {
        const { name, studentId, email, course, year, status } = studentForm;
        if (!name) return showToast('error', 'Missing', 'Full name is required');
        if (!studentId) return showToast('error', 'Missing', 'Student ID is required');
        if (!/^\d{8}$/.test(studentId)) return showToast('error', 'Invalid', 'Student ID must be 8 digits');
        if (!email || !email.includes('@')) return showToast('error', 'Invalid', 'Valid email is required');

        if (students.find(s => s.student_id_number === studentId))
            return showToast('error', 'Duplicate', `Student ID ${studentId} already exists`);

        const data = {
            name, student_id_number: studentId, email, course,
            year_level: year, status: status || 'Good', violation_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('students').insert([data]).select();
        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Student added', `${name} added successfully`);
        await logActivity('student', `Added student ${name} (${studentId})`);
        setShowAddStudent(false);
        resetStudentForm();
        await loadStudents();
        await loadActivity();
    };

    const handleEditStudent = async () => {
        if (!selectedStudent) return;
        const { name, studentId, email, course, year, status } = studentForm;
        if (!name || !studentId || !email) return showToast('error', 'Missing', 'Fill all required fields');
        if (!/^\d{8}$/.test(studentId)) return showToast('error', 'Invalid', 'Student ID must be 8 digits');

        const dup = students.find(s => s.student_id_number === studentId && s.id !== selectedStudent.id);
        if (dup) return showToast('error', 'Duplicate', 'Student ID already used');

        const { error } = await supabase.from('students').update({
            name, student_id_number: studentId, email, course,
            year_level: year, status, updated_at: new Date().toISOString(),
        }).eq('id', selectedStudent.id);

        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Updated', `${name} updated`);
        await logActivity('student', `Updated student ${name}`);
        setShowEditStudent(false);
        setSelectedStudent(null);
        await loadStudents();
        await loadActivity();
    };

    const handleDeletePenalty = async (id) => {
        if (!window.confirm('Delete this penalty?')) return;
        const target = penalties.find(p => p.id === id);
        const { error } = await supabase.from('penalties').delete().eq('id', id);
        if (error) return showToast('error', 'Failed', 'Failed to delete penalty');
        showToast('success', 'Deleted', 'Penalty removed');
        await logActivity('penalty', `Deleted penalty for ${target?.student_name || 'unknown student'}`);
        await loadPenalties();
        await loadActivity();
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm('Delete this student? This will also remove all their penalties.')) return;
        const student = students.find(s => String(s.id) === String(id));
        if (!student) return;
        const sid = student.student_id_number || student.student_id || student.id;
        await supabase.from('penalties').delete().eq('student_id', String(sid));
        const { error } = await supabase.from('students').delete().eq('id', student.id);
        if (error) return showToast('error', 'Failed', 'Failed to delete student');
        showToast('success', 'Deleted', 'Student removed');
        await logActivity('student', `Deleted student ${student.name}`);
        await loadStudents();
        await loadPenalties();
        await loadActivity();
    };

    const handleBulkDeletePenalties = async () => {
        if (!selectedPenalties.length) return;
        if (!window.confirm(`Delete ${selectedPenalties.length} selected penalties?`)) return;
        await supabase.from('penalties').delete().in('id', selectedPenalties);
        showToast('success', 'Bulk delete', `${selectedPenalties.length} penalties removed`);
        await logActivity('penalty', `Bulk deleted ${selectedPenalties.length} penalties`);
        setSelectedPenalties([]);
        await loadPenalties();
        await loadActivity();
    };

    const openAppealAction = (appeal, type) => {
        setSelectedAppeal(appeal);
        setAppealActionType(type);
        setAppealActionComment('');
        setAppealActionError('');
        setShowAppealActionModal(true);
    };

    const handleApproveAppeal = (id) => {
        const appeal = appeals.find(a => String(a.id) === String(id));
        if (!appeal) return showToast('error', 'Not found', 'Appeal not found');
        openAppealAction(appeal, 'approve');
    };

    const handleRejectAppeal = (id) => {
        const appeal = appeals.find(a => String(a.id) === String(id));
        if (!appeal) return showToast('error', 'Not found', 'Appeal not found');
        openAppealAction(appeal, 'reject');
    };

    const confirmAppealAction = async () => {
        if (!selectedAppeal || !appealActionType) return;

        const comment = appealActionComment.trim();
        if (!comment) {
            setAppealActionError('Please add a comment/remarks before confirming.');
            return;
        }
        setAppealActionError('');

        const isApprove = appealActionType === 'approve';
        const nowIso = new Date().toISOString();

        const update = {
            status: isApprove ? 'Approved' : 'Rejected',
            reviewed_at: nowIso,
            reviewed_by: admin?.id || null,
            reviewed_by_name: admin?.full_name || admin?.name || 'Admin',
            admin_comment: comment,
        };

        const { error } = await supabase
            .from('appeals')
            .update(update)
            .eq('id', selectedAppeal.id);

        if (error) {
            setAppealActionError(error.message);
            return;
        }

        if (selectedAppeal.student_id) {
            await supabase.from('notifications').insert([{
                student_id: selectedAppeal.student_id,
                title: isApprove ? 'Appeal approved' : 'Appeal rejected',
                message: `Your appeal for "${selectedAppeal.penalty_violation || selectedAppeal.violation || 'violation'}" has been ${isApprove ? 'approved' : 'rejected'}.\n\nRemarks: ${comment}`,
                type: isApprove ? 'approved' : 'rejected',
                is_read: false,
                created_at: nowIso,
            }]);
        }

        showToast('success', isApprove ? 'Approved' : 'Rejected',
            `Appeal #${selectedAppeal.id} has been ${isApprove ? 'approved' : 'rejected'}.`);

        await logActivity('appeal',
            `${isApprove ? 'Approved' : 'Rejected'} appeal #${selectedAppeal.id} — ${comment}`);

        setShowAppealActionModal(false);
        setSelectedAppeal(null);
        setAppealActionType(null);
        setAppealActionComment('');

        await loadAppeals();
        await loadActivity();
        await loadNotifications();
    };

    const handleMarkPenaltyComplete = (id) => {
        setCompletePenaltyId(id);
    };

    const confirmMarkPenaltyComplete = async () => {
        const id = completePenaltyId;
        setCompletePenaltyId(null);
        if (!id) return;
        const nowIso = new Date().toISOString();
        const { error } = await supabase.from('penalties').update({
            status: 'Completed',
            completed_at: nowIso,
            updated_at: nowIso,
        }).eq('id', id);
        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Completed', 'Penalty marked complete');
        await logActivity('penalty', `Marked penalty #${id} as complete`);
        await loadPenalties();
        await loadActivity();
    };

    const handleSaveProfile = async () => {
        if (!adminForm.name.trim()) return showToast('error', 'Name required', '');
        const { error } = await supabase.from('admins').update({
            full_name: adminForm.name.trim(),
            email: adminForm.email.trim(),
        }).eq('id', admin.id);
        if (error) return showToast('error', 'Failed', error.message);

        const updated = { ...admin, full_name: adminForm.name.trim(), email: adminForm.email.trim() };
        localStorage.setItem('currentAdmin', JSON.stringify(updated));
        setAdmin(updated);
        setShowEditProfile(false);
        showToast('success', 'Profile updated', '');
    };

    const handleChangePassword = async () => {
        if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) return showToast('error', 'Missing', 'Fill all fields');
        if (pwForm.newPw.length < 6) return showToast('error', 'Too short', 'Min 6 characters');
        if (pwForm.newPw !== pwForm.confirm) return showToast('error', 'Mismatch', 'Passwords do not match');

        const { data } = await supabase.from('admins').select('password_hash').eq('id', admin.id).single();
        if (!data || data.password_hash !== pwForm.current)
            return showToast('error', 'Wrong password', 'Current password is incorrect');

        const { error } = await supabase.from('admins').update({ password_hash: pwForm.newPw }).eq('id', admin.id);
        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Password updated', '');
        setPwForm({ current: '', newPw: '', confirm: '' });
        setShowChangePassword(false);
    };

    const handleImportCSV = async () => {
        if (!importFile) return showToast('error', 'No file', 'Select a CSV file first');
        try {
            const text = await importFile.text();
            const lines = text.split('\n').filter(l => l.trim());
            if (lines.length < 2) return showToast('error', 'Empty', 'CSV has no data');

            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIdx = headers.findIndex(h => h.includes('name'));
            const idIdx = headers.findIndex(h => h.includes('id') || h.includes('student'));
            const emailIdx = headers.findIndex(h => h.includes('email'));
            const courseIdx = headers.findIndex(h => h.includes('course'));
            const yearIdx = headers.findIndex(h => h.includes('year'));

            if (nameIdx === -1 || idIdx === -1) return showToast('error', 'Invalid CSV', 'Missing Name or ID columns');

            const records = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',').map(c => c.trim());
                if (cols.length <= Math.max(nameIdx, idIdx)) continue;
                const name = cols[nameIdx] || '';
                const sid = cols[idIdx] || '';
                if (!name || !sid || !/^\d{8}$/.test(sid)) continue;
                if (students.find(s => s.student_id_number === sid)) continue;
                records.push({
                    name, student_id_number: sid,
                    email: emailIdx !== -1 ? cols[emailIdx] || '' : '',
                    course: courseIdx !== -1 ? cols[courseIdx] || 'BSN' : 'BSN',
                    year_level: yearIdx !== -1 ? cols[yearIdx] || '1st' : '1st',
                    status: 'Good', violation_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
            }

            if (!records.length) return showToast('warning', 'No new records', 'All rows were invalid or already exist');

            const { error } = await supabase.from('students').insert(records);
            if (error) return showToast('error', 'Import failed', error.message);

            showToast('success', 'Import complete', `${records.length} students imported`);
            await logActivity('student', `Imported ${records.length} students from CSV`);
            setShowImportCSV(false);
            setImportFile(null);
            await loadStudents();
            await loadActivity();
        } catch (err) {
            showToast('error', 'Read failed', err.message);
        }
    };

    const handleSendQuickNote = async () => {
        if (!quickNote.title.trim() || !quickNote.message.trim()) return showToast('error', 'Missing', 'Title and message are required');
        const payload = {
            title: quickNote.title.trim(),
            message: quickNote.message.trim(),
            type: quickNote.type || 'info',
            is_read: false,
            created_at: new Date().toISOString(),
        };
        if (quickNote.targetStudent) payload.student_id = quickNote.targetStudent;
        const { error } = await supabase.from('notifications').insert([payload]);
        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Notification sent', quickNote.targetStudent ? 'Sent to selected student' : 'Broadcast sent');
        await logActivity('system', `Sent notification: ${quickNote.title}`);
        setShowQuickNote(false);
        setQuickNote({ title: '', message: '', targetStudent: '', type: 'info' });
        await loadNotifications();
        await loadActivity();
    };

    const resetAnnouncementForm = () => setAnnouncementForm({
        title: '', message: '', type: 'info', target: '', priority: 'normal',
        imageFile: null, imageUrl: '',
    });

    const handleSuggestCaption = async () => {
        const title = announcementForm.title.trim();
        if (title.length < 2) {
            showToast('warning', 'Add a title first', 'Type at least a few words before asking AI');
            return;
        }
        if (suggesting) return;

        setSuggesting(true);
        try {
            const { data, error } = await supabase.functions.invoke('suggest-caption', {
                body: { title },
            });

            if (error) {
                console.error('[suggest-caption] invoke error', error);
                showToast('error', 'AI request failed', error.message || 'Try again in a moment');
                return;
            }

            if (!data || data.error) {
                console.error('[suggest-caption] returned', data);
                showToast('error', 'AI could not respond', data?.error || 'Unknown error');
                return;
            }

            setAnnouncementForm(prev => ({
                ...prev,
                message: prev.message?.trim() ? prev.message : data.caption,
                type: data.type || prev.type,
                priority: data.priority || prev.priority,
            }));

            showToast('success', '✨ Caption suggested', 'Review it and tweak if needed');
        } catch (err) {
            console.error('[suggest-caption] threw', err);
            showToast('error', 'AI request failed', err?.message || 'Check your connection');
        } finally {
            setSuggesting(false);
        }
    };

    const handleSaveAnnouncement = async () => {
        if (!announcementForm.title.trim() || !announcementForm.message.trim()) {
            return showToast('error', 'Missing', 'Title and message are required');
        }

        let imageUrl = announcementForm.imageUrl || selectedAnnouncement?.image_url || null;
        if (announcementForm.imageFile) {
            const { url, error: upErr } = await uploadImageToBucket('announcement', announcementForm.imageFile);
            if (upErr) {
                showToast('warning', 'Image upload skipped', upErr.message || 'Check Supabase Storage bucket "announcements"');
            } else {
                imageUrl = url;
            }
        }

        const basePayload = {
            title: announcementForm.title.trim(),
            message: announcementForm.message.trim(),
            type: announcementForm.type,
            is_read: false,
        };
        if (imageUrl) basePayload.image_url = imageUrl;
        if (announcementForm.target) basePayload.student_id = announcementForm.target;

        const tryWrite = async (includePriority) => {
            const payload = { ...basePayload };
            if (includePriority) payload.priority = announcementForm.priority;

            if (selectedAnnouncement) {
                return await supabase
                    .from('notifications')
                    .update(payload)
                    .eq('id', selectedAnnouncement.id);
            }
            payload.created_at = new Date().toISOString();
            return await supabase.from('notifications').insert([payload]);
        };

        let result = await tryWrite(true);

        if (result.error && /priority/i.test(result.error.message || '')) {
            result = await tryWrite(false);
        }
        if (result.error && /image_url/i.test(result.error.message || '')) {
            const dropImage = { ...basePayload };
            delete dropImage.image_url;
            if (selectedAnnouncement) {
                result = await supabase.from('notifications').update(dropImage).eq('id', selectedAnnouncement.id);
            } else {
                dropImage.created_at = new Date().toISOString();
                result = await supabase.from('notifications').insert([dropImage]);
            }
            showToast('warning', 'Saved without image', 'Add an "image_url" text column to your notifications table.');
        }

        if (result.error) {
            return showToast('error', 'Failed', result.error.message);
        }

        showToast(
            'success',
            selectedAnnouncement ? 'Updated' : 'Posted',
            selectedAnnouncement
                ? 'Announcement saved'
                : (announcementForm.target ? 'Sent to selected student' : 'Broadcast to all students')
        );

        await logActivity('system', `Announcement: ${announcementForm.title}`);
        setShowAnnouncementModal(false);
        setSelectedAnnouncement(null);
        resetAnnouncementForm();
        await loadAnnouncements();
        await loadNotifications();
        await loadActivity();
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('Delete this announcement?')) return;
        const { error } = await supabase.from('notifications').delete().eq('id', id);
        if (error) return showToast('error', 'Failed', error.message);
        showToast('success', 'Deleted', 'Announcement removed');
        await loadAnnouncements();
        await loadNotifications();
    };

    const openEditAnnouncement = (a) => {
        setSelectedAnnouncement(a);
        setAnnouncementForm({
            title: a.title || '',
            message: a.message || '',
            type: a.type || 'info',
            target: a.student_id || '',
            priority: a.priority || 'normal',
            imageFile: null,
            imageUrl: a.image_url || '',
        });
        setShowAnnouncementModal(true);
    };

    const resetPenaltyForm = () => setPenaltyForm({
        violation: '', description: '', offenseLevel: '1st Offense',
        serviceType: 'Community Service', deadline: '', status: 'Pending', studentId: '',
        imageFile: null, imageUrl: ''
    });
    const resetStudentForm = () => setStudentForm({
        name: '', studentId: generateStudentId(students), email: '', course: 'BSN', year: '1st', status: 'Good'
    });

    const openEditPenalty = (p) => {
        setSelectedPenalty(p);
        setPenaltyForm({
            violation: p.violation || p.violation_type || '',
            description: p.description || '',
            offenseLevel: p.offense_level || '1st Offense',
            serviceType: p.service_type || 'Community Service',
            deadline: p.deadline || '',
            status: p.status || 'Pending',
            studentId: p.student_id || '',
            imageFile: null,
            imageUrl: p.image_url || '',
        });
        setShowEditPenalty(true);
    };

    const openEditStudent = (s) => {
        setSelectedStudent(s);
        setStudentForm({
            name: s.name || '',
            studentId: s.student_id_number || '',
            email: s.email || '',
            course: s.course || 'BSN',
            year: s.year_level || '1st',
            status: s.status || 'Good',
        });
        setShowEditStudent(true);
    };

    const markAllRead = async () => {
        await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('is_read', false);
        await loadNotifications();
        showToast('info', 'All marked as read', '');
    };
    const deleteNotif = async (id) => {
        const target = notifications.find((n) => n.id === id);
        if (target && target.student_id == null) {
            showToast('warning', 'Cannot delete here', 'Announcements can only be deleted from the Announcements tab');
            return;
        }
        await supabase.from('notifications').delete().eq('id', id);
        await loadNotifications();
        if (loadAnnouncements) await loadAnnouncements();
    };
    const markNotifRead = async (id) => {
        await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', id);
        await loadNotifications();
    };

    const confirmLogout = () => {
        logout();
    };

    const handleSendAnnouncement = () => {
        setCurrentTab('announcements');
        setSelectedAnnouncement(null);
        resetAnnouncementForm();
        setShowAnnouncementModal(true);
    };

    useEffect(() => {
        if (!showNotifications) return;
        const prevOverflow = document.body.style.overflow;
        const prevPointer = document.body.style.pointerEvents;
        document.body.style.overflow = 'hidden';
        document.body.style.pointerEvents = 'none';
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.pointerEvents = prevPointer;
        };
    }, [showNotifications]);

    useEffect(() => {
        if (!confirmDialog && !completePenaltyId) return;
        const prevOverflow = document.body.style.overflow;
        const prevPointer = document.body.style.pointerEvents;
        document.body.style.overflow = 'hidden';
        document.body.style.pointerEvents = 'none';
        return () => {
            document.body.style.overflow = prevOverflow;
            document.body.style.pointerEvents = prevPointer;
        };
    }, [confirmDialog, completePenaltyId]);

    if (!admin) return null;
    const adminName = admin.full_name || admin.name || 'Admin';
    const adminRole = admin.role || 'Discipline Officer';

    const cardCls = 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl';
    const btnPrimary = 'px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed';
    const btnSecondary = 'px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-base font-medium rounded-lg transition';
    const btnDanger = 'px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-base font-semibold rounded-lg transition';
    const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-base text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';
    const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2';

    const tabLabel = currentTab === 'dashboard' ? 'Dashboard'
        : currentTab === 'penalties' ? 'Penalties Management'
            : currentTab === 'students' ? 'Student Management'
                : currentTab === 'appeals' ? 'Appeals Management'
                    : currentTab === 'announcements' ? 'Announcements'
                        : currentTab === 'analytics' ? 'Analytics'
                            : currentTab === 'activity' ? 'Activity Log'
                                : currentTab === 'reports' ? 'Reports & Analytics' : '';

    const violationOptions = [
        'Academic Dishonesty', 'Cheating', 'Plagiarism',
        'Class Disruption', 'Insubordination', 'Bullying', 'Fighting',
        'Tardiness', 'Absenteeism', 'Uniform Violation',
    ];
    const serviceTypeOptions = [
        'Community Service',
        'Library Duty',
        'Clean-Up Drive',
        'Office Assistance',
        'Event Support',
        'Peer Tutoring',
        'Clinical Area Assistance',
        'Campus Beautification',
        'Others',
    ];
    const courseOptions = ['BSN'];
    const yearOptions = ['1st', '2nd', '3rd', '4th'];
    const statusOptions = ['Good', 'Probation', 'Warning', 'Suspended'];

    if (loading) return <DashboardSkeleton variant="admin" isDark={darkMode} />;

    return (
        <div className={darkMode ? 'dashboard-dark' : ''}>
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans text-[16px] leading-relaxed">
                <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes pulseSoft { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
            .dashboard-dark { color-scheme: dark; }
        `}</style>

                {drawerOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] md:hidden" onClick={() => setDrawerOpen(false)} />
                )}

                <aside className={`group fixed top-0 left-0 bottom-0 w-[68px] hover:w-[220px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-[300] flex flex-col transition-all duration-300 ease-out overflow-hidden md:translate-x-0 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex flex-col items-center pt-4 pb-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md">
                            {getInitials(adminName)}
                        </div>
                        <div className="mt-3 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap px-3">
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">{adminName}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{adminRole}</div>
                            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-100 dark:border-violet-800">
                                {I.shield} Admin
                            </span>
                        </div>
                    </div>

                    <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
                        {[
                            { tab: 'dashboard', label: 'Dashboard', icon: I.home },
                            { tab: 'penalties', label: 'Penalties', icon: I.rect },
                            { tab: 'students', label: 'Students', icon: I.users },
                            { tab: 'appeals', label: 'Appeals', icon: I.doc },
                            { tab: 'announcements', label: 'Announcements', icon: I.megaphone },
                            { tab: 'analytics', label: 'Analytics', icon: I.chart },
                            { tab: 'activity', label: 'Activity Log', icon: I.activity },
                            { tab: 'reports', label: 'Reports', icon: I.trendUp },
                        ].map((item) => (
                            <button
                                key={item.tab}
                                onClick={() => { setCurrentTab(item.tab); setDrawerOpen(false); }}
                                className={`relative flex items-center w-full h-12 transition-colors duration-150 ${currentTab === item.tab
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                {currentTab === item.tab && (
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 dark:bg-blue-400 rounded-r" />
                                )}
                                <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{item.icon}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm font-medium pr-4">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                        <button
                            onClick={() => { setAdminForm({ name: adminName, email: admin.email || '' }); setShowEditProfile(true); }}
                            className="relative flex items-center w-full h-11 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{I.edit}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm">Edit Profile</span>
                        </button>
                        <button
                            onClick={() => { setPwForm({ current: '', newPw: '', confirm: '' }); setShowChangePassword(true); }}
                            className="relative flex items-center w-full h-11 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{I.lock}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm">Change Password</span>
                        </button>
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="relative flex items-center w-full h-12 text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                        >
                            <span className="w-[68px] flex-shrink-0 flex items-center justify-center">{I.logout}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-100 whitespace-nowrap text-sm">Logout</span>
                        </button>
                    </div>
                </aside>

                <header className="sticky top-0 z-[100] h-16/bg-white/90 dark:bg-slate-900/90  backdrop-blur border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 md:ml-[68px]">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setDrawerOpen(true)}>
                            <span className="w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rounded" />
                            <span className="w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rounded" />
                            <span className="w-5 h-0.5 bg-slate-700 dark:bg-slate-200 rounded" />
                        </button>
                        <div className="flex items-center gap-3">
                            <img src="/CC.png" alt="CCNDM" className="w-9 h-9 object-contain rounded-lg bg-blue-50 dark:bg-slate-700 p-1" />
                            <span className="text-lg font-bold text-blue-600">CCNDM</span>
                            <span className="hidden md:inline text-xs text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3 uppercase tracking-wide">{tabLabel}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={handleSendAnnouncement}
                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-sm hover:shadow-md transition"
                            title="Post a new announcement"
                        >
                            {I.megaphone} Send Announcement
                        </button>
                        <button
                            onClick={() => setShowQuickNote(true)}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition"
                            title="Send quick notification"
                        >
                            {I.messageCircle} Send Note
                        </button>
                        <button
                            onClick={() => { setImportFile(null); setShowImportCSV(true); }}
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition"
                            title="Import students from CSV"
                        >
                            {I.upload} Import
                        </button>
                        <button
                            onClick={refreshAll}
                            disabled={refreshing}
                            className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Refresh data"
                        >
                            <span className={refreshing ? 'animate-spin inline-block' : 'inline-block'}>
                                {I.refresh}
                            </span>
                        </button>
                        <button className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition" onClick={toggleDarkMode}>
                            {darkMode ? I.sun : I.moon}
                        </button>
                        <button className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition relative" onClick={() => setShowNotifications(true)}>
                            {I.bell}
                            {unreadCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <button className="ml-1.5 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition">
                            {I.shield} Admin
                        </button>
                    </div>
                </header>

                {showNotifications && (
                    <div className="fixed inset-0 z-[20000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 select-none" style={{ pointerEvents: 'auto' }}>
                        <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className="text-slate-700 dark:text-slate-200 scale-125">{I.bellRing}</span>
                                        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-800 animate-pulse" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>
                                <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition" onClick={() => setShowNotifications(false)}>
                                    {I.close}
                                </button>
                            </div>
                            <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                                {[{ key: 'all', label: 'All', count: notifications.length }, { key: 'unread', label: 'Unread', count: unreadCount }].map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setNotifFilter(f.key)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition flex items-center gap-2 ${notifFilter === f.key
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700/60 dark:text-slate-400'}`}
                                    >
                                        {f.label}
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${notifFilter === f.key
                                            ? 'bg-blue-200/70 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                            {f.count}
                                        </span>
                                    </button>
                                ))}
                                <div className="flex-1" />
                                <button
                                    onClick={markAllRead}
                                    disabled={unreadCount === 0}
                                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed px-3 py-1.5"
                                >
                                    Mark all read
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-2 py-2">
                                {filteredNotifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mb-5 relative">
                                            <span className="text-blue-400 dark:text-blue-500 scale-150">{I.bell}</span>
                                            <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                {I.check}
                                            </span>
                                        </div>
                                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">{notifFilter === 'unread' ? "You're all caught up!" : 'No notifications yet'}</p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]">{notifFilter === 'unread' ? "You've read everything." : 'Updates will show up here.'}</p>
                                    </div>
                                ) : (
                                    <>
                                        {newNotifs.length > 0 && <div className="px-4 pt-3 pb-1"><p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">New</p></div>}
                                        {newNotifs.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markNotifRead} onDelete={deleteNotif} />)}
                                        {earlierNotifs.length > 0 && <div className="px-4 pt-5 pb-1"><p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Earlier</p></div>}
                                        {earlierNotifs.map((n) => <NotificationItem key={n.id} notification={n} onMarkRead={markNotifRead} onDelete={deleteNotif} />)}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <main className="md:ml-[68px] p-4 md:p-8 pb-20 md:pb-8">
                    {currentTab === 'dashboard' && (
                        <div style={fadeInStyle}>
                            <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                        {getGreeting()}, <span className="text-blue-600">{adminName.split(' ')[0]}</span>
                                    </h1>
                                    <p className="text-sm text-slate-400 mt-1.5">
                                        {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at{' '}
                                        <strong className="text-slate-700 dark:text-slate-200">
                                            {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                                        </strong>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        onClick={refreshAll}
                                        disabled={refreshing}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 text-sm font-semibold transition"
                                    >
                                        <span className={refreshing ? 'animate-spin' : ''}>
                                            {I.refresh}
                                        </span>
                                        {refreshing ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                    <span className="text-xs text-slate-400 hidden sm:inline">
                                        Updated {timeAgo(lastUpdated)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Live System
                                    </span>
                                </div>
                            </div>

                            {stats.pendingAppeals > 0 && (
                                <div className="flex items-center gap-3 p-4 mb-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">{I.alert}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                            {stats.pendingAppeals} pending {stats.pendingAppeals === 1 ? 'appeal' : 'appeals'} awaiting review
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-0.5">Review and resolve student appeals to keep things moving.</p>
                                    </div>
                                    <button onClick={() => setCurrentTab('appeals')} className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg transition">
                                        Review →
                                    </button>
                                </div>
                            )}

                            {stats.inProgress > 0 && (
                                <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60">
                                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">{I.clock}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-semibold text-slate-800 dark:text-slate-100">
                                            {stats.inProgress} {stats.inProgress === 1 ? 'penalty' : 'penalties'} currently in progress
                                        </p>
                                        <p className="text-sm text-slate-500 dark:text-slate-300 mt-0.5">Students are actively completing their service hours.</p>
                                    </div>
                                    <button onClick={() => setCurrentTab('penalties')} className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
                                        View →
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {[
                                    { icon: I.users, value: stats.totalStudents, label: 'Total Students', bg: 'from-blue-500 to-blue-600', trend: '+12%', trendUp: true },
                                    { icon: I.alert, value: stats.totalViolations, label: 'Total Violations', bg: 'from-amber-500 to-orange-600', trend: '+8%', trendUp: true },
                                    { icon: I.clock, value: stats.pendingAppeals, label: 'Pending Appeals', bg: 'from-violet-500 to-purple-600', trend: '-3%', trendUp: false },
                                    { icon: I.check, value: stats.approvedAppeals, label: 'Approved Appeals', bg: 'from-emerald-500 to-teal-600', trend: '+15%', trendUp: true },
                                ].map((s, i) => (
                                    <div key={i} className={`${cardCls} p-6 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition group`}>
                                        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${s.bg} opacity-5 dark:opacity-10 -mr-12 -mt-12 group-hover:opacity-10 dark:group-hover:opacity-20 transition`} />
                                        <div className="flex justify-between items-start mb-3 relative">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br ${s.bg} shadow-md`}>
                                                {s.icon}
                                            </div>
                                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${s.trendUp
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {s.trendUp ? I.trendUp : I.trendDown}
                                                {s.trend}
                                            </span>
                                        </div>
                                        <div className="relative">
                                            <div className="text-3xl font-bold leading-tight">{s.value}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`${cardCls} p-6 mb-6`}>
                                <h3 className="text-base font-bold mb-5 flex items-center gap-2">
                                    {I.zap} Quick Actions
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {[
                                        { icon: I.plus, label: 'Add Penalty', onClick: () => { resetPenaltyForm(); setShowAddPenalty(true); }, color: 'bg-blue-500' },
                                        { icon: I.plus, label: 'Add Student', onClick: () => { resetStudentForm(); setShowAddStudent(true); }, color: 'bg-emerald-500' },
                                        { icon: I.megaphone, label: 'Announcement', onClick: handleSendAnnouncement, color: 'bg-fuchsia-500' },
                                        { icon: I.doc, label: 'Review Appeals', onClick: () => setCurrentTab('appeals'), color: 'bg-violet-500' },
                                        { icon: I.chart, label: 'View Analytics', onClick: () => setCurrentTab('analytics'), color: 'bg-rose-500' },
                                        { icon: I.activity, label: 'Activity Log', onClick: () => setCurrentTab('activity'), color: 'bg-slate-600' },
                                    ].map((a, i) => (
                                        <button
                                            key={i}
                                            onClick={a.onClick}
                                            className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition"
                                        >
                                            <div className={`w-12 h-12 rounded-lg ${a.color} text-white flex items-center justify-center group-hover:scale-110 transition`}>
                                                {a.icon}
                                            </div>
                                            <span className="text-sm font-semibold text-center leading-tight">{a.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                                <div className={`${cardCls} p-6 lg:col-span-2`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-bold flex items-center gap-2">{I.trendUp} Violations — Last 7 Days</h3>
                                        <span className="text-xs text-slate-400">Live</span>
                                    </div>
                                    <div className="flex items-end justify-between gap-2 h-40">
                                        {stats.last7.map((d, i) => {
                                            const max = Math.max(...stats.last7.map(x => x.count), 1);
                                            const pct = (d.count / max) * 100;
                                            const isToday = i === 6;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{d.count}</span>
                                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative overflow-hidden">
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-700 ${isToday ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-blue-500/70 to-blue-400/60'}`}
                                                            style={{ height: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.date.getDay()]}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`${cardCls} p-6`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.chart} By Category</h3>
                                    <div className="space-y-3">
                                        {stats.categoryDist.map((c, i) => {
                                            const pct = penalties.length > 0 ? Math.round((c.count / penalties.length) * 100) : 0;
                                            const colors = ['from-blue-400 to-blue-600', 'from-violet-400 to-violet-600', 'from-amber-400 to-amber-600', 'from-emerald-400 to-emerald-600', 'from-rose-400 to-rose-600'];
                                            return (
                                                <div key={c.name}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium">{c.name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400">{c.count} · {pct}%</span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${colors[i]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className={`${cardCls} p-6 mb-6`}>
                                <h3 className="text-base font-bold mb-5 flex items-center gap-2">{I.chart} System Overview</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { pct: stats.resolutionRate, label: 'Resolution Rate', color: '#10b981', sub: `${stats.resolved}/${stats.totalViolations} resolved` },
                                        { pct: stats.appealSuccessRate, label: 'Appeal Success', color: '#f59e0b', sub: `${stats.approvedAppeals}/${appeals.length} approved` },
                                        { pct: stats.engagementRate, label: 'Student Engagement', color: '#3b82f6', sub: `${stats.activeStudents} active` },
                                        { pct: stats.totalHours > 0 ? Math.round((stats.completedHours / stats.totalHours) * 100) : 0, label: 'Hours Completed', color: '#8b5cf6', sub: `${stats.completedHours}/${stats.totalHours} hrs` },
                                    ].map((r, i) => {
                                        const r32 = 42;
                                        const circ = 2 * Math.PI * r32;
                                        return (
                                            <div key={i} className="flex flex-col items-center">
                                                <div className="relative w-32 h-32">
                                                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r={r32} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-slate-700" />
                                                        <circle cx="50" cy="50" r={r32} fill="none" stroke={r.color} strokeWidth="8" strokeLinecap="round"
                                                            strokeDasharray={circ} strokeDashoffset={circ * (1 - r.pct / 100)}
                                                            style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-2xl font-bold">{r.pct}%</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-semibold mt-2 text-center">{r.label}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 text-center">{r.sub}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                                <div className={`${cardCls} overflow-hidden`}>
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                                        <div className="flex items-center gap-2 text-base font-semibold">{I.alert} Recent Violations</div>
                                        <button onClick={() => setCurrentTab('penalties')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View all →</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-base">
                                            <thead className="bg-slate-50 dark:bg-slate-900/40">
                                                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    <th className="px-5 py-3">Student</th>
                                                    <th className="px-5 py-3">Violation</th>
                                                    <th className="px-5 py-3">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {penalties.length === 0 ? (
                                                    <tr><td colSpan="3" className="text-center py-12 text-slate-400 text-sm">No violations yet</td></tr>
                                                ) : (
                                                    penalties.slice(0, 5).map(v => (
                                                        <tr key={v.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                            <td className="px-5 py-3 font-medium truncate max-w-[140px]">{v.student_name || 'Unknown'}</td>
                                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">{v.violation_type || 'N/A'}</td>
                                                            <td className="px-5 py-3">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeCls(statusClass(v))}`}>
                                                                    {statusLabel(v)}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className={`${cardCls} p-6`}>
                                    <h3 className="text-base font-semibold mb-4 flex items-center gap-2">{I.star} Top Violators</h3>
                                    {topStudents.length === 0 ? (
                                        <p className="text-slate-400 text-center py-4 text-base">No violations recorded</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topStudents.map(([name, count], i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow' :
                                                            i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow' :
                                                                i === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white shadow' :
                                                                    'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                                            {i + 1}
                                                        </span>
                                                        <span className="font-medium truncate">{name}</span>
                                                    </div>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400 flex-shrink-0">{count} {count === 1 ? 'case' : 'cases'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={`${cardCls} p-6`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-semibold flex items-center gap-2">{I.doc} Recent Appeals</h3>
                                    <button onClick={() => setCurrentTab('appeals')} className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">View all →</button>
                                </div>
                                {appeals.length === 0 ? (
                                    <p className="text-slate-400 text-center py-4 text-base">No appeals submitted</p>
                                ) : (
                                    <div className="space-y-2">
                                        {appeals.slice(0, 5).map(a => {
                                            const s = (a.status || 'pending').toLowerCase();
                                            return (
                                                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/40 transition">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium truncate">{a.student_name || 'Unknown'}</p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{a.penalty_violation || a.violation || a.violation_type || 'Unknown violation'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeCls(s)}`}>
                                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                                        </span>
                                                        {s === 'pending' && (
                                                            <button
                                                                onClick={() => handleApproveAppeal(a.id)}
                                                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-md transition"
                                                            >
                                                                Review
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {currentTab === 'penalties' && (
                        <div style={fadeInStyle}>
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold">Penalties Management</h1>
                                    <p className="text-sm text-blue-100 mt-1">Manage violation types, penalties, and enforcement rules</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            if (exportToCSV(filteredPenalties, `penalties_${new Date().toISOString().slice(0, 10)}.csv`)) {
                                                showToast('success', 'Export complete', 'File downloaded');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-base font-medium rounded-lg transition"
                                    >
                                        {I.download} Export
                                    </button>
                                    <button
                                        onClick={() => { resetPenaltyForm(); setShowAddPenalty(true); }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-base font-bold rounded-lg transition shadow-lg"
                                    >
                                        {I.plus} Add Penalty
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {[
                                    { icon: I.doc, value: penalties.length, label: 'Total Penalties', bg: 'bg-blue-500' },
                                    { icon: I.clock, value: penalties.filter(p => p.status === 'Active' || p.status === 'in-progress').length, label: 'Active', bg: 'bg-amber-500' },
                                    { icon: I.check, value: penalties.filter(p => ['Inactive', 'Completed', 'Resolved'].includes(p.status)).length, label: 'Completed', bg: 'bg-emerald-500' },
                                    { icon: I.alert, value: penalties.filter(p => p.offense_level === '3rd Offense').length, label: 'Severe', bg: 'bg-red-500' },
                                ].map((s, i) => (
                                    <div key={i} className={`${cardCls} p-5 flex items-center gap-4`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${s.bg}`}>{s.icon}</div>
                                        <div>
                                            <div className="text-2xl font-bold leading-tight">{s.value}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`${cardCls} p-4 mb-6 flex flex-wrap items-center gap-3`}>
                                <div className="flex-1 min-w-[200px] relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.search}</span>
                                    <input type="text" value={penaltySearch} onChange={(e) => setPenaltySearch(e.target.value)}
                                        placeholder="Search by student, violation..." className={inputCls + ' pl-10'} />
                                </div>
                                <select value={penaltyCategoryFilter} onChange={(e) => setPenaltyCategoryFilter(e.target.value)}
                                    className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100">
                                    <option value="">All Categories</option>
                                    <option>Academic</option>
                                    <option>Behavior</option>
                                    <option>Attendance</option>
                                    <option>Uniform</option>
                                    <option>Other</option>
                                </select>
                                <select value={penaltyStatusFilter} onChange={(e) => setPenaltyStatusFilter(e.target.value)}
                                    className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100">
                                    <option value="">All Status</option>
                                    <option>Pending</option>
                                    <option>in-progress</option>
                                    <option>Completed</option>
                                    <option>Resolved</option>
                                </select>
                                <select value={penaltyLevelFilter} onChange={(e) => setPenaltyLevelFilter(e.target.value)}
                                    className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100">
                                    <option value="">All Levels</option>
                                    <option>1st Offense</option>
                                    <option>2nd Offense</option>
                                    <option>3rd Offense</option>
                                </select>
                                {(penaltySearch || penaltyCategoryFilter || penaltyStatusFilter || penaltyLevelFilter) && (
                                    <button
                                        onClick={() => { setPenaltySearch(''); setPenaltyCategoryFilter(''); setPenaltyStatusFilter(''); setPenaltyLevelFilter(''); }}
                                        className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white underline"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            {selectedPenalties.length > 0 && (
                                <div className="flex items-center gap-3 p-3 mb-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <span className="text-base font-semibold text-blue-700 dark:text-blue-300">
                                        {selectedPenalties.length} selected
                                    </span>
                                    <div className="flex-1" />
                                    <button onClick={handleBulkDeletePenalties} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-md transition flex items-center gap-1">
                                        {I.trash} Delete Selected
                                    </button>
                                    <button onClick={() => setSelectedPenalties([])} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
                                        Cancel
                                    </button>
                                </div>
                            )}

                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-base">
                                        <thead className="bg-slate-50 dark:bg-slate-900/40">
                                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <th className="px-4 py-3 w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="w-5 h-5 accent-blue-600 rounded"
                                                        checked={filteredPenalties.length > 0 && selectedPenalties.length === filteredPenalties.length}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedPenalties(filteredPenalties.map(p => p.id));
                                                            else setSelectedPenalties([]);
                                                        }}
                                                    />
                                                </th>
                                                <th className="px-4 py-3">Student</th>
                                                <th className="px-4 py-3">Violation</th>
                                                <th className="px-4 py-3">Level</th>
                                                <th className="px-4 py-3">Hours</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPenalties.length === 0 ? (
                                                <tr><td colSpan="8" className="text-center py-12 text-slate-400 text-base">No penalties found</td></tr>
                                            ) : (
                                                filteredPenalties.map(p => {
                                                    const time = calculateRemainingTime(p);
                                                    const progress = time ? calculateProgress(p) : 0;
                                                    const isInProgress = p.status === 'in-progress' || p.status === 'Active';
                                                    const isWarning = p.is_warning || p.offense_level === '1st Offense';
                                                    const isCompleted = p.status === 'Completed' || p.status === 'Resolved';
                                                    return (
                                                        <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                            <td className="px-4 py-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-5 h-5 accent-blue-600 rounded"
                                                                    checked={selectedPenalties.includes(p.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) setSelectedPenalties(prev => [...prev, p.id]);
                                                                        else setSelectedPenalties(prev => prev.filter(x => x !== p.id));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3 font-medium truncate max-w-[160px]">{p.student_name || 'Unknown'}</td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[180px]">{p.violation_type || 'N/A'}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${p.offense_level === '3rd Offense' ? badgeCls('rejected') :
                                                                    p.offense_level === '2nd Offense' ? badgeCls('progress') : badgeCls('completed')}`}>
                                                                    {p.offense_level || 'Minor'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">{isWarning ? '—' : `${p.hours || 0}h`}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeCls(isWarning ? 'warning' : statusClass(p))}`}>
                                                                    {statusLabel(p)}
                                                                </span>
                                                                {isInProgress && !isWarning && time && (
                                                                    <div className="mt-1.5">
                                                                        <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">{formatCountdown(time)}</span>
                                                                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                                            <div className="h-full bg-blue-500 transition-all duration-1000 rounded-full" style={{ width: `${progress}%` }} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-sm">
                                                                {p.created_at ? parseDbDate(p.created_at).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1 justify-end">
                                                                    {p.image_url && (
                                                                        <a href={p.image_url} target="_blank" rel="noreferrer"
                                                                            className="p-2 rounded-lg text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                                                                            title="View image">
                                                                            {I.image}
                                                                        </a>
                                                                    )}
                                                                    {isInProgress && !isWarning && !isCompleted && (
                                                                        <button
                                                                            onClick={() => handleMarkPenaltyComplete(p.id)}
                                                                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
                                                                            title="Mark Complete"
                                                                        >
                                                                            {I.check}
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => openEditPenalty(p)}
                                                                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                                                                        title="Edit"
                                                                    >
                                                                        {I.edit}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePenalty(p.id)}
                                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                                                        title="Delete"
                                                                    >
                                                                        {I.trash}
                                                                    </button>
                                                                </div>
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

                    {currentTab === 'students' && (
                        <div style={fadeInStyle}>
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 md:p-7 mb-6 text-white flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold">Student Management</h1>
                                    <p className="text-sm text-blue-100 mt-1">View, manage, and track all student records</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setImportFile(null); setShowImportCSV(true); }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-base font-medium rounded-lg transition"
                                    >
                                        {I.upload} Import CSV
                                    </button>
                                    <button
                                        onClick={() => { resetStudentForm(); setShowAddStudent(true); }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-base font-bold rounded-lg transition shadow-lg"
                                    >
                                        {I.plus} Add Student
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {[
                                    { icon: I.users, value: students.length, label: 'Total Students', bg: 'bg-blue-500' },
                                    { icon: I.check, value: students.filter(s => s.status === 'Good').length, label: 'Good Standing', bg: 'bg-emerald-500' },
                                    { icon: I.clock, value: students.filter(s => s.status === 'Probation').length, label: 'On Probation', bg: 'bg-amber-500' },
                                    { icon: I.alert, value: students.filter(s => s.status === 'Suspended').length, label: 'Suspended', bg: 'bg-red-500' },
                                ].map((s, i) => (
                                    <div key={i} className={`${cardCls} p-5 flex items-center gap-4`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${s.bg}`}>{s.icon}</div>
                                        <div>
                                            <div className="text-2xl font-bold leading-tight">{s.value}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`${cardCls} p-4 mb-6 flex flex-wrap items-center gap-3`}>
                                <div className="flex-1 min-w-[200px] relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.search}</span>
                                    <input type="text" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                                        placeholder="Search by name, ID, or email..." className={inputCls + ' pl-10'} />
                                </div>
                                <select value={studentCourseFilter} onChange={(e) => setStudentCourseFilter(e.target.value)}
                                    className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100">
                                    <option value="">All Courses</option>
                                    {courseOptions.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <select value={studentStatusFilter} onChange={(e) => setStudentStatusFilter(e.target.value)}
                                    className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100">
                                    <option value="">All Status</option>
                                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-base">
                                        <thead className="bg-slate-50 dark:bg-slate-900/40">
                                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <th className="px-5 py-3">ID</th>
                                                <th className="px-5 py-3">Name</th>
                                                <th className="px-5 py-3">Course</th>
                                                <th className="px-5 py-3">Year</th>
                                                <th className="px-5 py-3">Violations</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-12 text-slate-400 text-base">No students found</td></tr>
                                            ) : (
                                                filteredStudents.map(s => {
                                                    const sid = s.student_id_number || s.student_id || s.id;
                                                    const vc = penalties.filter(p =>
                                                        String(p.student_id) === String(sid) ||
                                                        (p.student_name && p.student_name === s.name)
                                                    ).length;
                                                    const sk = (s.status || 'good').toLowerCase();
                                                    return (
                                                        <tr key={s.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                            <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">{s.student_id_number || '—'}</td>
                                                            <td className="px-5 py-3 font-medium">{s.name || 'Unknown'}</td>
                                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.course || '—'}</td>
                                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.year_level || '—'}</td>
                                                            <td className="px-5 py-3">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${vc > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                                                                    {vc}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeCls(sk)}`}>{s.status || 'Good'}</span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex gap-1 justify-end">
                                                                    <button onClick={() => { setSelectedStudent(s); setShowViewStudent(true); }}
                                                                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="View">
                                                                        {I.eye}
                                                                    </button>
                                                                    <button onClick={() => openEditStudent(s)}
                                                                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition" title="Edit">
                                                                        {I.edit}
                                                                    </button>
                                                                    <button onClick={() => handleDeleteStudent(s.id)}
                                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition" title="Delete">
                                                                        {I.trash}
                                                                    </button>
                                                                </div>
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

                    {currentTab === 'appeals' && (
                        <div style={fadeInStyle}>
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-800 rounded-xl p-6 md:p-7 mb-6 text-white">
                                <h1 className="text-2xl font-bold">Appeals Management</h1>
                                <p className="text-sm text-violet-100 mt-1">Review, manage, and resolve student appeals</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {[
                                    { icon: I.doc, value: appeals.length, label: 'Total Appeals', bg: 'bg-violet-500' },
                                    { icon: I.clock, value: stats.pendingAppeals, label: 'Pending', bg: 'bg-amber-500' },
                                    { icon: I.check, value: stats.approvedAppeals, label: 'Approved', bg: 'bg-emerald-500' },
                                    { icon: I.alert, value: stats.rejectedAppeals, label: 'Rejected', bg: 'bg-red-500' },
                                ].map((s, i) => (
                                    <div key={i} className={`${cardCls} p-5 flex items-center gap-4`}>
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${s.bg}`}>{s.icon}</div>
                                        <div>
                                            <div className="text-2xl font-bold leading-tight">{s.value}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={`${cardCls} p-4 mb-6 flex flex-wrap items-center gap-3`}>
                                <div className="flex-1 min-w-[200px] relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.search}</span>
                                    <input type="text" value={appealSearch} onChange={(e) => setAppealSearch(e.target.value)}
                                        placeholder="Search appeals..." className={inputCls + ' pl-10'} />
                                </div>
                                <select value={appealStatusFilter} onChange={(e) => setAppealStatusFilter(e.target.value)}
                                    className="px-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100">
                                    <option value="">All Status</option>
                                    <option>Pending</option><option>Approved</option><option>Rejected</option>
                                </select>
                            </div>

                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-base">
                                        <thead className="bg-slate-50 dark:bg-slate-900/40">
                                            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <th className="px-5 py-3">Appeal ID</th>
                                                <th className="px-5 py-3">Student</th>
                                                <th className="px-5 py-3">Violation</th>
                                                <th className="px-5 py-3">Reason</th>
                                                <th className="px-5 py-3">Submitted</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredAppeals.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-12 text-slate-400 text-base">No appeals found</td></tr>
                                            ) : (
                                                filteredAppeals.map(a => {
                                                    const s = (a.status || 'pending').toLowerCase();
                                                    const reason = a.appeal_reason || a.reason || a.supporting_statement || '—';
                                                    return (
                                                        <tr key={a.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                            <td className="px-5 py-3 font-mono text-slate-700 dark:text-slate-300">#{a.id}</td>
                                                            <td className="px-5 py-3 font-medium">{a.student_name || 'Unknown'}</td>
                                                            <td className="px-5 py-3 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                                                                {a.penalty_violation || a.violation || a.violation_type || '—'}
                                                            </td>
                                                            <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-sm truncate max-w-[180px]" title={reason}>{reason}</td>
                                                            <td className="px-5 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-sm">
                                                                {a.created_at ? parseDbDate(a.created_at).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeCls(s)}`}>
                                                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3">
                                                                <div className="flex gap-1 justify-end">
                                                                    <button onClick={() => { setSelectedAppeal(a); setShowViewAppeal(true); }}
                                                                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition" title="View details">
                                                                        {I.eye}
                                                                    </button>
                                                                    {s === 'pending' && (
                                                                        <>
                                                                            <button onClick={() => handleApproveAppeal(a.id)}
                                                                                className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition" title="Approve">
                                                                                {I.check}
                                                                            </button>
                                                                            <button onClick={() => handleRejectAppeal(a.id)}
                                                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition" title="Reject">
                                                                                {I.close}
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
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

                    {currentTab === 'announcements' && (
                        <div style={fadeInStyle}>
                            <div className="bg-gradient-to-br from-fuchsia-600 to-purple-800 rounded-xl p-6 md:p-7 mb-6 text-white flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                        {I.megaphone} Announcements
                                    </h1>
                                    <p className="text-sm md:text-base text-fuchsia-100 mt-1">
                                        Broadcast messages to all students or target individuals
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setSelectedAnnouncement(null); resetAnnouncementForm(); setShowAnnouncementModal(true); }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-fuchsia-700 hover:bg-fuchsia-50 text-base font-bold rounded-lg transition shadow-lg"
                                >
                                    {I.plus} New Announcement
                                </button>
                            </div>

                            <div className={`${cardCls} p-4 mb-6 flex flex-wrap items-center gap-3`}>
                                <div className="flex-1 min-w-[200px] relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{I.search}</span>
                                    <input
                                        type="text"
                                        value={announcementSearch}
                                        onChange={(e) => setAnnouncementSearch(e.target.value)}
                                        placeholder="Search announcements..."
                                        className={inputCls + ' pl-10'}
                                    />
                                </div>
                                {(announcementSearch) && (
                                    <button
                                        onClick={() => setAnnouncementSearch('')}
                                        className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>

                            {filteredAnnouncements.length === 0 ? (
                                <div className={`${cardCls} p-12 text-center`}>
                                    <div className="w-20 h-20 rounded-full bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-500 flex items-center justify-center mx-auto mb-4">
                                        {I.megaphone}
                                    </div>
                                    <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No announcements yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Post your first announcement to reach students</p>
                                </div>
                            ) : (
                                (() => {
                                    const current =
                                        filteredAnnouncements.find(x => x.id === selectedAnnouncementPreview?.id) ||
                                        filteredAnnouncements[0];
                                    const currentMeta = notifMeta(current);
                                    const CurrentIcon = I[currentMeta.icon] || I.info;
                                    const currentIsHigh = (current.priority || '').toLowerCase() === 'high';

                                    return (
                                        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-5 lg:gap-6 items-start">
                                            <article className={`${cardCls} p-4 md:p-5 flex flex-col gap-4`}>
                                                {current.image_url ? (
                                                    <img
                                                        src={current.image_url}
                                                        alt={current.title || 'Announcement image'}
                                                        className="w-full rounded-xl object-contain bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className={`w-full aspect-square rounded-xl flex items-center justify-center ${currentMeta.bg} ${currentMeta.fg}`}>
                                                        <span className="scale-[3]">{CurrentIcon}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200">
                                                        Date Posted: {formatDate(current.created_at)}
                                                    </span>
                                                    {currentIsHigh && (
                                                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 uppercase tracking-wide">
                                                            High Priority
                                                        </span>
                                                    )}
                                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 uppercase tracking-wide">
                                                        {current.student_id ? 'Targeted' : 'Broadcast'}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-snug">
                                                    {current.title || 'Untitled Announcement'}
                                                </h3>

                                                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                                    {current.message}
                                                </p>

                                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                                    <span className="text-sm text-slate-400">
                                                        Posted {timeAgo(current.created_at)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openEditAnnouncement(current)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                                                        >
                                                            {I.edit} Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteAnnouncement(current.id)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                                                        >
                                                            {I.trash} Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>

                                            <div className={`${cardCls} overflow-hidden`}>
                                                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between">
                                                    <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                        All Announcements
                                                    </p>
                                                    <span className="text-xs text-slate-400">
                                                        {filteredAnnouncements.length}
                                                    </span>
                                                </div>
                                                <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                                    {filteredAnnouncements.map((a) => {
                                                        const meta = notifMeta(a);
                                                        const IconEl = I[meta.icon] || I.info;
                                                        const isActive = a.id === current.id;
                                                        return (
                                                            <button
                                                                key={a.id}
                                                                onClick={() => setSelectedAnnouncementPreview(a)}
                                                                className={`w-full flex items-start gap-3 p-4 text-left transition ${isActive
                                                                    ? 'bg-fuchsia-50/70 dark:bg-fuchsia-900/30 border-l-4 border-l-fuchsia-500'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/40 border-l-4 border-l-transparent'
                                                                    }`}
                                                            >
                                                                {a.image_url ? (
                                                                    <img
                                                                        src={a.image_url}
                                                                        alt=""
                                                                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-50"
                                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                    />
                                                                ) : (
                                                                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.fg}`}>
                                                                        {IconEl}
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                        <span className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">
                                                                            {formatDate(a.created_at)}
                                                                        </span>
                                                                        {a.priority === 'high' && (
                                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 uppercase tracking-wide">
                                                                                High
                                                                            </span>
                                                                        )}
                                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 uppercase tracking-wide">
                                                                            {a.student_id ? 'Targeted' : 'Broadcast'}
                                                                        </span>
                                                                    </div>
                                                                    <h4 className={`text-sm md:text-base leading-snug line-clamp-2 ${isActive
                                                                        ? 'font-bold text-slate-900 dark:text-white'
                                                                        : 'font-semibold text-slate-700 dark:text-slate-200'
                                                                        }`}>
                                                                        {a.title || 'Untitled Announcement'}
                                                                    </h4>
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                                        {a.message}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()
                            )}
                        </div>
                    )}

                    {currentTab === 'analytics' && (
                        <div style={fadeInStyle} className="space-y-4">
                            <div className="bg-gradient-to-br from-fuchsia-600 to-purple-800 rounded-xl p-6 md:p-7 text-white">
                                <h1 className="text-2xl font-bold">Analytics</h1>
                                <p className="text-sm text-fuchsia-100 mt-1">Deep insights into disciplinary data and trends</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { label: 'Avg Resolution', value: `${analytics.avgResolutionDays}d`, sub: `across ${analytics.resolvedCount} resolved` },
                                    { label: 'Appeal Rate', value: `${analytics.appealRate}%`, sub: `${appeals.length} of ${penalties.length} cases` },
                                    { label: 'Top Violation', value: analytics.topViolations[0]?.[1] || 0, sub: analytics.topViolations[0]?.[0] || 'No data' },
                                    { label: 'Active Students', value: students.length, sub: 'total enrollment' },
                                ].map((k, i) => (
                                    <div key={i} className={`${cardCls} p-5`}>
                                        <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">{k.label}</div>
                                        <div className="text-2xl font-bold">{k.value}</div>
                                        <div className="text-xs text-slate-400 mt-0.5 truncate">{k.sub}</div>
                                    </div>
                                ))}
                            </div>

                            <div className={`${cardCls} p-5`}>
                                <h3 className="text-base font-bold mb-5 flex items-center gap-2">{I.trendUp} Monthly Trend — Last 6 Months</h3>
                                <div className="flex items-end gap-4 h-48">
                                    {analytics.months.map((m, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{m.count}</span>
                                            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative overflow-hidden flex-1">
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fuchsia-600 to-purple-500 rounded-t-lg transition-all duration-700"
                                                    style={{ height: `${(m.count / analytics.maxMonth) * 100}%` }}
                                                />
                                                <div
                                                    className="absolute bottom-0 left-0 right-0 bg-emerald-400/60 transition-all duration-700"
                                                    style={{ height: `${(m.resolved / analytics.maxMonth) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-fuchsia-600"></span> Total cases</span>
                                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-400"></span> Resolved</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.alert} Top Violation Types</h3>
                                    <div className="space-y-3">
                                        {analytics.topViolations.length === 0 ? (
                                            <p className="text-center py-6 text-sm text-slate-400">No data</p>
                                        ) : analytics.topViolations.map(([name, count]) => {
                                            const pct = (count / analytics.maxViolationCount) * 100;
                                            return (
                                                <div key={name}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-medium truncate">{name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400 font-bold">{count}</span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.cap} Per Year Level</h3>
                                    <div className="space-y-4">
                                        {analytics.byYearLevel.map(y => (
                                            <div key={y.year} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-base font-bold">{y.year} Year</span>
                                                    <span className="text-sm text-slate-500 dark:text-slate-400">{y.students} students</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <div className="text-slate-400 uppercase font-bold text-xs">Cases</div>
                                                        <div className="font-bold text-xl">{y.cases}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-400 uppercase font-bold text-xs">Resolution</div>
                                                        <div className="font-bold text-xl">{y.resolutionRate}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentTab === 'activity' && (
                        <div style={fadeInStyle}>
                            <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-6 md:p-7 mb-6 text-white">
                                <h1 className="text-2xl font-bold">Activity Log</h1>
                                <p className="text-sm text-slate-300 mt-1">Track all admin actions and system events</p>
                            </div>

                            <div className={`${cardCls} p-4 mb-6 flex flex-wrap items-center gap-3`}>
                                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{I.filter}</span>
                                {['all', 'penalty', 'student', 'appeal', 'system'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setActivityFilter(f)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition capitalize ${activityFilter === f
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                                <div className="flex-1" />
                                <button
                                    onClick={() => exportToCSV(activityLog, `activity_${new Date().toISOString().slice(0, 10)}.csv`)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg flex items-center gap-1"
                                >
                                    {I.download} Export
                                </button>
                            </div>

                            {filteredActivity.length === 0 ? (
                                <div className={`${cardCls} p-12 text-center`}>
                                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                        {I.activity}
                                    </div>
                                    <p className="text-base font-semibold text-slate-700 dark:text-slate-300">No activity yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Actions you take will appear here</p>
                                </div>
                            ) : (
                                <div className={`${cardCls} overflow-hidden`}>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {filteredActivity.map((a, i) => {
                                            const meta = {
                                                penalty: { icon: I.alert, bg: 'bg-amber-100 dark:bg-amber-900/40', fg: 'text-amber-600 dark:text-amber-300' },
                                                student: { icon: I.users, bg: 'bg-blue-100 dark:bg-blue-900/40', fg: 'text-blue-600 dark:text-blue-300' },
                                                appeal: { icon: I.doc, bg: 'bg-violet-100 dark:bg-violet-900/40', fg: 'text-violet-600 dark:text-violet-300' },
                                                system: { icon: I.info, bg: 'bg-slate-100 dark:bg-slate-700', fg: 'text-slate-600 dark:text-slate-300' },
                                            }[a.type] || { icon: I.info, bg: 'bg-slate-100 dark:bg-slate-700', fg: 'text-slate-600 dark:text-slate-300' };
                                            return (
                                                <div key={i} className="flex items-start gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.fg}`}>
                                                        {meta.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-medium">{a.description}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm text-slate-500 dark:text-slate-400">by {a.admin_name || 'Admin'}</span>
                                                            <span className="text-slate-300 dark:text-slate-600">·</span>
                                                            <span className="text-sm text-slate-400">{timeAgo(a.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.bg} ${meta.fg}`}>
                                                        {a.type || 'system'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {currentTab === 'reports' && (
                        <div style={fadeInStyle} className="w-full space-y-4">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 md:p-7 text-white flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold">Reports & Analytics</h1>
                                    <p className="text-sm text-blue-100 mt-1">Generate comprehensive reports and analyze trends</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={async () => {
                                        try {
                                            if (await exportReportToPDF({ stats, students, penalties, appeals, department: 'Student Conduct' })) {
                                                showToast('success', 'PDF exported', 'Your report download has started');
                                            }
                                        } catch {
                                            showToast('error', 'PDF export failed', 'Please try again');
                                        }
                                    }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-base font-medium rounded-lg transition">
                                        {I.doc} PDF
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const sheets = [
                                                    {
                                                        name: 'Summary', rows: [
                                                            { Metric: 'Total Cases', Value: stats.totalCases },
                                                            { Metric: 'Active Students', Value: stats.activeStudents },
                                                            { Metric: 'Resolution Rate', Value: `${stats.resolutionRate}%` },
                                                            { Metric: 'Total Service Hours', Value: stats.totalHours },
                                                            { Metric: 'In Progress', Value: stats.inProgress },
                                                            { Metric: 'Resolved', Value: stats.resolved },
                                                        ]
                                                    },
                                                    { name: 'Students', rows: students.map(s => ({ ID: s.student_id_number, Name: s.name, Course: s.course, Year: s.year_level, Status: s.status })) },
                                                    { name: 'Penalties', rows: penalties.map(p => ({ Date: formatDate(p.created_at), Student: p.student_name, Violation: p.violation_type, Level: p.offense_level, Hours: p.hours, Status: p.status })) },
                                                    { name: 'Appeals', rows: appeals.map(a => ({ Student: a.student_name, Violation: a.penalty_violation || a.violation, Status: a.status, Submitted: formatDate(a.created_at), Comment: a.admin_comment || '' })) },
                                                ];
                                                if (await exportToExcel(sheets, `report_${new Date().toISOString().slice(0, 10)}.xlsx`)) {
                                                    showToast('success', 'Excel exported', 'Your report download has started');
                                                }
                                            } catch {
                                                showToast('error', 'Excel export failed', 'Please try again');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-base font-bold rounded-lg transition shadow-lg">
                                        {I.download} Excel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const data = [
                                                ...students.map(s => ({ Name: s.name, ID: s.student_id_number, Course: s.course, Year: s.year_level, Status: s.status })),
                                                ...penalties.map(p => ({ Violation: p.violation_type, Level: p.offense_level, Status: p.status })),
                                            ];
                                            if (exportToCSV(data, `report_${new Date().toISOString().slice(0, 10)}.csv`)) {
                                                showToast('success', 'Export complete', 'File downloaded');
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 text-base font-bold rounded-lg transition shadow-lg">
                                        {I.download} Export CSV
                                    </button>
                                    <button onClick={() => window.print()}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-base font-medium rounded-lg transition">
                                        {I.printer} Print
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {[
                                    { icon: I.doc, value: stats.totalCases, label: 'Total Cases', accent: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                                    { icon: I.chart, value: `${stats.resolutionRate}%`, label: 'Resolution', accent: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                                    { icon: I.users, value: stats.activeStudents, label: 'Active Students', accent: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                                    { icon: I.clock, value: stats.totalHours, label: 'Total Hours', accent: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                                    { icon: I.alert, value: stats.inProgress, label: 'In Progress', accent: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                                    { icon: I.check, value: stats.resolved, label: 'Resolved', accent: 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                                ].map((s, i) => (
                                    <div key={i} className={`${cardCls} p-5 flex flex-col gap-2 hover:-translate-y-0.5 hover:shadow-md transition`}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.accent}`}>{s.icon}</div>
                                        <div className="text-2xl font-bold leading-tight">{s.value}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className={`${cardCls} p-5 lg:col-span-2`}>
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <h3 className="text-base font-bold flex items-center gap-2">{I.trendUp} Violations — Last 14 Days</h3>
                                            <p className="text-sm text-slate-400 mt-0.5">Daily count</p>
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between gap-1 h-40">
                                        {Array.from({ length: 14 }).map((_, i) => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - (13 - i));
                                            d.setHours(0, 0, 0, 0);
                                            const count = penalties.filter(p => {
                                                const pd = parseDbDate(p.created_at);
                                                if (!pd) return false;
                                                pd.setHours(0, 0, 0, 0);
                                                return pd.getTime() === d.getTime();
                                            }).length;
                                            const max = Math.max(
                                                ...Array.from({ length: 14 }).map((_, j) => {
                                                    const dd = new Date();
                                                    dd.setDate(dd.getDate() - (13 - j));
                                                    dd.setHours(0, 0, 0, 0);
                                                    return penalties.filter(p => {
                                                        const pd = parseDbDate(p.created_at);
                                                        if (!pd) return false;
                                                        pd.setHours(0, 0, 0, 0);
                                                        return pd.getTime() === dd.getTime();
                                                    }).length;
                                                }), 1
                                            );
                                            const pct = (count / max) * 100;
                                            const isToday = i === 13;
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition">{count}</span>
                                                    <div className="w-full h-32 bg-slate-100 dark:bg-slate-700 rounded relative overflow-hidden">
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 rounded transition-all duration-700 ${isToday ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-blue-500/70'}`}
                                                            style={{ height: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                                                        {d.getDate()}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.chart} Category Split</h3>
                                    <div className="flex flex-col items-center gap-4">
                                        <svg viewBox="0 0 42 42" className="w-40 h-40 -rotate-90 flex-shrink-0">
                                            {(() => {
                                                const total = stats.categoryDist.reduce((s, c) => s + c.count, 0) || 1;
                                                const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
                                                let offset = 0;
                                                return stats.categoryDist.map((c, i) => {
                                                    const pct = (c.count / total) * 100;
                                                    const dash = `${pct} ${100 - pct}`;
                                                    const el = (
                                                        <circle key={i} cx="21" cy="21" r="15.9" fill="none" stroke={colors[i]}
                                                            strokeWidth="6" strokeDasharray={dash} strokeDashoffset={-offset} />
                                                    );
                                                    offset += pct;
                                                    return el;
                                                });
                                            })()}
                                        </svg>
                                        <div className="w-full space-y-2">
                                            {stats.categoryDist.map((c, i) => {
                                                const colors = ['bg-blue-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-pink-500'];
                                                const pct = penalties.length > 0 ? Math.round((c.count / penalties.length) * 100) : 0;
                                                return (
                                                    <div key={c.name} className="flex items-center gap-2 text-sm">
                                                        <span className={`w-3 h-3 rounded-full ${colors[i]}`}></span>
                                                        <span className="flex-1 truncate font-medium">{c.name}</span>
                                                        <span className="font-bold">{c.count}</span>
                                                        <span className="text-slate-400 w-8 text-right">{pct}%</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.award} Top Offenders</h3>
                                    <div className="space-y-3">
                                        {topStudents.length === 0 ? (
                                            <p className="text-center py-6 text-sm text-slate-400">No data</p>
                                        ) : topStudents.map(([name, count], i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                                                    i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                                                        i === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white' :
                                                            'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                    {i + 1}
                                                </span>
                                                <span className="text-base font-medium truncate flex-1">{name}</span>
                                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.alert} Offense Levels</h3>
                                    <div className="space-y-4">
                                        {stats.offenseDist.map((o, i) => {
                                            const pct = penalties.length > 0 ? Math.round((o.count / penalties.length) * 100) : 0;
                                            const colors = ['from-emerald-400 to-emerald-600', 'from-amber-400 to-amber-600', 'from-red-400 to-red-600'];
                                            return (
                                                <div key={o.name}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-semibold">{o.name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400">{o.count} · {pct}%</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${colors[i]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.doc} Appeals Breakdown</h3>
                                    <div className="space-y-4">
                                        {[
                                            { name: 'Approved', count: stats.approvedAppeals, color: 'from-emerald-400 to-emerald-600' },
                                            { name: 'Rejected', count: stats.rejectedAppeals, color: 'from-red-400 to-red-600' },
                                            { name: 'Pending', count: stats.pendingAppeals, color: 'from-amber-400 to-amber-600' },
                                        ].map(o => {
                                            const pct = appeals.length > 0 ? Math.round((o.count / appeals.length) * 100) : 0;
                                            return (
                                                <div key={o.name}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-semibold">{o.name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400">{o.count} · {pct}%</span>
                                                    </div>
                                                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className={`h-full bg-gradient-to-r ${o.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className={`${cardCls} p-5`}>
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2">{I.cap} Students by Year Level</h3>
                                    <div className="space-y-3">
                                        {yearOptions.map(y => {
                                            const count = students.filter(s => {
                                                const yl = String(s.year_level || '').trim();
                                                return yl === y || yl.startsWith(y);
                                            }).length;
                                            const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
                                            return (
                                                <div key={y}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-semibold">{y} Year</span>
                                                        <span className="text-slate-500 dark:text-slate-400">{count} · {pct}%</span>
                                                    </div>
                                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-gradient-to-r from-blue-400 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                                            <span>Program</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">BSN — Nursing</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`${cardCls} overflow-hidden lg:col-span-2`}>
                                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <h3 className="text-base font-bold flex items-center gap-2">{I.activity} Recent Violations</h3>
                                        <span className="text-sm text-slate-400">Latest 8</span>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-base">
                                            <thead className="bg-slate-50 dark:bg-slate-900/40">
                                                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                    <th className="px-4 py-2.5">Student</th>
                                                    <th className="px-4 py-2.5">Violation</th>
                                                    <th className="px-4 py-2.5">Level</th>
                                                    <th className="px-4 py-2.5">Status</th>
                                                    <th className="px-4 py-2.5 text-right">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {penalties.slice(0, 8).length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center py-10 text-slate-400 text-base">No records</td></tr>
                                                ) : penalties.slice(0, 8).map(p => (
                                                    <tr key={p.id} className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                        <td className="px-4 py-2.5 font-medium truncate max-w-[140px]">{p.student_name || 'Unknown'}</td>
                                                        <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400 truncate max-w-[160px]">{p.violation_type}</td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${p.offense_level === '3rd Offense' ? badgeCls('rejected') :
                                                                p.offense_level === '2nd Offense' ? badgeCls('progress') : badgeCls('completed')}`}>
                                                                {p.offense_level || 'Minor'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${badgeCls(statusClass(p))}`}>
                                                                {statusLabel(p)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right text-sm text-slate-400 whitespace-nowrap">{formatDate(p.created_at)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <Modal
                    open={showEditProfile}
                    onClose={() => setShowEditProfile(false)}
                    title="Edit Profile"
                    icon={I.edit}
                    maxWidth="max-w-2xl"
                    footer={
                        <>
                            <button onClick={() => setShowEditProfile(false)} className={btnSecondary}>Cancel</button>
                            <button onClick={handleSaveProfile} className={btnPrimary}>Save Changes</button>
                        </>
                    }
                >
                    <div className="space-y-5">
                        <div>
                            <label className={labelCls}>Full Name</label>
                            <input type="text" value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} className={inputCls} placeholder="Your full name" />
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} className={inputCls} placeholder="you@example.com" />
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                            <p className="text-base text-slate-500 dark:text-slate-400">
                                Role: <span className="font-semibold text-slate-700 dark:text-slate-200">{adminRole}</span>
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showChangePassword}
                    onClose={() => setShowChangePassword(false)}
                    title="Change Password"
                    icon={I.lock}
                    maxWidth="max-w-2xl"
                    footer={
                        <>
                            <button onClick={() => setShowChangePassword(false)} className={btnSecondary}>Cancel</button>
                            <button onClick={handleChangePassword} className={btnPrimary}>Update Password</button>
                        </>
                    }
                >
                    <div className="space-y-5">
                        <div>
                            <label className={labelCls}>Current Password</label>
                            <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} className={inputCls} placeholder="Enter current password" />
                        </div>
                        <div>
                            <label className={labelCls}>New Password</label>
                            <input type="password" value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })} className={inputCls} placeholder="Min 6 characters" />
                        </div>
                        <div>
                            <label className={labelCls}>Confirm New Password</label>
                            <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} className={inputCls} placeholder="Re-enter new password" />
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showAnnouncementModal}
                    onClose={() => { setShowAnnouncementModal(false); setSelectedAnnouncement(null); resetAnnouncementForm(); }}
                    title={selectedAnnouncement ? 'Edit Announcement' : 'New Announcement'}
                    icon={I.megaphone}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => { setShowAnnouncementModal(false); setSelectedAnnouncement(null); resetAnnouncementForm(); }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleSaveAnnouncement} className={btnPrimary}>{selectedAnnouncement ? 'Save Changes' : 'Post Announcement'}</button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <div>
                            <label className={labelCls}>Title *</label>
                            <div className="flex gap-2 items-stretch">
                                <input
                                    value={announcementForm.title}
                                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                                    className={inputCls + ' flex-1'}
                                    placeholder="Announcement title"
                                />
                                <button
                                    type="button"
                                    onClick={handleSuggestCaption}
                                    disabled={suggesting || !announcementForm.title.trim()}
                                    className="shrink-0 px-4 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                                    title="Ask AI to write a caption based on the title"
                                >
                                    {suggesting ? (
                                        <>
                                            <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                            Thinking…
                                        </>
                                    ) : (
                                        <>✨ Suggest</>
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">
                                Tip: type a title, then click ✨ Suggest — the AI will write a caption and pick the type/priority.
                            </p>
                        </div>
                        <div>
                            <label className={labelCls}>Message *</label>
                            <textarea
                                rows={6}
                                value={announcementForm.message}
                                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, message: e.target.value }))}
                                className={inputCls + ' resize-y'}
                                placeholder="Write your announcement..."
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Image (optional)</label>
                            <div className="flex items-start gap-4 flex-wrap">
                                {(announcementForm.imageFile || announcementForm.imageUrl) && (
                                    <div className="relative">
                                        <img
                                            src={announcementForm.imageFile ? URL.createObjectURL(announcementForm.imageFile) : announcementForm.imageUrl}
                                            alt="preview"
                                            className="w-40 h-40 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setAnnouncementForm({ ...announcementForm, imageFile: null, imageUrl: '' })}
                                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                                            title="Remove image"
                                        >
                                            {I.close}
                                        </button>
                                    </div>
                                )}
                                <label className="flex flex-col items-center justify-center gap-2 w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                                    <span className="text-slate-400 scale-125">{I.image}</span>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Choose image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setAnnouncementForm({ ...announcementForm, imageFile: f });
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">Uploads to the <code>announcements</code> Storage bucket (public).</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Type</label>
                                <select value={announcementForm.type} onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })} className={inputCls}>
                                    <option value="info">Info</option>
                                    <option value="reminder">Reminder</option>
                                    <option value="penalty">Penalty</option>
                                    <option value="appeal">Appeal</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Priority</label>
                                <select value={announcementForm.priority} onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value })} className={inputCls}>
                                    <option value="normal">Normal</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Target (optional)</label>
                            <select value={announcementForm.target} onChange={(e) => setAnnouncementForm({ ...announcementForm, target: e.target.value })} className={inputCls}>
                                <option value="">Broadcast to all students</option>
                                {students.map(s => {
                                    const sid = s.student_id_number || s.student_id || s.id;
                                    return <option key={s.id} value={sid}>{s.name}</option>;
                                })}
                            </select>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showAppealActionModal}
                    onClose={() => {
                        setShowAppealActionModal(false);
                        setSelectedAppeal(null);
                        setAppealActionType(null);
                        setAppealActionComment('');
                        setAppealActionError('');
                    }}
                    title={appealActionType === 'approve' ? 'Approve Appeal' : 'Reject Appeal'}
                    icon={appealActionType === 'approve' ? I.check : I.close}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button
                                onClick={() => {
                                    setShowAppealActionModal(false);
                                    setSelectedAppeal(null);
                                    setAppealActionType(null);
                                    setAppealActionComment('');
                                    setAppealActionError('');
                                }}
                                className={btnSecondary}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAppealAction}
                                className={appealActionType === 'approve' ? btnPrimary : btnDanger}
                            >
                                {appealActionType === 'approve' ? 'Approve Appeal' : 'Reject Appeal'}
                            </button>
                        </>
                    }
                >
                    {selectedAppeal && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs uppercase font-bold text-slate-400">Student</div>
                                    <div className="text-base font-semibold mt-1 truncate">
                                        {selectedAppeal.student_name || 'Unknown'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                    <div className="text-xs uppercase font-bold text-slate-400">Violation</div>
                                    <div className="text-base font-semibold mt-1 truncate">
                                        {selectedAppeal.penalty_violation || selectedAppeal.violation || selectedAppeal.violation_type || '—'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs uppercase font-bold text-slate-400 mb-2">
                                    Student's Reason
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-base whitespace-pre-wrap max-h-40 overflow-y-auto">
                                    {selectedAppeal.appeal_reason || selectedAppeal.reason || selectedAppeal.supporting_statement || '—'}
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>
                                    {appealActionType === 'approve' ? 'Approval Remarks *' : 'Rejection Reason *'}
                                </label>
                                <textarea
                                    rows={5}
                                    value={appealActionComment}
                                    onChange={(e) => {
                                        setAppealActionComment(e.target.value);
                                        if (appealActionError) setAppealActionError('');
                                    }}
                                    className={inputCls}
                                    placeholder={
                                        appealActionType === 'approve'
                                            ? 'Explain why this appeal is approved (e.g., valid documentation provided)...'
                                            : 'Explain why this appeal is rejected (e.g., insufficient evidence)...'
                                    }
                                />
                                <p className="text-sm text-slate-400 mt-2">
                                    This comment will be saved with the appeal and sent to the student.
                                </p>
                            </div>

                            {appealActionError && (
                                <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                                    <span className="text-red-500 flex-shrink-0 mt-0.5 scale-110">{I.alert}</span>
                                    <p className="text-base text-red-700 dark:text-red-300">{appealActionError}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                <Modal
                    open={showLogoutConfirm}
                    onClose={() => setShowLogoutConfirm(false)}
                    title="Confirm Logout"
                    icon={I.logout}
                    maxWidth="max-w-xl"
                    footer={
                        <>
                            <button onClick={() => setShowLogoutConfirm(false)} className={btnSecondary}>Cancel</button>
                            <button onClick={confirmLogout} className={btnDanger}>Yes, Logout</button>
                        </>
                    }
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 flex items-center justify-center flex-shrink-0">
                            {I.alert}
                        </div>
                        <div>
                            <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Are you sure you want to logout?</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">You will need to sign in again to access the dashboard.</p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showAddPenalty}
                    onClose={() => { setShowAddPenalty(false); resetPenaltyForm(); }}
                    title="Add Penalty"
                    icon={I.plus}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => { setShowAddPenalty(false); resetPenaltyForm(); }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleAddPenalty} className={btnPrimary}>Add Penalty</button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <div>
                            <label className={labelCls}>Student *</label>
                            <select value={penaltyForm.studentId} onChange={(e) => setPenaltyForm({ ...penaltyForm, studentId: e.target.value })} className={inputCls}>
                                <option value="">Select a student...</option>
                                {students.map(s => {
                                    const sid = s.student_id_number || s.student_id || s.id;
                                    return <option key={s.id} value={sid}>{s.name} — {sid}</option>;
                                })}
                            </select>
                        </div>
                        <div>
                            <label className={labelCls}>Violation Type *</label>
                            <select value={penaltyForm.violation} onChange={(e) => setPenaltyForm({ ...penaltyForm, violation: e.target.value })} className={inputCls}>
                                <option value="">Select violation...</option>
                                {violationOptions.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Offense Level</label>
                                <select value={penaltyForm.offenseLevel} onChange={(e) => setPenaltyForm({ ...penaltyForm, offenseLevel: e.target.value })} className={inputCls}>
                                    <option>1st Offense</option>
                                    <option>2nd Offense</option>
                                    <option>3rd Offense</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select value={penaltyForm.status} onChange={(e) => setPenaltyForm({ ...penaltyForm, status: e.target.value })} className={inputCls} disabled={penaltyForm.offenseLevel === '1st Offense'}>
                                    <option>Pending</option>
                                    <option>in-progress</option>
                                    <option>Completed</option>
                                    <option>Resolved</option>
                                </select>
                            </div>
                        </div>
                        {penaltyForm.offenseLevel !== '1st Offense' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Service Type</label>
                                    <select value={penaltyForm.serviceType} onChange={(e) => setPenaltyForm({ ...penaltyForm, serviceType: e.target.value })} className={inputCls}>
                                        {serviceTypeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Deadline</label>
                                    <input type="date" value={penaltyForm.deadline} onChange={(e) => setPenaltyForm({ ...penaltyForm, deadline: e.target.value })} className={inputCls} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea rows={4} value={penaltyForm.description} onChange={(e) => setPenaltyForm({ ...penaltyForm, description: e.target.value })} className={inputCls + ' resize-y'} placeholder="Optional description..." />
                        </div>

                        <div>
                            <label className={labelCls}>Evidence Image (optional)</label>
                            <div className="flex items-start gap-4 flex-wrap">
                                {(penaltyForm.imageFile || penaltyForm.imageUrl) && (
                                    <div className="relative">
                                        <img
                                            src={penaltyForm.imageFile ? URL.createObjectURL(penaltyForm.imageFile) : penaltyForm.imageUrl}
                                            alt="preview"
                                            className="w-40 h-40 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPenaltyForm({ ...penaltyForm, imageFile: null, imageUrl: '' })}
                                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                                            title="Remove image"
                                        >
                                            {I.close}
                                        </button>
                                    </div>
                                )}
                                <label className="flex flex-col items-center justify-center gap-2 w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                                    <span className="text-slate-400 scale-125">{I.image}</span>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Choose image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setPenaltyForm({ ...penaltyForm, imageFile: f });
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">Uploads to the <code>penalties</code> Storage bucket (public).</p>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                {penaltyForm.offenseLevel === '1st Offense'
                                    ? '1st Offense is a warning only — no service hours required.'
                                    : penaltyForm.offenseLevel === '2nd Offense'
                                        ? '2nd Offense = 5 service hours.'
                                        : '3rd Offense = 10 service hours.'}
                            </p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showEditPenalty}
                    onClose={() => { setShowEditPenalty(false); setSelectedPenalty(null); resetPenaltyForm(); }}
                    title="Edit Penalty"
                    icon={I.edit}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => { setShowEditPenalty(false); setSelectedPenalty(null); resetPenaltyForm(); }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleEditPenalty} className={btnPrimary}>Save Changes</button>
                        </>
                    }
                >
                    <div className="space-y-6">
                        <div>
                            <label className={labelCls}>Student</label>
                            <input
                                type="text"
                                value={
                                    (() => {
                                        const s = students.find(st =>
                                            String(st.student_id_number || st.student_id || st.id) === String(penaltyForm.studentId)
                                        );
                                        return s ? `${s.name} — ${s.student_id_number || ''}` : (selectedPenalty?.student_name || 'Unknown Student');
                                    })()
                                }
                                readOnly
                                disabled
                                tabIndex={-1}
                                className={inputCls + ' opacity-70 cursor-not-allowed select-none bg-slate-100 dark:bg-slate-900'}
                            />
                            <p className="text-sm text-slate-400 mt-1.5">Student cannot be changed after a penalty is created.</p>
                        </div>
                        <div>
                            <label className={labelCls}>Violation Type *</label>
                            <select value={penaltyForm.violation} onChange={(e) => setPenaltyForm({ ...penaltyForm, violation: e.target.value })} className={inputCls}>
                                <option value="">Select violation...</option>
                                {violationOptions.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Offense Level</label>
                                <select value={penaltyForm.offenseLevel} onChange={(e) => setPenaltyForm({ ...penaltyForm, offenseLevel: e.target.value })} className={inputCls}>
                                    <option>1st Offense</option>
                                    <option>2nd Offense</option>
                                    <option>3rd Offense</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select value={penaltyForm.status} onChange={(e) => setPenaltyForm({ ...penaltyForm, status: e.target.value })} className={inputCls} disabled={penaltyForm.offenseLevel === '1st Offense'}>
                                    <option>Pending</option>
                                    <option>in-progress</option>
                                    <option>Completed</option>
                                    <option>Resolved</option>
                                </select>
                            </div>
                        </div>
                        {penaltyForm.offenseLevel !== '1st Offense' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelCls}>Service Type</label>
                                    <select value={penaltyForm.serviceType} onChange={(e) => setPenaltyForm({ ...penaltyForm, serviceType: e.target.value })} className={inputCls}>
                                        {serviceTypeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Deadline</label>
                                    <input type="date" value={penaltyForm.deadline} onChange={(e) => setPenaltyForm({ ...penaltyForm, deadline: e.target.value })} className={inputCls} />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea rows={4} value={penaltyForm.description} onChange={(e) => setPenaltyForm({ ...penaltyForm, description: e.target.value })} className={inputCls + ' resize-y'} />
                        </div>

                        <div>
                            <label className={labelCls}>Evidence Image (optional)</label>
                            <div className="flex items-start gap-4 flex-wrap">
                                {(penaltyForm.imageFile || penaltyForm.imageUrl) && (
                                    <div className="relative">
                                        <img
                                            src={penaltyForm.imageFile ? URL.createObjectURL(penaltyForm.imageFile) : penaltyForm.imageUrl}
                                            alt="preview"
                                            className="w-40 h-40 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setPenaltyForm({ ...penaltyForm, imageFile: null, imageUrl: '' })}
                                            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-red-500 text-white shadow hover:bg-red-600 transition"
                                            title="Remove image"
                                        >
                                            {I.close}
                                        </button>
                                    </div>
                                )}
                                <label className="flex flex-col items-center justify-center gap-2 w-40 h-40 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                                    <span className="text-slate-400 scale-125">{I.image}</span>
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Choose image</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            setPenaltyForm({ ...penaltyForm, imageFile: f });
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-slate-400 mt-2">Uploads to the <code>penalties</code> Storage bucket (public).</p>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showAddStudent}
                    onClose={() => setShowAddStudent(false)}
                    title="Add Student"
                    icon={I.plus}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => setShowAddStudent(false)} className={btnSecondary}>Cancel</button>
                            <button onClick={handleAddStudent} className={btnPrimary}>Add Student</button>
                        </>
                    }
                >
                    <div className="space-y-5">
                        <div>
                            <label className={labelCls}>Full Name *</label>
                            <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className={inputCls} placeholder="Juan Dela Cruz" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Student ID * (8 digits)</label>
                                <input type="text" value={studentForm.studentId} onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value.replace(/\D/g, '').slice(0, 8) })} className={inputCls} placeholder="24000001" />
                            </div>
                            <div>
                                <label className={labelCls}>Email *</label>
                                <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className={inputCls} placeholder="student@example.com" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className={labelCls}>Course</label>
                                <select value={studentForm.course} onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })} className={inputCls}>
                                    {courseOptions.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Year Level</label>
                                <select value={studentForm.year} onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })} className={inputCls}>
                                    {yearOptions.map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select value={studentForm.status} onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })} className={inputCls}>
                                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showEditStudent}
                    onClose={() => { setShowEditStudent(false); setSelectedStudent(null); }}
                    title="Edit Student"
                    icon={I.edit}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => { setShowEditStudent(false); setSelectedStudent(null); }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleEditStudent} className={btnPrimary}>Save Changes</button>
                        </>
                    }
                >
                    <div className="space-y-5">
                        <div>
                            <label className={labelCls}>Full Name *</label>
                            <input type="text" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className={inputCls} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Student ID *</label>
                                <input type="text" value={studentForm.studentId} onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value.replace(/\D/g, '').slice(0, 8) })} className={inputCls} />
                            </div>
                            <div>
                                <label className={labelCls}>Email *</label>
                                <input type="email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className={inputCls} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div>
                                <label className={labelCls}>Course</label>
                                <select value={studentForm.course} onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })} className={inputCls}>
                                    {courseOptions.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Year Level</label>
                                <select value={studentForm.year} onChange={(e) => setStudentForm({ ...studentForm, year: e.target.value })} className={inputCls}>
                                    {yearOptions.map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Status</label>
                                <select value={studentForm.status} onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value })} className={inputCls}>
                                    {statusOptions.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showViewStudent}
                    onClose={() => { setShowViewStudent(false); setSelectedStudent(null); }}
                    title="Student Details"
                    icon={I.eye}
                    maxWidth="max-w-4xl"
                    footer={<button onClick={() => { setShowViewStudent(false); setSelectedStudent(null); }} className={btnSecondary}>Close</button>}
                >
                    {selectedStudent && (() => {
                        const sid = selectedStudent.student_id_number || selectedStudent.student_id || selectedStudent.id;
                        const studentPenalties = penalties.filter(p =>
                            String(p.student_id) === String(sid) ||
                            (p.student_name && p.student_name === selectedStudent.name)
                        );
                        const resolved = studentPenalties.filter(p => p.status === 'Completed' || p.status === 'Resolved').length;
                        const active = studentPenalties.filter(p => p.status === 'in-progress' || p.status === 'Active').length;
                        return (
                            <div className="space-y-6">
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                                        {getInitials(selectedStudent.name)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{selectedStudent.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{sid}</p>
                                        <span className={`inline-flex items-center mt-2 px-3 py-1 rounded-full text-xs font-semibold ${badgeCls((selectedStudent.status || 'good').toLowerCase())}`}>
                                            {selectedStudent.status || 'Good'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Course', value: selectedStudent.course || '—' },
                                        { label: 'Year', value: selectedStudent.year_level || '—' },
                                        { label: 'Email', value: selectedStudent.email || '—' },
                                        { label: 'Total Cases', value: studentPenalties.length },
                                    ].map((f, i) => (
                                        <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                            <div className="text-xs uppercase font-bold text-slate-400">{f.label}</div>
                                            <div className="text-base font-semibold mt-1 truncate">{f.value}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-center">
                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{studentPenalties.length}</div>
                                        <div className="text-xs uppercase font-bold text-blue-500 dark:text-blue-400">Total</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-center">
                                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{active}</div>
                                        <div className="text-xs uppercase font-bold text-amber-500 dark:text-amber-400">Active</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-center">
                                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolved}</div>
                                        <div className="text-xs uppercase font-bold text-emerald-500 dark:text-emerald-400">Resolved</div>
                                    </div>
                                </div>

                                <div>
                                    <h5 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">Violation History</h5>
                                    {studentPenalties.length === 0 ? (
                                        <p className="text-center py-6 text-base text-slate-400 bg-slate-50 dark:bg-slate-900/60 rounded-lg">No violations on record</p>
                                    ) : (
                                        <div className="space-y-2 max-h-72 overflow-y-auto">
                                            {studentPenalties.map(p => (
                                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-base font-medium truncate">{p.violation_type || 'Violation'}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{p.offense_level} · {formatDate(p.created_at)}</p>
                                                    </div>
                                                    <span className={`ml-3 inline-flex px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${badgeCls(statusClass(p))}`}>
                                                        {statusLabel(p)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}
                </Modal>

                <Modal
                    open={showViewAppeal}
                    onClose={() => { setShowViewAppeal(false); setSelectedAppeal(null); }}
                    title="Appeal Details"
                    icon={I.doc}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => { setShowViewAppeal(false); setSelectedAppeal(null); }} className={btnSecondary}>Close</button>
                            {selectedAppeal && (selectedAppeal.status || 'pending').toLowerCase() === 'pending' && (
                                <>
                                    <button
                                        onClick={() => {
                                            const a = selectedAppeal;
                                            setShowViewAppeal(false);
                                            handleRejectAppeal(a.id);
                                        }}
                                        className={btnDanger}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            const a = selectedAppeal;
                                            setShowViewAppeal(false);
                                            handleApproveAppeal(a.id);
                                        }}
                                        className={btnPrimary}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </>
                    }
                >
                    {selectedAppeal && (() => {
                        const s = (selectedAppeal.status || 'pending').toLowerCase();
                        const reason = selectedAppeal.appeal_reason || selectedAppeal.reason || selectedAppeal.supporting_statement || '—';
                        return (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{selectedAppeal.student_name || 'Unknown'}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">Appeal #{selectedAppeal.id}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${badgeCls(s)}`}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                        <div className="text-xs uppercase font-bold text-slate-400">Violation</div>
                                        <div className="text-base font-semibold mt-1">
                                            {selectedAppeal.penalty_violation || selectedAppeal.violation || selectedAppeal.violation_type || '—'}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                                        <div className="text-xs uppercase font-bold text-slate-400">Submitted</div>
                                        <div className="text-base font-semibold mt-1">{formatDate(selectedAppeal.created_at)}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase font-bold text-slate-400 mb-2">Reason / Statement</div>
                                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-base whitespace-pre-wrap">
                                        {reason}
                                    </div>
                                </div>
                                {selectedAppeal.admin_comment && (
                                    <div>
                                        <div className="text-xs uppercase font-bold text-slate-400 mb-2">
                                            Admin Comment
                                        </div>
                                        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-base whitespace-pre-wrap">
                                            {selectedAppeal.admin_comment}
                                        </div>
                                    </div>
                                )}
                                {selectedAppeal.reviewed_at && (
                                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                                        <div className="text-xs uppercase font-bold text-blue-500 dark:text-blue-400">Reviewed</div>
                                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                            {formatDate(selectedAppeal.reviewed_at)}
                                            {selectedAppeal.reviewed_by_name && ` by ${selectedAppeal.reviewed_by_name}`}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </Modal>

                <Modal
                    open={showImportCSV}
                    onClose={() => { setShowImportCSV(false); setImportFile(null); }}
                    title="Import Students from CSV"
                    icon={I.upload}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => { setShowImportCSV(false); setImportFile(null); }} className={btnSecondary}>Cancel</button>
                            <button onClick={handleImportCSV} disabled={!importFile} className={btnPrimary}>Import</button>
                        </>
                    }
                >
                    <div className="space-y-5">
                        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/60 text-center">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto mb-4">
                                {I.upload}
                            </div>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                className="block w-full text-base text-slate-500 dark:text-slate-400 file:mr-3 file:py-3 file:px-5 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-semibold file:cursor-pointer hover:file:bg-blue-700"
                            />
                            {importFile && (
                                <p className="mt-4 text-base font-medium text-emerald-600 dark:text-emerald-400">
                                    Selected: {importFile.name}
                                </p>
                            )}
                        </div>
                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                            <p className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">Required CSV columns</p>
                            <ul className="text-base text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                                <li><code className="font-mono">name</code> — Full name</li>
                                <li><code className="font-mono">student_id</code> — 8 digits</li>
                                <li><code className="font-mono">email</code> — (optional)</li>
                                <li><code className="font-mono">course</code> — (optional, default BSN)</li>
                                <li><code className="font-mono">year</code> — (optional, default 1st)</li>
                            </ul>
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showQuickNote}
                    onClose={() => setShowQuickNote(false)}
                    title="Send Quick Notification"
                    icon={I.messageCircle}
                    maxWidth="max-w-3xl"
                    footer={
                        <>
                            <button onClick={() => setShowQuickNote(false)} className={btnSecondary}>Cancel</button>
                            <button onClick={handleSendQuickNote} className={btnPrimary}>Send</button>
                        </>
                    }
                >
                    <div className="space-y-5">
                        <div>
                            <label className={labelCls}>Title *</label>
                            <input type="text" value={quickNote.title} onChange={(e) => setQuickNote({ ...quickNote, title: e.target.value })} className={inputCls} placeholder="Notification title" />
                        </div>
                        <div>
                            <label className={labelCls}>Message *</label>
                            <textarea rows={5} value={quickNote.message} onChange={(e) => setQuickNote({ ...quickNote, message: e.target.value })} className={inputCls + ' resize-y'} placeholder="Type your message..." />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Type</label>
                                <select value={quickNote.type} onChange={(e) => setQuickNote({ ...quickNote, type: e.target.value })} className={inputCls}>
                                    <option value="info">Info</option>
                                    <option value="reminder">Reminder</option>
                                    <option value="penalty">Penalty</option>
                                    <option value="appeal">Appeal</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Target (optional)</label>
                                <select value={quickNote.targetStudent} onChange={(e) => setQuickNote({ ...quickNote, targetStudent: e.target.value })} className={inputCls}>
                                    <option value="">Broadcast to all</option>
                                    {students.map(s => {
                                        const sid = s.student_id_number || s.student_id || s.id;
                                        return <option key={s.id} value={sid}>{s.name}</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                </Modal>

                {completePenaltyId && (
                    <div className="fixed inset-0 z-[50000] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4 select-none" style={{ pointerEvents: 'auto' }}>
                        <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 p-7">
                            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-4">
                                {I.check}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Mark penalty complete?</h3>
                            <p className="mt-2 text-base text-slate-500 dark:text-slate-400">This will mark the selected penalty as completed.</p>
                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setCompletePenaltyId(null)} className={btnSecondary}>Cancel</button>
                                <button onClick={confirmMarkPenaltyComplete} className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold rounded-lg transition">Mark Complete</button>
                            </div>
                        </div>
                    </div>
                )}

                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        title={toast.title}
                        onClose={closeToast}
                        duration={4000}
                        dark={darkMode}
                    />
                )}
            </div>
            </div>
            );
} 