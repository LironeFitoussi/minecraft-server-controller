import axios from "axios";

import type { AxiosError, AxiosInstance } from "axios";

// Optional override, e.g. VITE_API_URL=http://192.168.1.10:5000
// Without it we use relative URLs: the Vite proxy handles them in development
// and nginx in production, so the dashboard works from any machine
// (an absolute "localhost" URL would point at the visitor's own computer).
export const getServerOrigin = (): string => {
    const envURL = import.meta.env.VITE_API_URL as string | undefined;
    return envURL ? envURL.replace(/\/+$/, '').replace(/\/api$/, '') : '';
};

// Turn axios failures into messages worth showing to the user:
// prefer the error text sent by the backend over "Request failed with status code 503".
export const attachErrorMessages = (instance: AxiosInstance): void => {
    instance.interceptors.response.use(
        (response) => response,
        (error: AxiosError<{ error?: string; message?: string }>) => {
            const serverMessage = error.response?.data?.error || error.response?.data?.message;
            if (serverMessage) {
                error.message = serverMessage;
            } else if (error.code === 'ECONNABORTED') {
                error.message = 'Request timed out. The controller backend is not responding.';
            } else if (!error.response) {
                error.message = 'Cannot reach the controller backend. Is it running?';
            }
            console.error('[API]', error.config?.url, error.message);
            return Promise.reject(error);
        }
    );
};

const api = axios.create({
    baseURL: `${getServerOrigin()}/api`,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 20000, // RCON commands time out on the backend after ~10 seconds
});

attachErrorMessages(api);

export default api;
