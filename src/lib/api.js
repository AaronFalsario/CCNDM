const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '');

async function apiRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch (networkError) {
    throw new Error('Unable to connect to the server. Please check your network or verify the backend is running.');
  }

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON
    }
  }

  if (!response.ok) {
    let message = data?.message;
    if (!message) {
      if (response.status === 502 || response.status === 504) {
        message = 'The backend server is unreachable. Please make sure the backend is running.';
      } else if (response.status === 404) {
        message = 'The requested API endpoint was not found (404).';
      } else if (text && text.length < 200 && !text.trim().startsWith('<')) {
        message = text.trim();
      } else {
        message = `Server returned error (${response.status} ${response.statusText || 'Error'}).`;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (text && data === null) {
    if (text.trim().startsWith('<')) {
      throw new Error('The server returned an HTML page instead of API data. Please check your API routing configuration.');
    }
    throw new Error('The server returned an invalid response.');
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
