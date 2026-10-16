import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const loginPaths = {
  student: '/student/login',
  admin: '/admin/login',
};

export function useAuth(role) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get('/api/auth/me')
      .then(({ user: currentUser }) => {
        if (!active) return;
        if (!currentUser || currentUser.account_type !== role) {
          setUser(null);
          navigate(loginPaths[role] || '/', { replace: true });
          return;
        }
        setUser(currentUser);
      })
      .catch((error) => {
        if (!active) return;
        if (error.status !== 401) console.error('[load session]', error);
        setUser(null);
        navigate(loginPaths[role] || '/', { replace: true });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate, role]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('[logout]', error);
    } finally {
      setUser(null);
      navigate(loginPaths[role] || '/', { replace: true });
    }
  }, [navigate, role]);

  return { user, setUser, logout, loading };
}
