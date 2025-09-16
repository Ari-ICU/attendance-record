'use client';

import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';

interface EmployeeListProps {
    employees: Employee[];
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => void;
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
    const handleEdit = (employee: Employee) => {
        onEdit(employee);
        toast.success(`Editing ${employee.fullName}`);
    };

    const handleDelete = (id: string, fullName: string) => {
        if (confirm(`Are you sure you want to delete ${fullName}?`)) {
            onDelete(id);
            toast.success(`${fullName} has been deleted`);
        }
    };

    return (
        <table className="w-full border border-gray-300 text-white">
            <thead>
                <tr className="shadow-2xs">
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Full Name</th>
                    <th className="border p-2">Email</th>
                    <th className="border p-2">Position</th>
                    <th className="border p-2">Department</th>
                    <th className="border p-2">Actions</th>
                </tr>
            </thead>
            <tbody>
                {employees.map((employee) => (
                    <tr key={employee._id}>
                        <td className="border p-2">{employee._id}</td>
                        <td className="border p-2">{employee.fullName}</td>
                        <td className="border p-2">{employee.email}</td>
                        <td className="border p-2">{employee.position}</td>
                        <td className="border p-2">{employee.department}</td>
                        <td className="border p-2 flex gap-2">
                            <button
                                onClick={() => handleEdit(employee)}
                                className="px-3 py-1 bg-blue-500 text-white rounded"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => handleDelete(employee._id, employee.fullName)}
                                className="px-3 py-1 bg-red-500 text-white rounded"
                            >
                                Delete
                            </button>

                            <button
                                onClick={() => {
                                    toast(`Viewing details for ${employee.fullName}`);
                                    // Navigate to detail page
                                    window.location.href = `/dashboard/management/employee/${employee._id}`;
                                }}
                                className="px-3 py-1 bg-green-500 text-white rounded"
                            >
                                View Detail
                            </button>
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>
    );
}
