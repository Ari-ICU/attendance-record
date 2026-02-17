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
    approve: async (month?: number, year?: number) => {
        const response = await api.post(API_URLS.PAYROLL.APPROVE, { month, year });
        return response.data.data;
    },
    deposit: async (amount: number, notes?: string) => {
        const response = await api.post(API_URLS.PAYROLL.DEPOSIT, { amount, notes });
        return response.data.data;
    },
    updateCompanyBank: async (details: { accountNumber: string, accountName: string }) => {
        const response = await api.put(API_URLS.PAYROLL.UPDATE_COMPANY_BANK, details);
        return response.data.data;
    },
    generate: async (month?: number, year?: number) => {
        const response = await api.post(API_URLS.PAYROLL.GENERATE, { month, year });
        return response.data.data;
    }
};
