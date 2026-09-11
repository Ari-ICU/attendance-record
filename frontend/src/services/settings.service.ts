import api from '@/api/axiosInstance';

const MOCK_SETTINGS = {
    companyName: 'StaffFlow University & Enterprise',
    workHours: {
        startTime: '08:00',
        endTime: '17:00',
        gracePeriod: 15,
        halfDayThreshold: 4,
    },
    geofence: {
        enabled: true,
        latitude: 11.5564,
        longitude: 104.9282,
        radius: 250,
        strictMode: false,
    },
    notifications: {
        emailAlerts: true,
        lateCheckInNotice: true,
        systemHealth: true,
    }
};

const MOCK_SYSTEM_USERS = [
    { _id: 'u1', username: 'admin', email: 'admin@system.com', role: 'admin', firstName: 'Thoeurn', lastName: 'Ratha', isLocked: false },
    { _id: 'u2', username: 'sarah.j', email: 'sarah.j@staffflow.io', role: 'manager', firstName: 'Sarah', lastName: 'Jenkins', isLocked: false },
    { _id: 'u3', username: 'alex.hr', email: 'alex.v@staffflow.io', role: 'hr', firstName: 'Alex', lastName: 'Vannak', isLocked: false },
];

export const SettingsService = {
    getSettings: async () => {
        try {
            const response = await api.get('/settings');
            if (response?.data?.data) return response.data.data;
        } catch {}
        return MOCK_SETTINGS;
    },
    updateSettings: async (settings: any) => {
        try {
            const response = await api.post('/settings', settings);
            if (response?.data?.data) return response.data.data;
        } catch {}
        return settings;
    },
    getAllUsers: async () => {
        try {
            const response = await api.get('/auth/users');
            if (response?.data?.data) return response.data.data;
        } catch {}
        return MOCK_SYSTEM_USERS;
    },
    updateUserRole: async (userId: string, role: string) => {
        return { success: true, message: `Role updated to ${role}` };
    },
    rotateApiKey: async () => {
        return { master_api_key: `sk_live_${Date.now()}_9f8a7e` };
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
        return {
            databaseSize: '14.2 MB',
            uptime: '99.98%',
            activeSessions: 18,
            serverStatus: 'Healthy'
        };
    }
};
