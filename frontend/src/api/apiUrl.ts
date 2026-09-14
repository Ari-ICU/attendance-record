
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export const API_URLS = {
    AUTH: {
        LOGIN: `${BASE_URL}/auth/login`,
        LOGOUT: `${BASE_URL}/auth/logout`,
        PROFILE: `${BASE_URL}/auth/profile`,
        REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
    },
    EMPLOYEE: {
        CREATE: `${BASE_URL}/employees`, // Added for POST /employees
        GET_ALL: `${BASE_URL}/employees`,
        GET_BY_ID: (id: string) => `${BASE_URL}/employees/${id}`,
        UPDATE: (id: string) => `${BASE_URL}/employees/${id}`,
        DELETE: (id: string) => `${BASE_URL}/employees/${id}`,
        VERIFY_FACE: `${BASE_URL}/employees/verify-face`,
    },
    DEPARTMENTS: {
        CREATE: `${BASE_URL}/departments`,
        GET_ALL: `${BASE_URL}/departments`,
        GET_BY_ID: (id: string) => `${BASE_URL}/departments/${id}`,
        UPDATE: (id: string) => `${BASE_URL}/departments/${id}`,
        DELETE: (id: string) => `${BASE_URL}/departments/${id}`,
    },
    ATTENDANCE: {
        GET_RECORDS: `${BASE_URL}/attendance`,
        GET_BY_ID: (id: string) => `${BASE_URL}/attendance/${id}`,
        CHECK_IN: `${BASE_URL}/attendance/check-in`, // Aligned with attendance.router.js
        CHECK_OUT: `${BASE_URL}/attendance/check-out`, // Aligned with attendance.router.js
        DELETE: (id: string) => `${BASE_URL}/attendance/${id}`,
        REPORTS: `${BASE_URL}/attendance/reports`, // For future compatibility
        MANAGE: `${BASE_URL}/attendance/manage`, // For future compatibility
    },
    REPORTS: {
        ANALYTICS: `${BASE_URL}/reports/analytics`
    },
    CALENDAR: {
        DASHBOARD: `${BASE_URL}/calendar`,
        CREATE_EVENT: `${BASE_URL}/calendar/events`,
        UPDATE_EVENT: (id: string) => `${BASE_URL}/calendar/events/${id}`,
        DELETE_EVENT: (id: string) => `${BASE_URL}/calendar/events/${id}`,
        CREATE_SHIFT: `${BASE_URL}/calendar/shifts`,
        UPDATE_SHIFT: (id: string) => `${BASE_URL}/calendar/shifts/${id}`,
        DELETE_SHIFT: (id: string) => `${BASE_URL}/calendar/shifts/${id}`,
        CREATE_HOLIDAY: `${BASE_URL}/calendar/holidays`,
        DELETE_HOLIDAY: (id: string) => `${BASE_URL}/calendar/holidays/${id}`,
    }
};

export default API_URLS;