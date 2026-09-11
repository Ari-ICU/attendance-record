'use client';

import { useState } from 'react';
import { CalendarDays, Plus, Filter, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                        <CalendarDays size={13} />
                        <span>Calendar Hub</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                        Schedule & Calendar
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">
                        Manage holidays, academic events, work shifts, and company-wide schedules.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-1.5 rounded-lg hover:bg-white text-black transition-colors cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 text-xs font-black text-black select-none">
                            {format(currentDate, 'MMMM yyyy')}
                        </span>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-1.5 rounded-lg hover:bg-white text-black transition-colors cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer">
                        <Plus size={14} />
                        <span>Add Event</span>
                    </button>
                </div>
            </div>

            {/* Calendar Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <CalendarDays size={28} />
                </div>
                <h3 className="text-xl font-black text-black mb-1">
                    New Calendar View Canvas Ready
                </h3>
                <p className="text-sm font-semibold text-slate-800 max-w-md">
                    Ready for your updated calendar grid, event timelines, and shift scheduling UI components.
                </p>
            </div>
        </div>
    );
}
