export interface LeaveRequestItem {
    _id?: string;
    id?: string;
    employeeId?: any;
    employeeName?: string;
    department?: string;
    type?: 'Annual Leave' | 'Sick Leave' | 'Maternity / Paternity' | 'Casual Leave' | 'Emergency' | string;
    leaveType?: string;
    startDate: string;
    endDate: string;
    days?: number;
    totalDays?: number;
    reason: string;
    status: 'approved' | 'pending' | 'rejected' | 'cancelled';
    approvedBy?: any;
    createdAt?: string;
    updatedAt?: string;
}
