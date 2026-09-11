import DailyAttendance from '@/components/dashboard/DailyAttendance';
import ActivityAnalytics from '@/components/dashboard/ActivityAnalytics';
import SystemPulse from '@/components/dashboard/SystemPulse';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                        Dashboard Overview
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        Real-time attendance tracking and team metrics.
                    </p>
                </div>

                <div className="flex gap-2.5">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5">System</span>
                            <span className="text-xs font-semibold text-emerald-400 leading-none">Operational</span>
                        </div>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Recognition</span>
                            <span className="text-xs font-semibold text-blue-400 leading-none">Active</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DailyAttendance />
                    <ActivityAnalytics />
                </div>
                <div className="lg:col-span-1">
                    <SystemPulse />
                </div>
            </div>
        </div>
    );
}

