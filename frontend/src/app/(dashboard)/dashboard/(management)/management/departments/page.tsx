'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { Users } from 'lucide-react';

export default function DepartmentsPage() {
    return (
        <ComingSoon
            title="Department Management"
            description="Organize your organization structure, manage department heads, and assign employees to teams."
            icon={Users}
        />
    );
}
