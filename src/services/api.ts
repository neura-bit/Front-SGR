import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add JWT token to all requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('sgr_auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle 401 responses (token expired or invalid)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear stored auth data
            localStorage.removeItem('sgr_auth_token');
            localStorage.removeItem('sgr_auth_user');
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
