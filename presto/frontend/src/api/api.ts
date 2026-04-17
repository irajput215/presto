import BACKEND_CONFIG from '../../backend.config.json';

const BASE_URL = `http://localhost:${BACKEND_CONFIG.BACKEND_PORT}`;

export const apiCall = async (path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: any, token?: string | null) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred');
  }

  return data;
};
