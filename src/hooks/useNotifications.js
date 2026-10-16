import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export default function useNotifications(pollMs = 60000) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = useCallback(async () => {
        const data = await api.data.list('notifications', {
            order: 'created_at',
            ascending: false,
            limit: 20,
        });
        const list = data;
        setNotifications(list);
        setUnreadCount(list.filter((n) => !n.is_read).length);
    }, []);

    useEffect(() => {
        const initialLoad = setTimeout(() => {
            load().catch((error) => console.error('Unable to load notifications:', error));
        }, 0);
        const id = setInterval(() => {
            load().catch((error) => console.error('Unable to refresh notifications:', error));
        }, pollMs);
        return () => {
            clearTimeout(initialLoad);
            clearInterval(id);
        };
    }, [load, pollMs]);

    const markAsRead = async (id) => {
        await api.data.update('notifications', { id }, {
            is_read: true,
            read_at: new Date().toISOString(),
        });
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const markAllAsRead = async () => {
        await api.data.update('notifications', { is_read: false }, {
            is_read: true,
            read_at: new Date().toISOString(),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
    };

    const deleteOne = async (id) => {
        await api.data.remove('notifications', { id });
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((c) => Math.max(0, c - 1));
    };

    const clearAll = async () => {
        const ids = notifications.map((n) => n.id).filter(Boolean);
        if (!ids.length) return;
        await api.data.remove('notifications', { id: ids });
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