'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeCreateData } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/url.utils';
import { DepartmentService } from '@/services/department.service';
import { Department } from '@/types/department.types';
import { User, Check, RotateCcw, CreditCard, Building } from 'lucide-react';

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

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (type === 'number') {
            const numValue = value === '' ? 0 : parseFloat(value);
            setFormData({ ...formData, [name]: numValue });
        } else if (name.startsWith('bank.')) {
            const field = name.split('.')[1];
            setFormData({
                ...formData,
                bankDetails: {
                    ...formData.bankDetails,
                    [field]: value
                }
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFormData({ ...formData, image: base64.split(',')[1] });
                setImagePreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.dateOfJoining) {
            toast.error('Please select a Date of Joining');
            return;
        }

        const payload = {
            ...formData,
            dateOfJoining: formData.dateOfJoining,
            department: formData.department || '',
            phone: formData.phone.trim()
        };

        onSubmit(payload);
    };

    return (
        <div className="max-w-4xl mx-auto py-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="mb-8 border-b border-slate-800 pb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {initialData ? 'Edit' : 'Add New'} {formData.type === 'student' ? 'Student' : 'Employee'} Profile
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        Enter the personal, employment, and financial details for this record.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
                        <div className="flex-1">
                            <h3 className="text-xs font-semibold text-rose-400 uppercase">Submission Error</h3>
                            <p className="text-xs text-rose-300 mt-0.5">{error}</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
                        {/* Avatar photo upload */}
                        <div className="flex flex-col items-center gap-3 w-full md:w-44 shrink-0">
                            <div className="w-36 h-36 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative group">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center text-slate-500">
                                        <User className="w-10 h-10 mb-1" />
                                        <span className="text-[11px] font-medium">No Photo</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-xs font-semibold text-white">
                                    Change
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <span className="text-[10px] text-slate-500">JPG, PNG up to 3MB</span>
                        </div>

                        {/* Form Inputs Grid */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">First Name <span className="text-rose-400">*</span></label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="First name"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Last Name <span className="text-rose-400">*</span></label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Last name"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Email Address <span className="text-rose-400">*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Phone Number <span className="text-rose-400">*</span></label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+855 00 000 000"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Position / Role <span className="text-rose-400">*</span></label>
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Senior Engineer"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Department</label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d) => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Date of Joining <span className="text-rose-400">*</span></label>
                                <input
                                    type="date"
                                    name="dateOfJoining"
                                    value={formData.dateOfJoining}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Entity Type <span className="text-rose-400">*</span></label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="employee">Employee</option>
                                    <option value="student">Student</option>
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Monthly Base Salary ($)</label>
                                <input
                                    type="number"
                                    name="baseSalary"
                                    value={formData.baseSalary || ''}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors font-mono"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    value={formData.hourlyRate || ''}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="pt-6 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-400" />
                            Bank & Payment Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Bank Name</label>
                                <select
                                    name="bank.bankName"
                                    value={formData.bankDetails?.bankName || ''}
                                    onChange={(e) => handleChange(e as any)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Select Bank</option>
                                    <option value="ABA">ABA Bank</option>
                                    <option value="Acleda">Acleda Bank</option>
                                    <option value="Wing">Wing Bank</option>
                                    <option value="Sathapana">Sathapana Bank</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Account Holder Name</label>
                                <input
                                    type="text"
                                    name="bank.accountName"
                                    value={formData.bankDetails?.accountName || ''}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="e.g. JOHN DOE"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors font-medium uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Account Number</label>
                                <input
                                    type="text"
                                    name="bank.accountNumber"
                                    value={formData.bankDetails?.accountNumber || ''}
                                    onChange={(e) => handleChange(e as any)}
                                    placeholder="000 000 000"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-colors font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <RotateCcw className="w-4 h-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <span>{initialData ? 'Save Changes' : `Create ${formData.type === 'student' ? 'Student' : 'Employee'}`}</span>
                                    <Check className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

