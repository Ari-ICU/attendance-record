// src/mocks/mockData.ts
import { Employee } from '@/types/employee.types';
import { AttendanceRecord } from '@/types/attendance.types';
import { Department } from '@/types/department.types';
import { format, subDays } from 'date-fns';

export const MOCK_DEPARTMENTS: Department[] = [
    {
        _id: 'dept_001',
        name: 'Engineering & IT',
        code: 'ENG-IT',
        description: 'Software development, infrastructure, and technical support teams',
        headOfDepartment: { _id: 'emp_001', firstName: 'Thoeurn', lastName: 'Ratha' },
        memberCount: 24,
        isActive: true,
        createdAt: '2025-01-10T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'dept_002',
        name: 'Academic Core',
        code: 'ACAD',
        description: 'Curriculum instruction, university lecturers, and student administration',
        headOfDepartment: { _id: 'emp_002', firstName: 'Sarah', lastName: 'Jenkins' },
        memberCount: 48,
        isActive: true,
        createdAt: '2025-01-10T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'dept_003',
        name: 'Human Resources',
        code: 'HR-OPS',
        description: 'Talent recruitment, workforce attendance governance, and employee wellness',
        headOfDepartment: { _id: 'emp_003', firstName: 'Alex', lastName: 'Vannak' },
        memberCount: 12,
        isActive: true,
        createdAt: '2025-01-10T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
        _id: 'dept_004',
        name: 'Operations & Facilities',
        code: 'OPS-FAC',
        description: 'Campus management, access security, and logistical operations',
        headOfDepartment: { _id: 'emp_004', firstName: 'David', lastName: 'Miller' },
        memberCount: 18,
        isActive: true,
        createdAt: '2025-01-10T08:00:00.000Z',
        updatedAt: '2026-09-01T08:00:00.000Z',
    },
];

export const MOCK_EMPLOYEES: Employee[] = [
    {
        _id: 'emp_001',
        firstName: 'Thoeurn',
        lastName: 'Ratha',
        fullName: 'Thoeurn Ratha',
        email: 'ratha@staffflow.io',
        phone: '+855 12 345 678',
        position: 'System Administrator',
        department: 'Engineering & IT',
        type: 'employee',
        dateOfJoining: '2024-03-15',
        photoUrl: null,
        faceDescriptor: [0.12, 0.45, 0.88],
        faceVerificationEnabled: true,
        baseSalary: 2800,
        hourlyRate: 25,
        currency: 'USD',
        isActive: true,
        createdAt: '2024-03-15T08:00:00.000Z',
        updatedAt: '2026-09-10T08:00:00.000Z',
    },
    {
        _id: 'emp_002',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        fullName: 'Sarah Jenkins',
        email: 'sarah.j@staffflow.io',
        phone: '+855 17 889 001',
        position: 'Senior Lecturer',
        department: 'Academic Core',
        type: 'employee',
        dateOfJoining: '2023-08-01',
        photoUrl: null,
        faceDescriptor: [0.22, 0.55, 0.77],
        faceVerificationEnabled: true,
        baseSalary: 2400,
        hourlyRate: 20,
        currency: 'USD',
        isActive: true,
        createdAt: '2023-08-01T08:00:00.000Z',
        updatedAt: '2026-09-10T08:00:00.000Z',
    },
    {
        _id: 'emp_003',
        firstName: 'Alex',
        lastName: 'Vannak',
        fullName: 'Alex Vannak',
        email: 'alex.v@staffflow.io',
        phone: '+855 92 112 334',
        position: 'HR Director',
        department: 'Human Resources',
        type: 'employee',
        dateOfJoining: '2024-01-10',
        photoUrl: null,
        faceDescriptor: [0.33, 0.44, 0.55],
        faceVerificationEnabled: true,
        baseSalary: 2100,
        hourlyRate: 18,
        currency: 'USD',
        isActive: true,
        createdAt: '2024-01-10T08:00:00.000Z',
        updatedAt: '2026-09-10T08:00:00.000Z',
    },
    {
        _id: 'emp_004',
        firstName: 'David',
        lastName: 'Miller',
        fullName: 'David Miller',
        email: 'david.m@staffflow.io',
        phone: '+855 88 776 554',
        position: 'Operations Manager',
        department: 'Operations & Facilities',
        type: 'employee',
        dateOfJoining: '2024-06-01',
        photoUrl: null,
        faceDescriptor: [0.66, 0.11, 0.99],
        faceVerificationEnabled: true,
        baseSalary: 1900,
        hourlyRate: 16,
        currency: 'USD',
        isActive: true,
        createdAt: '2024-06-01T08:00:00.000Z',
        updatedAt: '2026-09-10T08:00:00.000Z',
    },
    {
        _id: 'stu_001',
        firstName: 'Chann',
        lastName: 'Dara',
        fullName: 'Chann Dara',
        email: 'chann.dara@student.edu',
        phone: '+855 10 998 877',
        position: 'Computer Science Yr-3',
        department: 'Academic Core',
        type: 'student',
        dateOfJoining: '2023-10-01',
        photoUrl: null,
        faceDescriptor: [0.15, 0.35, 0.65],
        faceVerificationEnabled: true,
        baseSalary: 0,
        hourlyRate: 0,
        currency: 'USD',
        isActive: true,
        createdAt: '2023-10-01T08:00:00.000Z',
        updatedAt: '2026-09-10T08:00:00.000Z',
    },
    {
        _id: 'stu_002',
        firstName: 'Sophea',
        lastName: 'Kosal',
        fullName: 'Sophea Kosal',
        email: 'sophea.k@student.edu',
        phone: '+855 15 443 221',
        position: 'Information Tech Yr-2',
        department: 'Academic Core',
        type: 'student',
        dateOfJoining: '2024-10-01',
        photoUrl: null,
        faceDescriptor: [],
        faceVerificationEnabled: false,
        baseSalary: 0,
        hourlyRate: 0,
        currency: 'USD',
        isActive: true,
        createdAt: '2024-10-01T08:00:00.000Z',
        updatedAt: '2026-09-10T08:00:00.000Z',
    },
];

