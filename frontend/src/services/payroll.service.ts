// src/services/payroll.service.ts
import api from '@/api/axiosInstance';
import { API_URLS } from '@/api/apiUrl';
import { Payslip, MonthlyPayrollSummary, PaymentStatus } from '@/types/payroll.types';

export const PayrollService = {
    // Fetch monthly payroll summary & payslips
    getMonthlyPayroll: async (month = 'September', year = 2026): Promise<MonthlyPayrollSummary> => {
        const response = await api.get(API_URLS.PAYROLL.LEDGER, { params: { month, year } });
        return response.data?.data || response.data;
    },

    // Fetch individual payslip by ID
    getPayslipById: async (id: string): Promise<Payslip | null> => {
        const response = await api.get(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/payslips/${id}`);
        return response.data?.data || response.data;
    },

    // Fetch payslips for a specific employee
    getEmployeePayslips: async (employeeId: string): Promise<Payslip[]> => {
        const response = await api.get(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/employee/${employeeId}`);
        return response.data?.data || response.data || [];
    },

    // Mark single payslip as paid
    updatePayslipStatus: async (id: string, status: PaymentStatus): Promise<Payslip | null> => {
        const response = await api.put(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/payslips/${id}/status`, { status });
        return response.data?.data || response.data;
    },

    // Mark entire month's payroll as paid
    markAllAsPaid: async (month = 'September', year = 2026): Promise<boolean> => {
        const response = await api.post(`${API_URLS.PAYROLL.STATS.replace('/stats', '')}/mark-all-paid`, { month, year });
        return response.data?.success ?? true;
    },

    // Re-run / recalculate payroll from active employees
    generatePayrollRun: async (month = 'September', year = 2026): Promise<MonthlyPayrollSummary> => {
        const response = await api.post(API_URLS.PAYROLL.GENERATE, { month, year });
        return response.data?.data || response.data;
    }
};
