import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useNotifications(pollMs = 60000) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = useCallback(async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);
        if (error) {
            console.error('Unable to load notifications:', error);
            return;
        }
        const list = data;
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
        const { error } = await supabase.rpc('set_my_notification_read', {
            p_notification_id: id,
            p_include_broadcast: true,
        });
        if (error) {
            console.error('Unable to mark notification as read:', error);
            return;
        }
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const markAllAsRead = async () => {
        if (!supabase) return;
        const { error } = await supabase.rpc('set_my_notification_read', {
            p_notification_id: null,
            p_include_broadcast: true,
        });
        if (error) {
            console.error('Unable to mark notifications as read:', error);
            return;
        }
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const deleteOne = async (id) => {
        if (!supabase) return;
        const { error } = await supabase.rpc('delete_my_notifications', {
            p_notification_ids: [id],
        });
        if (error) {
            console.error('Unable to delete notification:', error);
            return;
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const clearAll = async () => {
        if (!supabase) return;
        const ids = notifications.map((n) => n.id).filter(Boolean);
        if (!ids.length) return;
        const { error } = await supabase.rpc('delete_my_notifications', {
            p_notification_ids: ids,
        });
        if (error) {
            console.error('Unable to delete notifications:', error);
            return;
        }
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