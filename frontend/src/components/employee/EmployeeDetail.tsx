'use client';

import { Employee } from '@/types/employee.types';

interface EmployeeDetailProps {
    employee: Employee;
}

export default function EmployeeDetail({ employee }: EmployeeDetailProps) {
    return (
        <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Employee Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-200">
                <div>
                    <span className="font-semibold">Full Name:</span> {employee.fullName}
                </div>
                <div>
                    <span className="font-semibold">Email:</span> {employee.email}
                </div>
                <div>
                    <span className="font-semibold">Phone:</span> {employee.phone}
                </div>
                <div>
                    <span className="font-semibold">Position:</span> {employee.position}
                </div>
                <div>
                    <span className="font-semibold">Department:</span> {employee.department || '-'}
                </div>
                <div>
                    <span className="font-semibold">Date of Joining:</span> {employee.dateOfJoining}
                </div>
                <div>
                    <span className="font-semibold">Active:</span> {employee.isActive ? 'Yes' : 'No'}
                </div>
                <div>
                    <span className="font-semibold">Face Verification Enabled:</span>{' '}
                    {employee.faceVerificationEnabled ? 'Yes' : 'No'}
                </div>
            </div>
        </div>
    );
}
