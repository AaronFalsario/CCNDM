const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '');

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('The server returned an invalid response.');
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed');
    error.status = response.status;
    throw error;
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
  data: {
    list(table, { filters, order, ascending = true, limit } = {}) {
      const params = new URLSearchParams();
      if (filters) params.set('filters', JSON.stringify(filters));
      if (order) params.set('order', order);
      if (order) params.set('ascending', String(ascending));
      if (limit) params.set('limit', String(limit));
      const query = params.size ? `?${params.toString()}` : '';
      return apiRequest(`/api/data/${encodeURIComponent(table)}${query}`, { method: 'GET' });
    },
    insert(table, rows) {
      return apiRequest(`/api/data/${encodeURIComponent(table)}`, {
        method: 'POST',
        body: JSON.stringify({ rows }),
      });
    },
    update(table, filters, values) {
      return apiRequest(`/api/data/${encodeURIComponent(table)}`, {
        method: 'PATCH',
        body: JSON.stringify({ filters, values }),
      });
    },
    remove(table, filters) {
      return apiRequest(`/api/data/${encodeURIComponent(table)}`, {
        method: 'DELETE',
        body: JSON.stringify({ filters }),
      });
    },
  },
};

export default api;
