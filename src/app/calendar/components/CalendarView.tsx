"use client";

import React, { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { CreateEventModal } from "@/components/modals/CreateEventModal";

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    description?: string | null;
    type: string;
    isTask: boolean;
    color: string;
    status?: string;
    roomName?: string;
    sprintName?: string;
}

interface CalendarViewProps {
    events: CalendarEvent[];
    projectId: string;
}

export function CalendarView({ events, projectId }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week" | "day">("month");
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

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
                onAddEvent={() => setIsEventModalOpen(true)}
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {view === "month" && (
                    <MonthView currentDate={currentDate} events={events} />
                )}
                {/* Week and Day views can be added here later */}
            </div>

            <CreateEventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                projectId={projectId}
            />
        </div>
    );
}
