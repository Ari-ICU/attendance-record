'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    UserCheck,
    AlertCircle,
    UserX,
    Sparkles,
    Search,
    Filter,
    Download,
    Eye,
    QrCode,
    Camera,
    Shield,
    X,
    CheckCircle2,
    CalendarDays,
    BookOpen,
    Users,
    ChevronDown
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    isWeekend,
    parseISO,
    addDays,
    subDays,
    addWeeks,
    subWeeks
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { AttendanceService } from '@/services/attendance.service';
import { EmployeeService } from '@/services/employee.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { Employee } from '@/types/employee.types';
import { getFullImageUrl } from '@/utils/url.utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'holiday' | 'exam' | 'meeting' | 'academic' | 'general';
    description?: string;
    time?: string;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
    {
        id: '1',
        date: format(new Date(), 'yyyy-MM-dd'),
        title: 'Daily Attendance Session',
        type: 'academic',
        time: '08:00 AM - 05:00 PM',
        description: 'Standard campus morning & afternoon check-in tracking'
    },
    {
        id: '2',
        date: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        title: 'Midterm Assessment Week',
        type: 'exam',
        time: '09:00 AM',
        description: 'Semester midterm examinations for all departments'
    },
    {
        id: '3',
        date: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        title: 'Faculty & Staff Review',
        type: 'meeting',
        time: '02:00 PM',
        description: 'Monthly department review meeting'
    },
    {
        id: '4',
        date: format(addDays(new Date(), 14), 'yyyy-MM-dd'),
        title: 'Campus Public Holiday',
        type: 'holiday',
        description: 'Institution closed for national holiday'
    }
];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('attendance_calendar_events');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch {
                    return DEFAULT_EVENTS;
                }
            }
        }
        return DEFAULT_EVENTS;
    });

    // Filters
    const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'employee'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent' | 'on_leave'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'academic' as CalendarEvent['type'],
        time: '09:00 AM',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd')
    });

    // Save events to local storage
    const saveEvents = (updatedEvents: CalendarEvent[]) => {
        setEvents(updatedEvents);
        if (typeof window !== 'undefined') {
            localStorage.setItem('attendance_calendar_events', JSON.stringify(updatedEvents));
        }
    };

    // Fetch Attendance & Employees
    const fetchData = async () => {
        setLoading(true);
        try {
            const start = format(startOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd');
            const end = format(endOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd');

            const [recordsRes, employeesRes] = await Promise.all([
                AttendanceService.getRecords({ startDate: start, endDate: end, limit: 1000 }),
                EmployeeService.getAllEmployees({ limit: 1000 })
            ]);

            const recData = recordsRes?.data?.docs || recordsRes?.data || [];
            setRecords(recData);
            setEmployees(employeesRes?.employees || []);
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            toast.error('Failed to load attendance calendar data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    // Group records by YYYY-MM-DD
    const recordsByDate = useMemo(() => {
        const map: Record<string, AttendanceRecord[]> = {};
        records.forEach((record) => {
            if (!record.date) return;
            const dateKey = record.date.substring(0, 10);
            if (!map[dateKey]) map[dateKey] = [];

            // Apply role filter if set
            if (roleFilter !== 'all') {
                const emp = record.employeeId;
                const empType = (emp as any)?.type || (emp as any)?.role || 'employee';
                if (roleFilter === 'student' && empType !== 'student') return;
                if (roleFilter === 'employee' && empType === 'student') return;
            }

            map[dateKey].push(record);
        });
        return map;
    }, [records, roleFilter]);

    // Group events by YYYY-MM-DD
    const eventsByDate = useMemo(() => {
        const map: Record<string, CalendarEvent[]> = {};
        events.forEach((evt) => {
            if (!map[evt.date]) map[evt.date] = [];
            map[evt.date].push(evt);
        });
        return map;
    }, [events]);

    // Selected date records
    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const selectedDateRecords = useMemo(() => {
        const list = recordsByDate[selectedDateKey] || [];
        return list.filter((rec) => {
            if (statusFilter !== 'all' && rec.status !== statusFilter) return false;
            if (searchTerm) {
                const emp = rec.employeeId;
                const fullName = `${emp?.firstName || ''} ${emp?.lastName || ''}`.toLowerCase();
                const empId = (emp?.employeeId || '').toLowerCase();
                const term = searchTerm.toLowerCase();
                return fullName.includes(term) || empId.includes(term);
            }
            return true;
        });
    }, [recordsByDate, selectedDateKey, statusFilter, searchTerm]);

    // Summary statistics for current month
    const monthStats = useMemo(() => {
        let totalPresent = 0;
        let totalLate = 0;
        let totalAbsent = 0;
        let totalLeave = 0;

        records.forEach((rec) => {
            if (!rec.date) return;
            const recDate = parseISO(rec.date);
            if (isSameMonth(recDate, currentDate)) {
                if (rec.status === 'present') totalPresent++;
                else if (rec.status === 'late') totalLate++;
                else if (rec.status === 'absent') totalAbsent++;
                else if (rec.status === 'on_leave' || rec.status === 'half_day') totalLeave++;
            }
        });

        const totalRecords = totalPresent + totalLate + totalAbsent + totalLeave;
        const onTimeRate = totalRecords > 0 ? Math.round((totalPresent / (totalPresent + totalLate)) * 100) || 0 : 95;

        return {
            totalPresent,
            totalLate,
            totalAbsent,
            totalLeave,
            totalRecords,
            onTimeRate
        };
    }, [records, currentDate]);

    // Navigation helpers
    const handlePrev = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(subDays(currentDate, 1));
    };

    const handleNext = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };

    const handleAddEvent = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title.trim()) {
            toast.error('Event title is required');
            return;
        }

        const created: CalendarEvent = {
            id: Date.now().toString(),
            title: newEvent.title.trim(),
            type: newEvent.type,
            time: newEvent.time,
            description: newEvent.description,
            date: newEvent.date
        };

        saveEvents([...events, created]);
        setIsAddEventModalOpen(false);
        setNewEvent({
            title: '',
            type: 'academic',
            time: '09:00 AM',
            description: '',
            date: format(new Date(), 'yyyy-MM-dd')
        });
        toast.success('Event added to calendar');
    };

    const handleDeleteEvent = (id: string) => {
        const updated = events.filter((e) => e.id !== id);
        saveEvents(updated);
        toast.success('Event removed');
    };

    // Calendar Matrix for Month View
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    // Week View Days
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(weekStart);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Export day summary CSV
    const exportDayCSV = () => {
        if (selectedDateRecords.length === 0) {
            toast.error('No records to export for this date');
            return;
        }

        const headers = ['Employee ID', 'Name', 'Type', 'Status', 'Check In', 'Check Out', 'Method', 'Date'];
        const rows = selectedDateRecords.map((r) => [
            r.employeeId?.employeeId || 'N/A',
            `"${r.employeeId?.firstName || ''} ${r.employeeId?.lastName || ''}"`,
            (r.employeeId as any)?.type || 'Staff',
            r.status,
            r.checkIn?.time ? format(parseISO(r.checkIn.time), 'hh:mm:ss a') : 'N/A',
            r.checkOut?.time ? format(parseISO(r.checkOut.time), 'hh:mm:ss a') : 'N/A',
            r.checkIn?.method || 'N/A',
            r.date
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Attendance_${selectedDateKey}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Day report exported successfully');
    };

    const getEventTypeBadge = (type: CalendarEvent['type']) => {
        switch (type) {
            case 'holiday':
                return 'bg-rose-50 text-rose-600 border-rose-200';
            case 'exam':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'meeting':
                return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'academic':
                return 'bg-blue-50 text-blue-600 border-blue-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Top Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                Calendar & Schedule
                            </h1>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100">
                                Live Tracking
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Track daily attendance logs, academic schedules, exams, and institutional events
                        </p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => {
                            setNewEvent((prev) => ({ ...prev, date: selectedDateKey }));
                            setIsAddEventModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                        <Plus size={15} />
                        <span>Add Event / Note</span>
                    </button>

                    <Link
                        href="/dashboard/attendance/monitor"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
                    >
                        <Camera size={15} />
                        <span>Take Attendance</span>
                    </Link>
                </div>
            </div>

            {/* Key Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Present (Month)</span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">{monthStats.totalPresent}</span>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                            On Track
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Late Check-ins</span>
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">{monthStats.totalLate}</span>
                        <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            Need Follow-up
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Absences / Leaves</span>
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                            <UserX size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">
                            {monthStats.totalAbsent + monthStats.totalLeave}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                            {monthStats.totalLeave} Leaves
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">On-Time Accuracy</span>
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Sparkles size={16} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-slate-900">{monthStats.onTimeRate}%</span>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                            Target 90%+
                        </span>
                    </div>
                </div>
            </div>

            {/* Calendar Controls & Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Month/Week Navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Previous"
                    >
                        <ChevronLeft size={17} />
                    </button>

                    <button
                        onClick={handleToday}
                        className="px-3 py-1.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                        Today
                    </button>

                    <button
                        onClick={handleNext}
                        className="p-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Next"
                    >
                        <ChevronRight size={17} />
                    </button>

                    <h2 className="text-base sm:text-lg font-bold text-slate-900 ml-2">
                        {format(currentDate, viewMode === 'day' ? 'EEEE, MMMM d, yyyy' : 'MMMM yyyy')}
                    </h2>
                </div>

                {/* View Switcher & Role Filter */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Role Filter */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setRoleFilter('all')}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                                roleFilter === 'all'
                                    ? 'bg-white text-slate-900 font-bold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setRoleFilter('student')}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                                roleFilter === 'student'
                                    ? 'bg-white text-blue-600 font-bold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setRoleFilter('employee')}
                            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                                roleFilter === 'employee'
                                    ? 'bg-white text-purple-600 font-bold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Staff
                        </button>
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('month')}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                                viewMode === 'month'
                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                                viewMode === 'week'
                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                                viewMode === 'day'
                                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Day
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Layout: Calendar Grid + Day Inspector Sidebar */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                {/* Left: Main Calendar View */}
                <div className="xl:col-span-8 space-y-4">
                    {/* MONTH VIEW */}
                    {viewMode === 'month' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            {/* Day Header Row */}
                            <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/70 text-center py-2.5">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
                                    <span
                                        key={d}
                                        className={`text-xs font-bold uppercase tracking-wider ${
                                            idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
                                        }`}
                                    >
                                        {d}
                                    </span>
                                ))}
                            </div>

                            {/* Month Grid */}
                            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                                {calendarDays.map((day, idx) => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const dayRecords = recordsByDate[dateKey] || [];
                                    const dayEvents = eventsByDate[dateKey] || [];
                                    const inCurrentMonth = isSameMonth(day, currentDate);
                                    const isCurrentDay = isToday(day);
                                    const isSelected = isSameDay(day, selectedDate);
                                    const weekend = isWeekend(day);

                                    const presentCount = dayRecords.filter((r) => r.status === 'present').length;
                                    const lateCount = dayRecords.filter((r) => r.status === 'late').length;
                                    const absentCount = dayRecords.filter((r) => r.status === 'absent').length;

                                    return (
                                        <div
                                            key={day.toISOString() + idx}
                                            onClick={() => setSelectedDate(day)}
                                            className={`min-h-[105px] p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                                                !inCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'bg-white'
                                            } ${isSelected ? 'ring-2 ring-blue-600 ring-inset bg-blue-50/20' : ''} ${
                                                weekend && inCurrentMonth ? 'bg-slate-50/30' : ''
                                            } hover:bg-slate-50/80`}
                                        >
                                            {/* Date Number Header */}
                                            <div className="flex items-center justify-between mb-1">
                                                <span
                                                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                                        isCurrentDay
                                                            ? 'bg-blue-600 text-white font-black shadow-xs'
                                                            : isSelected
                                                            ? 'bg-slate-900 text-white'
                                                            : inCurrentMonth
                                                            ? 'text-slate-700 group-hover:text-blue-600'
                                                            : 'text-slate-300'
                                                    }`}
                                                >
                                                    {format(day, 'd')}
                                                </span>

                                                {/* Total count badge */}
                                                {dayRecords.length > 0 && inCurrentMonth && (
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                                                        {dayRecords.length}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Attendance Indicator Badges */}
                                            <div className="space-y-1 flex-1">
                                                {/* Present / Late Pills */}
                                                {inCurrentMonth && (presentCount > 0 || lateCount > 0) && (
                                                    <div className="flex items-center gap-1 text-[10px] font-semibold">
                                                        {presentCount > 0 && (
                                                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 leading-tight">
                                                                {presentCount} Present
                                                            </span>
                                                        )}
                                                        {lateCount > 0 && (
                                                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/60 leading-tight">
                                                                {lateCount} Late
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Absences */}
                                                {inCurrentMonth && absentCount > 0 && (
                                                    <span className="inline-block px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200/60 text-[10px] font-semibold leading-tight">
                                                        {absentCount} Absent
                                                    </span>
                                                )}

                                                {/* Event Pills */}
                                                {dayEvents.map((evt) => (
                                                    <div
                                                        key={evt.id}
                                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate border ${getEventTypeBadge(
                                                            evt.type
                                                        )}`}
                                                        title={evt.title}
                                                    >
                                                        {evt.title}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* WEEK VIEW */}
                    {viewMode === 'week' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-slate-200/80 bg-slate-50/70 py-3">
                                {weekDays.map((day) => {
                                    const isCurrent = isToday(day);
                                    const isSelected = isSameDay(day, selectedDate);
                                    return (
                                        <div
                                            key={day.toISOString()}
                                            onClick={() => setSelectedDate(day)}
                                            className="text-center cursor-pointer group"
                                        >
                                            <p className="text-[10px] uppercase font-bold text-slate-400">
                                                {format(day, 'EEE')}
                                            </p>
                                            <p
                                                className={`text-sm font-bold mx-auto w-7 h-7 rounded-full flex items-center justify-center mt-0.5 ${
                                                    isCurrent
                                                        ? 'bg-blue-600 text-white'
                                                        : isSelected
                                                        ? 'bg-slate-900 text-white'
                                                        : 'text-slate-800 group-hover:text-blue-600'
                                                }`}
                                            >
                                                {format(day, 'd')}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[400px]">
                                {weekDays.map((day) => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const dayRecords = recordsByDate[dateKey] || [];
                                    const dayEvents = eventsByDate[dateKey] || [];

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            onClick={() => setSelectedDate(day)}
                                            className={`p-2 space-y-2 cursor-pointer transition-colors ${
                                                isSameDay(day, selectedDate) ? 'bg-blue-50/20' : 'hover:bg-slate-50/50'
                                            }`}
                                        >
                                            {dayEvents.map((evt) => (
                                                <div
                                                    key={evt.id}
                                                    className={`p-2 rounded-xl text-xs font-semibold border ${getEventTypeBadge(
                                                        evt.type
                                                    )}`}
                                                >
                                                    <p className="font-bold truncate">{evt.title}</p>
                                                    {evt.time && <p className="text-[10px] opacity-80">{evt.time}</p>}
                                                </div>
                                            ))}

                                            {dayRecords.slice(0, 5).map((rec) => (
                                                <div
                                                    key={rec._id}
                                                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px]"
                                                >
                                                    <p className="font-bold text-slate-800 truncate">
                                                        {rec.employeeId?.firstName} {rec.employeeId?.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 capitalize">
                                                        {rec.status} • {rec.checkIn?.time ? format(parseISO(rec.checkIn.time), 'hh:mm a') : 'No check-in'}
                                                    </p>
                                                </div>
                                            ))}

                                            {dayRecords.length > 5 && (
                                                <p className="text-[10px] font-bold text-blue-600 text-center">
                                                    +{dayRecords.length - 5} more
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* DAY VIEW */}
                    {viewMode === 'day' && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {format(currentDate, 'EEEE, MMMM d, yyyy')}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Detailed timeline and attendance roster
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-200">
                                    {selectedDateRecords.length} Attendees Logged
                                </span>
                            </div>

                            {/* Scheduled events for this day */}
                            {(eventsByDate[format(currentDate, 'yyyy-MM-dd')] || []).length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Scheduled Events & Notes
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(eventsByDate[format(currentDate, 'yyyy-MM-dd')] || []).map((evt) => (
                                            <div
                                                key={evt.id}
                                                className={`p-3 rounded-xl border flex items-start justify-between ${getEventTypeBadge(
                                                    evt.type
                                                )}`}
                                            >
                                                <div>
                                                    <p className="text-xs font-bold">{evt.title}</p>
                                                    {evt.time && <p className="text-[11px] opacity-80 mt-0.5">{evt.time}</p>}
                                                    {evt.description && (
                                                        <p className="text-[11px] opacity-90 mt-1">{evt.description}</p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteEvent(evt.id)}
                                                    className="p-1 hover:text-rose-600 transition-colors"
                                                    title="Delete event"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full Attendee List */}
                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Attendance Roster ({selectedDateRecords.length})
                                </h4>
                                {selectedDateRecords.length > 0 ? (
                                    <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                                        {selectedDateRecords.map((record) => (
                                            <div
                                                key={record._id}
                                                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-2xs">
                                                        {record.employeeId?.photoUrl ? (
                                                            <img
                                                                src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>
                                                                {record.employeeId?.firstName?.[0] || 'U'}
                                                                {record.employeeId?.lastName?.[0] || ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">
                                                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                        </p>
                                                        <p className="text-[11px] text-slate-400 font-mono">
                                                            ID: {record.employeeId?.employeeId || 'N/A'} • {record.checkIn?.method || 'Manual'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-slate-800">
                                                            {record.checkIn?.time
                                                                ? format(parseISO(record.checkIn.time), 'hh:mm a')
                                                                : '—'}
                                                        </p>
                                                        <span
                                                            className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${
                                                                record.status === 'present'
                                                                    ? 'bg-emerald-50 text-emerald-600'
                                                                    : record.status === 'late'
                                                                    ? 'bg-amber-50 text-amber-600'
                                                                    : 'bg-rose-50 text-rose-600'
                                                            }`}
                                                        >
                                                            {record.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                                        <CalendarDays size={28} className="mx-auto text-slate-400 mb-2 opacity-50" />
                                        <p className="text-xs font-semibold text-slate-600">No attendance logged for this day</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Selected Date Inspection Drawer */}
                <div className="xl:col-span-4 space-y-4">
                    {/* Day Overview Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Selected Date
                                </span>
                                <h3 className="text-base font-bold text-slate-900">
                                    {format(selectedDate, 'EEEE, MMM d, yyyy')}
                                </h3>
                            </div>
                            <button
                                onClick={exportDayCSV}
                                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/80 transition-colors"
                                title="Export day CSV report"
                            >
                                <Download size={15} />
                            </button>
                        </div>

                        {/* Day Quick Breakdown */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                <span className="text-[10px] font-bold text-emerald-700 block">Present</span>
                                <span className="text-lg font-black text-emerald-700">
                                    {(recordsByDate[selectedDateKey] || []).filter((r) => r.status === 'present').length}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                                <span className="text-[10px] font-bold text-amber-700 block">Late</span>
                                <span className="text-lg font-black text-amber-700">
                                    {(recordsByDate[selectedDateKey] || []).filter((r) => r.status === 'late').length}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                                <span className="text-[10px] font-bold text-rose-600 block">Absent</span>
                                <span className="text-lg font-black text-rose-600">
                                    {(recordsByDate[selectedDateKey] || []).filter((r) => r.status === 'absent').length}
                                </span>
                            </div>
                        </div>

                        {/* Events on this date */}
                        {(eventsByDate[selectedDateKey] || []).length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Notes & Events
                                </span>
                                <div className="space-y-1.5">
                                    {(eventsByDate[selectedDateKey] || []).map((evt) => (
                                        <div
                                            key={evt.id}
                                            className={`p-2.5 rounded-xl border flex items-center justify-between ${getEventTypeBadge(
                                                evt.type
                                            )}`}
                                        >
                                            <div className="min-w-0 pr-2">
                                                <p className="text-xs font-bold truncate">{evt.title}</p>
                                                {evt.description && (
                                                    <p className="text-[10px] opacity-80 truncate">{evt.description}</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDeleteEvent(evt.id)}
                                                className="p-1 hover:text-rose-600 transition-colors shrink-0"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Search & Status Filter for Attendee List */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Attendees ({selectedDateRecords.length})
                                </span>
                                <Link
                                    href={`/dashboard/attendance/records?date=${selectedDateKey}`}
                                    className="text-[11px] font-bold text-blue-600 hover:underline"
                                >
                                    View Full Records →
                                </Link>
                            </div>

                            <div className="relative">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Filter by name / ID..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Attendee Roster List */}
                            <div className="max-h-72 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                                {selectedDateRecords.length > 0 ? (
                                    selectedDateRecords.map((record) => (
                                        <div
                                            key={record._id}
                                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                                                    {record.employeeId?.photoUrl ? (
                                                        <img
                                                            src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{record.employeeId?.firstName?.[0] || 'U'}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 truncate">
                                                        {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-mono truncate">
                                                        {record.checkIn?.time
                                                            ? format(parseISO(record.checkIn.time), 'hh:mm a')
                                                            : 'No check-in'}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-md shrink-0 ${
                                                    record.status === 'present'
                                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                        : record.status === 'late'
                                                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                                        : 'bg-rose-50 text-rose-600 border border-rose-200'
                                                }`}
                                            >
                                                {record.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-400">
                                        <Users size={20} className="mx-auto mb-1.5 opacity-40" />
                                        <p className="text-xs font-medium">No check-ins found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Add Event / Note */}
            <AnimatePresence>
                {isAddEventModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
                        >
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Plus size={16} />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">Add Calendar Event / Note</h3>
                                </div>
                                <button
                                    onClick={() => setIsAddEventModalOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleAddEvent} className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newEvent.title}
                                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                        placeholder="e.g. Midterm Exams, Staff Assembly, Campus Holiday"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={newEvent.date}
                                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Event Type
                                        </label>
                                        <select
                                            value={newEvent.type}
                                            onChange={(e) =>
                                                setNewEvent({ ...newEvent, type: e.target.value as CalendarEvent['type'] })
                                            }
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none bg-white"
                                        >
                                            <option value="academic">Academic Session</option>
                                            <option value="exam">Examination</option>
                                            <option value="holiday">Holiday</option>
                                            <option value="meeting">Staff Meeting</option>
                                            <option value="general">General Note</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Time (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newEvent.time}
                                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                                        placeholder="e.g. 08:30 AM - 11:30 AM"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={newEvent.description}
                                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                        placeholder="Add any additional instructions or details..."
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddEventModalOpen(false)}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                                    >
                                        Save Event
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
