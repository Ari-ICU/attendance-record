export interface OvertimeItem {
    _id?: string;
    id?: string;
    employeeId?: any;
    employeeName?: string;
    department?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    hours: number;
    project?: string;
    reason: string;
    status: 'approved' | 'pending' | 'rejected';
    hourlyRate?: number;
    totalAmount?: number;
    createdAt?: string;
    updatedAt?: string;
}
