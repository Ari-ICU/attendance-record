import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';

export interface EventItem {
    id?: string;
    _id?: string;
    title: string;
    category: 'work' | 'meeting' | 'holiday' | 'personal' | 'special';
    date: string; // YYYY-MM-DD
    startHour: number;
    endHour: number;
    isAllDay?: boolean;
    location?: string;
    description?: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export interface ShiftItem {
    id?: string;
    _id?: string;
    name: string;
    type: 'morning' | 'afternoon' | 'night' | 'flexible';
    startTime: string;
    endTime: string;
    gracePeriod: number;
    assignedDepts: string[];
    assignedCount: number;
    color: string;
    bgColor: string;
}

export interface HolidayItem {
    id?: string;
    _id?: string;
    name: string;
    date: string;
    type: 'national' | 'academic' | 'observance';
    status: 'paid' | 'unpaid';
}

export interface CalendarDashboardData {
    events: EventItem[];
    shifts: ShiftItem[];
    holidays: HolidayItem[];
}

export const CalendarService = {
    // Fetch all calendar events, shifts, holidays
    getDashboard: async (): Promise<CalendarDashboardData> => {
        const response = await api.get(API_URLS.CALENDAR.DASHBOARD);
        const data = response.data?.data || response.data || {};
        return {
            events: (data.events || []).map((e: any) => ({ ...e, id: e._id || e.id })),
            shifts: (data.shifts || []).map((s: any) => ({ ...s, id: s._id || s.id })),
            holidays: (data.holidays || []).map((h: any) => ({ ...h, id: h._id || h.id }))
        };
    },

    // Events
    createEvent: async (data: Omit<EventItem, 'id' | '_id'>) => {
        const response = await api.post(API_URLS.CALENDAR.CREATE_EVENT, data);
        const created = response.data?.data || response.data;
        return { ...created, id: created._id || created.id };
    },

    updateEvent: async (id: string, data: Partial<EventItem>) => {
        const response = await api.put(API_URLS.CALENDAR.UPDATE_EVENT(id), data);
        const updated = response.data?.data || response.data;
        return { ...updated, id: updated._id || updated.id };
    },

    deleteEvent: async (id: string) => {
        const response = await api.delete(API_URLS.CALENDAR.DELETE_EVENT(id));
        return response.data;
    },

    // Shifts
    createShift: async (data: Omit<ShiftItem, 'id' | '_id'>) => {
        const response = await api.post(API_URLS.CALENDAR.CREATE_SHIFT, data);
        const created = response.data?.data || response.data;
        return { ...created, id: created._id || created.id };
    },

    updateShift: async (id: string, data: Partial<ShiftItem>) => {
        const response = await api.put(API_URLS.CALENDAR.UPDATE_SHIFT(id), data);
        const updated = response.data?.data || response.data;
        return { ...updated, id: updated._id || updated.id };
    },

    deleteShift: async (id: string) => {
        const response = await api.delete(API_URLS.CALENDAR.DELETE_SHIFT(id));
        return response.data;
    },

    // Holidays
    createHoliday: async (data: Omit<HolidayItem, 'id' | '_id'>) => {
        const response = await api.post(API_URLS.CALENDAR.CREATE_HOLIDAY, data);
        const created = response.data?.data || response.data;
        return { ...created, id: created._id || created.id };
    },

    deleteHoliday: async (id: string) => {
        const response = await api.delete(API_URLS.CALENDAR.DELETE_HOLIDAY(id));
        return response.data;
    }
};
