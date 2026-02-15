import api from '@/api/axiosInstance';

export const SettingsService = {
    getSettings: async () => {
        const response = await api.get('/settings');
        return response.data.data;
    },
    updateSettings: async (settings: any) => {
        const response = await api.post('/settings', settings);
        return response.data.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data.data;
    },
    updateUserRole: async (userId: string, role: string) => {
        const response = await api.put(`/auth/users/${userId}/role`, { role });
        return response.data.data;
    }
};
