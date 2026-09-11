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
import { MOCK_EMPLOYEES } from '@/mocks/mockData';

let localEmployees = [...MOCK_EMPLOYEES];

export class EmployeeService {
    static async createEmployee(data: EmployeeCreateData): Promise<Employee> {
        try {
            const { data: res } = await api.post(API_URLS.EMPLOYEE.CREATE, data);
            if (res?.data) return res.data;
        } catch {
            // Fallback to mock
        }

        const newEmp: Employee = {
            _id: `emp_${Date.now()}`,
            firstName: data.firstName,
            lastName: data.lastName,
            fullName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            phone: data.phone,
            position: data.position,
            department: data.department,
            type: data.type || 'employee',
            dateOfJoining: data.dateOfJoining || new Date().toISOString().split('T')[0],
            photoUrl: data.photoUrl || null,
            faceDescriptor: [],
            faceVerificationEnabled: false,
            baseSalary: data.baseSalary || 0,
            hourlyRate: data.hourlyRate || 0,
            currency: data.currency || 'USD',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        localEmployees = [newEmp, ...localEmployees];
        return newEmp;
    }

    static async getAllEmployees(query?: { page?: number; limit?: number; sortBy?: string; sortOrder?: 'asc' | 'desc'; type?: string }): Promise<EmployeeListResponse> {
        try {
            const { data: res } = await api.get(API_URLS.EMPLOYEE.GET_ALL, { params: query });
            if (res?.data?.employees) return res.data;
        } catch {
            // Fallback to mock
        }

        let filtered = [...localEmployees];
        if (query?.type) {
            filtered = filtered.filter(e => e.type === query.type);
        }

        return {
            employees: filtered,
            pagination: {
                currentPage: query?.page || 1,
                totalPages: 1,
                totalItems: filtered.length,
                itemsPerPage: query?.limit || 50,
            }
        };
    }

    static async getEmployeeById(id: string): Promise<Employee> {
        try {
            const { data: res } = await api.get(API_URLS.EMPLOYEE.GET_BY_ID(id));
            if (res?.data) return res.data;
        } catch {
            // Fallback to mock
        }

        const found = localEmployees.find(e => e._id === id);
        if (!found) throw new Error('Employee not found');
        return found;
    }

    static async updateEmployee(id: string, data: EmployeeUpdateData): Promise<Employee> {
        try {
            const { data: res } = await api.put(API_URLS.EMPLOYEE.UPDATE(id), data);
            if (res?.data) return res.data;
        } catch {
            // Fallback to mock
        }

        localEmployees = localEmployees.map(e => {
            if (e._id === id) {
                return {
                    ...e,
                    ...data,
                    fullName: data.firstName || data.lastName ? `${data.firstName || e.firstName} ${data.lastName || e.lastName}` : e.fullName,
                    updatedAt: new Date().toISOString(),
                };
            }
            return e;
        });

        const updated = localEmployees.find(e => e._id === id);
        return updated || (localEmployees[0] as Employee);
    }

    static async deleteEmployee(id: string): Promise<{ message: string }> {
        try {
            await api.delete(API_URLS.EMPLOYEE.DELETE(id));
        } catch {
            // Fallback to mock
        }

        localEmployees = localEmployees.filter(e => e._id !== id);
        return { message: 'Employee removed successfully' };
    }

    static async verifyFace(data: VerifyFaceData): Promise<VerifyFaceResult> {
        try {
            const { data: res } = await api.post(API_URLS.EMPLOYEE.VERIFY_FACE, data);
            if (res?.data) return res.data;
        } catch {
            // Fallback to mock
        }

        return {
            employeeId: localEmployees[0]?._id,
            employee: localEmployees[0],
            similarity: 0.94,
            verifiedAt: new Date().toISOString()
        };
    }
}
