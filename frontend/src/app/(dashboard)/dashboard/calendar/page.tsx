'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
    Briefcase,
    Radio
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
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { CalendarService, EventItem, ShiftItem, HolidayItem } from '@/services/calendar.service';
import { useSocket } from '@/contexts/SocketContext';

// Types
type CalendarView = 'week' | 'day' | 'month';
type ActiveTab = 'calendar' | 'shifts' | 'holidays';

const CATEGORIES = [
    { id: 'work', name: 'Work & Shifts', color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-500' },
    { id: 'meeting', name: 'Sales & Meetings', color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-500' },
    { id: 'personal', name: 'Team Review & Lunch', color: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-500' },
    { id: 'holiday', name: 'Holidays & Closures', color: 'bg-purple-500', text: 'text-purple-700', border: 'border-purple-500' },
    { id: 'special', name: 'Exam & Training', color: 'bg-rose-500', text: 'text-rose-700', border: 'border-rose-500' },
];

export default function UnifiedCalendarPage() {
    const { socket, isConnected } = useSocket();
    const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<CalendarView>('week');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(['work', 'meeting', 'personal', 'holiday', 'special']);
    
    // Live Data from Backend API
    const [events, setEvents] = useState<EventItem[]>([]);
    const [shifts, setShifts] = useState<ShiftItem[]>([]);
    const [holidays, setHolidays] = useState<HolidayItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showEventModal, setShowEventModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showHolidayModal, setShowHolidayModal] = useState(false);
    const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);

    // New Event Form State
    const [newEvent, setNewEvent] = useState<{
        title: string;
        category: 'work' | 'meeting' | 'holiday' | 'personal' | 'special';
        date: string;
        startHour: number;
        endHour: number;
        location: string;
        description: string;
    }>({
        title: '',
        category: 'work',
        date: format(new Date(), 'yyyy-MM-dd'),
        startHour: 9,
        endHour: 10,
        location: 'Office Room 1',
        description: ''
    });

    // New Shift Form State
    const [newShift, setNewShift] = useState<{
        name: string;
        type: 'morning' | 'afternoon' | 'night' | 'flexible';
        startTime: string;
        endTime: string;
        gracePeriod: number;
        assignedDepts: string;
    }>({
        name: '',
        type: 'morning',
        startTime: '08:00',
        endTime: '17:00',
        gracePeriod: 15,
        assignedDepts: 'Engineering & IT, Operations'
    });

    // New Holiday Form State
    const [newHoliday, setNewHoliday] = useState<{
        name: string;
        date: string;
        type: 'national' | 'academic' | 'observance';
        status: 'paid' | 'unpaid';
    }>({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'national',
        status: 'paid'
    });

    // Fetch Calendar Dashboard Data from Backend API
    const fetchCalendarData = useCallback(async () => {
        try {
            const data = await CalendarService.getDashboard();
            setEvents(data.events || []);
            setShifts(data.shifts || []);
            setHolidays(data.holidays || []);
        } catch (error) {
            console.error('Failed to fetch calendar data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    // Real-Time WebSocket Synchronization
    useEffect(() => {
        if (!socket) return;

        const handleRealtimeUpdate = (data: any) => {
            console.log('⚡ [RealTime Calendar Sync]:', data);
            fetchCalendarData();
        };

        socket.on('calendar_updated', handleRealtimeUpdate);
        socket.on('schedule_updated', handleRealtimeUpdate);

        return () => {
            socket.off('calendar_updated', handleRealtimeUpdate);
            socket.off('schedule_updated', handleRealtimeUpdate);
        };
    }, [socket, fetchCalendarData]);

    // Live Time Indicator Calculation
    useEffect(() => {
        const updateIndicator = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
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

    // Backend Handlers
    const handleCreateEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title.trim()) {
            toast.error('Event title is required');
            return;
        }

        const colorMap: Record<string, { color: string; bgColor: string; borderColor: string }> = {
            work: { color: 'text-emerald-950', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-500' },
            meeting: { color: 'text-amber-950', bgColor: 'bg-amber-50', borderColor: 'border-amber-500' },
            personal: { color: 'text-blue-950', bgColor: 'bg-blue-50', borderColor: 'border-blue-500' },
            holiday: { color: 'text-purple-950', bgColor: 'bg-purple-50', borderColor: 'border-purple-500' },
            special: { color: 'text-rose-950', bgColor: 'bg-rose-50', borderColor: 'border-rose-500' }
        };

        const config = colorMap[newEvent.category] || colorMap.work;

        try {
            await CalendarService.createEvent({
                title: newEvent.title.trim(),
                category: newEvent.category,
                date: newEvent.date,
                startHour: Number(newEvent.startHour),
                endHour: Number(newEvent.endHour),
                location: newEvent.location.trim(),
                description: newEvent.description.trim(),
                color: config.color,
                bgColor: config.bgColor,
                borderColor: config.borderColor
            });
            toast.success('Calendar event saved in backend database!');
            setShowEventModal(false);
            setNewEvent({
                title: '',
                category: 'work',
                date: format(new Date(), 'yyyy-MM-dd'),
                startHour: 9,
                endHour: 10,
                location: '',
                description: ''
            });
            fetchCalendarData();
        } catch {
            toast.error('Failed to create event');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;
        try {
            await CalendarService.deleteEvent(id);
            toast.success('Event deleted');
            fetchCalendarData();
        } catch {
            toast.error('Failed to delete event');
        }
    };

    const handleCreateShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newShift.name.trim()) {
            toast.error('Shift name is required');
            return;
        }

        const colorConfig = newShift.type === 'morning' ? { color: 'text-blue-900', bgColor: 'bg-blue-50' }
            : newShift.type === 'afternoon' ? { color: 'text-amber-900', bgColor: 'bg-amber-50' }
            : newShift.type === 'night' ? { color: 'text-purple-900', bgColor: 'bg-purple-50' }
            : { color: 'text-emerald-900', bgColor: 'bg-emerald-50' };

        const depts = newShift.assignedDepts.split(',').map(d => d.trim()).filter(Boolean);

        try {
            await CalendarService.createShift({
                name: newShift.name.trim(),
                type: newShift.type,
                startTime: newShift.startTime,
                endTime: newShift.endTime,
                gracePeriod: Number(newShift.gracePeriod),
                assignedDepts: depts,
                assignedCount: 15,
                color: colorConfig.color,
                bgColor: colorConfig.bgColor
            });
            toast.success('Work shift created in backend database!');
            setShowShiftModal(false);
            fetchCalendarData();
        } catch {
            toast.error('Failed to create shift');
        }
    };

    const handleDeleteShift = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shift?')) return;
        try {
            await CalendarService.deleteShift(id);
            toast.success('Shift deleted');
            fetchCalendarData();
        } catch {
            toast.error('Failed to delete shift');
        }
    };

    const handleCreateHoliday = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHoliday.name.trim()) {
            toast.error('Holiday name is required');
            return;
        }

        try {
            await CalendarService.createHoliday({
                name: newHoliday.name.trim(),
                date: newHoliday.date,
                type: newHoliday.type,
                status: newHoliday.status
            });
            toast.success('Holiday registered in backend database!');
            setShowHolidayModal(false);
            fetchCalendarData();
        } catch {
            toast.error('Failed to create holiday');
        }
    };

    const handleDeleteHoliday = async (id: string) => {
        if (!confirm('Delete this public holiday?')) return;
        try {
            await CalendarService.deleteHoliday(id);
            toast.success('Holiday removed');
            fetchCalendarData();
        } catch {
            toast.error('Failed to remove holiday');
        }
    };

    return (
        <div className="w-full space-y-5 sm:space-y-6 animate-in fade-in duration-300 font-sans select-none max-w-full overflow-x-hidden">
            {/* Top Navigation Bar & Sub-Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-full sm:w-fit overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex-1 sm:flex-initial ${
                            activeTab === 'calendar'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-slate-800 hover:text-black hover:bg-slate-200/60'
                        }`}
                    >
                        <CalendarDays size={14} />
                        <span>Timeline</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('shifts')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex-1 sm:flex-initial ${
                            activeTab === 'shifts'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-slate-800 hover:text-black hover:bg-slate-200/60'
                        }`}
                    >
                        <Clock size={14} />
                        <span>Shifts</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('holidays')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer flex-1 sm:flex-initial ${
                            activeTab === 'holidays'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-slate-800 hover:text-black hover:bg-slate-200/60'
                        }`}
                    >
                        <Sparkles size={14} />
                        <span>Holidays</span>
                    </button>
                </div>

                {/* Live Real-time Status Badge & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-wrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Sync</span>
                    </div>

                    {activeTab === 'calendar' && (
                        <button
                            onClick={() => setShowEventModal(true)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Add Event</span>
                        </button>
                    )}
                    {activeTab === 'shifts' && (
                        <button
                            onClick={() => setShowShiftModal(true)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Create Shift</span>
                        </button>
                    )}
                    {activeTab === 'holidays' && (
                        <button
                            onClick={() => setShowHolidayModal(true)}
                            className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-black hover:bg-slate-900 text-white text-xs font-black transition-all shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Add Holiday</span>
                        </button>
                    )}
                </div>
            </div>

            {/* TAB 1: CALENDAR VIEW */}
            {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                    {/* Left Sidebar (Mini Calendar & Category Filters) */}
                    <div className="lg:col-span-3 space-y-5 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                        {/* Mini Calendar Header */}
                        <div className="flex items-center justify-between">
                            <span className="font-black text-sm text-black">
                                {format(currentDate, 'MMMM yyyy')}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-black cursor-pointer"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-black cursor-pointer"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Mini Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                                <span key={idx} className="text-[10px] font-black text-slate-400 py-1">
                                    {day}
                                </span>
                            ))}
                            {miniCalendarDays.map((day, idx) => {
                                const isCurrent = isSameDay(day, currentDate);
                                const isTodayDate = isToday(day);
                                const inCurrentMonth = isSameMonth(day, currentDate);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentDate(day)}
                                        className={`h-8 w-8 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                            isCurrent
                                                ? 'bg-black text-white shadow-xs font-black'
                                                : isTodayDate
                                                ? 'bg-blue-50 text-blue-600 border border-blue-200 font-black'
                                                : inCurrentMonth
                                                ? 'text-slate-800 hover:bg-slate-100'
                                                : 'text-slate-300'
                                        }`}
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Category Filter Checkboxes */}
                        <div className="pt-4 border-t border-slate-100 space-y-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                                Filter Calendars
                            </span>
                            <div className="space-y-1.5">
                                {CATEGORIES.map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-3 h-3 rounded-md ${cat.color}`} />
                                                <span className="text-xs font-bold text-slate-800 group-hover:text-black">
                                                    {cat.name}
                                                </span>
                                            </div>
                                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                                isSelected ? 'bg-black border-black text-white' : 'border-slate-300'
                                            }`}>
                                                {isSelected && <Check size={10} />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Timeline Calendar Workspace */}
                    <div className="lg:col-span-9 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                        {/* Main View Header & Navigation */}
                        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg sm:text-xl font-black text-black">
                                    {format(currentDate, 'MMMM yyyy')}
                                </h2>
                                <button
                                    onClick={handleToday}
                                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Today
                                </button>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handlePrev}
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-black transition-colors cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-black transition-colors cursor-pointer"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* View Switcher: Day, Week, Month */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
                                {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
                                    <button
                                        key={v}
                                        onClick={() => setViewMode(v)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                                            viewMode === v
                                                ? 'bg-white text-black shadow-2xs'
                                                : 'text-slate-600 hover:text-black'
                                        }`}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* WEEK VIEW */}
                        {viewMode === 'week' && (
                            <div className="overflow-x-auto">
                                <div className="min-w-[800px]">
                                    {/* Week Header (Mon - Sun) */}
                                    <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/70">
                                        <div className="p-3 text-[11px] font-black text-slate-400 uppercase text-center border-r border-slate-200">
                                            Time (GMT+7)
                                        </div>
                                        {weekDays.map((day, idx) => {
                                            const isCurr = isSameDay(day, new Date());
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${
                                                        isCurr ? 'bg-blue-50/50' : ''
                                                    }`}
                                                >
                                                    <span className="text-[11px] font-bold text-slate-500 uppercase block">
                                                        {format(day, 'EEE')}
                                                    </span>
                                                    <span className={`text-base font-black inline-block mt-0.5 ${
                                                        isCurr ? 'w-7 h-7 rounded-full bg-blue-600 text-white leading-7' : 'text-black'
                                                    }`}>
                                                        {format(day, 'd')}
                                                    </span>
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
                                                        <div className="w-full px-2 py-1 bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-xs font-bold truncate flex items-center gap-1.5 group justify-between">
                                                            <div className="flex items-center gap-1.5 truncate">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0" />
                                                                <span className="truncate">{allDayEvt.title}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => allDayEvt.id && handleDeleteEvent(allDayEvt.id)}
                                                                className="opacity-0 group-hover:opacity-100 hover:text-rose-700"
                                                            >
                                                                <Trash2 size={11} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Hourly Timeline Rows */}
                                    <div className="relative">
                                        {/* Current Live Time Line */}
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
                                                                const durationHours = (evt.endHour || hour + 1) - (evt.startHour || hour);
                                                                const heightPx = Math.max(38, durationHours * 64 - 4);
                                                                const topOffsetPx = ((evt.startHour || hour) - hour) * 64;

                                                                return (
                                                                    <div
                                                                        key={evt.id}
                                                                        className={`absolute left-1 right-1 rounded-xl p-2 border-l-4 ${evt.borderColor || 'border-emerald-500'} ${evt.bgColor || 'bg-emerald-50'} ${evt.color || 'text-emerald-950'} shadow-xs z-10 overflow-hidden cursor-pointer hover:shadow-md transition-all group`}
                                                                        style={{
                                                                            top: `${topOffsetPx + 2}px`,
                                                                            height: `${heightPx}px`
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="font-black text-xs leading-tight truncate">
                                                                                {evt.title}
                                                                            </div>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (evt.id) handleDeleteEvent(evt.id);
                                                                                }}
                                                                                className="opacity-0 group-hover:opacity-100 hover:text-rose-700 text-slate-400 p-0.5"
                                                                            >
                                                                                <Trash2 size={11} />
                                                                            </button>
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

                        {/* MONTH VIEW */}
                        {viewMode === 'month' && (
                            <div className="p-4">
                                <div className="grid grid-cols-7 border-b border-slate-200 pb-2 mb-2 text-center text-xs font-black text-slate-500 uppercase">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                        <div key={d}>{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {miniCalendarDays.map((day, idx) => {
                                        const dayKey = format(day, 'yyyy-MM-dd');
                                        const dayEvents = filteredEvents.filter(e => e.date === dayKey);
                                        const isCurrMonth = isSameMonth(day, currentDate);
                                        const isCurrDay = isToday(day);

                                        return (
                                            <div
                                                key={idx}
                                                className={`min-h-[90px] p-2 rounded-2xl border transition-all ${
                                                    isCurrDay
                                                        ? 'bg-blue-50/40 border-blue-200'
                                                        : isCurrMonth
                                                        ? 'bg-white border-slate-200 hover:border-slate-300'
                                                        : 'bg-slate-50/50 border-slate-100 opacity-60'
                                                }`}
                                            >
                                                <div className="text-right">
                                                    <span className={`text-xs font-black inline-block px-1.5 py-0.5 rounded-lg ${
                                                        isCurrDay ? 'bg-blue-600 text-white' : 'text-slate-700'
                                                    }`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5 space-y-1">
                                                    {dayEvents.slice(0, 2).map((ev) => (
                                                        <div
                                                            key={ev.id}
                                                            className={`p-1 rounded-lg text-[10px] font-bold truncate ${ev.bgColor} ${ev.color} border border-slate-200/60`}
                                                        >
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
                                        className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
                                    >
                                        + Add Event
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {filteredEvents
                                        .filter(e => e.date === format(currentDate, 'yyyy-MM-dd'))
                                        .map((ev) => (
                                            <div
                                                key={ev.id}
                                                className={`p-4 rounded-2xl border-l-4 ${ev.borderColor} ${ev.bgColor} flex items-center justify-between group`}
                                            >
                                                <div>
                                                    <div className="font-black text-sm text-black">{ev.title}</div>
                                                    <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-3">
                                                        <span>⏰ {ev.startHour}:00 - {ev.endHour}:00</span>
                                                        {ev.location && <span>📍 {ev.location}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black capitalize text-black">
                                                        {ev.category}
                                                    </span>
                                                    <button
                                                        onClick={() => ev.id && handleDeleteEvent(ev.id)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
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
                                    <button
                                        onClick={() => shift.id && handleDeleteShift(shift.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
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
                                            {shift.assignedCount || 15} Staff
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {shift.assignedDepts?.map((d, i) => (
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
                        <button
                            onClick={() => setShowHolidayModal(true)}
                            className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-slate-900 cursor-pointer"
                        >
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
                                    <button
                                        onClick={() => h.id && handleDeleteHoliday(h.id)}
                                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MODAL 1: ADD EVENT MODAL */}
            {showEventModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-black">Create Calendar Event</h3>
                            <button
                                onClick={() => setShowEventModal(false)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-black block mb-1">Event Title *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Engineering Sprint Planning"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-hidden focus:border-black"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Category</label>
                                    <select
                                        value={newEvent.category}
                                        onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-hidden"
                                    >
                                        <option value="work">Work & Shifts</option>
                                        <option value="meeting">Meeting</option>
                                        <option value="personal">Team Review</option>
                                        <option value="holiday">Holiday</option>
                                        <option value="special">Training</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newEvent.date}
                                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Start Hour (24h)</label>
                                    <input
                                        type="number"
                                        min="7"
                                        max="20"
                                        step="0.5"
                                        value={newEvent.startHour}
                                        onChange={(e) => setNewEvent({ ...newEvent, startHour: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">End Hour (24h)</label>
                                    <input
                                        type="number"
                                        min="7"
                                        max="21"
                                        step="0.5"
                                        value={newEvent.endHour}
                                        onChange={(e) => setNewEvent({ ...newEvent, endHour: Number(e.target.value) })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-black block mb-1">Location / Room</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Conference Room 3"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEventModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-black text-white text-xs font-black hover:bg-slate-800 shadow-xs"
                                >
                                    Save Event
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: ADD SHIFT MODAL */}
            {showShiftModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-black">Create Work Shift</h3>
                            <button
                                onClick={() => setShowShiftModal(false)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateShift} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-black block mb-1">Shift Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Early Morning Security"
                                    value={newShift.name}
                                    onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Type</label>
                                    <select
                                        value={newShift.type}
                                        onChange={(e) => setNewShift({ ...newShift, type: e.target.value as any })}
                                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    >
                                        <option value="morning">Morning</option>
                                        <option value="afternoon">Afternoon</option>
                                        <option value="night">Night</option>
                                        <option value="flexible">Flexible</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Start</label>
                                    <input
                                        type="time"
                                        required
                                        value={newShift.startTime}
                                        onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">End</label>
                                    <input
                                        type="time"
                                        required
                                        value={newShift.endTime}
                                        onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                                        className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-black block mb-1">Assigned Departments (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="Engineering & IT, Operations"
                                    value={newShift.assignedDepts}
                                    onChange={(e) => setNewShift({ ...newShift, assignedDepts: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowShiftModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-black text-white text-xs font-black hover:bg-slate-800 shadow-xs"
                                >
                                    Create Shift
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: ADD HOLIDAY MODAL */}
            {showHolidayModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-black text-black">Add Public Holiday</h3>
                            <button
                                onClick={() => setShowHolidayModal(false)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateHoliday} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-black block mb-1">Holiday Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Independence Day"
                                    value={newHoliday.name}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newHoliday.date}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-black block mb-1">Type</label>
                                    <select
                                        value={newHoliday.type}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value as any })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black"
                                    >
                                        <option value="national">National</option>
                                        <option value="observance">Observance</option>
                                        <option value="academic">Academic</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowHolidayModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 rounded-xl bg-black text-white text-xs font-black hover:bg-slate-800 shadow-xs"
                                >
                                    Save Holiday
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
