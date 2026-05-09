import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') + '/api',
  withCredentials: true,   // required for session cookies to work
});

export default api;