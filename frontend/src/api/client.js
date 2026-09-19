import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Used to build links to uploaded receipt files (e.g. /uploads/abc.pdf)
export const FILE_ORIGIN = API_URL.replace(/\/api\/?$/, '');
export const TOKEN_KEY = 'tfl_token';

const api = axios.create({ baseURL: API_URL });

// Send "Authorization: Bearer <token>" on every request when logged in.
// Note: we never set Content-Type here, so axios/browser add the correct
// multipart boundary for FormData uploads by themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turn any axios error into a readable message
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (data?.error) {
    if (typeof data.error === 'string') return data.error;
    if (Array.isArray(data.error.details) && data.error.details.length > 0) {
      const firstIssue = data.error.details[0];
      return firstIssue.message || `${firstIssue.path?.join('.')}: invalid value`;
    }
    if (data.error.message) return data.error.message;
  }
  const msg = data?.message || (Array.isArray(data?.errors) && data.errors[0]?.message);
  if (typeof msg === 'string') return msg;
  if (err?.request && !err?.response) {
    return 'Cannot reach the server. Check that the backend is running on port 5000.';
  }
  return err?.message || fallback;
}

export default api;
