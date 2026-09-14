'use client';

import { useState, useEffect, Suspense } from 'react';
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
    Scan,
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

    const isTeamLeadOrManager = user && (
        ['admin', 'manager', 'superadmin'].includes(user.role || '') ||
        (user.position && /lead|manager|head|director|supervisor/i.test(user.position))
    );

    const menuItems: MenuItem[] = isTeamLeadOrManager ? [
        // MAIN (Admin / Manager / Team Lead)
        {
            section: 'MAIN',
            name: 'Dashboard',
            href: '/dashboard',
            icon: <Home size={17} />,
        },

        // MY PROFILE
        {
            section: 'MY WORKSPACE',
            name: 'My Profile & Team',
            href: '/dashboard/profile',
            icon: <User size={17} />,
        },

        // STAFF & TEAMS
        {
            section: 'TEAMS & WORKFORCE',
            name: 'Staff & Teams',
            icon: <Users size={17} />,
            group: true,
            items: [
                { name: 'Employees', href: '/dashboard/management/employee', icon: <Users size={15} /> },
                { name: 'Departments & Teams', href: '/dashboard/management/departments', icon: <Building2 size={15} /> },
                { name: 'Positions', href: '/dashboard/management/positions', icon: <Briefcase size={15} /> },
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
                { name: 'Kiosk Terminal', href: '/scan', icon: <Scan size={15} /> },
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

        // SYSTEM (Admins only)
        ...(user?.role === 'admin' || user?.role === 'superadmin' ? [
            {
                section: 'SYSTEM',
                name: 'System',
                icon: <Settings size={17} />,
                group: true,
                items: [
                    { name: 'Users & Roles', href: '/dashboard/settings?tab=roles', icon: <Shield size={15} /> },
                    { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={15} /> },
                ],
            },
        ] : []),
    ] : [
        // MAIN (Standard Employee View)
        {
            section: 'MAIN',
            name: 'Dashboard',
            href: '/dashboard',
            icon: <Home size={17} />,
        },

        // MY PROFILE & SALARY
        {
            section: 'MY WORKSPACE',
            name: 'My Profile & Team Lead',
            href: '/dashboard/profile',
            icon: <User size={17} />,
        },
        {
            name: 'My Department & Team',
            href: '/dashboard/management/departments',
            icon: <Building2 size={17} />,
        },

        // ATTENDANCE
        {
            section: 'ATTENDANCE',
            name: 'My Attendance Logs',
            href: '/dashboard/attendance/records',
            icon: <CheckSquare size={17} />,
        },
        {
            name: 'Kiosk Check-In',
            href: '/scan',
            icon: <Scan size={17} />,
        },

        // SCHEDULE & CALENDAR
        {
            section: 'SCHEDULE & TIME',
            name: 'Calendar & Shifts',
            href: '/dashboard/calendar',
            icon: <CalendarDays size={17} />,
        },

        // TIME OFF & EXTRA
        {
            section: 'TIME OFF & REQUESTS',
            name: 'My Leave Requests',
            href: '/dashboard/leave',
            icon: <FileText size={17} />,
        },
        {
            name: 'My Overtime',
            href: '/dashboard/overtime',
            icon: <Timer size={17} />,
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
        <div className="flex min-h-screen bg-slate-50/70 text-black font-sans antialiased max-w-full overflow-x-hidden">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 transform ${sidebarCollapsed ? 'translate-x-[-100%] lg:translate-x-0 lg:w-20' : 'translate-x-[0] w-64'} shadow-sm print:hidden`}>
                <Suspense fallback={<div className="w-64 bg-white" />}>
                    <Sidebar menuItems={menuItems} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
                </Suspense>
            </div>

            {/* Mobile Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity duration-300 print:hidden"
                    onClick={() => setSidebarCollapsed(true)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-h-screen print:ml-0 max-w-full overflow-x-hidden`}>
                {/* Header */}
                <div className="print:hidden">
                    <Suspense fallback={null}>
                        <AHeader sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />
                    </Suspense>
                </div>

                <main className="flex-1 p-3 sm:p-5 lg:p-8 w-full max-w-full overflow-x-hidden">
                    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" /></div>}>
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
}