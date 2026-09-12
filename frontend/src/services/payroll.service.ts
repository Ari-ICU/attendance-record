// src/services/payroll.service.ts
import { MOCK_EMPLOYEES } from '@/mocks/mockData';
import { Payslip, MonthlyPayrollSummary, PaymentStatus } from '@/types/payroll.types';

// Pre-seeded September 2026 Payslips
const SEED_PAYSLIPS_SEP_2026: Payslip[] = [
    {
        _id: 'ps_001',
        payrollId: 'pr_2026_09',
        employeeId: MOCK_EMPLOYEES[0]._id,
        employee: MOCK_EMPLOYEES[0], // Thoeurn Ratha
        month: 'September',
        year: 2026,
        payPeriodStart: '2026-09-01',
        payPeriodEnd: '2026-09-30',
        paymentDate: '2026-09-30',
        earnings: {
            baseSalary: 2800,
            hourlyRate: 25,
            regularHours: 160,
            regularPay: 2800,
            overtimeHours: 6.5,
            overtimeRate: 37.5,
            overtimePay: 243.75,
            bonuses: 150,
            allowances: 100,
            grossEarnings: 3293.75,
        },
        deductions: {
            unpaidLeaveDays: 0,
            leaveDeductions: 0,
            taxWithholding: 164.69, // 5%
            socialSecurity: 65.88, // 2%
            otherDeductions: 0,
            totalDeductions: 230.57,
        },
        netPay: 3063.18,
        status: 'paid',
        paymentMethod: 'Direct Deposit / Bank Wire',
        bankDetails: {
            bankName: 'ABA Bank',
            accountName: 'THOEURN RATHA',
            accountNumber: '001 234 567'
        },
        generatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'ps_002',
        payrollId: 'pr_2026_09',
        employeeId: MOCK_EMPLOYEES[1]._id,
        employee: MOCK_EMPLOYEES[1], // Sarah Jenkins
        month: 'September',
        year: 2026,
        payPeriodStart: '2026-09-01',
        payPeriodEnd: '2026-09-30',
        paymentDate: '2026-09-30',
        earnings: {
            baseSalary: 2400,
            hourlyRate: 20,
            regularHours: 160,
            regularPay: 2400,
            overtimeHours: 4.0,
            overtimeRate: 30,
            overtimePay: 120,
            bonuses: 100,
            allowances: 80,
            grossEarnings: 2700,
        },
        deductions: {
            unpaidLeaveDays: 0,
            leaveDeductions: 0,
            taxWithholding: 135.0,
            socialSecurity: 54.0,
            otherDeductions: 0,
            totalDeductions: 189.0,
        },
        netPay: 2511.0,
        status: 'paid',
        paymentMethod: 'Direct Deposit / Bank Wire',
        bankDetails: {
            bankName: 'Canadia Bank',
            accountName: 'SARAH JENKINS',
            accountNumber: '102 987 654'
        },
        generatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'ps_003',
        payrollId: 'pr_2026_09',
        employeeId: MOCK_EMPLOYEES[2]._id,
        employee: MOCK_EMPLOYEES[2], // Alex Vannak
        month: 'September',
        year: 2026,
        payPeriodStart: '2026-09-01',
        payPeriodEnd: '2026-09-30',
        paymentDate: '2026-09-30',
        earnings: {
            baseSalary: 2100,
            hourlyRate: 18,
            regularHours: 160,
            regularPay: 2100,
            overtimeHours: 0,
            overtimeRate: 27,
            overtimePay: 0,
            bonuses: 50,
            allowances: 50,
            grossEarnings: 2200,
        },
        deductions: {
            unpaidLeaveDays: 1,
            leaveDeductions: 95.45,
            taxWithholding: 105.23,
            socialSecurity: 42.09,
            otherDeductions: 0,
            totalDeductions: 242.77,
        },
        netPay: 1957.23,
        status: 'paid',
        paymentMethod: 'Direct Deposit / Bank Wire',
        bankDetails: {
            bankName: 'Wing Bank',
            accountName: 'ALEX VANNAK',
            accountNumber: '998 112 334'
        },
        generatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'ps_004',
        payrollId: 'pr_2026_09',
        employeeId: MOCK_EMPLOYEES[3]._id,
        employee: MOCK_EMPLOYEES[3], // David Miller
        month: 'September',
        year: 2026,
        payPeriodStart: '2026-09-01',
        payPeriodEnd: '2026-09-30',
        paymentDate: '2026-09-30',
        earnings: {
            baseSalary: 1900,
            hourlyRate: 16,
            regularHours: 160,
            regularPay: 1900,
            overtimeHours: 8.0,
            overtimeRate: 24,
            overtimePay: 192,
            bonuses: 80,
            allowances: 60,
            grossEarnings: 2232,
        },
        deductions: {
            unpaidLeaveDays: 0,
            leaveDeductions: 0,
            taxWithholding: 111.6,
            socialSecurity: 44.64,
            otherDeductions: 0,
            totalDeductions: 156.24,
        },
        netPay: 2075.76,
        status: 'paid',
        paymentMethod: 'Direct Deposit / Bank Wire',
        bankDetails: {
            bankName: 'ABA Bank',
            accountName: 'DAVID MILLER',
            accountNumber: '003 445 667'
        },
        generatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'ps_005',
        payrollId: 'pr_2026_09',
        employeeId: MOCK_EMPLOYEES[4]._id,
        employee: MOCK_EMPLOYEES[4], // Chann Dara
        month: 'September',
        year: 2026,
        payPeriodStart: '2026-09-01',
        payPeriodEnd: '2026-09-30',
        paymentDate: '2026-09-30',
        earnings: {
            baseSalary: 2300,
            hourlyRate: 20,
            regularHours: 160,
            regularPay: 2300,
            overtimeHours: 10.0,
            overtimeRate: 30,
            overtimePay: 300,
            bonuses: 120,
            allowances: 80,
            grossEarnings: 2800,
        },
        deductions: {
            unpaidLeaveDays: 0,
            leaveDeductions: 0,
            taxWithholding: 140.0,
            socialSecurity: 56.0,
            otherDeductions: 0,
            totalDeductions: 196.0,
        },
        netPay: 2604.0,
        status: 'pending',
        paymentMethod: 'Direct Deposit / Bank Wire',
        bankDetails: {
            bankName: 'ABA Bank',
            accountName: 'CHANN DARA',
            accountNumber: '005 889 112'
        },
        generatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'ps_006',
        payrollId: 'pr_2026_09',
        employeeId: MOCK_EMPLOYEES[5]._id,
        employee: MOCK_EMPLOYEES[5], // Sophea Kosal
        month: 'September',
        year: 2026,
        payPeriodStart: '2026-09-01',
        payPeriodEnd: '2026-09-30',
        paymentDate: '2026-09-30',
        earnings: {
            baseSalary: 1800,
            hourlyRate: 15,
            regularHours: 160,
            regularPay: 1800,
            overtimeHours: 2.0,
            overtimeRate: 22.5,
            overtimePay: 45,
            bonuses: 50,
            allowances: 50,
            grossEarnings: 1945,
        },
        deductions: {
            unpaidLeaveDays: 0,
            leaveDeductions: 0,
            taxWithholding: 97.25,
            socialSecurity: 38.9,
            otherDeductions: 0,
            totalDeductions: 136.15,
        },
        netPay: 1808.85,
        status: 'pending',
        paymentMethod: 'Direct Deposit / Bank Wire',
        bankDetails: {
            bankName: 'Canadia Bank',
            accountName: 'SOPHEA KOSAL',
            accountNumber: '109 443 221'
        },
        generatedAt: '2026-09-01T08:00:00.000Z',
    },
];

