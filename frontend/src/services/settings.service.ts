import api from '@/api/axiosInstance';

export const SettingsService = {
    getSettings: async () => {
        const response = await api.get('/settings');
        return response.data?.data || response.data;
    },
    updateSettings: async (settings: any) => {
        const response = await api.post('/settings', settings);
        return response.data?.data || response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data?.data || response.data || [];
    },
    updateUserRole: async (userId: string, role: string) => {
        const response = await api.put(`/auth/users/${userId}/role`, { role });
        return response.data;
    },
    rotateApiKey: async () => {
        const response = await api.post('/settings/rotate-key');
        return response.data?.data || response.data;
    },
    exportSystemLog: async () => {
        const dummyBlob = new Blob([JSON.stringify({ timestamp: new Date(), log: 'System operating normally' }, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(dummyBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `system-log-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
    getSystemStats: async () => {
        const response = await api.get('/settings/stats');
        return response.data?.data || response.data;
    }
};
