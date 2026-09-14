'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmployeeDetail from '@/components/employee/EmployeeDetail';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { EmployeeService } from '@/services/employee.service';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = params as { id: string };

    useEffect(() => {
        async function fetchEmployee() {
            try {
                setLoading(true);
                const data = await EmployeeService.getEmployeeById(id);
                
                // Permission Enforcement:
                const isAdmin = Boolean(user && ['admin', 'superadmin'].includes(user.role || ''));
                const isTeamLead = Boolean(user && (user.role === 'manager' || /lead|manager|head|director|supervisor/i.test(user.position || '')));
                const isSelf = data.email?.toLowerCase() === user?.email?.toLowerCase() || data._id === (user as any)?.id || data._id === user?._id;

                const empDept = typeof data.department === 'object' ? (data.department as any)?.name : data.department;
                const userDept = typeof user?.department === 'object' ? (user.department as any)?.name : user?.department;
                const isSameDept = empDept && userDept && empDept.toLowerCase() === userDept.toLowerCase();
                const isTargetLeader = /lead|manager|head|director|supervisor|admin/i.test(data.position || '') || ['admin', 'manager', 'superadmin'].includes((data as any).role || '');

                // Allow access if admin, self, team lead viewing department member, or staff viewing department leader
                const hasAccess = isAdmin || isSelf || (isTeamLead && isSameDept) || (isSameDept && isTargetLeader);

                if (!hasAccess) {
                    toast.error('Access restricted: You can only view your own profile and your department team lead.', { id: 'view-restrict' });
                    router.push('/dashboard/management/departments');
                    return;
                }

                setEmployee(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error('Failed to load profile');
                }
                router.push('/dashboard/profile');
            } finally {
                setLoading(false);
            }
        }

        if (id && user) fetchEmployee();
    }, [id, user, router]);

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-black rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-800">Loading profile data...</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <p className="text-sm font-bold text-black">Employee profile not found.</p>
                <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
                >
                    Back to My Profile
                </button>
            </div>
        );
    }

    return <EmployeeDetail employee={employee} />;
}
