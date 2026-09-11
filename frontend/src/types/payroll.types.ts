// src/types/payroll.types.ts
import { Employee, BankDetails } from './employee.types';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'on_hold';

export interface EarningsBreakdown {
    baseSalary: number;
    hourlyRate: number;
    regularHours: number;
    regularPay: number;
    overtimeHours: number;
    overtimeRate: number; // usually 1.5x hourly rate
    overtimePay: number;
    bonuses: number;
    allowances: number;
    grossEarnings: number;
}

export interface DeductionsBreakdown {
    unpaidLeaveDays: number;
    leaveDeductions: number;
    taxWithholding: number; // e.g. 5%
    socialSecurity: number;
    otherDeductions: number;
    totalDeductions: number;
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
    status: 'draft' | 'processed' | 'approved' | 'disbursed';
    payslips: Payslip[];
}
