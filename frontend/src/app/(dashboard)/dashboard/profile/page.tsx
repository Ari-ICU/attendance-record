'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeService } from '@/services/employee.service';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfileRedirectPage() {
    const { user, initializing } = useAuth();
    const router = useRouter();
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const resolveEmployee = async () => {
            try {
                const res = await EmployeeService.getAllEmployees({ limit: 100 });
                if (!isMounted) return;

                const employees = res.employees || [];
                if (employees.length === 0) {
                    setFailed(true);
                    return;
                }

                // Match user if available
                let matched = null;
                if (user) {
                    matched = employees.find(
                        (e: any) =>
                            (user.email && e.email?.toLowerCase() === user.email?.toLowerCase()) ||
                            (e.user && (typeof e.user === 'object' ? e.user._id === user._id : e.user === user._id)) ||
                            (e.userId && (e.userId === user._id || e.userId === (user as any).id))
                    );
                }

                // Fallback to first employee if not matched
                if (!matched && employees.length > 0) {
                    matched = employees[0];
                }

                if (matched?._id) {
                    router.replace(`/dashboard/management/employee/${matched._id}`);
                } else {
                    setFailed(true);
                }
            } catch {
                if (isMounted) setFailed(true);
            }
        };

        resolveEmployee();

        return () => {
            isMounted = false;
        };
    }, [user, initializing, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-sans">
            {!failed ? (
                <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xs">
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Resolving profile record...</p>
                </div>
            ) : (
                <div className="text-center space-y-3 bg-white p-8 rounded-2xl border border-slate-200 shadow-xs max-w-md">
                    <p className="text-sm font-black text-black">Could not resolve employee record.</p>
                    <p className="text-xs text-slate-600">Please select your profile from the employee directory.</p>
                    <Link
                        href="/dashboard/management/employee"
                        className="inline-block px-4 py-2 bg-black text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-colors"
                    >
                        Go to Employee Directory
                    </Link>
                </div>
            )}
        </div>
    );
}
