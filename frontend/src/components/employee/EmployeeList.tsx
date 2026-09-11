'use client';

import { Employee } from '@/types/employee.types';
import { Edit2, Trash2, Eye, Search, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { getFullImageUrl } from '@/utils/url.utils';

interface EmployeeListProps {
    employees: Employee[];
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => Promise<void>;
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp => {
        const deptName = typeof emp?.department === 'object' ? (emp?.department as any)?.name : emp?.department;
        return (
            (emp?.fullName || `${emp?.firstName || ''} ${emp?.lastName || ''}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (deptName || emp?.position || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const handleDelete = async (id: string, fullName: string) => {
        if (confirm(`Are you sure you want to delete ${fullName || 'this record'}?`)) {
            await onDelete(id);
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={15} />
                    <input
                        type="text"
                        placeholder="Search by employee name, ID, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder-slate-500 focus:bg-white focus:border-black outline-hidden transition-colors"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-bold text-slate-800 hidden sm:inline">
                        Showing {filteredEmployees.length} of {employees.length} employees
                    </span>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="px-5 py-3.5">Staff Member</th>
                                <th className="px-5 py-3.5">Department & Role</th>
                                <th className="px-5 py-3.5">Contact Line</th>
                                <th className="px-5 py-3.5">Biometrics</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee) => {
                                    const deptName = typeof employee.department === 'object' ? (employee.department as any)?.name : employee.department;
                                    const hasBio = employee.faceDescriptor && employee.faceDescriptor.length > 0;

                                    return (
                                        <tr
                                            key={employee._id}
                                            className="hover:bg-slate-50/70 transition-colors"
                                        >
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                                                        {employee.photoUrl ? (
                                                            <img
                                                                src={getFullImageUrl(employee.photoUrl) || ''}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).parentElement!.innerText = (employee.firstName?.[0] || '') + (employee.lastName?.[0] || '');
                                                                }}
                                                            />
                                                        ) : (
                                                            <span>{employee.firstName?.[0]}{employee.lastName?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                                            {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-mono">ID: {employee._id.substring(0, 8)}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="font-bold text-black text-xs">{employee.position || 'Staff Member'}</div>
                                                <div className="text-[11px] text-slate-600 font-medium">{deptName || 'General'}</div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="text-xs font-semibold text-slate-900">{employee.email}</div>
                                                <div className="text-[11px] text-slate-600 font-medium">{employee.phone || '--'}</div>
                                            </td>

                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    hasBio
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasBio ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                                                    <span>{hasBio ? 'Face Bio Active' : 'Face Pending'}</span>
                                                </span>
                                            </td>

                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/dashboard/management/employee/${employee._id}`}
                                                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => onEdit(employee)}
                                                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer"
                                                        title="Edit Record"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(employee._id, employee.fullName || `${employee.firstName} ${employee.lastName}`)}
                                                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-14 text-center text-slate-700">
                                        <User size={32} className="mx-auto mb-2 opacity-50 text-slate-600" />
                                        <p className="text-sm font-bold text-slate-900">No employees found matching your search</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
