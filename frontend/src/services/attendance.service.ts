import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import { MOCK_ATTENDANCE_RECORDS } from '@/mocks/mockData';

export interface CheckInPayload {
    employeeId?: string;
    method: 'manual' | 'qr_code' | 'face_verification';
    faceDescriptor?: number[];
    faceImage?: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    platform?: string;
    browser?: string;
}

export interface CheckOutPayload {
    employeeId?: string;
    method: 'manual' | 'qr_code' | 'face_verification';
    faceDescriptor?: number[];
    faceImage?: string;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    platform?: string;
    browser?: string;
}

let localRecords = [...MOCK_ATTENDANCE_RECORDS];

export const AttendanceService = {
    checkIn: async (data: CheckInPayload) => {
        try {
            const response = await api.post(API_URLS.ATTENDANCE.CHECK_IN, data);
            if (response.data) return response.data;
        } catch {
            // Fallback to mock
        }
        return { success: true, message: 'Check-in recorded successfully' };
    },

    checkOut: async (data: CheckOutPayload) => {
        try {
            const response = await api.post(API_URLS.ATTENDANCE.CHECK_OUT, data);
            if (response.data) return response.data;
        } catch {
            // Fallback to mock
        }
        return { success: true, message: 'Check-out recorded successfully' };
    },

    getRecords: async (query?: any) => {
        try {
            const response = await api.get(API_URLS.ATTENDANCE.GET_RECORDS, { params: query });
            if (response.data) return response.data;
        } catch {
            // Fallback to mock
        }
        return {
            success: true,
            data: {
                docs: localRecords,
                totalDocs: localRecords.length,
                limit: query?.limit || 50,
                page: query?.page || 1,
            }
        };
    },

    deleteRecord: async (id: string) => {
        try {
            const response = await api.delete(API_URLS.ATTENDANCE.DELETE(id));
            if (response.data) return response.data;
        } catch {
            // Fallback to mock
        }
        localRecords = localRecords.filter(r => r._id !== id);
        return { success: true, message: 'Record deleted successfully' };
    }
};
