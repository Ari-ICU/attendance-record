// src/types/attendance.types.ts

import { Employee } from "./employee.types";

export interface AttendanceRecord {
    _id: string;
    employeeId: Employee; // Populated
    date: string;
    checkIn?: {
        time: string;
        location?: {
            latitude: number;
            longitude: number;
            address?: string;
        };
        method: string;
        ipAddress?: string;
    };
    checkOut?: {
        time: string;
        location?: {
            latitude: number;
            longitude: number;
            address?: string;
        };
        method: string;
        totalHours?: number;
    };
    status: 'present' | 'absent' | 'late' | 'half_day' | 'remote' | 'on_leave';
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceQuery {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
}
