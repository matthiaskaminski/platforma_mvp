"use client";

import React, { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";

// Mock Data
const MOCK_EVENTS = [
    { id: 1, title: "Spotkanie z klientem", date: new Date().toISOString(), color: "bg-[#536AC8]" }, // Blue
    { id: 2, title: "Oddanie projektu kuchni", date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), color: "bg-[#C85353]" }, // Red
    { id: 3, title: "Wybór materiałów", date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), color: "bg-[#53C87F]" }, // Green
    { id: 4, title: "Konsultacja online", date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(), color: "bg-[#7253C8]" }, // Purple
    { id: 5, title: "Przegląd budżetu", date: new Date().toISOString(), color: "bg-[#C88253]" }, // Orange
];

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week" | "day">("month");

    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
    const handleToday = () => setCurrentDate(new Date());

    return (
        <div className="flex flex-col h-full overflow-hidden text-foreground">
            <CalendarHeader
                currentDate={currentDate}
                onPrevDate={handlePrevMonth}
                onNextDate={handleNextMonth}
                onToday={handleToday}
                view={view}
                onViewChange={setView}
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {view === "month" && (
                    <MonthView currentDate={currentDate} events={MOCK_EVENTS} />
                )}
                {/* Week and Day views can be added here later */}
            </div>
        </div>
    );
}
