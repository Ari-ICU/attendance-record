'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { ShieldCheck } from 'lucide-react';

export default function ManagementPage() {
    return (
        <ComingSoon
            title="Entity Management"
            description="Access administrative tools to manage your organization's core entities and user permissions."
            icon={ShieldCheck}
        />
    );
}