const todayKey = format(new Date(), 'yyyy-MM-dd');
const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');

export const MOCK_ATTENDANCE_RECORDS: AttendanceRecord[] = [
    {
        _id: 'att_001',
        employeeId: MOCK_EMPLOYEES[0],
        date: todayKey,
        checkIn: {
            time: `${todayKey}T07:54:12.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Main Campus Gate A' },
            method: 'Face Biometrics',
            ipAddress: '192.168.1.101',
        },
        checkOut: {
            time: `${todayKey}T17:02:45.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Main Campus Gate A' },
            method: 'Face Biometrics',
            totalHours: 9.1,
        },
        totalHours: 9.1,
        status: 'present',
        createdAt: `${todayKey}T07:54:12.000Z`,
        updatedAt: `${todayKey}T17:02:45.000Z`,
    },
    {
        _id: 'att_002',
        employeeId: MOCK_EMPLOYEES[1],
        date: todayKey,
        checkIn: {
            time: `${todayKey}T08:02:30.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Academic Wing B' },
            method: 'QR Code',
            ipAddress: '192.168.1.105',
        },
        status: 'present',
        createdAt: `${todayKey}T08:02:30.000Z`,
        updatedAt: `${todayKey}T08:02:30.000Z`,
    },
    {
        _id: 'att_003',
        employeeId: MOCK_EMPLOYEES[2],
        date: todayKey,
        checkIn: {
            time: `${todayKey}T08:24:10.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Admin Block 1' },
            method: 'Manual Check-in',
            ipAddress: '192.168.1.110',
        },
        status: 'late',
        createdAt: `${todayKey}T08:24:10.000Z`,
        updatedAt: `${todayKey}T08:24:10.000Z`,
    },
    {
        _id: 'att_004',
        employeeId: MOCK_EMPLOYEES[4],
        date: todayKey,
        checkIn: {
            time: `${todayKey}T07:48:50.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Student Hall C' },
            method: 'Face Biometrics',
            ipAddress: '192.168.1.120',
        },
        status: 'present',
        createdAt: `${todayKey}T07:48:50.000Z`,
        updatedAt: `${todayKey}T07:48:50.000Z`,
    },
    {
        _id: 'att_005',
        employeeId: MOCK_EMPLOYEES[3],
        date: yesterdayKey,
        checkIn: {
            time: `${yesterdayKey}T08:00:00.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Main Gate' },
            method: 'Face Biometrics',
        },
        checkOut: {
            time: `${yesterdayKey}T17:00:00.000Z`,
            location: { latitude: 11.5564, longitude: 104.9282, address: 'Main Gate' },
            method: 'Face Biometrics',
            totalHours: 9.0,
        },
        totalHours: 9.0,
        status: 'present',
        createdAt: `${yesterdayKey}T08:00:00.000Z`,
        updatedAt: `${yesterdayKey}T17:00:00.000Z`,
    }
];

