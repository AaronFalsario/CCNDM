import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function usePenalties() {
    const [penalties, setPenalties] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!supabase) return;
        setLoading(true);
        const { data } = await supabase
            .from('penalties')
            .select('*')
            .order('created_at', { ascending: false });
        setPenalties(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    return { penalties, setPenalties, loading, refresh };
}