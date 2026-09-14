// src/types/payroll.types.ts
import { Employee, BankDetails } from './employee.types';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'on_hold';

export interface EarningsBreakdown {
    baseSalary: number;
    hourlyRate: number;
    regularHours: number;
    workedHours?: number;
    workingDays?: number;
    targetDays?: number;
    presentDays?: number;
    regularPay: number;
    overtimeHours: number;
    overtimeRate: number; // usually 1.5x hourly rate
    overtimePay: number;
    bonuses: number;
    allowances: number;
    grossEarnings: number;
}

export interface DeductionsBreakdown {
    lateCount?: number;
    lateMinutes?: number;
    lateDeductions?: number;
    absentDays?: number;
    absentDeductions?: number;
    leaveDays?: number;
    permissionDays?: number;
    unpaidLeaveDays: number;
    leaveDeductions: number;
    taxWithholding: number; // e.g. 5%
    socialSecurity: number;
    otherDeductions: number;
    totalDeductions: number;
}

export interface AttendanceMetrics {
    totalWorkingHours: number;
    targetWorkingHours: number;
    targetDays: number;
    presentDays: number;
    lateDays: number;
    lateMinutes: number;
    absentDays: number;
    leaveDays: number;
    permissionDays: number;
    overtimeHours: number;
    attendanceRate: number;
}

export interface Payslip {
    _id: string;
    payrollId: string;
    employeeId: string;
    employee: Employee;
    month: string; // "September"
    year: number; // 2026
    payPeriodStart: string; // "2026-09-01"
    payPeriodEnd: string; // "2026-09-30"
    paymentDate: string; // "2026-09-30"
    earnings: EarningsBreakdown;
    deductions: DeductionsBreakdown;
    attendanceMetrics?: AttendanceMetrics;
    netPay: number;
    status: PaymentStatus;
    paymentMethod: 'Direct Deposit / Bank Wire' | 'Cheque' | 'Cash';
    bankDetails?: BankDetails;
    notes?: string;
    generatedAt: string;
}

export interface MonthlyPayrollSummary {
    month: string;
    year: number;
    totalStaffCount: number;
    totalGrossSalary: number;
    totalOvertimePay: number;
    totalDeductions: number;
    totalNetPayout: number;
    totalWorkingHours?: number;
    totalOvertimeHours?: number;
    totalLateCount?: number;
    totalLateDeductions?: number;
    totalAbsentDays?: number;
    totalAbsentDeductions?: number;
    totalLeaveDays?: number;
    totalPermissionDays?: number;
    status: 'draft' | 'processed' | 'approved' | 'disbursed';
    payslips: Payslip[];
}

