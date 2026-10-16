import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export default function useAppeals() {
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.data.list('appeals', { order: 'created_at', ascending: false });
            setAppeals(data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const id = setTimeout(() => {
            refresh().catch((error) => console.error('Unable to load appeals:', error));
        }, 0);
        return () => clearTimeout(id);
    }, [refresh]);

    return { appeals, setAppeals, loading, refresh };
}