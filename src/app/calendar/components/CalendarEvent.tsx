import React from "react";
import { cn } from '@/lib/utils';

interface CalendarEventProps {
    title: string;
    color?: string; // Tailwind color class or hex, simplifying for MVP
    isMultiDay?: boolean;
}

export function CalendarEvent({ title, color = "bg-blue-600", isMultiDay }: CalendarEventProps) {
    return (
        <div className={cn(
            "text-xs px-2 py-1 rounded truncate cursor-pointer font-medium hover:opacity-80 transition-opacity mb-1",
            color,
            "text-white"
        )}>
            {title}
        </div>
    );
}
