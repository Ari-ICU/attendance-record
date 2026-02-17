import DailyAttendance from '@/components/dashboard/DailyAttendance';
import ActivityAnalytics from '@/components/dashboard/ActivityAnalytics';
import SystemPulse from '@/components/dashboard/SystemPulse';
import { Cpu, Zap, Shield } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Cpu className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Operational Nexus v4.0</span>
                    </div>
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tighter italic">
                        Command Overview
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium tracking-tight">
                        Real-time intelligence and personnel synchronization.
                    </p>
                </div>

                <div className="flex gap-3">
                    {[
                        { label: 'Security', val: 'Active', color: 'text-emerald-400', icon: Shield },
                        { label: 'Neural', val: 'Stabilized', color: 'text-blue-400', icon: Zap }
                    ].map((s, i) => (
                        <div key={i} className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                            <s.icon size={12} className={s.color} />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">{s.label}</span>
                                <span className={`text-[10px] font-black ${s.color} uppercase tracking-wider leading-none`}>{s.val}</span>
                            </div>
                        </div>
                    ))}
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

