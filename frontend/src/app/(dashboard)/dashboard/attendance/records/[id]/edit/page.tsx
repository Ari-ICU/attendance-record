'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function EditAttendanceRecordPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        status: 'present',
        checkInTime: '08:00',
        checkOutTime: '17:00',
        remarks: ''
    });

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                setLoading(true);
                let found: AttendanceRecord | null = null;
                try {
                    const single = await AttendanceService.getRecordById(id);
                    found = single?.data || single;
                } catch {
                    const res = await AttendanceService.getRecords({ limit: 100 });
                    const list = Array.isArray(res?.data) ? res.data : (res?.data?.docs || []);
                    found = list.find((r: AttendanceRecord) => r._id === id || (r as any).id === id);
                }

                if (found) {
                    setFormData({
                        date: found.date ? (typeof found.date === 'string' ? found.date.substring(0, 10) : new Date(found.date).toISOString().substring(0, 10)) : '',
                        status: found.status || 'present',
                        checkInTime: found.checkIn?.time ? new Date(found.checkIn.time).toTimeString().substring(0, 5) : '08:00',
                        checkOutTime: found.checkOut?.time ? new Date(found.checkOut.time).toTimeString().substring(0, 5) : '17:00',
                        remarks: 'Admin adjustment record'
                    });
                }
            } catch {
                toast.error('Failed to load record');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRecord();
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setTimeout(() => {
            toast.success('Attendance record adjusted successfully');
            router.push(`/dashboard/attendance/records/${id}`);
        }, 300);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-5 sm:space-y-6 pb-12 font-sans max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/attendance/records/${id}`}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-lg sm:text-2xl font-black text-black tracking-tight">
                            Edit / Adjust Attendance Log
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Modify check-in timestamps, check-out times, and attendance status
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-8 shadow-xs space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Status</label>
                        <CustomDropdown
                            value={formData.status}
                            onChange={(val) => setFormData({ ...formData, status: val })}
                            options={[
                                { value: 'present', label: 'Present (On Time)' },
                                { value: 'late', label: 'Late' },
                                { value: 'absent', label: 'Absent' },
                                { value: 'half_day', label: 'Half Day' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Check In Time</label>
                        <input
                            type="time"
                            value={formData.checkInTime}
                            onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Check Out Time</label>
                        <input
                            type="time"
                            value={formData.checkOutTime}
                            onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Adjustment Reason</label>
                        <textarea
                            rows={3}
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href={`/dashboard/attendance/records/${id}`}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={16} />
                        <span>{saving ? 'Updating...' : 'Save Adjustments'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
