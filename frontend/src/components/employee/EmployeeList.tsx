'use client';

import { Employee } from '@/types/employee.types';
import { Edit2, Trash2, Eye, Search, Filter, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';

interface EmployeeListProps {
    employees: Employee[];
    onEdit: (employee: Employee) => void;
    onDelete: (id: string) => Promise<void>;
}

export default function EmployeeList({ employees, onEdit, onDelete }: EmployeeListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp =>
        (emp?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (employee: Employee) => {
        onEdit(employee);
    };

    const handleDelete = async (id: string, fullName: string) => {
        if (confirm(`Are you sure you want to delete ${fullName || 'this record'}?`)) {
            await onDelete(id);
        }
    };

    return (
        <div className="space-y-4 text-slate-100">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded-xl">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                        <Filter size={14} />
                        Filter
                    </button>
                    <button className="flex items-center justify-center p-2 text-slate-400 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950">
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400">Employee</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400">Position & Dept</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400">Contact</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400">Status</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee) => (
                                    <tr
                                        key={employee._id}
                                        className="hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center text-slate-400 shrink-0">
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
                                                        <span className="text-xs font-bold uppercase">{employee.firstName?.[0]}{employee.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-200">
                                                        {employee.fullName}
                                                    </div>
                                                    <div className="text-[11px] text-slate-500 font-mono">ID: {employee._id.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-200">{employee.position}</span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
                                                        {employee.department || 'General'}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                                                        {employee.type || 'Employee'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-300">{employee.email}</span>
                                                <span className="text-[11px] text-slate-500">{employee.phone || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border
                                                ${employee.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${employee.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => window.location.href = `/dashboard/management/employee/${employee._id}`}
                                                    className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id, employee.fullName)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <Search size={28} className="mx-auto mb-2 opacity-40" />
                                        <p className="text-sm font-semibold text-slate-300">No employees found</p>
                                        <p className="text-xs mt-0.5 text-slate-500">Try adjusting your search query</p>
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

