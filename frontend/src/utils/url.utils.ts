import { BASE_URL } from '@/api/apiUrl';

export const getFullImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('data:')) return path; // Already absolute or base64

    // Remove '/api' from BASE_URL if present to get the root URL
    const rootUrl = BASE_URL.replace(/\/api\/?$/, '');

    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${rootUrl}${cleanPath}`;
};
