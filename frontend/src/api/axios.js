// Axios instance configured with base URL and JWT interceptor
import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';

// If it's a full URL (production) and doesn't end with /api, append it automatically
if (baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
    baseURL = baseURL.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('edupulse_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('edupulse_token');
            localStorage.removeItem('edupulse_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
