import api from '@/api/axiosInstance';
import { LeaveRequestItem } from '@/types/leave.types';

export const LeaveService = {
    getAll: async (query?: any): Promise<LeaveRequestItem[]> => {
        try {
            const response = await api.get('/leaves', { params: query });
            if (response?.data?.data) {
                return response.data.data.map((l: any) => ({
                    ...l,
                    id: l._id || l.id,
                    employeeName: l.employeeName || (l.employeeId ? `${l.employeeId.firstName || ''} ${l.employeeId.lastName || ''}`.trim() : 'Staff Member'),
                    department: l.department || l.employeeId?.department || 'General',
                    days: l.totalDays || l.days || 1,
                    type: l.leaveType ? (l.leaveType.charAt(0).toUpperCase() + l.leaveType.slice(1) + ' Leave') : (l.type || 'Annual Leave')
                }));
            }
        } catch (error) {
            console.error('Failed to fetch leaves:', error);
        }
        return [];
    },

    create: async (data: any): Promise<LeaveRequestItem> => {
        const response = await api.post('/leaves', data);
        const l = response.data.data;
        return { ...l, id: l._id || l.id };
    },

    updateStatus: async (id: string, status: string, rejectionReason?: string): Promise<LeaveRequestItem> => {
        const response = await api.patch(`/leaves/${id}/status`, { status, rejectionReason });
        const l = response.data.data;
        return { ...l, id: l._id || l.id };
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await api.delete(`/leaves/${id}`);
        return response?.data?.success ?? true;
    }
};
