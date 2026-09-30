const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : '');

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }

  return data;
}

export const api = {
  get: (path, options = {}) => apiRequest(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body ?? {}),
    }),
  put: (path, body, options = {}) =>
    apiRequest(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body ?? {}),
    }),
  del: (path, options = {}) => apiRequest(path, { ...options, method: 'DELETE' }),
};

export default api;
