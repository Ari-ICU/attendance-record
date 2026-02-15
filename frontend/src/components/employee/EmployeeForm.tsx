'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeCreateData } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/url.utils';

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
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                email: initialData.email,
                phone: initialData.phone,
                position: initialData.position,
                department: initialData.department,
                dateOfJoining: initialData.dateOfJoining,
                type: initialData.type || 'employee',
                image: undefined, // Reset image field
            });
            if (initialData.photoUrl) setImagePreview(getFullImageUrl(initialData.photoUrl) || null);
        } else {
            setFormData(prev => ({ ...prev, type: initialType }));
        }
    }, [initialData, initialType]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setFormData({ ...formData, image: base64.split(',')[1] }); // Store only base64 string
                setImagePreview(base64); // Show preview
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
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
            <div className="w-full max-w-4xl glass-pane rounded-3xl shadow-2xl overflow-hidden border border-white/10 relative group">
                {/* Decorative glow */}
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full transition-all duration-500 group-hover:bg-blue-500/20" />
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full transition-all duration-500 group-hover:bg-indigo-500/20" />

                <div className="p-8 sm:p-12 relative z-10">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tight">
                                {initialData ? 'Edit' : 'Add New'} {formData.type === 'student' ? 'Student' : 'Employee'}
                            </h2>
                            <p className="text-slate-400 mt-2 font-medium">
                                Enter the information to {initialData ? 'update' : 'create'} the profile.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-widest">Submission Error</h3>
                                <p className="text-sm text-rose-200/70 mt-1 font-medium leading-relaxed">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                            {/* Left Column: Image Upload */}
                            <div className="flex flex-col items-center gap-6 lg:w-1/3">
                                <div className="relative group/avatar">
                                    <div className={`
                                        w-48 h-48 rounded-3xl flex items-center justify-center overflow-hidden
                                        bg-slate-900 border-2 border-white/5 shadow-2xl
                                        transition-all duration-500 group-hover/avatar:border-blue-500/50 group-hover/avatar:scale-[1.02]
                                        relative
                                    `}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                                        ) : (
                                            <div className="flex flex-col items-center text-slate-500 group-hover/avatar:text-blue-400 transition-colors">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest">Upload Photo</span>
                                            </div>
                                        )}

                                        {/* Overlay for file input */}
                                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                                            <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl transition-all transform hover:scale-105 active:scale-95">
                                                Change
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-center mt-4 text-slate-500">
                                        JPEG, PNG, GIF • Max 3MB
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Form Fields */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                {[
                                    { label: 'First Name', name: 'firstName', type: 'text', required: true, placeholder: 'e.g. John' },
                                    { label: 'Last Name', name: 'lastName', type: 'text', required: true, placeholder: 'e.g. Doe' },
                                    { label: 'Email Address', name: 'email', type: 'email', required: true, placeholder: 'john.doe@company.com' },
                                    { label: 'Phone Number', name: 'phone', type: 'tel', required: true, placeholder: '+1 (555) 000-0000' },
                                    { label: 'Position / Role', name: 'position', type: 'text', required: true, placeholder: 'Software Engineer' },
                                    { label: 'Department', name: 'department', type: 'text', required: false, placeholder: 'Engineering' },
                                    { label: 'Date of Joining', name: 'dateOfJoining', type: 'date', required: true, placeholder: '' },
                                    { label: 'Entity Type', name: 'type', type: 'select', required: true, options: ['employee', 'student'] },
                                ].map((field) => (
                                    <div key={field.name} className={`${field.name === 'dateOfJoining' || field.name === 'department' ? 'col-span-1' : 'col-span-1'} space-y-2`}>
                                        <label htmlFor={field.name} className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                            {field.label} {field.required && <span className="text-rose-500">*</span>}
                                        </label>
                                        {field.type === 'select' ? (
                                            <select
                                                name={field.name}
                                                id={field.name}
                                                value={formData[field.name as keyof EmployeeCreateData] || ''}
                                                onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
                                                required={field.required}
                                                className="
                                                    w-full px-5 py-4 rounded-2xl bg-slate-950/50 
                                                    border border-white/5 text-white placeholder-slate-600
                                                    focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 
                                                    transition-all duration-300 hover:bg-slate-950/80
                                                    appearance-none cursor-pointer
                                                "
                                            >
                                                {field.options?.map(opt => (
                                                    <option key={opt} value={opt} className="bg-slate-900 capitalize">{opt}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type}
                                                name={field.name}
                                                id={field.name}
                                                value={formData[field.name as keyof EmployeeCreateData] || ''}
                                                onChange={handleChange}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                className="
                                                    w-full px-5 py-4 rounded-2xl bg-slate-950/50 
                                                    border border-white/5 text-white placeholder-slate-600
                                                    focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 
                                                    transition-all duration-300 hover:bg-slate-950/80
                                                    autofill:shadow-[0_0_0px_1000px_#020617_inset] autofill:text-fill-white
                                                "
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end gap-x-4 pt-10 border-t border-white/5">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`
                                    px-10 py-4 rounded-2xl font-bold text-white shadow-xl shadow-blue-500/20
                                    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                                    transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300
                                    flex items-center gap-2
                                    ${isSubmitting ? 'opacity-70 cursor-not-allowed grayscale' : ''}
                                `}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{initialData ? 'Save Changes' : `Create ${formData.type === 'student' ? 'Student' : 'Employee'}`}</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
