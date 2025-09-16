
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
    ATTENDANCE: {
        GET_RECORDS: `${BASE_URL}/attendance`,
        CHECK_IN: `${BASE_URL}/attendance/check-in`, // Aligned with attendance.router.js
        CHECK_OUT: `${BASE_URL}/attendance/check-out`, // Aligned with attendance.router.js
        REPORTS: `${BASE_URL}/attendance/reports`, // For future compatibility
        MANAGE: `${BASE_URL}/attendance/manage`, // For future compatibility
    },
};

export default API_URLS;