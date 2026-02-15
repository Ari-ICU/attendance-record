'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { Calendar } from 'lucide-react';

export default function AttendanceRecordsPage() {
    return (
        <ComingSoon
            title="Attendance Records"
            description="Access historical attendance logs, filter by date ranges, and view detailed check-in/out patterns."
            icon={Calendar}
        />
    );
}
