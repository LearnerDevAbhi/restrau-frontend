import axios from 'axios';

export const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
export const ADMIN_TOKEN_KEY = 'admin.token';

/** Normalized error thrown by every service call. */
export class ApiError extends Error {
  constructor({ status = 0, code = 'NETWORK_ERROR', message = 'Network error', details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const api = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token && !config.public) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const data = error.response?.data;
    const apiError = error.response
      ? new ApiError({
          status: error.response.status,
          code: data?.code || 'INTERNAL_ERROR',
          message: data?.message || error.message,
          details: data?.details,
        })
      : new ApiError({ code: error.code === 'ECONNABORTED' ? 'NETWORK_ERROR' : 'NETWORK_ERROR', message: error.message });

    if (apiError.status === 401 && !error.config?.public) {
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
    return Promise.reject(apiError);
  },
);

/** Resolves server-relative asset paths (e.g. menu images) against the API origin. */
export const assetUrl = (path) => (path && path.startsWith('/') ? `${API_ORIGIN}${path}` : path || null);

export default api;
