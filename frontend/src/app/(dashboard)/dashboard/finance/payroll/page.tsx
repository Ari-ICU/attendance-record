'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { CreditCard } from 'lucide-react';

export default function PayrollPage() {
    return (
        <ComingSoon
            title="Payroll Processing"
            description="Manage employee salaries, generate payslips, and handle financial distributions based on attendance data."
            icon={CreditCard}
        />
    );
}
