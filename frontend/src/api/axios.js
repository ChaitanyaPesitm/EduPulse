// Axios instance configured with base URL and JWT interceptor
import axios from 'axios';

// Get the backend URL from environment variables
// Strip any trailing slash and /api suffix so we can handle it consistently
let rawBaseURL = import.meta.env.VITE_API_URL || '';
let cleanBaseURL = rawBaseURL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const api = axios.create({
    baseURL: cleanBaseURL || '',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor to ensure every request starts with /api
api.interceptors.request.use((config) => {
    // 1. Prefix URL with /api if it doesn't have it
    if (config.url && !config.url.startsWith('/api')) {
        config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }

    // 2. Attach JWT token
    const token = localStorage.getItem('edupulse_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('edupulse_token');
            localStorage.removeItem('edupulse_user');
            // Avoid infinite loops if already on login page
            if (!window.location.pathname.includes('login')) {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
