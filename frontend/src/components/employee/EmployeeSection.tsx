'use client';

import { useState } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import { Employee, EmployeeCreateData } from '@/types/employee.types';

export default function EmployeeSection() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showForm, setShowForm] = useState(false);

    const handleAddOrUpdate = (data: EmployeeCreateData) => {
        if (editingEmployee) {
            // Update existing
            setEmployees((prev) =>
                prev.map((e) => (e._id === editingEmployee._id ? { ...e, ...data } : e))
            );
        } else {
            // Add new (temporary _id until backend returns real one)
            setEmployees((prev) => [
                ...prev,
                {
                    _id: Date.now().toString(),
                    fullName: `${data.firstName} ${data.lastName}`,
                    isActive: true,
                    faceVerificationEnabled: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...data,
                },
            ]);
        }
        setEditingEmployee(null);
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        setEmployees((prev) => prev.filter((e) => e._id !== id));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Employees</h2>
                <button
                    onClick={() => {
                        setEditingEmployee(null);
                        setShowForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Add Employee
                </button>
            </div>

            {showForm && (
                <EmployeeForm
                    initialData={editingEmployee}
                    onSubmit={handleAddOrUpdate}
                    onCancel={() => setShowForm(false)}
                />
            )}

            <EmployeeList
                employees={employees}
                onEdit={(employee) => {
                    setEditingEmployee(employee);
                    setShowForm(true);
                }}
                onDelete={handleDelete}
            />
        </div>
    );
}
