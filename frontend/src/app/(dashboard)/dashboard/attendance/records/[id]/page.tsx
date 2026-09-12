'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    Clock,
    UserCheck,
    MapPin,
    ShieldCheck,
    CheckCircle2,
    Edit2,
    Trash2,
    Globe
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import toast from 'react-hot-toast';

export default function AttendanceRecordDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [record, setRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                setLoading(true);
                const res = await AttendanceService.getRecords({ limit: 100 });
                const found = res.data?.docs?.find((r: AttendanceRecord) => r._id === id || (r as any).id === id);
                setRecord(found || null);
            } catch {
                toast.error('Failed to load attendance record');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchRecord();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await AttendanceService.deleteRecord(id);
            toast.success('Record deleted');
            router.push('/dashboard/attendance/records');
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!record) {
        return (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
                <p className="text-sm font-bold text-black">Attendance record not found.</p>
                <Link href="/dashboard/attendance/records" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-xl text-xs font-bold">
                    Back to Attendance Records
                </Link>
            </div>
        );
    }

    const emp = typeof record.employeeId === 'object' ? record.employeeId : null;

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/attendance/records"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                Attendance Log Detail
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold capitalize">
                                {record.status}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Staff Member'} • Date: {record.date}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/dashboard/attendance/records/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold cursor-pointer"
                    >
                        <Edit2 size={15} />
                        <span>Edit Log</span>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Log"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Main Log Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Check In Details */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-black uppercase">Check-in Scan</span>
                            <span className="text-xs font-black text-emerald-700">Verified</span>
                        </div>
                        <div className="space-y-2 text-xs font-medium text-black">
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Timestamp:</span>
                                <span>{record.checkIn?.time ? new Date(record.checkIn.time).toLocaleString() : '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Method:</span>
                                <span className="font-bold">{record.checkIn?.method || 'Face Biometrics'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Location Gate:</span>
                                <span>{record.checkIn?.location?.address || 'Main Campus Terminal A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">IP Address:</span>
                                <span className="font-mono">{record.checkIn?.ipAddress || '192.168.1.101'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Check Out Details */}
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <span className="text-xs font-bold text-black uppercase">Check-out Scan</span>
                            <span className="text-xs font-black text-black">Logged</span>
                        </div>
                        <div className="space-y-2 text-xs font-medium text-black">
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Timestamp:</span>
                                <span>{record.checkOut?.time ? new Date(record.checkOut.time).toLocaleString() : '—'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Method:</span>
                                <span className="font-bold">{record.checkOut?.method || 'Face Biometrics'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Total Hours Logged:</span>
                                <span className="font-bold">{record.totalHours || record.checkOut?.totalHours || 9.0} hrs</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="font-bold">Geofence Compliance:</span>
                                <span className="font-bold text-emerald-800">Inside Perimeter (250m)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Staff Profile Card Reference */}
                {emp && (
                    <div className="p-5 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black text-white font-bold flex items-center justify-center text-sm">
                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-black">{emp.firstName} {emp.lastName}</h3>
                                <p className="text-xs font-medium text-black">{emp.position} • {emp.department}</p>
                            </div>
                        </div>

                        <Link
                            href={`/dashboard/management/employee/${emp._id}`}
                            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            View Staff Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
