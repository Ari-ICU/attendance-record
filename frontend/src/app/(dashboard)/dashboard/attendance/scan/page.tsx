'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardAttendanceScanRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/scan');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Opening Standalone Biometric Terminal...</p>
            </div>
        </div>
    );
}