let localPayslips: Payslip[] = [...SEED_PAYSLIPS_SEP_2026];

import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';

export const PayrollService = {
    // Fetch monthly payroll summary & payslips
    getMonthlyPayroll: async (month = 'September', year = 2026): Promise<MonthlyPayrollSummary> => {
        try {
            const response = await api.get(API_URLS.PAYROLL.LEDGER, { params: { month, year } });
            if (response?.data?.data) {
                return response.data.data;
            }
        } catch {
            // Fallback to mock
        }

        const filtered = localPayslips.filter(p => p.month.toLowerCase() === month.toLowerCase() && p.year === year);
        
        const totalGrossSalary = filtered.reduce((acc, p) => acc + p.earnings.grossEarnings, 0);
        const totalOvertimePay = filtered.reduce((acc, p) => acc + p.earnings.overtimePay, 0);
        const totalDeductions = filtered.reduce((acc, p) => acc + p.deductions.totalDeductions, 0);
        const totalNetPayout = filtered.reduce((acc, p) => acc + p.netPay, 0);

        return {
            month,
            year,
            totalStaffCount: filtered.length,
            totalGrossSalary: Math.round(totalGrossSalary * 100) / 100,
            totalOvertimePay: Math.round(totalOvertimePay * 100) / 100,
            totalDeductions: Math.round(totalDeductions * 100) / 100,
            totalNetPayout: Math.round(totalNetPayout * 100) / 100,
            status: filtered.every(p => p.status === 'paid') ? 'disbursed' : 'processed',
            payslips: filtered,
        };
    },

    // Fetch individual payslip by ID
    getPayslipById: async (id: string): Promise<Payslip | null> => {
        try {
            const response = await api.get(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/payslips/${id}`);
            if (response?.data?.data) return response.data.data;
        } catch {
            // Fallback to mock
        }
        const found = localPayslips.find(p => p._id === id);
        return found || null;
    },

    // Fetch payslips for a specific employee
    getEmployeePayslips: async (employeeId: string): Promise<Payslip[]> => {
        try {
            const response = await api.get(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/employee/${employeeId}`);
            if (response?.data?.data) return response.data.data;
        } catch {
            // Fallback to mock
        }
        return localPayslips.filter(p => p.employeeId === employeeId || (p.employee as any)?._id === employeeId);
    },

    // Mark single payslip as paid
    updatePayslipStatus: async (id: string, status: PaymentStatus): Promise<Payslip | null> => {
        try {
            const response = await api.put(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/payslips/${id}/status`, { status });
            if (response?.data?.data) return response.data.data;
        } catch {
            // Fallback to mock
        }
        const index = localPayslips.findIndex(p => p._id === id);
        if (index === -1) return null;
        localPayslips[index] = { ...localPayslips[index], status };
        return localPayslips[index];
    },

    // Mark entire month's payroll as paid
    markAllAsPaid: async (month = 'September', year = 2026): Promise<boolean> => {
        try {
            const response = await api.post(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/mark-all-paid`, { month, year });
            if (response?.data?.success) return true;
        } catch {
            // Fallback to mock
        }
        localPayslips = localPayslips.map(p => {
            if (p.month.toLowerCase() === month.toLowerCase() && p.year === year) {
                return { ...p, status: 'paid' };
            }
            return p;
        });
        return true;
    },

    // Re-run / recalculate payroll from active employees
    generatePayrollRun: async (month = 'September', year = 2026): Promise<MonthlyPayrollSummary> => {
        try {
            const response = await api.post(API_URLS.PAYROLL.GENERATE, { month, year });
            if (response?.data?.data) return response.data.data;
        } catch {
            // Fallback to mock
        }
        // Regenerate payslips for all active employees
        const generated: Payslip[] = MOCK_EMPLOYEES.map((emp, idx) => {
            const baseSalary = emp.baseSalary || 2000;
            const hourlyRate = emp.hourlyRate || 20;
            const overtimeHours = (idx % 2 === 0) ? (idx * 2 + 2) : 0;
            const overtimeRate = hourlyRate * 1.5;
            const overtimePay = overtimeHours * overtimeRate;
            const bonuses = idx === 0 ? 150 : 50;
            const allowances = 80;
            const grossEarnings = baseSalary + overtimePay + bonuses + allowances;

            const taxWithholding = Math.round(grossEarnings * 0.05 * 100) / 100;
            const socialSecurity = Math.round(grossEarnings * 0.02 * 100) / 100;
            const totalDeductions = taxWithholding + socialSecurity;
            const netPay = Math.round((grossEarnings - totalDeductions) * 100) / 100;

            return {
                _id: `ps_${Date.now()}_${idx}`,
                payrollId: `pr_${year}_${month}`,
                employeeId: emp._id,
                employee: emp,
                month,
                year,
                payPeriodStart: `${year}-09-01`,
                payPeriodEnd: `${year}-09-30`,
                paymentDate: `${year}-09-30`,
                earnings: {
                    baseSalary,
                    hourlyRate,
                    regularHours: 160,
                    regularPay: baseSalary,
                    overtimeHours,
                    overtimeRate,
                    overtimePay,
                    bonuses,
                    allowances,
                    grossEarnings,
                },
                deductions: {
                    unpaidLeaveDays: 0,
                    leaveDeductions: 0,
                    taxWithholding,
                    socialSecurity,
                    otherDeductions: 0,
                    totalDeductions,
                },
                netPay,
                status: 'pending',
                paymentMethod: 'Direct Deposit / Bank Wire',
                bankDetails: emp.bankDetails || {
                    bankName: 'ABA Bank',
                    accountName: `${emp.firstName.toUpperCase()} ${emp.lastName.toUpperCase()}`,
                    accountNumber: `00${idx + 1} 123 456`
                },
                generatedAt: new Date().toISOString(),
            };
        });

        localPayslips = [...generated];
        return PayrollService.getMonthlyPayroll(month, year);
    }
};
