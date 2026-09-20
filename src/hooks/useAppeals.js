import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useAppeals() {
    const [appeals, setAppeals] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data } = await supabase
            .from('appeals')
            .select('*')
            .order('created_at', { ascending: false });
        setAppeals(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { appeals, setAppeals, loading, refresh };
}