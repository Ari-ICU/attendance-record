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
    },
    rotateApiKey: async () => {
        const response = await api.post('/security/rotate-api-key');
        return response.data.data;
    },
    exportSystemLog: async () => {
        const response = await api.get('/security/export-log', { responseType: 'blob' });
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `system-log-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
    getSystemStats: async () => {
        const response = await api.get('/security/stats');
        return response.data.data;
    }
};

