import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';

export interface CheckInPayload {
    employeeId?: string; // Optional if using authenticated user context
    method: 'manual' | 'qr_code' | 'face_verification';
    faceDescriptor?: number[];
    faceImage?: string; // base64
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

export const AttendanceService = {
    checkIn: async (data: CheckInPayload) => {
        const response = await api.post(API_URLS.ATTENDANCE.CHECK_IN, data);
        return response.data;
    },

    checkOut: async (data: CheckOutPayload) => {
        const response = await api.post(API_URLS.ATTENDANCE.CHECK_OUT, data);
        return response.data;
    },

    getRecords: async (query?: any) => {
        const response = await api.get(API_URLS.ATTENDANCE.GET_RECORDS, { params: query });
        return response.data;
    }
};
