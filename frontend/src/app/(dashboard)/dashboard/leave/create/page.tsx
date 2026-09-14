'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { EmployeeService } from '@/services/employee.service';
import { LeaveService } from '@/services/leave.service';
import { Employee } from '@/types/employee.types';

export default function CreateLeavePage() {
    const router = useRouter();
    const { user } = useAuth();
    const isAdminOrManager = user && ['admin', 'manager', 'superadmin'].includes(user.role || '');

    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
    const [leaveType, setLeaveType] = useState<string>('annual');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(
        new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    );
    const [reason, setReason] = useState<string>('');
    const [contactNumber, setContactNumber] = useState<string>('+855 12 345 678');

    // Calculate total days
    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 1;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diffTime = d2.getTime() - d1.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : 1;
    };

    const totalDays = calculateDays(startDate, endDate);

    // Fetch staff list for admin/manager or link current employee
    useEffect(() => {
        const loadEmployees = async () => {
            try {
                const res = await EmployeeService.getAllEmployees({ limit: 100 });
                const list: Employee[] = res?.employees || (Array.isArray(res) ? res : []);
                setEmployees(list);

                if (user?.email) {
                    const selfEmp = list.find(
                        e => e.email?.toLowerCase() === user.email?.toLowerCase()
                    );
                    if (selfEmp) {
                        setSelectedEmployeeId(selfEmp._id || selfEmp.id || '');
                    } else if (list.length > 0) {
                        setSelectedEmployeeId(list[0]._id || list[0].id || '');
                    }
                } else if (list.length > 0) {
                    setSelectedEmployeeId(list[0]._id || list[0].id || '');
                }
            } catch (err) {
                console.error('Failed to load employee list:', err);
            }
        };

        loadEmployees();
    }, [user]);

    const currentStaff = employees.find(e => (e._id || e.id) === selectedEmployeeId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEmployeeId && !isAdminOrManager && !currentStaff) {
            toast.error('Unable to locate staff profile');
            return;
        }

        if (!reason.trim()) {
            toast.error('Please specify a reason for the leave');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            toast.error('End date cannot be earlier than start date');
            return;
        }

        setLoading(true);
        try {
            await LeaveService.create({
                employeeId: selectedEmployeeId || currentStaff?._id || currentStaff?.id,
                leaveType,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString(),
                totalDays,
                reason: `${reason.trim()}${contactNumber ? ` | Contact during leave: ${contactNumber}` : ''}`
            });

            toast.success('Leave application submitted successfully!');
            router.push('/dashboard/leave');
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                'Failed to submit leave application';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/leave"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            Apply for Leave / Time Off
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Submit a leave request for departmental approval
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Staff Member Selector */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">
                            Staff Member {isAdminOrManager ? '(Admin Selection)' : '(Your Profile)'}
                        </label>
                        {isAdminOrManager ? (
                            <CustomDropdown
                                value={selectedEmployeeId}
                                onChange={(val) => setSelectedEmployeeId(val)}
                                options={
                                    employees.length > 0
                                        ? employees.map(emp => ({
                                              value: emp._id || emp.id || '',
                                              label: `${emp.firstName} ${emp.lastName} — ${emp.position || 'Staff'} (${emp.department || 'General'})`
                                          }))
                                        : [{ value: '', label: 'Loading staff roster...' }]
                                }
                                searchable
                                placeholder="Select staff member..."
                            />
                        ) : (
                            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-black flex items-center justify-between">
                                <span>
                                    {currentStaff
                                        ? `${currentStaff.firstName} ${currentStaff.lastName}`
                                        : (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Staff Member')}
                                </span>
                                <span className="text-xs font-semibold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-md">
                                    {currentStaff?.department || user?.department || 'Staff'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Leave Category *</label>
                        <CustomDropdown
                            value={leaveType}
                            onChange={(val) => setLeaveType(val)}
                            options={[
                                { value: 'annual', label: '🏖️ Annual Leave' },
                                { value: 'sick', label: '🩺 Sick / Medical Leave' },
                                { value: 'casual', label: '☕ Casual Leave' },
                                { value: 'maternity', label: '👶 Maternity / Paternity Leave' },
                                { value: 'unpaid', label: '📋 Unpaid Leave' },
                                { value: 'other', label: '⚠️ Emergency / Other' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Contact Number During Leave</label>
                        <input
                            type="text"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                            placeholder="+855 12 345 678"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Start Date *</label>
                        <input
                            type="date"
                            required
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">End Date *</label>
                        <input
                            type="date"
                            required
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    {/* Duration Summary Banner */}
                    <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-black">
                            <Clock size={16} className="text-black" />
                            <span>Calculated Leave Duration:</span>
                        </div>
                        <span className="px-3 py-1 bg-black text-white text-xs font-black rounded-lg">
                            {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                        </span>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Reason for Leave *</label>
                        <textarea
                            rows={4}
                            required
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Provide details regarding your planned absence and handoff plan..."
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/leave"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={16} />
                        <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

