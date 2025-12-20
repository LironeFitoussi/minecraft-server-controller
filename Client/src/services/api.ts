import axios from "axios";

// In development, use relative path with Vite proxy
// In production, use full URL from environment variable
const getBaseURL = () => {
    const envURL = import.meta.env.VITE_API_URL;
    if (envURL) {
        return envURL.endsWith('/api') ? envURL : `${envURL}/api`;
    }
    // Development: use relative path (Vite proxy will handle it)
    if (import.meta.env.DEV) {
        return '/api';
    }
    // Fallback for production
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 30000, // Increased timeout to 30 seconds for RCON operations
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('[API] Request timeout:', error.config?.url);
        } else if (error.response) {
            console.error('[API] Response error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('[API] No response received:', error.request);
        } else {
            console.error('[API] Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;