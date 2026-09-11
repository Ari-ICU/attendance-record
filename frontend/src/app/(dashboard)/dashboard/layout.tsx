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
    Clock
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

        // ATTENDANCE
        {
            section: 'ATTENDANCE',
            name: 'Attendance',
            icon: <CheckSquare size={17} />,
            group: true,
            items: [
                { name: 'Take Attendance', href: '/dashboard/attendance/monitor', icon: <Clock size={15} /> },
                { name: 'Attendance Records', href: '/dashboard/attendance/records', icon: <Calendar size={15} /> },
            ],
        },

        // PEOPLE
        {
            section: 'PEOPLE',
            name: 'People',
            icon: <Users size={17} />,
            group: true,
            items: [
                { name: 'Students', href: '/dashboard/management/employee?type=student', icon: <Users size={15} /> },
                { name: 'Teachers / Staff', href: '/dashboard/management/employee?type=employee', icon: <UserCheck size={15} /> },
            ],
        },

        // CLASSES / ACADEMIC
        {
            section: 'ACADEMIC',
            name: 'Classes & Depts',
            href: '/dashboard/management/departments',
            icon: <BookOpen size={17} />,
        },

        // REPORTS
        {
            section: 'INSIGHTS',
            name: 'Reports & Analytics',
            href: '/dashboard/reports/analytics',
            icon: <BarChart3 size={17} />,
        },

        // SYSTEM
        {
            section: 'SYSTEM',
            name: 'System',
            icon: <Settings size={17} />,
            group: true,
            items: [
                { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={15} /> },
                { name: 'Notifications', href: '/dashboard/notifications', icon: <Bell size={15} /> },
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
        <div className="flex min-h-screen bg-slate-50/70 text-slate-800 font-sans antialiased">
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