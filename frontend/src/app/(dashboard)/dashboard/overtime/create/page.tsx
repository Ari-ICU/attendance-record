'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { EmployeeService } from '@/services/employee.service';
import { DepartmentService } from '@/services/department.service';
import { OvertimeService } from '@/services/overtime.service';

export default function CreateOvertimePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        employeeId: '',
        department: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '17:30',
        endTime: '20:30',
        hours: 3.0,
        project: 'Biometric Cloud Gateway Upgrade Sprint',
        reason: 'Performing database indexing and API endpoint stress-tests during scheduled maintenance window.'
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [empRes, deptRes] = await Promise.all([
                    EmployeeService.getAllEmployees(),
                    DepartmentService.getAll()
                ]);
                const empList = empRes.employees || [];
                setEmployees(empList);
                const deptList = deptRes?.data || [];
                setDepartments(deptList);

                if (empList.length > 0) {
                    const first = empList[0];
                    setFormData(prev => ({
                        ...prev,
                        employeeId: first._id,
                        department: first.department || (deptList[0]?.name || 'General')
                    }));
                }
            } catch (err) {
                console.error('Failed to load employee list:', err);
            }
        };
        loadInitialData();
    }, []);

    const employeeOptions = employees.map(emp => ({
        value: emp._id,
        label: `${emp.fullName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim()} — ${emp.position || 'Staff'} (${emp.department || 'General'})`
    }));

    const handleEmployeeChange = (employeeId: string) => {
        const matched = employees.find(e => e._id === employeeId);
        setFormData(prev => ({
            ...prev,
            employeeId,
            department: matched ? matched.department : prev.department
        }));
    };

    const handleTimeChange = (type: 'startTime' | 'endTime', value: string) => {
        const newForm = { ...formData, [type]: value };
        try {
            const [startH, startM] = (type === 'startTime' ? value : formData.startTime).split(':').map(Number);
            const [endH, endM] = (type === 'endTime' ? value : formData.endTime).split(':').map(Number);
            const startMinutes = startH * 60 + startM;
            const endMinutes = endH * 60 + endM;
            if (endMinutes > startMinutes) {
                const diffHours = parseFloat(((endMinutes - startMinutes) / 60).toFixed(1));
                newForm.hours = diffHours;
            }
        } catch {
            // Keep default
        }
        setFormData(newForm);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }
        if (!formData.project.trim()) {
            toast.error('Project / task scope is required');
            return;
        }

        setLoading(true);
        try {
            await OvertimeService.create({
                employeeId: formData.employeeId,
                hours: formData.hours,
                date: formData.date,
                reason: `${formData.project}: ${formData.reason}`
            });
            toast.success('Overtime submission recorded successfully!');
            router.push('/dashboard/overtime');
        } catch {
            toast.error('Failed to submit overtime record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/overtime"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            Submit Staff Overtime Request
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Log extra project working hours and deliverables for supervisor authorization
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Staff Member Selector */}
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Staff Member / Employee *</label>
                        <CustomDropdown
                            value={formData.employeeId}
                            onChange={handleEmployeeChange}
                            options={employeeOptions.length > 0 ? employeeOptions : [{ value: '', label: 'Loading staff members...' }]}
                            placeholder="Select employee..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Department</label>
                        <CustomDropdown
                            value={formData.department}
                            onChange={(val) => setFormData({ ...formData, department: val })}
                            options={departments.length > 0 ? departments.map(d => ({ value: d.name, label: d.name })) : [
                                { value: 'Engineering & IT', label: 'Engineering & IT' },
                                { value: 'Product & Design', label: 'Product & Design' },
                                { value: 'Human Resources', label: 'Human Resources' },
                                { value: 'Operations & Facilities', label: 'Operations & Facilities' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Overtime Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Start Time</label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => handleTimeChange('startTime', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">End Time</label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => handleTimeChange('endTime', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-black">Calculated Extra Hours</label>
                            <span className="text-[11px] font-semibold text-slate-700">Auto-computed from time interval</span>
                        </div>
                        <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={formData.hours}
                            onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors font-mono"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Project / Task Scope *</label>
                        <input
                            type="text"
                            required
                            value={formData.project}
                            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                            placeholder="e.g. Q3 Cloud Infrastructure Migration Sprint"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Reason & Deliverables</label>
                        <textarea
                            rows={3}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Detail deliverables and justification for extra hours..."
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/overtime"
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
                        <span>{loading ? 'Submitting...' : 'Submit Overtime Request'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
