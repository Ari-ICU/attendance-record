import api from '@/api/axiosInstance';

export interface Backup {
    filename: string;
    size: number;
    createdAt: string;
}

export const BackupService = {
    async createBackup() {
        // api instance already has baseURL and interceptors for auth
        const response = await api.post('/backups');
        return response.data.data;
    },

    async listBackups(): Promise<Backup[]> {
        const response = await api.get('/backups');
        return response.data.data;
    },

    async deleteBackup(filename: string) {
        const response = await api.delete(`/backups/${filename}`);
        return response.data;
    },

    async downloadBackup(filename: string) {
        // Use api instance to include auth headers for download
        const response = await api.get(`/backups/download/${filename}`, {
            responseType: 'blob'
        });

        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async restoreBackup(filename: string) {
        const response = await api.post(`/backups/restore/${filename}`);
        return response.data;
    }
};
