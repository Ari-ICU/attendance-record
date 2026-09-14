'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Clock, UserCheck } from 'lucide-react';
import { EmployeeService } from '@/services/employee.service';
import { AttendanceService } from '@/services/attendance.service';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function CreateAttendanceRecordPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        checkInTime: '08:00',
        checkOutTime: '17:00',
        status: 'present',
        method: 'manual',
        remarks: 'Manual attendance log recorded by administrator.'
    });

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await EmployeeService.getAllEmployees({ limit: 100 });
                setEmployees(res.employees || []);
                if (res.employees?.length) {
                    setFormData(prev => ({ ...prev, employeeId: res.employees[0]._id }));
                }
            } catch {}
        };
        fetchStaff();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }

        try {
            setLoading(true);
            await AttendanceService.checkIn({
                employeeId: formData.employeeId,
                method: formData.method as any,
            });
            toast.success('Attendance record logged successfully!');
            router.push('/dashboard/attendance/records');
        } catch (err: any) {
            const msg = err?.response?.data?.error || err?.response?.data?.message || 'Failed to log attendance record';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-5 sm:space-y-6 pb-12 font-sans max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/attendance/records"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-black tracking-tight">
                            Log Manual Attendance Record
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Record attendance timestamps and status adjustments
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Select Staff Member *</label>
                        <CustomDropdown
                            value={formData.employeeId}
                            onChange={(val) => setFormData({ ...formData, employeeId: val })}
                            placeholder="Choose employee..."
                            options={employees.map(emp => ({
                                value: emp._id,
                                label: `${emp.firstName} ${emp.lastName} — ${emp.position || 'Staff Member'} (${typeof emp.department === 'object' ? (emp.department as any)?.name : emp.department})`
                            }))}
                            searchable
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Attendance Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Attendance Status</label>
                        <CustomDropdown
                            value={formData.status}
                            onChange={(val) => setFormData({ ...formData, status: val })}
                            options={[
                                { value: 'present', label: 'Present (On Time)' },
                                { value: 'late', label: 'Late Arrival' },
                                { value: 'absent', label: 'Absent' },
                                { value: 'half_day', label: 'Half Day' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Check-in Time</label>
                        <input
                            type="time"
                            value={formData.checkInTime}
                            onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Check-out Time</label>
                        <input
                            type="time"
                            value={formData.checkOutTime}
                            onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Verification Method</label>
                        <CustomDropdown
                            value={formData.method}
                            onChange={(val) => setFormData({ ...formData, method: val })}
                            options={[
                                { value: 'manual', label: 'Manual Entry / Admin Override' },
                                { value: 'face_verification', label: 'Face Biometrics Scan' },
                                { value: 'qr_code', label: 'Campus QR Code' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Reason / Remarks</label>
                        <textarea
                            rows={3}
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            placeholder="Optional notes or adjustment justification..."
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/attendance/records"
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
                        <span>{loading ? 'Saving...' : 'Save Attendance Record'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
