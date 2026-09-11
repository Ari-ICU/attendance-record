'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeCreateData } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/url.utils';
import { DepartmentService } from '@/services/department.service';
import { Department } from '@/types/department.types';
import { User, Check, RotateCcw, CreditCard, Building, Camera, X } from 'lucide-react';

interface EmployeeFormProps {
    initialData?: Employee | null;
    initialType?: 'employee' | 'student';
    onSubmit: (employee: EmployeeCreateData) => void;
    onCancel: () => void;
    error?: string | null;
    isSubmitting?: boolean;
}

export default function EmployeeForm({ initialData, initialType = 'employee', onSubmit, onCancel, error, isSubmitting }: EmployeeFormProps) {
    const [formData, setFormData] = useState<EmployeeCreateData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        dateOfJoining: '',
        type: initialType,
        baseSalary: 0,
        hourlyRate: 0,
        currency: 'USD',
        bankDetails: {
            bankName: '',
            accountName: '',
            accountNumber: ''
        }
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await DepartmentService.getAll();
                if (res.success) {
                    setDepartments(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch departments:', err);
            }
        };
        fetchDepartments();
    }, []);

    const formatDateForInput = (dateString?: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';
            return date.toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                email: initialData.email,
                phone: initialData.phone,
                position: initialData.position,
                department: initialData.department,
                dateOfJoining: formatDateForInput(initialData.dateOfJoining),
                type: initialData.type || 'employee',
                baseSalary: initialData.baseSalary || 0,
                hourlyRate: initialData.hourlyRate || 0,
                currency: initialData.currency || 'USD',
                bankDetails: {
                    bankName: initialData.bankDetails?.bankName || '',
                    accountName: initialData.bankDetails?.accountName || '',
                    accountNumber: initialData.bankDetails?.accountNumber || ''
                },
                image: undefined,
            });

            if (initialData.photoUrl) setImagePreview(getFullImageUrl(initialData.photoUrl) || null);
        } else {
            setFormData(prev => ({
                ...prev,
                type: initialType,
                dateOfJoining: formatDateForInput(new Date().toISOString())
            }));
        }
    }, [initialData, initialType]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: name === 'baseSalary' || name === 'hourlyRate' ? parseFloat(value) || 0 : value,
            }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                setFormData((prev) => ({ ...prev, image: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email) {
            toast.error('Please fill in required fields');
            return;
        }
        onSubmit(formData);
    };

    const isStudent = formData.type === 'student';

    return (
        <form onSubmit={handleSubmit} className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-lg sm:text-xl font-black text-black">
                        {initialData ? `Edit ${isStudent ? 'Student' : 'Staff Member'}` : `Enroll New ${isStudent ? 'Student' : 'Staff Member'}`}
                    </h2>
                    <p className="text-xs font-medium text-black mt-0.5">
                        Fill in personal info, department track, and biometric credentials.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="p-1.5 rounded-xl text-black hover:bg-slate-100 transition-colors cursor-pointer"
                >
                    <X size={18} />
                </button>
            </div>

            {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl">
                    {error}
                </div>
            )}

            {/* Photo Upload Card */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white border border-slate-300 shrink-0 flex items-center justify-center shadow-2xs">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-8 h-8 text-black" />
                    )}
                </div>
                <div className="space-y-1 text-center sm:text-left">
                    <label className="text-xs font-bold text-black block">Biometric Identification Photo</label>
                    <p className="text-[11px] font-medium text-black">Clear frontal face portrait for recognition (JPG/PNG max 5MB)</p>
                    <input
                        type="file"
                        accept="image/*"
                        id="photoUpload"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="photoUpload"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold cursor-pointer transition-colors shadow-2xs mt-1"
                    >
                        <Camera size={13} />
                        <span>Choose Photo</span>
                    </label>
                </div>
            </div>

            {/* Personal Details */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-black">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">First Name *</label>
                        <input
                            type="text"
                            required
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            placeholder="e.g. Dara"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Last Name *</label>
                        <input
                            type="text"
                            required
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            placeholder="e.g. Sok"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Email Address *</label>
                        <input
                            type="email"
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g. user@campus.edu"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Phone Number</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="e.g. +855 12 345 678"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Academic / Role Details */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-black">Department & Enrollment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Account Type</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors capitalize"
                        >
                            <option value="student">Student</option>
                            <option value="employee">Faculty & Staff</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Department / Class</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        >
                            <option value="">Select Class / Dept</option>
                            {departments.map((dept) => (
                                <option key={dept._id} value={dept.name}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Designation / Role Title</label>
                        <input
                            type="text"
                            name="position"
                            value={formData.position}
                            onChange={handleInputChange}
                            placeholder={isStudent ? 'e.g. Computer Science Yr-3' : 'e.g. Senior Lecturer'}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                    {isSubmitting ? (
                        <>
                            <RotateCcw size={14} className="animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Check size={14} />
                            <span>{initialData ? 'Update Record' : 'Save & Register'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
