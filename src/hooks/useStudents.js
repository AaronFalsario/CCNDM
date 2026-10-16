import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export default function useStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.data.list('students', { order: 'name' });
            setStudents(data || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const id = setTimeout(() => {
            refresh().catch((error) => console.error('Unable to load students:', error));
        }, 0);
        return () => clearTimeout(id);
    }, [refresh]);

    return { students, setStudents, loading, refresh };
}