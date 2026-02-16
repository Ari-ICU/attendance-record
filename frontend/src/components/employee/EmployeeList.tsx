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
        <div className="space-y-6 text-slate-100">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-pane p-4 rounded-2xl shadow-sm transition-all hover:shadow-md">
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search employees..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-950/50 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-500 text-slate-100"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-300 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:text-blue-400 transition-all shadow-sm">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-300 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:text-blue-400 transition-all shadow-sm">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="glass-pane rounded-3xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((employee, index) => (
                                    <motion.tr
                                        key={employee._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-blue-500/5 transition-colors duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-md group-hover:shadow-blue-500/20 transition-all">
                                                    <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-slate-500 relative">
                                                        {employee.photoUrl ? (
                                                            <img
                                                                src={getFullImageUrl(employee.photoUrl) || ''}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                                    (e.target as HTMLImageElement).parentElement!.innerText = employee.firstName[0] + employee.lastName[0]
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-bold">{employee.firstName[0]}{employee.lastName[0]}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                                                        {employee.fullName}
                                                    </div>
                                                    <div className="text-xs text-slate-500 font-mono mt-0.5">ID: {employee._id.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-slate-300">{employee.position}</span>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold uppercase tracking-wider border border-blue-500/20">
                                                        {employee.department || 'General'}
                                                    </span>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border 
                                                        ${employee.type === 'student' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                                                        {employee.type || 'Employee'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-sm text-slate-400 font-medium">
                                                    {employee.email}
                                                </div>
                                                <div className="text-xs text-slate-500">{employee.phone}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm
                                                ${employee.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${employee.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                                {employee.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => window.location.href = `/dashboard/management/employee/${employee._id}`}
                                                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-white/5 rounded-lg transition-all"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(employee)}
                                                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-white/5 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id, employee.fullName)}
                                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500">
                                            <div className="p-4 bg-white/5 rounded-full mb-4">
                                                <Search size={32} className="opacity-50" />
                                            </div>
                                            <p className="text-lg font-semibold text-white">No employees found</p>
                                            <p className="text-sm mt-1 opacity-70">Try adjusting your search terms</p>
                                        </div>
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

