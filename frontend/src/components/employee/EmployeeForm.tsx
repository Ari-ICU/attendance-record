'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeCreateData } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/url.utils';
import { DepartmentService } from '@/services/department.service';
import { Department } from '@/types/department.types';
import {
    User,
    Check,
    RotateCcw,
    Building2,
    Camera,
    Mail,
    Phone,
    Briefcase,
    Calendar,
    ShieldCheck,
    Trash2,
    Info,
    CheckCircle2,
    DollarSign,
    CreditCard,
    Calculator
} from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface EmployeeFormProps {
    initialData?: Employee | null;
    onSubmit: (employee: EmployeeCreateData) => void;
    onCancel: () => void;
    error?: string | null;
    isSubmitting?: boolean;
}

export default function EmployeeForm({
    initialData,
    onSubmit,
    onCancel,
    error,
    isSubmitting
}: EmployeeFormProps) {
    const [formData, setFormData] = useState<EmployeeCreateData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        dateOfJoining: '',
        type: 'employee',
        baseSalary: 2800,
        hourlyRate: 17.50,
        currency: 'USD',
        bankDetails: {
            bankName: 'ABA Bank',
            accountName: '',
            accountNumber: ''
        }
    });

    const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'payroll' | 'biometrics'>('profile');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await DepartmentService.getAll();
                if (res.success && res.data) {
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
        } catch {
            return '';
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                position: initialData.position || '',
                department: typeof initialData.department === 'object' ? (initialData.department as any)?.name : (initialData.department || ''),
                dateOfJoining: formatDateForInput(initialData.dateOfJoining),
                type: 'employee',
                image: undefined,
                baseSalary: initialData.baseSalary ?? 2800,
                hourlyRate: initialData.hourlyRate ?? 17.50,
                currency: initialData.currency || 'USD',
                bankDetails: {
                    bankName: initialData.bankDetails?.bankName || 'ABA Bank',
                    accountName: initialData.bankDetails?.accountName || (initialData.fullName || `${initialData.firstName || ''} ${initialData.lastName || ''}`.trim()),
                    accountNumber: initialData.bankDetails?.accountNumber || ''
                }
            });

            if (initialData.photoUrl) {
                setImagePreview(getFullImageUrl(initialData.photoUrl) || null);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                type: 'employee',
                dateOfJoining: formatDateForInput(new Date().toISOString()),
                baseSalary: 2800,
                hourlyRate: 17.50,
                currency: 'USD',
                bankDetails: {
                    bankName: 'ABA Bank',
                    accountName: '',
                    accountNumber: ''
                }
            }));
        }
    }, [initialData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSalaryChange = (value: number) => {
        const base = isNaN(value) ? 0 : value;
        const autoHourly = Math.round((base / 160) * 100) / 100;
        setFormData(prev => ({
            ...prev,
            baseSalary: base,
            hourlyRate: autoHourly
        }));
    };

    const handleBankDetailChange = (field: 'bankName' | 'accountName' | 'accountNumber', value: string) => {
        setFormData(prev => ({
            ...prev,
            bankDetails: {
                ...prev.bankDetails,
                [field]: value
            }
        }));
    };

    const processFile = (file: File) => {
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
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processFile(file);
        }
    };

    const handleRemovePhoto = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: undefined, photoUrl: undefined }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.firstName?.trim() || !formData.lastName?.trim() || !formData.email?.trim()) {
            toast.error('Please fill in required identity fields');
            setActiveTab('profile');
            return;
        }

        // Auto-fill account name if empty
        const submissionPayload = {
            ...formData,
            bankDetails: {
                bankName: formData.bankDetails?.bankName || 'ABA Bank',
                accountName: formData.bankDetails?.accountName || `${formData.firstName} ${formData.lastName}`.trim(),
                accountNumber: formData.bankDetails?.accountNumber || '001 234 567'
            }
        };

        onSubmit(submissionPayload);
    };

    const bankOptions = [
        { value: 'ABA Bank', label: 'ABA Bank' },
        { value: 'ACLEDA Bank', label: 'ACLEDA Bank' },
        { value: 'Canadia Bank', label: 'Canadia Bank' },
        { value: 'Wing Bank', label: 'Wing Bank' },
        { value: 'Sathapana Bank', label: 'Sathapana Bank' },
        { value: 'Vattanac Bank', label: 'Vattanac Bank' },
        { value: 'Foreign Currency / Wire', label: 'International Wire Transfer' },
    ];

    const currencyOptions = [
        { value: 'USD', label: 'USD ($)' },
        { value: 'KHR', label: 'KHR (៛)' },
    ];

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                {initialData ? 'Update Employee Profile' : 'Register New Employee'}
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-black border border-slate-300">
                                Staff Member
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800">
                            Configure employee identity, departmental role, compensation, and biometric attendance credentials.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2">
                        <Info size={16} className="text-rose-600 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
                {[
                    { id: 'profile', label: '1. Personal Profile', icon: <User size={15} /> },
                    { id: 'organization', label: '2. Department & Role', icon: <Building2 size={15} /> },
                    { id: 'payroll', label: '3. Salary & Banking', icon: <DollarSign size={15} /> },
                    { id: 'biometrics', label: '4. Face Biometrics', icon: <ShieldCheck size={15} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-black text-white shadow-xs'
                                : 'bg-white text-slate-800 hover:text-black hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab 1: Personal Profile */}
            {activeTab === 'profile' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                            <User size={15} className="text-blue-600" />
                            Personal Identity & Contact Information
                        </h3>
                        <span className="text-[11px] font-bold text-slate-600">* Required fields</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">First Name *</label>
                            <input
                                type="text"
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="e.g. Sok"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
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
                                placeholder="e.g. Dara"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Work Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                                <input
                                    type="email"
                                    required
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="e.g. dara.sok@company.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="e.g. +855 12 345 678"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Date of Joining / Hire Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                                <input
                                    type="date"
                                    name="dateOfJoining"
                                    value={formData.dateOfJoining}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Organization / Department */}
            {activeTab === 'organization' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                            <Building2 size={15} className="text-blue-600" />
                            Department & Professional Role
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Company Department *</label>
                            <CustomDropdown
                                value={formData.department}
                                onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                                placeholder="Select Department"
                                options={departments.map(d => ({ value: d.name, label: d.name }))}
                                searchable
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Job Title / Designation *</label>
                            <div className="relative">
                                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                                <input
                                    type="text"
                                    name="position"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Senior Software Engineer"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Salary & Banking */}
            {activeTab === 'payroll' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                            <DollarSign size={15} className="text-emerald-600" />
                            Salary Structure & Bank Account
                        </h3>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Active Compensation
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* Base Monthly Salary */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Base Monthly Salary (USD) *</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    required
                                    value={formData.baseSalary ?? 2800}
                                    onChange={(e) => handleSalaryChange(parseFloat(e.target.value))}
                                    placeholder="2800"
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                            <span className="text-[10px] text-slate-600 block">Standard 160 hours / month</span>
                        </div>

                        {/* Overtime Hourly Rate */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Hourly Base Rate ($/hr)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black font-bold text-sm">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.hourlyRate ?? 17.50}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                                    placeholder="17.50"
                                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                            <span className="text-[10px] text-slate-600 block">Overtime multiplies at 1.5x</span>
                        </div>

                        {/* Currency */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-black">Disbursement Currency</label>
                            <CustomDropdown
                                value={formData.currency || 'USD'}
                                onChange={(val) => setFormData(prev => ({ ...prev, currency: val }))}
                                options={currencyOptions}
                            />
                        </div>
                    </div>

                    {/* Bank Particulars Section */}
                    <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-black uppercase tracking-wider text-black mb-4 flex items-center gap-1.5">
                            <CreditCard size={14} className="text-black" />
                            Employee Bank Account Particulars
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-black">Receiving Bank</label>
                                <CustomDropdown
                                    value={formData.bankDetails?.bankName || 'ABA Bank'}
                                    onChange={(val) => handleBankDetailChange('bankName', val)}
                                    options={bankOptions}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-black">Account Holder Name</label>
                                <input
                                    type="text"
                                    value={formData.bankDetails?.accountName || ''}
                                    onChange={(e) => handleBankDetailChange('accountName', e.target.value)}
                                    placeholder={formData.firstName ? `${formData.firstName} ${formData.lastName}` : 'Account Holder Name'}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-black">Bank Account Number</label>
                                <input
                                    type="text"
                                    value={formData.bankDetails?.accountNumber || ''}
                                    onChange={(e) => handleBankDetailChange('accountNumber', e.target.value)}
                                    placeholder="e.g. 001 234 567"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-black placeholder:text-slate-400 outline-none focus:bg-white focus:border-black transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Biometrics & Photo */}
            {activeTab === 'biometrics' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                            <ShieldCheck size={15} className="text-blue-600" />
                            Facial Recognition & Biometric Identification
                        </h3>
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} />
                            Face-Scan Ready
                        </span>
                    </div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={handleDrop}
                        className={`flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-dashed transition-all ${
                            isDragOver ? 'border-black bg-slate-100' : 'border-slate-300 bg-slate-50/70'
                        }`}
                    >
                        {/* Image Preview Box */}
                        <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white border border-slate-300 shrink-0 flex items-center justify-center shadow-xs group">
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer"
                                    >
                                        <Trash2 size={16} />
                                        <span>Remove</span>
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-3">
                                    <User className="w-10 h-10 text-slate-400 mx-auto" />
                                    <span className="text-[10px] font-bold text-slate-600 mt-1 block">No Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Upload Controls */}
                        <div className="space-y-2 text-center sm:text-left flex-1">
                            <h4 className="text-sm font-bold text-black">Frontal Biometric Portrait</h4>
                            <p className="text-xs font-semibold text-slate-800">
                                High-clarity face portrait for instant employee kiosk terminal check-in. Drag and drop file or choose from device.
                            </p>
                            <p className="text-[11px] font-medium text-slate-600">
                                Supported formats: JPG, PNG, WebP (Max 5MB)
                            </p>

                            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                                <input
                                    type="file"
                                    accept="image/*"
                                    id="photoUpload"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="photoUpload"
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                                >
                                    <Camera size={14} />
                                    <span>{imagePreview ? 'Change Photo' : 'Upload Image'}</span>
                                </label>

                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemovePhoto}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 hover:text-rose-800 text-black text-xs font-bold transition-colors"
                                    >
                                        <Trash2 size={13} />
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-5 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                        {isSubmitting ? (
                            <>
                                <RotateCcw size={15} className="animate-spin" />
                                <span>Saving Record...</span>
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                <span>{initialData ? 'Save Changes' : 'Complete & Register'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

