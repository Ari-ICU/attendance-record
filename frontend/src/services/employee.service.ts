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

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export class EmployeeService {
    static async createEmployee(data: EmployeeCreateData): Promise<Employee> {
        const { data: res } = await api.post<ApiResponse<Employee>>(API_URLS.EMPLOYEE.CREATE, data);
        if (!res.success) throw new Error(res.message || 'Failed to create employee');
        return res.data;
    }

    static async getAllEmployees(query?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; type?: 'employee' | 'student' }): Promise<EmployeeListResponse> {
        const { data: res } = await api.get<ApiResponse<EmployeeListResponse>>(API_URLS.EMPLOYEE.GET_ALL, { params: query });
        if (!res.success) throw new Error(res.message || 'Failed to fetch employees');
        return res.data;
    }

    static async getEmployeeById(id: string): Promise<Employee> {
        const { data: res } = await api.get<ApiResponse<Employee>>(API_URLS.EMPLOYEE.GET_BY_ID(id));
        if (!res.success) throw new Error(res.message || 'Failed to fetch employee');
        return res.data;
    }

    static async updateEmployee(id: string, data: EmployeeUpdateData): Promise<Employee> {
        const { data: res } = await api.put<ApiResponse<Employee>>(API_URLS.EMPLOYEE.UPDATE(id), data);
        if (!res.success) throw new Error(res.message || 'Failed to update employee');
        return res.data;
    }

    static async deleteEmployee(id: string): Promise<{ message: string }> {
        const { data: res } = await api.delete<ApiResponse<{ message: string }>>(API_URLS.EMPLOYEE.DELETE(id));
        if (!res.success) throw new Error(res.message || 'Failed to delete employee');
        return res.data;
    }

    static async verifyFace(data: VerifyFaceData): Promise<VerifyFaceResult> {
        const { data: res } = await api.post<ApiResponse<VerifyFaceResult>>(API_URLS.EMPLOYEE.VERIFY_FACE, data);
        if (!res.success) throw new Error(res.message || 'Face verification failed');
        return res.data;
    }
}
