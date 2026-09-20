import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .order('name', { ascending: true });
        if (!error) setStudents(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { students, setStudents, loading, refresh };
}