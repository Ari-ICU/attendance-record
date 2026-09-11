'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
    Sparkles, 
    Plus, 
    Layers, 
    Users, 
    CheckCircle2, 
    Clock, 
    TrendingUp, 
    ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="w-full space-y-8 animate-in fade-in duration-300">
            {/* Hero Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
                        <Sparkles size={13} className="text-amber-300" />
                        <span>Ready for New UI Customization</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                        Welcome back, {user?.firstName || user?.username || 'Admin'} 👋
                    </h1>
                    <p className="text-blue-100 text-sm mt-1 max-w-xl">
                        Your workspace is cleaned and ready for your new custom UI components and workflows.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/management/employee"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-blue-50 transition-all shadow-md active:scale-95"
                    >
                        <Users size={15} className="text-blue-600" />
                        <span>Manage Staff</span>
                    </Link>
                </div>
            </div>

            {/* Quick Stat Placeholders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Total Staff', value: '--', change: '+0% vs last month', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Present Today', value: '--', change: 'Live check-ins', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Late / Delayed', value: '--', change: 'Awaiting review', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Attendance Rate', value: '--%', change: 'Monthly average', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={idx}
                            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <Icon size={18} />
                                </div>
                            </div>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                                <ArrowUpRight size={12} className="text-emerald-500" />
                                <span>{stat.change}</span>
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Clean UI Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Layers size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                    New Dashboard Canvas Ready
                </h3>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                    Start designing your brand new UI widgets, tables, charts, or operational feeds here.
                </p>
            </div>
        </div>
    );
}
