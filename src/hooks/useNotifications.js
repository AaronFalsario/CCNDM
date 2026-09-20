import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useNotifications(pollMs = 60000) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = useCallback(async () => {
        if (!supabase) return;
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        const list = data || [];
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.is_read).length);
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(load, pollMs);
        return () => clearInterval(id);
    }, [load, pollMs]);

    const markAsRead = async (id) => {
        if (!supabase) return;
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', id);
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const markAllAsRead = async () => {
        if (!supabase) return;
        await supabase
            .from('notifications')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('is_read', false);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const deleteOne = async (id) => {
        if (!supabase) return;
        await supabase.from('notifications').delete().eq('id', id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const clearAll = async () => {
        if (!supabase) return;
        const ids = notifications.map((n) => n.id).filter(Boolean);
        if (!ids.length) return;
        await supabase.from('notifications').delete().in('id', ids);
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        reload: load,
        markAsRead,
        markAllAsRead,
        deleteOne,
        clearAll,
    };
}