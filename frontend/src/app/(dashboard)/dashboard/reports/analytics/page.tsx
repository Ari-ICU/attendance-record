'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
    return (
        <ComingSoon
            title="Advanced Analytics"
            description="Visualize workforce trends, attendance performance, and operational efficiency through interactive reports."
            icon={BarChart3}
        />
    );
}