export const MOCK_REPORT_ANALYTICS = {
    summary: {
        totalWorkforce: 102,
        workforceActive: 94,
        avgCompliance: 96.8,
        systemEfficiency: 98.2,
        onTimeRate: 94.5,
        lateIncidents: 4,
        absentIncidents: 2,
    },
    departmentBreakdown: [
        { name: 'Engineering & IT', total: 24, present: 23, rate: 95.8 },
        { name: 'Academic Core', total: 48, present: 46, rate: 95.8 },
        { name: 'Human Resources', total: 12, present: 12, rate: 100 },
        { name: 'Operations & Facilities', total: 18, present: 17, rate: 94.4 },
    ],
    timeline: [
        { day: 'Mon', onTime: 92, late: 6, absent: 2 },
        { day: 'Tue', onTime: 95, late: 4, absent: 1 },
        { day: 'Wed', onTime: 94, late: 5, absent: 1 },
        { day: 'Thu', onTime: 96, late: 3, absent: 1 },
        { day: 'Fri', onTime: 91, late: 7, absent: 2 },
    ]
};

export interface PositionItem {
    id: string;
    title: string;
    department: string;
    employeeCount: number;
    description: string;
    level: string;
}

export const MOCK_POSITIONS: PositionItem[] = [
    { id: 'pos_001', title: 'System Administrator', department: 'Engineering & IT', employeeCount: 2, description: 'Manages server infrastructure, cloud networks, and biometric IoT endpoints.', level: 'Senior' },
    { id: 'pos_002', title: 'Senior Lecturer', department: 'Academic Core', employeeCount: 14, description: 'Lead instructors for university courses, curriculum development, and student grading.', level: 'Executive' },
    { id: 'pos_003', title: 'HR Director', department: 'Human Resources', employeeCount: 1, description: 'Workforce governance, hiring pipeline, payroll coordination, and staff wellness.', level: 'Executive' },
    { id: 'pos_004', title: 'Operations Manager', department: 'Operations & Facilities', employeeCount: 3, description: 'Campus logistics, security operations, gate check-in monitors, and facilities.', level: 'Mid-Level' },
    { id: 'pos_005', title: 'Lecturer / Teaching Assistant', department: 'Academic Core', employeeCount: 22, description: 'Classroom teaching assistants, lab proctors, and student attendance monitors.', level: 'Associate' },
    { id: 'pos_006', title: 'Frontend Engineer', department: 'Engineering & IT', employeeCount: 5, description: 'Web application development, dashboard UI design, and portal maintenance.', level: 'Mid-Level' },
];

export interface LeaveRequestItem {
    id: string;
    employeeName: string;
    department: string;
    type: 'Annual Leave' | 'Sick Leave' | 'Maternity / Paternity' | 'Casual Leave' | 'Emergency';
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: 'approved' | 'pending' | 'rejected';
}

export const MOCK_LEAVE_REQUESTS: LeaveRequestItem[] = [
    { id: 'lv_001', employeeName: 'Thoeurn Ratha', department: 'Engineering & IT', type: 'Annual Leave', startDate: '2026-09-15', endDate: '2026-09-18', days: 4, reason: 'Annual family recharge and personal trip.', status: 'approved' },
    { id: 'lv_002', employeeName: 'Sarah Jenkins', department: 'Academic Core', type: 'Sick Leave', startDate: '2026-09-12', endDate: '2026-09-13', days: 2, reason: 'Medical recovery & doctor appointment.', status: 'pending' },
    { id: 'lv_003', employeeName: 'David Miller', department: 'Operations & Facilities', type: 'Casual Leave', startDate: '2026-09-20', endDate: '2026-09-20', days: 1, reason: 'Personal errands and vehicle registration.', status: 'pending' },
    { id: 'lv_004', employeeName: 'Alex Vannak', department: 'Human Resources', type: 'Emergency', startDate: '2026-09-08', endDate: '2026-09-09', days: 2, reason: 'Urgent family emergency.', status: 'approved' },
];

export interface OvertimeItem {
    id: string;
    employeeName: string;
    department: string;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    project: string;
    reason: string;
    status: 'approved' | 'pending' | 'rejected';
}

export const MOCK_OVERTIME: OvertimeItem[] = [
    { id: 'ot_001', employeeName: 'Thoeurn Ratha', department: 'Engineering & IT', date: '2026-09-10', startTime: '17:30', endTime: '20:30', hours: 3.0, project: 'Biometric Gateway Upgrade', reason: 'Campus IoT sensor firmware sync and database patch.', status: 'approved' },
    { id: 'ot_002', employeeName: 'Sarah Jenkins', department: 'Academic Core', date: '2026-09-09', startTime: '17:00', endTime: '19:00', hours: 2.0, project: 'Mid-term Exam Prep', reason: 'Curriculum exam grading and student submission review.', status: 'pending' },
    { id: 'ot_003', employeeName: 'David Miller', department: 'Operations & Facilities', date: '2026-09-08', startTime: '18:00', endTime: '21:30', hours: 3.5, project: 'Campus Security Audit', reason: 'Night gate check-in turnstile diagnostic.', status: 'approved' },
];

