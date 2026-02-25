import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('edupulse_user');
        return stored ? JSON.parse(stored) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('edupulse_token', data.token);
            localStorage.setItem('edupulse_user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (err) {
            console.error('Login error:', err);
            let message = 'Login failed';
            if (!err.response) {
                message = 'Network Error: Cannot reach backend server. Please check VITE_API_URL and CORS.';
            } else if (err.response.status === 404) {
                message = 'API Endpoint not found (404). Check backend URL.';
            } else {
                // Try to get specific error from server response
                const serverData = err.response.data;
                message = serverData?.message || serverData?.error || 'Server Error';
                if (serverData?.details) message += `: ${serverData.details}`;
            }
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', { name, email, password, role });
            localStorage.setItem('edupulse_token', data.token);
            localStorage.setItem('edupulse_user', JSON.stringify(data.user));
            setUser(data.user);
            return { success: true, role: data.user.role };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('edupulse_token');
        localStorage.removeItem('edupulse_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
