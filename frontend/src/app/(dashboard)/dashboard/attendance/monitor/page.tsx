'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { Clock } from 'lucide-react';

export default function LiveMonitorPage() {
    return (
        <ComingSoon
            title="Live Monitor"
            description="Real-time attendance tracking and live status updates of all employees in the system."
            icon={Clock}
        />
    );
}
