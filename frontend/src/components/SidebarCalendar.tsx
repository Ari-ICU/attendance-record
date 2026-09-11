'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    ArrowUpRight,
    ChevronDown,
    ChevronUp
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
    isWeekend
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarCalendarProps {
    collapsed?: boolean;
}

export default function SidebarCalendar({ collapsed = false }: SidebarCalendarProps) {
    const router = useRouter();
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [isOpenInCollapsed, setIsOpenInCollapsed] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Live clock ticker
    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Close collapsed popover on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpenInCollapsed(false);
            }
        };

        if (isOpenInCollapsed) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpenInCollapsed]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(today);
    };

    const handleSelectDate = (date: Date) => {
        setSelectedDate(date);
        if (!isSameMonth(date, currentMonth)) {
            setCurrentMonth(date);
        }
    };

    const handleNavigateToRecords = (date: Date) => {
        const formattedDate = format(date, 'yyyy-MM-dd');
        router.push(`/dashboard/attendance/records?date=${formattedDate}`);
        if (collapsed) {
            setIsOpenInCollapsed(false);
        }
    };

    // Calendar matrix calculation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const renderCalendarGrid = () => {
        return (
            <div className="space-y-2">
                {/* Month navigation header */}
                <div className="flex items-center justify-between px-0.5">
                    <button
                        type="button"
                        onClick={prevMonth}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Previous month"
                    >
                        <ChevronLeft size={14} />
                    </button>

                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 tracking-tight">
                            {format(currentMonth, 'MMM yyyy')}
                        </span>
                        {!isSameMonth(currentMonth, new Date()) && (
                            <button
                                type="button"
                                onClick={goToToday}
                                className="px-1.5 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            >
                                Today
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={nextMonth}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Next month"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((day, i) => (
                        <span
                            key={day + i}
                            className={`text-[10px] font-bold ${
                                i === 0 || i === 6 ? 'text-slate-400' : 'text-slate-500'
                            }`}
                        >
                            {day}
                        </span>
                    ))}
                </div>

                {/* Days matrix */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isCurrentDay = isToday(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const weekend = isWeekend(day);

                        let btnClass = 'text-slate-700 hover:bg-slate-100';

                        if (!isCurrentMonth) {
                            btnClass = 'text-slate-300 hover:text-slate-400 hover:bg-slate-50/50';
                        } else if (isSelected && isCurrentDay) {
                            btnClass = 'bg-blue-600 text-white font-bold shadow-xs';
                        } else if (isSelected) {
                            btnClass = 'bg-slate-900 text-white font-bold shadow-xs';
                        } else if (isCurrentDay) {
                            btnClass = 'bg-blue-50 text-blue-600 font-bold ring-1.5 ring-blue-500/40 hover:bg-blue-100';
                        } else if (weekend) {
                            btnClass = 'text-slate-500 hover:bg-slate-100';
                        }

                        return (
                            <button
                                key={day.toISOString() + idx}
                                type="button"
                                onClick={() => handleSelectDate(day)}
                                className={`h-6 w-full rounded-md text-[11px] font-medium flex items-center justify-center transition-all ${btnClass}`}
                                title={format(day, 'EEEE, MMMM d, yyyy')}
                            >
                                <span>{format(day, 'd')}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Selected Date Quick Action Bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <button
                        type="button"
                        onClick={() => router.push(`/dashboard/calendar?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
                        className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-bold transition-colors truncate"
                        title="Open Calendar Page"
                    >
                        <CalendarIcon size={11} className="text-blue-500 shrink-0" />
                        <span className="truncate">Open Page</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleNavigateToRecords(selectedDate)}
                        className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-bold transition-colors"
                        title="View attendance records for this date"
                    >
                        <span>Records</span>
                        <ArrowUpRight size={11} />
                    </button>
                </div>
            </div>
        );
    };

    // Collapsed Mode
    if (collapsed) {
        return (
            <div className="px-2.5 py-1 relative group/calendar" ref={popoverRef}>
                <button
                    type="button"
                    onClick={() => setIsOpenInCollapsed(!isOpenInCollapsed)}
                    className={`w-9 h-9 mx-auto rounded-xl flex flex-col items-center justify-center transition-all relative ${
                        isOpenInCollapsed
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                    title={`Calendar (${currentTime ? format(currentTime, 'MMM d') : ''})`}
                >
                    <CalendarDays size={16} />
                    <span className={`text-[8px] font-bold leading-none mt-0.5 ${isOpenInCollapsed ? 'text-white' : 'text-blue-600'}`}>
                        {currentTime ? format(currentTime, 'd') : ''}
                    </span>
                </button>

                {/* Collapsed Tooltip (when popover not open) */}
                {!isOpenInCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover/calendar:opacity-100 pointer-events-none transition-opacity duration-150 z-50 whitespace-nowrap">
                        Calendar • {currentTime ? format(currentTime, 'EEE, MMM d') : ''}
                    </div>
                )}

                {/* Floating Popover Calendar */}
                <AnimatePresence>
                    {isOpenInCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-full top-0 ml-3 w-64 p-3.5 bg-white border border-slate-200/90 rounded-2xl shadow-xl z-50"
                        >
                            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <CalendarIcon size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900">Calendar</span>
                                </div>
                                {currentTime && (
                                    <span className="text-[10px] font-mono font-medium text-slate-400">
                                        {format(currentTime, 'hh:mm a')}
                                    </span>
                                )}
                            </div>
                            {renderCalendarGrid()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Full Expanded Sidebar Mode
    return (
        <div className="px-3 py-1.5">
            <div className="bg-slate-50/90 border border-slate-200/70 rounded-2xl p-2.5 transition-all">
                {/* Header with live time */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between cursor-pointer group select-none"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center text-blue-600">
                            <CalendarDays size={13} />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-800">Calendar</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            </div>
                            {currentTime && (
                                <p className="text-[10px] text-slate-500 font-medium">
                                    {format(currentTime, 'EEE, MMM d')} • <span className="font-mono">{format(currentTime, 'h:mm a')}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        className="p-1 text-slate-400 group-hover:text-slate-600 rounded-md transition-colors"
                        aria-label="Toggle calendar visibility"
                    >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </div>

                {/* Expandable Calendar Grid */}
                <AnimatePresence initial={false}>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden pt-1 border-t border-slate-200/60"
                        >
                            {renderCalendarGrid()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
