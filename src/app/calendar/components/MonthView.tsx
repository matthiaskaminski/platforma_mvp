import React from "react";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    format
} from "date-fns";
import { pl } from "date-fns/locale";
import { CalendarEvent } from "./CalendarEvent";

interface MonthViewProps {
    currentDate: Date;
    events: any[]; // Define proper type later
}

const WEEKDAYS = ["Pon.", "Wt.", "Śr.", "Czw.", "Pt.", "Sob.", "Niedz."];

export function MonthView({ currentDate, events }: MonthViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: pl }); // Monday start
    const endDate = endOfWeek(monthEnd, { locale: pl });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    return (
        <div className="flex flex-col flex-1 h-full min-h-0 bg-[#0E0E0E]">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-white/5 bg-[#0F0F0F]">
                {WEEKDAYS.map((day) => (
                    <div key={day} className="py-2 px-4 text-xs font-medium text-muted-foreground uppercase text-center border-r border-white/5 last:border-r-0">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 grid-rows-5 flex-1 min-h-0">
                {calendarDays.map((day, idx) => {
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isDayToday = isToday(day);

                    // Simple mock filter for events on this day
                    const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                relative border-b border-r border-white/5 p-2 transition-colors min-h-[120px]
                                ${!isCurrentMonth ? "bg-[#0A0A0A] text-white/20" : "bg-[#0E0E0E] hover:bg-[#121212]"}
                                ${(idx + 1) % 7 === 0 ? "border-r-0" : ""}
                            `}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`
                                    text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                    ${isDayToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                                `}>
                                    {format(day, "d")}
                                </span>
                                {isDayToday && <span className="text-[10px] text-primary font-medium uppercase tracking-wide">Dziś</span>}
                            </div>

                            <div className="space-y-1 overflow-y-auto max-h-[100px] no-scrollbar">
                                {dayEvents.map(event => (
                                    <CalendarEvent
                                        key={event.id}
                                        title={event.title}
                                        color={event.color}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
