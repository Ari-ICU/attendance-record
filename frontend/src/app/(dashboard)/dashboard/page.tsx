import DailyAttendance from '@/components/dashboard/DailyAttendance';
import ActivityAnalytics from '@/components/dashboard/ActivityAnalytics';

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
                <ActivityAnalytics />
            </div>
        </div>
    );
}

