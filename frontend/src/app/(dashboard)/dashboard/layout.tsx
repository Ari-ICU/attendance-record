'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar, { MenuItem } from '@/components/ASide';
import AHeader from '@/components/AHeader';
import {
    Home,
    Settings,
    BarChart3,
    CheckSquare,
    Users,
    BookOpen,
    Bell,
    UserCheck,
    Calendar,
    Clock,
    CalendarDays,
    Briefcase,
    Building2,
    User,
    CheckCircle2,
    AlertTriangle,
    History,
    Layers,
    FileText,
    Bookmark,
    PieChart,
    Timer,
    Award,
    DollarSign,
    CreditCard,
    Receipt,
    FileSpreadsheet,
    TrendingUp,
    Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, loading, initializing } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const menuItems: MenuItem[] = [
        // MAIN
        {
            section: 'MAIN',
            name: 'Dashboard',
            href: '/dashboard',
            icon: <Home size={17} />,
        },

        // STAFF
        {
            section: 'STAFF',
            name: 'Staff',
            icon: <Users size={17} />,
            group: true,
            items: [
                { name: 'Employees', href: '/dashboard/management/employee', icon: <Users size={15} /> },
                { name: 'Departments', href: '/dashboard/management/departments', icon: <Building2 size={15} /> },
                { name: 'Positions', href: '/dashboard/management/positions', icon: <Briefcase size={15} /> },
                { name: 'My Profile', href: '/dashboard/profile', icon: <User size={15} /> },
            ],
        },

        // ATTENDANCE
        {
            section: 'ATTENDANCE',
            name: 'Attendance',
            icon: <CheckSquare size={17} />,
            group: true,
            items: [
                { name: 'Today', href: '/dashboard/attendance/monitor', icon: <CheckCircle2 size={15} /> },
                { name: 'Records', href: '/dashboard/attendance/records', icon: <Calendar size={15} /> },
                { name: 'Late / Early Leave', href: '/dashboard/attendance/records?status=late', icon: <AlertTriangle size={15} /> },
                { name: 'Attendance History', href: '/dashboard/attendance/records?view=history', icon: <History size={15} /> },
            ],
        },

        // SCHEDULE & CALENDAR
        {
            section: 'SCHEDULE & TIME',
            name: 'Calendar & Shifts',
            href: '/dashboard/calendar',
            icon: <CalendarDays size={17} />,
        },

        // LEAVE & OVERTIME
        {
            section: 'TIME OFF & EXTRA',
            name: 'Leave',
            href: '/dashboard/leave',
            icon: <FileText size={17} />,
        },
        {
            name: 'Overtime',
            href: '/dashboard/overtime',
            icon: <Timer size={17} />,
        },

        // REPORTS
        {
            section: 'REPORTS',
            name: 'Reports',
            icon: <BarChart3 size={17} />,
            group: true,
            items: [
                { name: 'Attendance', href: '/dashboard/reports/analytics?tab=attendance', icon: <BarChart3 size={15} /> },
                { name: 'Staff', href: '/dashboard/reports/analytics?tab=staff', icon: <Users size={15} /> },
                { name: 'Leave', href: '/dashboard/reports/analytics?tab=leave', icon: <FileSpreadsheet size={15} /> },
            ],
        },

        // SYSTEM
        {
            section: 'SYSTEM',
            name: 'System',
            icon: <Settings size={17} />,
            group: true,
            items: [
                { name: 'Users & Roles', href: '/dashboard/settings?tab=roles', icon: <Shield size={15} /> },
                { name: 'Notifications', href: '/dashboard/notifications', icon: <Bell size={15} /> },
                { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={15} /> },
            ],
        },
    ];

    useEffect(() => {
        const handleResize = () => setSidebarCollapsed(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close sidebar on route change on mobile
    useEffect(() => {
        if (window.innerWidth < 1024) {
            setSidebarCollapsed(true);
        }
    }, [pathname]);

    useEffect(() => {
        if (!initializing && !user) {
            router.push('/login');
        }
    }, [user, initializing, router]);

    if (loading || initializing || !user) return null;

    return (
        <div className="flex min-h-screen bg-slate-50/70 text-black font-sans antialiased">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 transform ${sidebarCollapsed ? 'translate-x-[-100%] lg:translate-x-0 lg:w-20' : 'translate-x-[0] w-64'} shadow-sm print:hidden`}>
                <Sidebar menuItems={menuItems} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            </div>

            {/* Mobile Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity duration-300 print:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen print:ml-0`}>
                {/* Header */}
                <div className="print:hidden">
                    <AHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                </div>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 relative z-10 w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}