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
  { name: 'Live Link Monitor', href: '/dashboard/attendance/monitor', category: 'Attendance' },
  { name: 'Attendance Records', href: '/dashboard/attendance/records', category: 'Attendance' },
  { name: 'Scan Station', href: '/verify', category: 'Attendance' },
  { name: 'Employees Management', href: '/dashboard/management/employee?type=employee', category: 'Management' },
  { name: 'Students Management', href: '/dashboard/management/employee?type=student', category: 'Management' },
  { name: 'Departments', href: '/dashboard/management/departments', category: 'Management' },
  { name: 'Payroll', href: '/dashboard/finance/payroll', category: 'Finance' },
  { name: 'Analytics Reports', href: '/dashboard/reports/analytics', category: 'Reports' },
  { name: 'System Settings', href: '/dashboard/settings', category: 'System' },
  { name: 'My Profile', href: '/dashboard/profile', category: 'User' },
];
