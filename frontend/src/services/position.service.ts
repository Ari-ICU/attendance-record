import api from '@/api/axiosInstance';
import { PositionItem } from '@/types/position.types';

export const PositionService = {
    getAll: async (): Promise<PositionItem[]> => {
        try {
            const response = await api.get('/positions');
            if (response?.data?.data) {
                return response.data.data.map((p: any) => ({
                    ...p,
                    id: p._id || p.id
                }));
            }
        } catch (error) {
            console.error('Failed to fetch positions:', error);
        }
        return [];
    },

    getById: async (id: string): Promise<PositionItem | null> => {
        try {
            const response = await api.get(`/positions/${id}`);
            if (response?.data?.data) {
                const p = response.data.data;
                return { ...p, id: p._id || p.id };
            }
        } catch (error) {
            console.error('Failed to fetch position by id:', error);
        }
        return null;
    },

    create: async (data: Partial<PositionItem>): Promise<PositionItem> => {
        const response = await api.post('/positions', data);
        const p = response.data.data;
        return { ...p, id: p._id || p.id };
    },

    update: async (id: string, data: Partial<PositionItem>): Promise<PositionItem> => {
        const response = await api.put(`/positions/${id}`, data);
        const p = response.data.data;
        return { ...p, id: p._id || p.id };
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await api.delete(`/positions/${id}`);
        return response?.data?.success ?? true;
    }
};
