'use client';

import DashboardLayout from '@/app/(dashboard)/dashboard/layout'; // reuse your layout
// or if you want, you can move DashboardLayout to `@/components/DashboardLayout`

export default function ManagementPage() {
    return (
        <DashboardLayout>
            <div>
                <h1 className="text-3xl font-bold">Management</h1>
                <p className="text-gray-600 mt-2">
                    Welcome to the management section! 🚀
                </p>
            </div>
        </DashboardLayout>
    );
}
