import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';

export const PayrollService = {
    getStats: async () => {
        const response = await api.get(API_URLS.PAYROLL.STATS);
        return response.data.data;
    },
    getLedger: async (month?: number, year?: number) => {
        const response = await api.get(API_URLS.PAYROLL.LEDGER, {
            params: { month, year }
        });
        return response.data.data;
    },
    disburse: async (month?: number, year?: number) => {
        const response = await api.post(API_URLS.PAYROLL.DISBURSE, { month, year });
        return response.data.data;
    },
    generate: async (month?: number, year?: number) => {
        const response = await api.post(API_URLS.PAYROLL.GENERATE, { month, year });
        return response.data.data;
    }
};
