'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    CheckSquare,
    Filter,
    CalendarDays,
    Layers,
    Sparkles,
    Search,
    X,
    Check,
    Tag,
    Trash2,
    Edit2,
    Users,
    Sun,
    Moon,
    Coffee,
    Briefcase
} from 'lucide-react';
import {
    format,
    addDays,
    subDays,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    isSameMonth,
    parseISO,
    setHours,
    setMinutes
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type CalendarView = 'week' | 'day' | 'month';
type ActiveTab = 'calendar' | 'shifts' | 'holidays';

interface EventItem {
    id: string;
    title: string;
    category: 'work' | 'meeting' | 'holiday' | 'personal' | 'special';
    date: string; // YYYY-MM-DD
    startHour: number; // e.g. 8.5 for 8:30 AM
    endHour: number; // e.g. 10 for 10:00 AM
    isAllDay?: boolean;
    location?: string;
    description?: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

interface ShiftItem {
    id: string;
    name: string;
    type: 'morning' | 'afternoon' | 'night' | 'flexible';
    startTime: string; // "08:00"
    endTime: string; // "17:00"
    gracePeriod: number; // minutes
    assignedDepts: string[];
    assignedCount: number;
    color: string;
    bgColor: string;
}

interface HolidayItem {
    id: string;
    name: string;
    date: string;
    type: 'national' | 'academic' | 'observance';
    status: 'paid' | 'unpaid';
}

const CATEGORIES = [
    { id: 'work', name: 'Work & Shifts', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-500' },
    { id: 'meeting', name: 'Sales & Meetings', color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-500' },
    { id: 'personal', name: 'Team Review & Lunch', color: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500' },
    { id: 'holiday', name: 'Holidays & Closures', color: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500' },
    { id: 'special', name: 'Exam & Training', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-500' },
];

const INITIAL_EVENTS: EventItem[] = [
    {
        id: '1',
        title: 'Morning Operations Sync',
        category: 'work',
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: 8,
        endHour: 8.75,
        location: 'Briefing Hall A',
        color: 'text-emerald-950',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-500'
    },
    {
        id: '2',
        title: 'Executive Attendance Review',
        category: 'meeting',
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: 9.5,
        endHour: 11,
        location: 'Conference Room 02',
        color: 'text-amber-950',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-500'
    },
    {
        id: '3',
        title: 'Roadmap & Shift Planning',
        category: 'personal',
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: 11.25,
        endHour: 13,
        location: 'Main Lab 04',
        color: 'text-blue-950',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500'
    },
    {
        id: '4',
        title: 'Lunch & Faculty Sync',
        category: 'personal',
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: 13.25,
        endHour: 14.25,
        location: 'Cafeteria Lounge',
        color: 'text-blue-950',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500'
    },
    {
        id: '5',
        title: 'Department Code Review & Audit',
        category: 'work',
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: 14.5,
        endHour: 16,
        location: 'Dev Hub',
        color: 'text-emerald-950',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-500'
    },
    {
        id: '6',
        title: 'Company Foundation Day',
        category: 'holiday',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        startHour: 0,
        endHour: 24,
        isAllDay: true,
        color: 'text-purple-950',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500'
    },
    {
        id: '7',
        title: 'Midterm Assessment Session',
        category: 'special',
        date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        startHour: 9,
        endHour: 12,
        location: 'Hall 301',
        color: 'text-rose-950',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-500'
    }
];

const INITIAL_SHIFTS: ShiftItem[] = [
    {
        id: 's1',
        name: 'Regular Day Shift',
        type: 'morning',
        startTime: '08:00',
        endTime: '17:00',
        gracePeriod: 15,
        assignedDepts: ['Engineering', 'Administration', 'HR'],
        assignedCount: 42,
        color: 'text-blue-900',
        bgColor: 'bg-blue-50'
    },
    {
        id: 's2',
        name: 'Afternoon & Lab Shift',
        type: 'afternoon',
        startTime: '13:00',
        endTime: '21:00',
        gracePeriod: 10,
        assignedDepts: ['IT Support', 'Library & Labs'],
        assignedCount: 18,
        color: 'text-amber-900',
        bgColor: 'bg-amber-50'
    },
    {
        id: 's3',
        name: 'Overnight Security & Facility',
        type: 'night',
        startTime: '21:00',
        endTime: '06:00',
        gracePeriod: 20,
        assignedDepts: ['Security', 'Maintenance'],
        assignedCount: 8,
        color: 'text-purple-900',
        bgColor: 'bg-purple-50'
    },
    {
        id: 's4',
        name: 'Faculty Flexible Roster',
        type: 'flexible',
        startTime: '09:00',
        endTime: '16:00',
        gracePeriod: 30,
        assignedDepts: ['Academic Staff'],
        assignedCount: 24,
        color: 'text-emerald-900',
        bgColor: 'bg-emerald-50'
    }
];

const INITIAL_HOLIDAYS: HolidayItem[] = [
    { id: 'h1', name: 'International New Year Day', date: '2026-01-01', type: 'national', status: 'paid' },
    { id: 'h2', name: 'Victory over Genocide Day', date: '2026-01-07', type: 'national', status: 'paid' },
    { id: 'h3', name: 'International Women’s Day', date: '2026-03-08', type: 'observance', status: 'paid' },
    { id: 'h4', name: 'Khmer New Year Holiday', date: '2026-04-13', type: 'national', status: 'paid' },
    { id: 'h5', name: 'King’s Birthday Commemoration', date: '2026-05-14', type: 'national', status: 'paid' },
    { id: 'h6', name: 'Pchum Ben Festival', date: '2026-10-09', type: 'national', status: 'paid' },
    { id: 'h7', name: 'Water & Moon Festival', date: '2026-11-23', type: 'national', status: 'paid' },
];

export default function UnifiedCalendarPage() {
    const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<CalendarView>('week');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['work', 'meeting', 'personal', 'holiday', 'special']);
    const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
    const [shifts, setShifts] = useState<ShiftItem[]>(INITIAL_SHIFTS);
    const [holidays, setHolidays] = useState<HolidayItem[]>(INITIAL_HOLIDAYS);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);

    // Live Time Indicator Calculation
    useEffect(() => {
        const updateIndicator = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            // Assuming time grid starts at 7 AM (hour 7 = 0px) and each hour is 64px
            const gridStartHour = 7;
            const hourOffset = (hours + minutes / 60) - gridStartHour;
            setCurrentTimePosition(Math.max(0, hourOffset * 64));
        };
        updateIndicator();
        const timer = setInterval(updateIndicator, 60000);
        return () => clearInterval(timer);
    }, []);

    // Date calculations for Week View
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start Monday
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Mini Calendar Days for Left Sidebar
    const miniMonthStart = startOfMonth(currentDate);
    const miniMonthEnd = endOfMonth(miniMonthStart);
    const miniCalStart = startOfWeek(miniMonthStart, { weekStartsOn: 1 });
    const miniCalEnd = endOfWeek(miniMonthEnd, { weekStartsOn: 1 });
    const miniCalendarDays = eachDayOfInterval({ start: miniCalStart, end: miniCalEnd });

    // Filter events by selected category
    const filteredEvents = useMemo(() => {
        return events.filter(e => selectedCategories.includes(e.category));
    }, [events, selectedCategories]);

    // Navigation handlers
    const handlePrev = () => {
        if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else if (viewMode === 'day') setCurrentDate(subDays(currentDate, 1));
        else setCurrentDate(subMonths(currentDate, 1));
    };

    const handleNext = () => {
        if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
        else setCurrentDate(addMonths(currentDate, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const hoursRange = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans select-none">
            {/* Top Navigation Bar & Sub-Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeTab === 'calendar'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-slate-800 hover:text-black hover:bg-slate-200/60'
                        }`}
                    >
                        <CalendarDays size={15} />
                        <span>Calendar & Timeline</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('shifts')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeTab === 'shifts'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-slate-800 hover:text-black hover:bg-slate-200/60'
                        }`}
                    >
                        <Clock size={15} />
                        <span>Shift Configuration</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            activeTab === 'holidays'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-slate-800 hover:text-black hover:bg-slate-200/60'
                        }`}
                    >
                        <Sparkles size={15} />
                        <span>Public Holidays</span>
                    </button>
                </div>

                {/* Primary Action */}
                <div className="flex items-center gap-2">
                    {activeTab === 'calendar' && (
                        <button
                            onClick={() => setShowEventModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Add Event</span>
                        </button>
                    )}
                    {activeTab === 'shifts' && (
                        <button
                            onClick={() => setShowShiftModal(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Create Shift</span>
                        </button>
                    )}
                </div>
            </div>

            {/* TAB 1: CALENDAR VIEW */}
            {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Sidebar (Mini Calendar & Category Filters) */}
                    <div className="lg:col-span-3 space-y-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                        {/* Mini Calendar Header */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-black text-black">
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-black transition-colors cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-black transition-colors cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Mini Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                                <span key={d} className="py-1 text-[11px] font-black text-slate-800 uppercase">
                                    {d}
                                </span>
                            ))}
                            {miniCalendarDays.map((day, idx) => {
                                const isSelected = isSameDay(day, currentDate);
                                const isCurrentMonth = isSameMonth(day, currentDate);
                                const isTodayDate = isToday(day);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentDate(day)}
                                        className={`h-7 w-7 mx-auto flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-blue-600 text-white font-black shadow-xs'
                                                : isTodayDate
                                                    ? 'bg-slate-200 text-black font-black'
                                                    : isCurrentMonth
                                                        ? 'text-black hover:bg-slate-100 font-semibold'
                                                        : 'text-slate-400 hover:bg-slate-50'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>

                        <hr className="border-slate-200" />

                        {/* Category Checkboxes */}
                        <div>
                            <p className="text-[11px] font-black text-black uppercase tracking-wider mb-3">
                                My Availability & Layers
                            </p>
                            <div className="space-y-2">
                                {CATEGORIES.map((cat) => {
                                    const isChecked = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                                    isChecked ? `${cat.color} border-transparent text-white` : 'border-slate-300 bg-white'
                                                }`}>
                                                    {isChecked && <Check size={12} className="stroke-[3]" />}
                                                </div>
                                                <span className="text-xs font-bold text-black group-hover:text-blue-600">
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <span className="w-2 h-2 rounded-full opacity-60 group-hover:opacity-100" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Timeline Grid */}
                    <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                        {/* Timeline Header Controller */}
                        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                    {format(weekStart, 'MMMM d')} – {format(weekEnd, 'd, yyyy')}
                                </h2>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Navigation & Today */}
                                <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
                                    <button
                                        onClick={handlePrev}
                                        className="p-1.5 rounded-xl hover:bg-white text-black transition-colors cursor-pointer"
                                        title="Previous"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={handleToday}
                                        className="px-3 py-1 rounded-xl hover:bg-white text-xs font-black text-black uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="p-1.5 rounded-xl hover:bg-white text-black transition-colors cursor-pointer"
                                        title="Next"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>

                                {/* View Switcher */}
                                <div className="flex items-center bg-slate-100 p-1 rounded-2xl">
                                    {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
                                        <button
                                            key={v}
                                            onClick={() => setViewMode(v)}
                                            className={`px-3 py-1 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                                                viewMode === v
                                                    ? 'bg-white text-black shadow-xs'
                                                    : 'text-slate-800 hover:text-black'
                                            }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* WEEK GRID VIEW */}
                        {viewMode === 'week' && (
                            <div className="overflow-x-auto custom-scrollbar">
                                <div className="min-w-[760px]">
                                    {/* Days Header */}
                                    <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/70">
                                        <div className="p-3 text-center border-r border-slate-200 text-[11px] font-black text-slate-800 uppercase">
                                            Time
                                        </div>
                                        {weekDays.map((day, idx) => {
                                            const isCurrentDay = isSameDay(day, currentDate);
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => setCurrentDate(day)}
                                                    className="p-3 text-center border-r border-slate-200 last:border-r-0 cursor-pointer hover:bg-slate-100/60 transition-colors"
                                                >
                                                    {isCurrentDay ? (
                                                        <div className="inline-flex items-center justify-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-xl shadow-xs">
                                                            <span className="text-sm font-black">{format(day, 'd')}</span>
                                                            <span className="text-[10px] font-black uppercase">{format(day, 'EEE')}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <span className="text-base font-black text-black">{format(day, 'd')}</span>
                                                            <span className="text-[10px] font-bold text-slate-800 uppercase">{format(day, 'EEE')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* All Day Banner Row */}
                                    <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/40 min-h-[44px]">
                                        <div className="p-2.5 text-[10px] font-black text-slate-800 uppercase text-center border-r border-slate-200 flex items-center justify-center">
                                            All Day
                                        </div>
                                        {weekDays.map((day, idx) => {
                                            const dayKey = format(day, 'yyyy-MM-dd');
                                            const allDayEvt = filteredEvents.find(e => e.date === dayKey && e.isAllDay);
                                            return (
                                                <div key={idx} className="p-1 border-r border-slate-200 last:border-r-0 flex items-center">
                                                    {allDayEvt && (
                                                        <div className="w-full px-2 py-1 bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-xs font-bold truncate flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                                                            <span className="truncate">{allDayEvt.title}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Hourly Timeline Rows */}
                                    <div className="relative">
                                        {/* Current Live Time Red/Blue Indicator Line */}
                                        <div
                                            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                                            style={{ top: `${currentTimePosition}px` }}
                                        >
                                            <div className="w-[12.5%] text-right pr-2">
                                                <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[10px] font-bold shadow-xs">
                                                    {format(new Date(), 'hh:mm a')}
                                                </span>
                                            </div>
                                            <div className="flex-1 h-[2px] bg-blue-600 relative">
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -top-[4px] -left-1" />
                                            </div>
                                        </div>

                                        {hoursRange.map((hour) => (
                                            <div key={hour} className="grid grid-cols-8 border-b border-slate-100 h-16 relative group">
                                                {/* Time Label */}
                                                <div className="p-2 text-right pr-3 border-r border-slate-200 text-xs font-bold text-slate-800 select-none">
                                                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                                                </div>

                                                {/* Day Cells */}
                                                {weekDays.map((day, dIdx) => {
                                                    const dayKey = format(day, 'yyyy-MM-dd');
                                                    const matchingEvents = filteredEvents.filter(
                                                        e => e.date === dayKey && !e.isAllDay && Math.floor(e.startHour) === hour
                                                    );

                                                    return (
                                                        <div
                                                            key={dIdx}
                                                            className="border-r border-slate-100 last:border-r-0 relative p-1 hover:bg-slate-50/50 transition-colors"
                                                        >
                                                            {matchingEvents.map((evt) => {
                                                                const durationHours = evt.endHour - evt.startHour;
                                                                const heightPx = Math.max(38, durationHours * 64 - 4);
                                                                const topOffsetPx = (evt.startHour - hour) * 64;

                                                                return (
                                                                    <div
                                                                        key={evt.id}
                                                                        className={`absolute left-1 right-1 rounded-xl p-2 border-l-4 ${evt.borderColor} ${evt.bgColor} ${evt.color} shadow-xs z-10 overflow-hidden cursor-pointer hover:shadow-md transition-all`}
                                                                        style={{
                                                                            top: `${topOffsetPx + 2}px`,
                                                                            height: `${heightPx}px`
                                                                        }}
                                                                    >
                                                                        <div className="font-black text-xs leading-tight truncate">
                                                                            {evt.title}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-slate-700 mt-0.5 flex items-center gap-1">
                                                                            <Clock size={10} />
                                                                            <span>
                                                                                {Math.floor(evt.startHour)}:{evt.startHour % 1 !== 0 ? '30' : '00'} - {Math.floor(evt.endHour)}:{evt.endHour % 1 !== 0 ? '30' : '00'}
                                                                            </span>
                                                                        </div>
                                                                        {evt.location && (
                                                                            <div className="text-[10px] font-semibold text-slate-600 truncate mt-0.5">
                                                                                {evt.location}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MONTH MATRIX VIEW */}
                        {viewMode === 'month' && (
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-7 gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                        <div key={d} className="p-2 text-center text-xs font-black text-black uppercase">
                                            {d}
                                        </div>
                                    ))}
                                    {miniCalendarDays.map((day, idx) => {
                                        const dayKey = format(day, 'yyyy-MM-dd');
                                        const dayEvents = filteredEvents.filter(e => e.date === dayKey);
                                        const isSelected = isSameDay(day, currentDate);
                                        const isCurrentMonth = isSameMonth(day, currentDate);

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setCurrentDate(day);
                                                    setViewMode('day');
                                                }}
                                                className={`min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-50/30'
                                                        : isCurrentMonth
                                                            ? 'border-slate-200 bg-white hover:border-slate-400'
                                                            : 'border-slate-100 bg-slate-50/50 opacity-40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-xs font-black ${isToday(day) ? 'px-2 py-0.5 rounded-lg bg-blue-600 text-white' : 'text-black'}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {dayEvents.length > 0 && (
                                                        <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded-md">
                                                            {dayEvents.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 2).map((ev) => (
                                                        <div key={ev.id} className={`text-[10px] font-bold p-1 rounded-md truncate border-l-2 ${ev.borderColor} ${ev.bgColor} ${ev.color}`}>
                                                            {ev.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <div className="text-[9px] font-bold text-slate-600 pl-1">
                                                            +{dayEvents.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* DAY VIEW */}
                        {viewMode === 'day' && (
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                                    <div>
                                        <h3 className="text-xl font-black text-black">
                                            {format(currentDate, 'EEEE, MMMM d, yyyy')}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                                            Detailed agenda & time slot assignments
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowEventModal(true)}
                                        className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-900"
                                    >
                                        + Add Time Block
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {filteredEvents
                                        .filter(e => e.date === format(currentDate, 'yyyy-MM-dd'))
                                        .map((ev) => (
                                            <div
                                                key={ev.id}
                                                className={`p-4 rounded-2xl border-l-4 ${ev.borderColor} ${ev.bgColor} flex items-center justify-between`}
                                            >
                                                <div>
                                                    <div className="font-black text-sm text-black">{ev.title}</div>
                                                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-3">
                                                        <span>⏰ {ev.startHour}:00 - {ev.endHour}:00</span>
                                                        {ev.location && <span>📍 {ev.location}</span>}
                                                    </div>
                                                </div>
                                                <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black capitalize text-black">
                                                    {ev.category}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: SHIFT CONFIGURATION */}
            {activeTab === 'shifts' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {shifts.map((shift) => (
                            <div
                                key={shift.id}
                                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-black text-[11px] font-black uppercase">
                                        {shift.type}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button className="p-1.5 text-slate-700 hover:text-black rounded-lg hover:bg-slate-100 cursor-pointer">
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-base font-black text-black">{shift.name}</h4>
                                    <div className="text-2xl font-black text-black mt-2 font-mono">
                                        {shift.startTime} – {shift.endTime}
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 mt-1">
                                        Grace Period: <span className="text-blue-600">{shift.gracePeriod} mins</span>
                                    </p>
                                </div>

                                <div className="pt-3 border-t border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-black">
                                        <span>Active Personnel</span>
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                                            {shift.assignedCount} Staff
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {shift.assignedDepts.map((d, i) => (
                                            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-bold">
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: PUBLIC HOLIDAYS */}
            {activeTab === 'holidays' && (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-black">Annual Statutory & Company Holidays</h3>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">Automated non-working days for attendance calculation</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-900 cursor-pointer">
                            + Add Holiday
                        </button>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {holidays.map((h) => (
                            <div key={h.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex flex-col items-center justify-center font-black text-xs shrink-0">
                                        <span>{format(parseISO(h.date), 'MMM')}</span>
                                        <span className="text-sm leading-none">{format(parseISO(h.date), 'd')}</span>
                                    </div>
                                    <div>
                                        <div className="font-black text-sm text-black">{h.name}</div>
                                        <div className="text-xs font-bold text-slate-800 mt-0.5 capitalize">
                                            {h.type} Holiday • <span className="text-emerald-700">{h.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                                        Active
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
