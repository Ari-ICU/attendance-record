import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import { MOCK_REPORT_ANALYTICS } from '@/mocks/mockData';

export const ReportService = {
    getAnalytics: async (timeRange: string = '7d') => {
        try {
            const response = await api.get(API_URLS.REPORTS.ANALYTICS, {
                params: { timeRange }
            });
            if (response?.data?.data) return response.data;
        } catch {
            // Fallback to mock
        }
        return {
            success: true,
            data: MOCK_REPORT_ANALYTICS
        };
    }
};
