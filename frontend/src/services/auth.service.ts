import api, { setAccessToken } from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import { AuthResponse, LoginPayload, UpdateProfilePayload, User } from '@/types/Auth';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export class AuthService {
    static async login(payload: LoginPayload): Promise<AuthResponse> {
        const { data } = await api.post<ApiResponse<AuthResponse>>(API_URLS.AUTH.LOGIN, payload);
        if (!data.success) throw new Error(data.message || 'Login failed');

        // Save token in Axios instance
        setAccessToken(data.data.token);
        return data.data;
    }

    static async refreshToken(): Promise<string> {
        const { data } = await api.post<ApiResponse<{ token: string }>>(API_URLS.AUTH.REFRESH_TOKEN);
        if (!data.success) throw new Error(data.message || 'Failed to refresh token');

        setAccessToken(data.data.token);
        return data.data.token;
    }

    static async logout(): Promise<void> {
        await api.post(API_URLS.AUTH.LOGOUT);
        setAccessToken(null);
    }

    static async getProfile(): Promise<User> {
        const { data } = await api.get<ApiResponse<User>>(API_URLS.AUTH.PROFILE);
        if (!data.success) throw new Error(data.message || 'Failed to fetch profile');
        return data.data;
    }

    static async updateProfile(payload: UpdateProfilePayload): Promise<User> {
        const { data } = await api.put<ApiResponse<User>>(API_URLS.AUTH.PROFILE, payload);
        if (!data.success) throw new Error(data.message || 'Failed to update profile');
        return data.data;
    }
}
