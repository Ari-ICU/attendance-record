import api from '@/api/axiosInstance';
import { OvertimeItem } from '@/types/overtime.types';

export const OvertimeService = {
    getAll: async (query?: any): Promise<OvertimeItem[]> => {
        try {
            const response = await api.get('/overtimes', { params: query });
            if (response?.data?.data) {
                return response.data.data.map((o: any) => ({
                    ...o,
                    id: o._id || o.id,
                    employeeName: o.employeeName || (o.employeeId ? `${o.employeeId.firstName || ''} ${o.employeeId.lastName || ''}`.trim() : 'Staff Member'),
                    department: o.department || o.employeeId?.department || 'General',
                    date: o.date ? new Date(o.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    project: o.reason?.split(':')[0] || 'Operations',
                }));
            }
        } catch (error) {
            console.error('Failed to fetch overtimes:', error);
        }
        return [];
    },

    create: async (data: any): Promise<OvertimeItem> => {
        const response = await api.post('/overtimes', data);
        const o = response.data.data;
        return { ...o, id: o._id || o.id };
    },

    updateStatus: async (id: string, status: string): Promise<OvertimeItem> => {
        const response = await api.patch(`/overtimes/${id}/status`, { status });
        const o = response.data.data;
        return { ...o, id: o._id || o.id };
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await api.delete(`/overtimes/${id}`);
        return response?.data?.success ?? true;
    }
};
