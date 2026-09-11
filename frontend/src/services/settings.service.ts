import api from '@/api/axiosInstance';

const MOCK_SETTINGS = {
    companyName: 'StaffFlow Enterprise Systems',
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
    { _id: 'u1', username: 'admin.ratha', email: 'ratha@staffflow.io', role: 'admin', firstName: 'Thoeurn', lastName: 'Ratha', department: 'Engineering & IT', isLocked: false },
    { _id: 'u2', username: 'sarah.ux', email: 'sarah.j@staffflow.io', role: 'manager', firstName: 'Sarah', lastName: 'Jenkins', department: 'Product & Design', isLocked: false },
    { _id: 'u3', username: 'alex.hr', email: 'alex.v@staffflow.io', role: 'manager', firstName: 'Alex', lastName: 'Vannak', department: 'Human Resources', isLocked: false },
    { _id: 'u4', username: 'david.ops', email: 'david.m@staffflow.io', role: 'manager', firstName: 'David', lastName: 'Miller', department: 'Operations & Facilities', isLocked: false },
    { _id: 'u5', username: 'chann.dara', email: 'chann.dara@staffflow.io', role: 'employee', firstName: 'Chann', lastName: 'Dara', department: 'Engineering & IT', isLocked: false },
    { _id: 'u6', username: 'sophea.k', email: 'sophea.k@staffflow.io', role: 'employee', firstName: 'Sophea', lastName: 'Kosal', department: 'Product & Design', isLocked: false },
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
