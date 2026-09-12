const mongoose = require('mongoose');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const Department = require('../models/department.model');
const Attendance = require('../models/attendance.model');
const Payroll = require('../models/payroll.model');
const Leave = require('../models/leave.model');
const Overtime = require('../models/overtime.model');
const Position = require('../models/position.model');
const SystemSetting = require('../models/systemSetting.model');
const BusinessBalance = require('../models/businessBalance.model');
const Token = require('../models/token.model');
const crypto = require('crypto');

const seedMockData = async () => {
    try {
        console.log('🌱 Checking and seeding mock data in MongoDB...');

        // 1. Seed System Users & Admin
        const adminEmail = 'admin@system.com';
        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = new User({
                username: 'admin',
                email: adminEmail,
                password: 'SecurePassword123!',
                firstName: 'System',
                lastName: 'Administrator',
                role: 'admin',
                department: 'Engineering & IT',
                position: 'System Administrator',
                isLocked: false
            });
            await adminUser.save();
            console.log('✅ Admin user created (admin@system.com / SecurePassword123!)');

            const token = new Token({
                userId: adminUser._id,
                token: crypto.randomBytes(32).toString('hex'),
                type: 'refresh',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
            await token.save();
        }

        const systemUsersData = [
            { username: 'admin.ratha', email: 'ratha@staffflow.io', role: 'admin', firstName: 'Thoeurn', lastName: 'Ratha', department: 'Engineering & IT', position: 'System Administrator' },
            { username: 'sarah.ux', email: 'sarah.j@staffflow.io', role: 'manager', firstName: 'Sarah', lastName: 'Jenkins', department: 'Product & Design', position: 'Lead UX Architect' },
            { username: 'alex.hr', email: 'alex.v@staffflow.io', role: 'manager', firstName: 'Alex', lastName: 'Vannak', department: 'Human Resources', position: 'HR Director' },
            { username: 'david.ops', email: 'david.m@staffflow.io', role: 'manager', firstName: 'David', lastName: 'Miller', department: 'Operations & Facilities', position: 'Operations Manager' },
            { username: 'chann.dara', email: 'chann.dara@staffflow.io', role: 'employee', firstName: 'Chann', lastName: 'Dara', department: 'Engineering & IT', position: 'Senior Backend Engineer' },
            { username: 'sophea.k', email: 'sophea.k@staffflow.io', role: 'employee', firstName: 'Sophea', lastName: 'Kosal', department: 'Product & Design', position: 'Product Designer' },
        ];

        for (const u of systemUsersData) {
            const existing = await User.findOne({ email: u.email });
            if (!existing) {
                const newUser = new User({
                    ...u,
                    password: 'SecurePassword123!',
                    isLocked: false
                });
                await newUser.save();
            }
        }
        console.log('✅ System users synchronized');

        // 2. Seed Departments
        const departmentsData = [
            {
                name: 'Engineering & IT',
                code: 'ENG-IT',
                description: 'Software development, infrastructure, and technical support teams',
                headOfDepartment: { firstName: 'Thoeurn', lastName: 'Ratha' },
                isActive: true
            },
            {
                name: 'Product & Design',
                code: 'PROD-DES',
                description: 'Product strategy, UI/UX design, customer research, and brand architecture',
                headOfDepartment: { firstName: 'Sarah', lastName: 'Jenkins' },
                isActive: true
            },
            {
                name: 'Human Resources',
                code: 'HR-OPS',
                description: 'Talent recruitment, workforce attendance governance, and employee wellness',
                headOfDepartment: { firstName: 'Alex', lastName: 'Vannak' },
                isActive: true
            },
            {
                name: 'Operations & Facilities',
                code: 'OPS-FAC',
                description: 'Corporate office management, access security, and logistical operations',
                headOfDepartment: { firstName: 'David', lastName: 'Miller' },
                isActive: true
            }
        ];

        for (const dept of departmentsData) {
            const existing = await Department.findOne({ name: dept.name });
            if (!existing) {
                await Department.create(dept);
            }
        }
        console.log('✅ Departments synchronized');

        // 3. Seed Employees
        const employeesData = [
            {
                firstName: 'Thoeurn',
                lastName: 'Ratha',
                email: 'ratha@staffflow.io',
                phone: '+855 12 345 678',
                position: 'System Administrator',
                department: 'Engineering & IT',
                type: 'employee',
                dateOfJoining: new Date('2024-03-15'),
                baseSalary: 2800,
                hourlyRate: 25,
                currency: 'USD',
                faceDescriptor: [0.12, 0.45, 0.88],
                faceVerificationEnabled: true,
                bankDetails: { bankName: 'ABA Bank', accountName: 'THOEURN RATHA', accountNumber: '001 234 567' },
                isActive: true
            },
            {
                firstName: 'Sarah',
                lastName: 'Jenkins',
                email: 'sarah.j@staffflow.io',
                phone: '+855 17 889 001',
                position: 'Lead UX Architect',
                department: 'Product & Design',
                type: 'employee',
                dateOfJoining: new Date('2023-08-01'),
                baseSalary: 2400,
                hourlyRate: 20,
                currency: 'USD',
                faceDescriptor: [0.22, 0.55, 0.77],
                faceVerificationEnabled: true,
                bankDetails: { bankName: 'Canadia Bank', accountName: 'SARAH JENKINS', accountNumber: '102 987 654' },
                isActive: true
            },
            {
                firstName: 'Alex',
                lastName: 'Vannak',
                email: 'alex.v@staffflow.io',
                phone: '+855 92 112 334',
                position: 'HR Director',
                department: 'Human Resources',
                type: 'employee',
                dateOfJoining: new Date('2024-01-10'),
                baseSalary: 2100,
                hourlyRate: 18,
                currency: 'USD',
                faceDescriptor: [0.33, 0.44, 0.55],
                faceVerificationEnabled: true,
                bankDetails: { bankName: 'Wing Bank', accountName: 'ALEX VANNAK', accountNumber: '998 112 334' },
                isActive: true
            },
            {
                firstName: 'David',
                lastName: 'Miller',
                email: 'david.m@staffflow.io',
                phone: '+855 88 776 554',
                position: 'Operations Manager',
                department: 'Operations & Facilities',
                type: 'employee',
                dateOfJoining: new Date('2024-06-01'),
                baseSalary: 1900,
                hourlyRate: 16,
                currency: 'USD',
                faceDescriptor: [0.66, 0.11, 0.99],
                faceVerificationEnabled: true,
                bankDetails: { bankName: 'ABA Bank', accountName: 'DAVID MILLER', accountNumber: '003 445 667' },
                isActive: true
            },
            {
                firstName: 'Chann',
                lastName: 'Dara',
                email: 'chann.dara@staffflow.io',
                phone: '+855 10 998 877',
                position: 'Senior Backend Engineer',
                department: 'Engineering & IT',
                type: 'employee',
                dateOfJoining: new Date('2023-10-01'),
                baseSalary: 2300,
                hourlyRate: 20,
                currency: 'USD',
                faceDescriptor: [0.15, 0.35, 0.65],
                faceVerificationEnabled: true,
                bankDetails: { bankName: 'ABA Bank', accountName: 'CHANN DARA', accountNumber: '005 889 112' },
                isActive: true
            },
            {
                firstName: 'Sophea',
                lastName: 'Kosal',
                email: 'sophea.k@staffflow.io',
                phone: '+855 15 443 221',
                position: 'Product Designer',
                department: 'Product & Design',
                type: 'employee',
                dateOfJoining: new Date('2024-10-01'),
                baseSalary: 1800,
                hourlyRate: 15,
                currency: 'USD',
                faceDescriptor: [],
                faceVerificationEnabled: false,
                bankDetails: { bankName: 'Canadia Bank', accountName: 'SOPHEA KOSAL', accountNumber: '109 443 221' },
                isActive: true
            }
        ];

        const employeeDocs = [];
        for (const emp of employeesData) {
            let doc = await Employee.findOne({ email: emp.email });
            if (!doc) {
                doc = await Employee.create(emp);
            }
            employeeDocs.push(doc);
        }
        console.log(`✅ ${employeeDocs.length} employees synchronized`);

        // Update departments head reference
        const engDept = await Department.findOne({ name: 'Engineering & IT' });
        if (engDept && employeeDocs[0]) {
            engDept.head = employeeDocs[0]._id;
            engDept.headOfDepartment = { _id: employeeDocs[0]._id.toString(), firstName: employeeDocs[0].firstName, lastName: employeeDocs[0].lastName };
            await engDept.save();
        }

        // 4. Seed Positions
        const positionsData = [
            { title: 'System Administrator', department: 'Engineering & IT', employeeCount: 2, description: 'Manages server infrastructure, cloud networks, and biometric IoT endpoints.', level: 'Senior' },
            { title: 'Lead UX Architect', department: 'Product & Design', employeeCount: 6, description: 'Design system governance, UX flow architecture, and user research coordination.', level: 'Executive' },
            { title: 'HR Director', department: 'Human Resources', employeeCount: 1, description: 'Workforce governance, hiring pipeline, payroll coordination, and staff wellness.', level: 'Executive' },
            { title: 'Operations Manager', department: 'Operations & Facilities', employeeCount: 3, description: 'Campus logistics, security operations, gate check-in monitors, and facilities.', level: 'Mid-Level' },
            { title: 'Senior Backend Engineer', department: 'Engineering & IT', employeeCount: 8, description: 'Microservices architecture, API integrations, and database scalability.', level: 'Senior' },
            { title: 'Frontend Engineer', department: 'Engineering & IT', employeeCount: 5, description: 'Web application development, dashboard UI design, and portal maintenance.', level: 'Mid-Level' },
        ];

        for (const pos of positionsData) {
            const existing = await Position.findOne({ title: pos.title, department: pos.department });
            if (!existing) {
                await Position.create(pos);
            }
        }
        console.log('✅ Positions synchronized');

        // 5. Seed Attendance Records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        const attendanceCount = await Attendance.countDocuments();
        if (attendanceCount === 0 && employeeDocs.length >= 4) {
            const todayCheckIn1 = new Date(today);
            todayCheckIn1.setHours(7, 54, 12);
            const todayCheckOut1 = new Date(today);
            todayCheckOut1.setHours(17, 2, 45);

            const todayCheckIn2 = new Date(today);
            todayCheckIn2.setHours(8, 2, 30);

            const todayCheckIn3 = new Date(today);
            todayCheckIn3.setHours(8, 24, 10);

            const todayCheckIn4 = new Date(today);
            todayCheckIn4.setHours(7, 48, 50);

            const yestCheckIn5 = new Date(yesterday);
            yestCheckIn5.setHours(8, 0, 0);
            const yestCheckOut5 = new Date(yesterday);
            yestCheckOut5.setHours(17, 0, 0);

            const sampleAttendances = [
                {
                    employeeId: employeeDocs[0]._id,
                    date: today,
                    checkIn: {
                        time: todayCheckIn1,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'HQ Building Gate A' },
                        method: 'biometric',
                        ipAddress: '192.168.1.101'
                    },
                    checkOut: {
                        time: todayCheckOut1,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'HQ Building Gate A' },
                        method: 'biometric'
                    },
                    totalHours: 9.1,
                    status: 'present',
                    createdBy: adminUser._id
                },
                {
                    employeeId: employeeDocs[1]._id,
                    date: today,
                    checkIn: {
                        time: todayCheckIn2,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'Design Studio Wing B' },
                        method: 'qr_code',
                        ipAddress: '192.168.1.105'
                    },
                    status: 'present',
                    createdBy: adminUser._id
                },
                {
                    employeeId: employeeDocs[2]._id,
                    date: today,
                    checkIn: {
                        time: todayCheckIn3,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'Corporate Tower Block 1' },
                        method: 'manual',
                        ipAddress: '192.168.1.110'
                    },
                    status: 'late',
                    createdBy: adminUser._id
                },
                {
                    employeeId: employeeDocs[4]._id,
                    date: today,
                    checkIn: {
                        time: todayCheckIn4,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'Engineering Lab 4' },
                        method: 'biometric',
                        ipAddress: '192.168.1.120'
                    },
                    status: 'present',
                    createdBy: adminUser._id
                },
                {
                    employeeId: employeeDocs[3]._id,
                    date: yesterday,
                    checkIn: {
                        time: yestCheckIn5,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'Main Gate' },
                        method: 'biometric'
                    },
                    checkOut: {
                        time: yestCheckOut5,
                        location: { latitude: 11.5564, longitude: 104.9282, address: 'Main Gate' },
                        method: 'biometric'
                    },
                    totalHours: 9.0,
                    status: 'present',
                    createdBy: adminUser._id
                }
            ];

            await Attendance.insertMany(sampleAttendances);
            console.log('✅ Sample attendance records seeded');
        }

        // 6. Seed Vault Business Balance & Payroll
        let balanceDoc = await BusinessBalance.findOne();
        if (!balanceDoc) {
            await BusinessBalance.create({
                totalBudget: 150000,
                accountName: 'STAFFFLOW CORP VAULT',
                accountNumber: '000 888 999',
                notes: 'Primary Payroll Reserve Vault'
            });
            console.log('✅ Business balance vault created ($150,000)');
        }

        const payrollCount = await Payroll.countDocuments();
        if (payrollCount === 0 && employeeDocs.length >= 6) {
            const payslipsSeed = [
                {
                    payrollId: 'pr_2026_09',
                    employeeId: employeeDocs[0]._id,
                    month: 'September',
                    monthNumber: 9,
                    year: 2026,
                    payPeriodStart: '2026-09-01',
                    payPeriodEnd: '2026-09-30',
                    paymentDate: '2026-09-30',
                    earnings: {
                        baseSalary: 2800,
                        hourlyRate: 25,
                        regularHours: 160,
                        regularPay: 2800,
                        overtimeHours: 6.5,
                        overtimeRate: 37.5,
                        overtimePay: 243.75,
                        bonuses: 150,
                        allowances: 100,
                        grossEarnings: 3293.75,
                    },
                    deductions: {
                        unpaidLeaveDays: 0,
                        leaveDeductions: 0,
                        taxWithholding: 164.69,
                        socialSecurity: 65.88,
                        otherDeductions: 0,
                        totalDeductions: 230.57,
                    },
                    netPay: 3063.18,
                    baseAmount: 2800,
                    netAmount: 3063.18,
                    status: 'paid',
                    paymentMethod: 'Direct Deposit / Bank Wire',
                    bankDetails: { bankName: 'ABA Bank', accountName: 'THOEURN RATHA', accountNumber: '001 234 567' },
                    bankSnapshot: { bankName: 'ABA Bank', accountName: 'THOEURN RATHA', accountNumber: '001 234 567' },
                    complianceScore: 98,
                    createdBy: adminUser._id
                },
                {
                    payrollId: 'pr_2026_09',
                    employeeId: employeeDocs[1]._id,
                    month: 'September',
                    monthNumber: 9,
                    year: 2026,
                    payPeriodStart: '2026-09-01',
                    payPeriodEnd: '2026-09-30',
                    paymentDate: '2026-09-30',
                    earnings: {
                        baseSalary: 2400,
                        hourlyRate: 20,
                        regularHours: 160,
                        regularPay: 2400,
                        overtimeHours: 4.0,
                        overtimeRate: 30,
                        overtimePay: 120,
                        bonuses: 100,
                        allowances: 80,
                        grossEarnings: 2700,
                    },
                    deductions: {
                        unpaidLeaveDays: 0,
                        leaveDeductions: 0,
                        taxWithholding: 135.0,
                        socialSecurity: 54.0,
                        otherDeductions: 0,
                        totalDeductions: 189.0,
                    },
                    netPay: 2511.0,
                    baseAmount: 2400,
                    netAmount: 2511.0,
                    status: 'paid',
                    paymentMethod: 'Direct Deposit / Bank Wire',
                    bankDetails: { bankName: 'Canadia Bank', accountName: 'SARAH JENKINS', accountNumber: '102 987 654' },
                    bankSnapshot: { bankName: 'Canadia Bank', accountName: 'SARAH JENKINS', accountNumber: '102 987 654' },
                    complianceScore: 96,
                    createdBy: adminUser._id
                },
                {
                    payrollId: 'pr_2026_09',
                    employeeId: employeeDocs[2]._id,
                    month: 'September',
                    monthNumber: 9,
                    year: 2026,
                    payPeriodStart: '2026-09-01',
                    payPeriodEnd: '2026-09-30',
                    paymentDate: '2026-09-30',
                    earnings: {
                        baseSalary: 2100,
                        hourlyRate: 18,
                        regularHours: 160,
                        regularPay: 2100,
                        overtimeHours: 0,
                        overtimeRate: 27,
                        overtimePay: 0,
                        bonuses: 50,
                        allowances: 50,
                        grossEarnings: 2200,
                    },
                    deductions: {
                        unpaidLeaveDays: 1,
                        leaveDeductions: 95.45,
                        taxWithholding: 105.23,
                        socialSecurity: 42.09,
                        otherDeductions: 0,
                        totalDeductions: 242.77,
                    },
                    netPay: 1957.23,
                    baseAmount: 2100,
                    netAmount: 1957.23,
                    status: 'paid',
                    paymentMethod: 'Direct Deposit / Bank Wire',
                    bankDetails: { bankName: 'Wing Bank', accountName: 'ALEX VANNAK', accountNumber: '998 112 334' },
                    bankSnapshot: { bankName: 'Wing Bank', accountName: 'ALEX VANNAK', accountNumber: '998 112 334' },
                    complianceScore: 92,
                    createdBy: adminUser._id
                },
                {
                    payrollId: 'pr_2026_09',
                    employeeId: employeeDocs[3]._id,
                    month: 'September',
                    monthNumber: 9,
                    year: 2026,
                    payPeriodStart: '2026-09-01',
                    payPeriodEnd: '2026-09-30',
                    paymentDate: '2026-09-30',
                    earnings: {
                        baseSalary: 1900,
                        hourlyRate: 16,
                        regularHours: 160,
                        regularPay: 1900,
                        overtimeHours: 8.0,
                        overtimeRate: 24,
                        overtimePay: 192,
                        bonuses: 80,
                        allowances: 60,
                        grossEarnings: 2232,
                    },
                    deductions: {
                        unpaidLeaveDays: 0,
                        leaveDeductions: 0,
                        taxWithholding: 111.6,
                        socialSecurity: 44.64,
                        otherDeductions: 0,
                        totalDeductions: 156.24,
                    },
                    netPay: 2075.76,
                    baseAmount: 1900,
                    netAmount: 2075.76,
                    status: 'paid',
                    paymentMethod: 'Direct Deposit / Bank Wire',
                    bankDetails: { bankName: 'ABA Bank', accountName: 'DAVID MILLER', accountNumber: '003 445 667' },
                    bankSnapshot: { bankName: 'ABA Bank', accountName: 'DAVID MILLER', accountNumber: '003 445 667' },
                    complianceScore: 95,
                    createdBy: adminUser._id
                },
                {
                    payrollId: 'pr_2026_09',
                    employeeId: employeeDocs[4]._id,
                    month: 'September',
                    monthNumber: 9,
                    year: 2026,
                    payPeriodStart: '2026-09-01',
                    payPeriodEnd: '2026-09-30',
                    paymentDate: '2026-09-30',
                    earnings: {
                        baseSalary: 2300,
                        hourlyRate: 20,
                        regularHours: 160,
                        regularPay: 2300,
                        overtimeHours: 10.0,
                        overtimeRate: 30,
                        overtimePay: 300,
                        bonuses: 120,
                        allowances: 80,
                        grossEarnings: 2800,
                    },
                    deductions: {
                        unpaidLeaveDays: 0,
                        leaveDeductions: 0,
                        taxWithholding: 140.0,
                        socialSecurity: 56.0,
                        otherDeductions: 0,
                        totalDeductions: 196.0,
                    },
                    netPay: 2604.0,
                    baseAmount: 2300,
                    netAmount: 2604.0,
                    status: 'pending',
                    paymentMethod: 'Direct Deposit / Bank Wire',
                    bankDetails: { bankName: 'ABA Bank', accountName: 'CHANN DARA', accountNumber: '005 889 112' },
                    bankSnapshot: { bankName: 'ABA Bank', accountName: 'CHANN DARA', accountNumber: '005 889 112' },
                    complianceScore: 97,
                    createdBy: adminUser._id
                },
                {
                    payrollId: 'pr_2026_09',
                    employeeId: employeeDocs[5]._id,
                    month: 'September',
                    monthNumber: 9,
                    year: 2026,
                    payPeriodStart: '2026-09-01',
                    payPeriodEnd: '2026-09-30',
                    paymentDate: '2026-09-30',
                    earnings: {
                        baseSalary: 1800,
                        hourlyRate: 15,
                        regularHours: 160,
                        regularPay: 1800,
                        overtimeHours: 2.0,
                        overtimeRate: 22.5,
                        overtimePay: 45,
                        bonuses: 50,
                        allowances: 50,
                        grossEarnings: 1945,
                    },
                    deductions: {
                        unpaidLeaveDays: 0,
                        leaveDeductions: 0,
                        taxWithholding: 97.25,
                        socialSecurity: 38.9,
                        otherDeductions: 0,
                        totalDeductions: 136.15,
                    },
                    netPay: 1808.85,
                    baseAmount: 1800,
                    netAmount: 1808.85,
                    status: 'pending',
                    paymentMethod: 'Direct Deposit / Bank Wire',
                    bankDetails: { bankName: 'Canadia Bank', accountName: 'SOPHEA KOSAL', accountNumber: '109 443 221' },
                    bankSnapshot: { bankName: 'Canadia Bank', accountName: 'SOPHEA KOSAL', accountNumber: '109 443 221' },
                    complianceScore: 94,
                    createdBy: adminUser._id
                }
            ];

            await Payroll.insertMany(payslipsSeed);
            console.log('✅ September 2026 Payroll & Payslips seeded');
        }

        // 7. Seed Leaves
        const leaveCount = await Leave.countDocuments();
        if (leaveCount === 0 && employeeDocs.length >= 4) {
            const sampleLeaves = [
                { employeeId: employeeDocs[0]._id, leaveType: 'annual', startDate: new Date('2026-09-15'), endDate: new Date('2026-09-18'), totalDays: 4, reason: 'Annual family recharge and personal trip.', status: 'approved', approvedBy: adminUser._id },
                { employeeId: employeeDocs[1]._id, leaveType: 'sick', startDate: new Date('2026-09-12'), endDate: new Date('2026-09-13'), totalDays: 2, reason: 'Medical recovery & doctor appointment.', status: 'pending' },
                { employeeId: employeeDocs[3]._id, leaveType: 'casual', startDate: new Date('2026-09-20'), endDate: new Date('2026-09-20'), totalDays: 1, reason: 'Personal errands and vehicle registration.', status: 'pending' },
                { employeeId: employeeDocs[2]._id, leaveType: 'other', startDate: new Date('2026-09-08'), endDate: new Date('2026-09-09'), totalDays: 2, reason: 'Urgent family emergency.', status: 'approved', approvedBy: adminUser._id },
            ];
            await Leave.insertMany(sampleLeaves);
            console.log('✅ Sample leave requests seeded');
        }

        // 8. Seed Overtime
        const overtimeCount = await Overtime.countDocuments();
        if (overtimeCount === 0 && employeeDocs.length >= 4) {
            const sampleOvertime = [
                { employeeId: employeeDocs[0]._id, date: new Date('2026-09-10'), hours: 3.0, reason: 'Biometric Gateway Upgrade: IoT sensor firmware sync and database patch.', status: 'approved', approvedBy: adminUser._id, hourlyRate: 37.5, totalAmount: 112.5 },
                { employeeId: employeeDocs[1]._id, date: new Date('2026-09-09'), hours: 2.0, reason: 'Design System Sprint: Component library release and UX review.', status: 'pending', hourlyRate: 30, totalAmount: 60 },
                { employeeId: employeeDocs[3]._id, date: new Date('2026-09-08'), hours: 3.5, reason: 'Corporate Security Audit: Night gate turnstile diagnostic.', status: 'approved', approvedBy: adminUser._id, hourlyRate: 24, totalAmount: 84 },
            ];
            await Overtime.insertMany(sampleOvertime);
            console.log('✅ Sample overtime records seeded');
        }

        // 9. Seed System Settings
        const settingsMap = {
            companyName: 'StaffFlow Enterprise Systems',
            workHours: { startTime: '08:00', endTime: '17:00', gracePeriod: 15, halfDayThreshold: 4 },
            geofence: { enabled: true, latitude: 11.5564, longitude: 104.9282, radius: 250, strictMode: false },
            notifications: { emailAlerts: true, lateCheckInNotice: true, systemHealth: true }
        };

        for (const [key, val] of Object.entries(settingsMap)) {
            const existing = await SystemSetting.findOne({ key });
            if (!existing) {
                await SystemSetting.create({ key, value: val });
            }
        }
        console.log('✅ System settings seeded');

        console.log('🚀 Backend mock database seeding complete!');
    } catch (error) {
        console.error('❌ Error during mock data seeding:', error);
    }
};

module.exports = { seedMockData };
