import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';

export const ReportService = {
    getAnalytics: async (timeRange: string = '7d') => {
        const response = await api.get(API_URLS.REPORTS.ANALYTICS, {
            params: { timeRange }
        });
        return response.data;
    }
};
