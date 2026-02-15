import api from '@/api/axiosInstance';

export const PayrollService = {
    getStats: async () => {
        const response = await api.get('/payroll/stats');
        return response.data.data;
    },
    getLedger: async (month?: number, year?: number) => {
        const response = await api.get('/payroll/ledger', {
            params: { month, year }
        });
        return response.data.data;
    },
    disburse: async (month?: number, year?: number) => {
        const response = await api.post('/payroll/disburse', { month, year });
        return response.data.data;
    },
    generate: async (month?: number, year?: number) => {
        const response = await api.post('/payroll/generate', { month, year });
        return response.data.data;
    }
};
