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
  { name: 'All Staff Directory', href: '/dashboard/management/employee?type=employee', category: 'Staff' },
  { name: 'Departments & Teams', href: '/dashboard/management/departments', category: 'Staff' },
  { name: 'Today Attendance', href: '/dashboard/attendance/monitor', category: 'Attendance' },
  { name: 'Attendance Records', href: '/dashboard/attendance/records', category: 'Attendance' },
  { name: 'Late & Early Departures', href: '/dashboard/attendance/records?status=late', category: 'Attendance' },
  { name: 'Work Schedule & Shifts', href: '/dashboard/schedule', category: 'Schedule' },
  { name: 'Calendar & Events', href: '/dashboard/calendar', category: 'Schedule' },
  { name: 'Leave Requests', href: '/dashboard/leave/requests', category: 'Leave' },
  { name: 'Overtime Submissions', href: '/dashboard/overtime', category: 'Overtime' },
  { name: 'Salary & Payroll', href: '/dashboard/finance/payroll', category: 'Payroll' },
  { name: 'Attendance Analytics & Reports', href: '/dashboard/reports/analytics', category: 'Reports' },
  { name: 'Users & Roles Settings', href: '/dashboard/settings?tab=roles', category: 'System' },
  { name: 'System Settings', href: '/dashboard/settings', category: 'System' },
  { name: 'My Profile', href: '/dashboard/profile', category: 'User' },
];
