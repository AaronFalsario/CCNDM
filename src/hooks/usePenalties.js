import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export default function usePenalties() {
    const [penalties, setPenalties] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.data.list('penalties', { order: 'created_at', ascending: false });
            setPenalties(data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const id = setTimeout(() => {
            refresh().catch((error) => console.error('Unable to load penalties:', error));
        }, 0);
        return () => clearTimeout(id);
    }, [refresh]);

    return { penalties, setPenalties, loading, refresh };
}