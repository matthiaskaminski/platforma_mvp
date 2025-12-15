import React from "react";
import { CheckSquare, Calendar } from "lucide-react";

interface CalendarEventProps {
    title: string;
    color: string; // Hex color
    isTask?: boolean;
    type?: string;
    onClick?: (e: React.MouseEvent) => void;
}

export function CalendarEvent({ title, color, isTask, type, onClick }: CalendarEventProps) {
    return (
        <div
            className="text-xs px-2 py-1 rounded truncate cursor-pointer font-medium hover:opacity-80 transition-opacity mb-1 flex items-center gap-1.5"
            style={{ backgroundColor: color }}
            onClick={onClick}
        >
            {isTask ? (
                <CheckSquare className="w-3 h-3 shrink-0" />
            ) : (
                <Calendar className="w-3 h-3 shrink-0" />
            )}
            <span className="truncate text-white">{title}</span>
        </div>
    );
}
