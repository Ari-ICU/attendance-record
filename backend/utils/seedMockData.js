const mongoose = require('mongoose');
const User = require('../models/user.model');
const Employee = require('../models/employee.model');
const Department = require('../models/department.model');
const Attendance = require('../models/attendance.model');
const Leave = require('../models/leave.model');
const Overtime = require('../models/overtime.model');
const Position = require('../models/position.model');
const SystemSetting = require('../models/systemSetting.model');
const Token = require('../models/token.model');
const { CalendarEvent, WorkShift, Holiday } = require('../models/calendar.model');
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
            {
                title: 'System Administrator',
                department: 'Engineering & IT',
                employeeCount: 2,
                level: 'Senior',
                description: 'Oversees the configuration, maintenance, and reliable operation of enterprise computer systems, servers, network infrastructure, and biometric gate hardware across all company facilities.',
                responsibilities: [
                    'Maintain and administer computer networks, Linux/Windows servers, and cloud computing environments.',
                    'Manage user accounts, IAM permissions, single sign-on (SSO), and biometric attendance terminals.',
                    'Perform daily system monitoring, verifying the integrity and availability of all server resources and log files.',
                    'Execute regular data backup operations and disaster recovery failover validation.',
                    'Apply OS patches and upgrades on a regular basis, and upgrade administrative tools and utilities.',
                    'Maintain network security policies, VPNs, firewalls, and endpoint protection compliance.'
                ],
                skills: ['Linux / UNIX', 'Network Security', 'Docker / Kubernetes', 'Active Directory / LDAP', 'Biometric Gate Protocols', 'Bash / Python Scripting', 'Disaster Recovery', 'Firewalls & VPN'],
                salaryRange: '$1,400 – $3,200 / mo',
                employmentType: 'Full-time / Permanent',
                experienceReq: '3 – 6 Years',
                workPolicy: 'On-site (Main Campus)',
                workingHours: '08:00 – 17:00 (Mon–Fri)'
            },
            {
                title: 'Lead UX Architect',
                department: 'Product & Design',
                employeeCount: 6,
                level: 'Executive',
                description: 'Champions the design vision, product usability, and user journey mapping across all enterprise products, ensuring intuitive interfaces and delightful user experiences.',
                responsibilities: [
                    'Lead user research, field usability testing, persona development, and journey mapping.',
                    'Design comprehensive design systems, high-fidelity interactive prototypes, and UX specifications.',
                    'Partner closely with Product Managers and Frontend Engineers to guide iterative design implementation.',
                    'Audit existing user workflows and formulate data-driven recommendations for UX simplification.',
                    'Facilitate design workshops and establish consistent design standards across all software suites.',
                    'Mentor junior and mid-level designers in UX best practices and user-centered design methodologies.'
                ],
                skills: ['Figma Mastery', 'Design Systems', 'Interactive Prototyping', 'User Research & Testing', 'Information Architecture', 'Design Tokens', 'HTML/CSS Awareness', 'Micro-interactions'],
                salaryRange: '$1,800 – $3,800 / mo',
                employmentType: 'Full-time / Permanent',
                experienceReq: '5+ Years',
                workPolicy: 'Hybrid (2 days on-site)',
                workingHours: '08:00 – 17:00 (Mon–Fri)'
            },
            {
                title: 'HR Director',
                department: 'Human Resources',
                employeeCount: 1,
                level: 'Executive',
                description: 'Leads the Human Resources department in developing and executing human resource strategy in support of the overall business plan and strategic direction of the organization.',
                responsibilities: [
                    'Develop comprehensive strategic recruiting, onboarding, and retention plans to meet human capital needs.',
                    'Establish and implement HR policies, employee performance evaluation systems, and compensation structures.',
                    'Oversee monthly payroll approval, employee benefits administration, and overtime compliance.',
                    'Manage workplace relations, conflict resolution, and employee satisfaction initiatives.',
                    'Ensure legal compliance with national labor laws and employment regulations.',
                    'Provide proactive executive leadership and counseling on human resource organizational topics.'
                ],
                skills: ['HR Strategy', 'Talent Acquisition', 'Labor Law Compliance', 'Payroll Administration', 'Performance Management', 'Conflict Mediation', 'Organizational Leadership', 'Executive Reporting'],
                salaryRange: '$2,000 – $4,500 / mo',
                employmentType: 'Full-time / Executive',
                experienceReq: '6+ Years',
                workPolicy: 'On-site / Flexible',
                workingHours: '08:00 – 17:00 (Mon–Fri)'
            },
            {
                title: 'Operations Manager',
                department: 'Operations & Facilities',
                employeeCount: 3,
                level: 'Mid-Level',
                description: 'Campus logistics, security operations, gate check-in monitors, and facilities management.',
                responsibilities: [
                    'Supervise physical attendance scanning kiosks, gate biometric hardware, and entrance checkpoints.',
                    'Oversee operational facilities management, security protocols, and shift scheduling.',
                    'Liaise with department leads to ensure optimal resource allocation and prompt incident resolution.'
                ],
                skills: ['Facility Management', 'Logistics Operations', 'Hardware Monitoring', 'Process Optimization', 'Incident Response', 'Team Leadership'],
                salaryRange: '$1,100 – $2,300 / mo',
                employmentType: 'Full-time / Permanent',
                experienceReq: '3 – 5 Years',
                workPolicy: 'On-site (Main Campus)',
                workingHours: '07:30 – 16:30 (Mon–Fri)'
            },
            {
                title: 'Senior Backend Engineer',
                department: 'Engineering & IT',
                employeeCount: 8,
                level: 'Senior',
                description: 'Microservices architecture, API integrations, real-time telemetry, and database scalability.',
                responsibilities: [
                    'Design and implement high-throughput Node.js microservices and database models.',
                    'Optimize MongoDB indexes, aggregation pipelines, and high-frequency scan queries.',
                    'Implement secure biometric face verification endpoints and token authentication pipelines.',
                    'Maintain CI/CD pipelines, containerized Docker deployments, and server health monitoring.'
                ],
                skills: ['Node.js / Express', 'MongoDB / Mongoose', 'REST & WebSocket APIs', 'Docker', 'JWT / Auth Security', 'System Architecture', 'Redis Caching'],
                salaryRange: '$1,600 – $3,400 / mo',
                employmentType: 'Full-time / Permanent',
                experienceReq: '4 – 7 Years',
                workPolicy: 'Hybrid (3 days on-site)',
                workingHours: '08:00 – 17:00 (Mon–Fri)'
            },
            {
                title: 'Frontend Engineer',
                department: 'Engineering & IT',
                employeeCount: 5,
                level: 'Mid-Level',
                description: 'Responsible for architecting, building, and maintaining high-performance, responsive web applications and dashboard user interfaces. Collaborates with product designers and backend engineers to translate complex workflows into seamless, pixel-perfect user experiences.',
                responsibilities: [
                    'Develop modern, reactive user interfaces using Next.js, React, and TypeScript.',
                    'Collaborate with backend teams to integrate RESTful endpoints, WebSockets, and real-time data feeds.',
                    'Build and maintain accessible, reusable design system components and UI design tokens.',
                    'Optimize frontend bundle sizes, Core Web Vitals, and runtime rendering performance.',
                    'Implement rigorous test coverage with automated unit, integration, and E2E browser tests.',
                    'Participate in code reviews, technical architectural planning, and developer experience enhancements.'
                ],
                skills: ['React / Next.js', 'TypeScript', 'Tailwind CSS', 'State Management', 'REST / GraphQL', 'Git & CI/CD', 'Figma / UI Design', 'Web Performance'],
                salaryRange: '$1,200 – $2,800 / mo',
                employmentType: 'Full-time / Permanent',
                experienceReq: '2 – 5 Years',
                workPolicy: 'Hybrid (3 days on-site)',
                workingHours: '08:00 – 17:00 (Mon–Fri)'
            },
        ];

        for (const pos of positionsData) {
            const existing = await Position.findOne({ title: pos.title, department: pos.department });
            if (!existing) {
                await Position.create(pos);
            } else {
                await Position.updateOne({ _id: existing._id }, { $set: pos });
            }
        }
        console.log('✅ Positions synchronized');

        // 5. Seed Attendance Records
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

        const attendanceCount = await Attendance.countDocuments();
        if (attendanceCount < 5 && employeeDocs.length >= 4) {
            await Attendance.deleteMany({});
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
            console.log('✅ Full sample attendance records seeded');
        }

        // 6. Seed Leaves
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
        // 10. Seed Calendar Events, Shifts & Holidays
        const eventCount = await CalendarEvent.countDocuments();
        if (eventCount === 0) {
            const todayStr = '2026-09-12';
            const sampleEvents = [
                { title: 'Morning Operations Sync', category: 'work', date: todayStr, startHour: 8, endHour: 8.75, location: 'Briefing Hall A', color: 'text-emerald-950', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500' },
                { title: 'Executive Attendance Review', category: 'meeting', date: todayStr, startHour: 9.5, endHour: 11, location: 'Conference Room 02', color: 'text-amber-950', bgColor: 'bg-amber-50', borderColor: 'border-amber-500' },
                { title: 'Roadmap & Shift Planning', category: 'personal', date: todayStr, startHour: 11.25, endHour: 13, location: 'Main Lab 04', color: 'text-blue-950', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
                { title: 'Lunch & Faculty Sync', category: 'personal', date: todayStr, startHour: 13.25, endHour: 14.25, location: 'Cafeteria Lounge', color: 'text-blue-950', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
                { title: 'Department Code Review & Audit', category: 'work', date: todayStr, startHour: 14.5, endHour: 16, location: 'Dev Hub', color: 'text-emerald-950', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500' },
                { title: 'Company Foundation Day', category: 'holiday', date: '2026-09-13', startHour: 0, endHour: 24, isAllDay: true, color: 'text-purple-950', bgColor: 'bg-purple-50', borderColor: 'border-purple-500' },
                { title: 'Midterm Assessment Session', category: 'special', date: '2026-09-14', startHour: 9, endHour: 12, location: 'Hall 301', color: 'text-rose-950', bgColor: 'bg-rose-50', borderColor: 'border-rose-500' }
            ];
            await CalendarEvent.insertMany(sampleEvents);
            console.log('✅ Calendar events seeded');
        }

        const shiftCount = await WorkShift.countDocuments();
        if (shiftCount === 0) {
            const sampleShifts = [
                { name: 'Regular Day Shift', type: 'morning', startTime: '08:00', endTime: '17:00', gracePeriod: 15, assignedDepts: ['Engineering & IT', 'Operations & Facilities', 'Human Resources'], assignedCount: 42, color: 'text-blue-900', bgColor: 'bg-blue-50' },
                { name: 'Afternoon & Lab Shift', type: 'afternoon', startTime: '13:00', endTime: '21:00', gracePeriod: 10, assignedDepts: ['Product & Design', 'Engineering & IT'], assignedCount: 18, color: 'text-amber-900', bgColor: 'bg-amber-50' },
                { name: 'Overnight Security & Facility', type: 'night', startTime: '21:00', endTime: '06:00', gracePeriod: 20, assignedDepts: ['Operations & Facilities'], assignedCount: 8, color: 'text-purple-900', bgColor: 'bg-purple-50' },
                { name: 'Faculty Flexible Roster', type: 'flexible', startTime: '09:00', endTime: '16:00', gracePeriod: 30, assignedDepts: ['Human Resources'], assignedCount: 24, color: 'text-emerald-900', bgColor: 'bg-emerald-50' }
            ];
            await WorkShift.insertMany(sampleShifts);
            console.log('✅ Work shifts seeded');
        }

        const holidayCount = await Holiday.countDocuments();
        if (holidayCount === 0) {
            const sampleHolidays = [
                { name: 'International New Year Day', date: '2026-01-01', type: 'national', status: 'paid' },
                { name: 'Victory over Genocide Day', date: '2026-01-07', type: 'national', status: 'paid' },
                { name: 'International Women’s Day', date: '2026-03-08', type: 'observance', status: 'paid' },
                { name: 'Khmer New Year Holiday', date: '2026-04-13', type: 'national', status: 'paid' },
                { name: 'King’s Birthday Commemoration', date: '2026-05-14', type: 'national', status: 'paid' },
                { name: 'Pchum Ben Festival', date: '2026-10-09', type: 'national', status: 'paid' },
                { name: 'Water & Moon Festival', date: '2026-11-23', type: 'national', status: 'paid' },
            ];
            await Holiday.insertMany(sampleHolidays);
            console.log('✅ Holidays seeded');
        }

        console.log('🚀 Backend mock database seeding complete!');
    } catch (error) {
        console.error('❌ Error during mock data seeding:', error);
    }
};

module.exports = { seedMockData };
