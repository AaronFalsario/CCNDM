import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const authConfig = {
	student: {
		storage: sessionStorage,
		key: 'currentStudent',
		loginPath: '/student/login',
	},
	admin: {
		storage: localStorage,
		key: 'currentAdmin',
		loginPath: '/admin/login',
	},
};

function readUser(config, role) {
	if (!config) return null;

	const stored = config.storage.getItem(config.key);
	if (!stored) return null;

	try {
		const parsed = JSON.parse(stored);
		const expired = role === 'admin' && parsed.expires && new Date(parsed.expires) < new Date();

		if (!parsed || parsed.id === undefined || parsed.id === null || expired) {
			throw new Error('Invalid session');
		}

		return parsed;
	} catch {
		config.storage.removeItem(config.key);
		if (role === 'admin') config.storage.removeItem('adminSessionExpiry');
		return null;
	}
}

export function useAuth(role) {
	const navigate = useNavigate();
	const config = authConfig[role];
	const [user, setUser] = useState(() => readUser(config, role));

	useEffect(() => {
		if (!config || !user) {
			if (!config) return;
			navigate(config.loginPath, { replace: true });
		}
	}, [config, navigate, user]);

	const logout = () => {
		if (!config) return;

		config.storage.removeItem(config.key);
		if (role === 'admin') {
			config.storage.removeItem('adminSessionExpiry');
			localStorage.removeItem('adminCurrentPage');
		}
		sessionStorage.clear();
		navigate(config.loginPath, { replace: true });
	};

	return { user, setUser, logout };
}
