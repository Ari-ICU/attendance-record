import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import { Department, DepartmentCreateData, DepartmentUpdateData } from '@/types/department.types';

export const DepartmentService = {
    getAll: async () => {
        const response = await api.get(API_URLS.DEPARTMENTS.GET_ALL);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(API_URLS.DEPARTMENTS.GET_BY_ID(id));
        return response.data;
    },

    create: async (data: DepartmentCreateData) => {
        const response = await api.post(API_URLS.DEPARTMENTS.CREATE, data);
        return response.data;
    },

    update: async (id: string, data: DepartmentUpdateData) => {
        const response = await api.put(API_URLS.DEPARTMENTS.UPDATE(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(API_URLS.DEPARTMENTS.DELETE(id));
        return response.data;
    }
};
