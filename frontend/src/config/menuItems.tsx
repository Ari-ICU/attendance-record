import { Home, User, Settings } from 'lucide-react';

export const defaultMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home size={20} /> },
  {
    name: 'Management',
    icon: <Settings size={20} />,
    group: true,
    items: [
      { name: 'Employee', href: '/management/employee', icon: <User size={20} /> },
    ],
  },
];
export const searchablePages = [
  { name: 'Dashboard Overview', href: '/dashboard', category: 'General' },
  { name: 'Faculty & Staff Directory', href: '/dashboard/management/employee?type=employee', category: 'Staff' },
  { name: 'Student Directory', href: '/dashboard/management/employee?type=student', category: 'Staff' },
  { name: 'Departments & Classes', href: '/dashboard/management/departments', category: 'Staff' },
  { name: 'Staff Positions & Roles', href: '/dashboard/management/positions', category: 'Staff' },
  { name: 'Today Live Attendance', href: '/dashboard/attendance/monitor', category: 'Attendance' },
  { name: 'Attendance Records & Logs', href: '/dashboard/attendance/records', category: 'Attendance' },
  { name: 'Late & Early Departures', href: '/dashboard/attendance/records?status=late', category: 'Attendance' },
  { name: 'Calendar & Shifts Hub', href: '/dashboard/calendar', category: 'Schedule' },
  { name: 'Time Off & Leave Requests', href: '/dashboard/leave', category: 'Leave' },
  { name: 'Overtime Submissions', href: '/dashboard/overtime', category: 'Overtime' },
  { name: 'Attendance Analytics & Reports', href: '/dashboard/reports/analytics', category: 'Reports' },
  { name: 'Users & Roles Settings', href: '/dashboard/settings?tab=roles', category: 'System' },
  { name: 'System Settings & Backups', href: '/dashboard/settings', category: 'System' },
  { name: 'My Profile', href: '/dashboard/profile', category: 'User' },
];
