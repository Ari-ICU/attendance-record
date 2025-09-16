import axios, { AxiosInstance } from 'axios';
import { API_URLS, BASE_URL } from './apiUrl';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Subscribe to token refresh
const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

// Notify all subscribers when token is refreshed
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// Create Axios instance
const api: AxiosInstance = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (
            originalRequest &&
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== API_URLS.AUTH.REFRESH_TOKEN
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const { data } = await api.post(API_URLS.AUTH.REFRESH_TOKEN);
                    if (!data.success) throw new Error(data.message || 'Failed to refresh token');

                    accessToken = data.data.token;
                    if (accessToken) { onRefreshed(accessToken); }
                } catch (err) {
                    accessToken = null;
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return new Promise((resolve) => {
                subscribeTokenRefresh((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export default api;
