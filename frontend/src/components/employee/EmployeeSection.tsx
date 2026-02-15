'use client';

import { useState, useEffect, useCallback } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import { Employee, EmployeeCreateData } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

export default function EmployeeSection() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await EmployeeService.getAllEmployees();
            setEmployees(response.employees);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleAddOrUpdate = async (data: EmployeeCreateData) => {
        try {
            setIsSubmitting(true);
            if (editingEmployee) {
                // Update existing
                const updated = await EmployeeService.updateEmployee(editingEmployee._id, data);
                setEmployees((prev) =>
                    prev.map((e) => (e._id === editingEmployee._id ? updated : e))
                );
                toast.success('Employee updated successfully');
            } else {
                // Add new
                const created = await EmployeeService.createEmployee(data);
                setEmployees((prev) => [created, ...prev]);
                toast.success('Employee created successfully');
            }
            setEditingEmployee(null);
            setShowForm(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save employee');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await EmployeeService.deleteEmployee(id);
            setEmployees((prev) => prev.filter((e) => e._id !== id));
            toast.success('Employee deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete employee');
        }
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Personnel Management</h1>
                    <p className="text-slate-400 mt-1">Manage employee and student records across all departments.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingEmployee(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Personnel
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <EmployeeForm
                            initialData={editingEmployee}
                            onSubmit={handleAddOrUpdate}
                            onCancel={() => setShowForm(false)}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-medium">Loading personnel records...</p>
                </div>
            ) : (
                <EmployeeList
                    employees={employees}
                    onEdit={(employee) => {
                        setEditingEmployee(employee);
                        setShowForm(true);
                    }}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
}
