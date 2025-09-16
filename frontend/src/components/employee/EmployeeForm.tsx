'use client';

import { useState, useEffect } from 'react';
import { Employee, EmployeeCreateData } from '@/types/employee.types';
import toast from 'react-hot-toast';

interface EmployeeFormProps {
    initialData?: Employee | null;
    onSubmit: (employee: EmployeeCreateData) => void;
    onCancel: () => void;
}

export default function EmployeeForm({ initialData, onSubmit, onCancel }: EmployeeFormProps) {
    const [formData, setFormData] = useState<EmployeeCreateData>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        dateOfJoining: '',
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
                image: undefined, // Reset image field
            });
            if (initialData.photoUrl) setImagePreview(initialData.photoUrl);
        }
    }, [initialData]);

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
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-3xl p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-all duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                    {initialData ? 'Edit Employee' : 'Add New Employee'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'First Name', name: 'firstName', type: 'text', required: true },
                            { label: 'Last Name', name: 'lastName', type: 'text', required: true },
                            { label: 'Email', name: 'email', type: 'email', required: true },
                            { label: 'Phone', name: 'phone', type: 'text', required: true },
                            { label: 'Position', name: 'position', type: 'text', required: true },
                            { label: 'Department', name: 'department', type: 'text', required: false },
                            { label: 'Date of Joining', name: 'dateOfJoining', type: 'date', required: true },
                        ].map((field) => (
                            <div key={field.name} className="relative group">
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={formData[field.name as keyof EmployeeCreateData] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 peer"
                                    placeholder={field.label}
                                />
                                <label
                                    htmlFor={field.name}
                                    className="absolute left-4 top-3 text-sm text-gray-500 dark:text-gray-400 transition-all duration-200 transform peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-blue-500 peer-valid:-translate-y-5 peer-valid:text-xs peer-valid:text-blue-500 bg-white dark:bg-gray-800 px-1"
                                >
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                            </div>
                        ))}

                        {/* Image Upload */}
                        <div className="col-span-1 md:col-span-2 flex flex-col items-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-40 h-40 object-cover rounded-full mb-2" />
                            ) : (
                                <div className="w-40 h-40 bg-gray-200 dark:bg-gray-600 rounded-full mb-2 flex items-center justify-center text-gray-500">
                                    No Image
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all duration-200 font-medium"
                        >
                            {initialData ? 'Update' : 'Add'} Employee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
