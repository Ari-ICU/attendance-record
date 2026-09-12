// src/services/employee.service.ts
import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import {
    Employee,
    EmployeeCreateData,
    EmployeeUpdateData,
    VerifyFaceData,
    VerifyFaceResult,
    EmployeeListResponse,
} from '@/types/employee.types';

export class EmployeeService {
    static async createEmployee(data: EmployeeCreateData): Promise<Employee> {
        const { data: res } = await api.post(API_URLS.EMPLOYEE.CREATE, data);
        return res?.data;
    }

    static async getAllEmployees(query?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; type?: string }): Promise<EmployeeListResponse> {
        const { data: res } = await api.get(API_URLS.EMPLOYEE.GET_ALL, { params: query });
        if (res?.data?.employees) {
            return res.data;
        }
        return {
            employees: Array.isArray(res?.data) ? res.data : [],
            pagination: res?.data?.pagination || {
                currentPage: query?.page || 1,
                totalPages: 1,
                totalItems: Array.isArray(res?.data) ? res.data.length : 0,
                itemsPerPage: query?.limit || 50,
            }
        };
    }

    static async getEmployeeById(id: string): Promise<Employee> {
        const { data: res } = await api.get(API_URLS.EMPLOYEE.GET_BY_ID(id));
        if (!res?.data) throw new Error('Employee not found');
        return res.data;
    }

    static async updateEmployee(id: string, data: EmployeeUpdateData): Promise<Employee> {
        const { data: res } = await api.put(API_URLS.EMPLOYEE.UPDATE(id), data);
        return res?.data;
    }

    static async deleteEmployee(id: string): Promise<{ message: string }> {
        const { data: res } = await api.delete(API_URLS.EMPLOYEE.DELETE(id));
        return { message: res?.message || 'Employee removed successfully' };
    }

    static async verifyFace(data: VerifyFaceData): Promise<VerifyFaceResult> {
        const { data: res } = await api.post(API_URLS.EMPLOYEE.VERIFY_FACE, data);
        return res?.data;
    }
}
