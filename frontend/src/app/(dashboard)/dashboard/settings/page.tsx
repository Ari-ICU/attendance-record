'use client';

import ComingSoon from '@/components/dashboard/ComingSoon';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <ComingSoon
            title="System Settings"
            description="Configure your organization profile, security preferences, and global attendance rules."
            icon={Settings}
        />
    );
}
