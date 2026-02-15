import DailyAttendance from '@/components/dashboard/DailyAttendance';

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tight">
                    Dashboard
                </h1>
                <p className="text-slate-400 mt-1 font-medium">
                    Overview of today's activities and attendance.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyAttendance />

                {/* Analytics Placeholder */}
                <div className="glass-pane rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-50" />

                    <div className="relative z-10 p-6 bg-slate-900 rounded-full mb-4 ring-8 ring-white/5 transition-transform group-hover:scale-110 duration-500">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg animate-pulse" />
                    </div>

                    <h3 className="text-xl font-bold text-white relative z-10">Activity Analytics</h3>
                    <p className="text-slate-400 mt-2 max-w-xs relative z-10">
                        Detailed charts and reporting features are coming soon.
                    </p>
                </div>
            </div>
        </div>
    );
}

