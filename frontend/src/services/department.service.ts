import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import { Department, DepartmentCreateData, DepartmentUpdateData } from '@/types/department.types';
import { MOCK_DEPARTMENTS } from '@/mocks/mockData';

let localDepartments = [...MOCK_DEPARTMENTS];

export const DepartmentService = {
    getAll: async () => {
        try {
            const response = await api.get(API_URLS.DEPARTMENTS.GET_ALL);
            if (response?.data?.data) return response.data;
        } catch {
            // Fallback to mock
        }
        return {
            success: true,
            data: localDepartments
        };
    },

    getById: async (id: string) => {
        try {
            const response = await api.get(API_URLS.DEPARTMENTS.GET_BY_ID(id));
            if (response?.data?.data) return response.data;
        } catch {
            // Fallback to mock
        }
        const found = localDepartments.find(d => d._id === id) || localDepartments[0];
        return {
            success: true,
            data: found
        };
    },

    create: async (data: DepartmentCreateData) => {
        const newDept: Department = {
            _id: `dept_${Date.now()}`,
            name: data.name,
            code: data.name.substring(0, 4).toUpperCase(),
            description: data.description || '',
            headOfDepartment: {},
            memberCount: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        localDepartments = [newDept, ...localDepartments];
        return { success: true, data: newDept };
    },

    update: async (id: string, data: DepartmentUpdateData) => {
        localDepartments = localDepartments.map(d => {
            if (d._id === id) {
                return {
                    ...d,
                    name: data.name || d.name,
                    description: data.description !== undefined ? data.description : d.description,
                    isActive: data.isActive !== undefined ? data.isActive : d.isActive,
                    updatedAt: new Date().toISOString()
                };
            }
            return d;
        });
        const updated = localDepartments.find(d => d._id === id) || localDepartments[0];
        return { success: true, data: updated };
    },

    delete: async (id: string) => {
        localDepartments = localDepartments.filter(d => d._id !== id);
        return { success: true, message: 'Department removed successfully' };
    }
};
