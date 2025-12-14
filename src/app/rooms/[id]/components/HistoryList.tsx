"use client";

import React from "react";
import { User, Package, FileText, CheckCircle2, Clock, MoreVertical, Home, StickyNote, History as HistoryIcon } from "lucide-react";

interface HistoryItem {
    id: string;
    type: string;
    action: string;
    target: string;
    timestamp: Date;
    icon: string;
}

interface HistoryListProps {
    history: HistoryItem[];
}

// Map icon strings to actual icon components
const iconMap: Record<string, any> = {
    'CheckCircle2': CheckCircle2,
    'Package': Package,
    'FileText': FileText,
    'StickyNote': StickyNote,
    'Home': Home,
    'User': User
};

// Group history items by time period
const groupHistoryByPeriod = (items: HistoryItem[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const groups: Record<string, HistoryItem[]> = {
        'Dziś': [],
        'Wczoraj': [],
        'Ten tydzień': [],
        'Wcześniej': []
    };

    items.forEach(item => {
        const itemDate = new Date(item.timestamp);
        itemDate.setHours(0, 0, 0, 0);

        if (itemDate.getTime() === today.getTime()) {
            groups['Dziś'].push(item);
        } else if (itemDate.getTime() === yesterday.getTime()) {
            groups['Wczoraj'].push(item);
        } else if (itemDate.getTime() >= thisWeekStart.getTime()) {
            groups['Ten tydzień'].push(item);
        } else {
            groups['Wcześniej'].push(item);
        }
    });

    // Remove empty groups
    return Object.entries(groups)
        .filter(([_, items]) => items.length > 0)
        .map(([period, items]) => ({ period, items }));
};

// Format time for display
const formatTime = (date: Date) => {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const itemDate = new Date(dateObj);
    itemDate.setHours(0, 0, 0, 0);

    // If today, show time
    if (itemDate.getTime() === today.getTime()) {
        return dateObj.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Otherwise show date
    return dateObj.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit'
    });
};

export function HistoryList({ history }: HistoryListProps) {
    const groupedHistory = groupHistoryByPeriod(history);

    // Default: "Dziś" is expanded, others collapsed
    const [collapsedPeriods, setCollapsedPeriods] = React.useState<Record<string, boolean>>({
        "Wczoraj": true,
        "Ten tydzień": true,
        "Wcześniej": true
    });

    const togglePeriod = (period: string) => {
        setCollapsedPeriods(prev => ({ ...prev, [period]: !prev[period] }));
    };

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <HistoryIcon className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-white font-medium mb-2">Brak historii</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Aktywność w projekcie pojawi się tutaj
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <div className="space-y-6">
                {groupedHistory.map((group, idx) => (
                    <div key={idx}>
                        {/* Group Header - Sticky & Collapsible */}
                        <div className="sticky top-0 bg-[#0E0E0E] z-10">
                            <button
                                onClick={() => togglePeriod(group.period)}
                                className="flex items-center justify-between px-6 py-3 w-full group hover:bg-[#151515] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                                    <h3 className="text-[14px] font-medium text-white group-hover:text-gray-200 transition-colors">
                                        {group.period}
                                    </h3>
                                    <div className="px-2 py-0.5 rounded-full bg-[#1B1B1B] text-[12px] text-muted-foreground border border-white/5">
                                        {group.items.length}
                                    </div>
                                </div>
                            </button>
                            <div className="mx-6 border-b border-white/5"></div>
                        </div>

                        {/* List Rows */}
                        {!collapsedPeriods[group.period] && (
                            <div className="flex flex-col px-6 transition-all duration-300 ease-in-out">
                                {group.items.map((item) => {
                                    const Icon = iconMap[item.icon] || User;

                                    return (
                                        <div key={item.id} className="grid grid-cols-[40px_minmax(200px,2fr)_1fr_1fr_40px] gap-4 py-3 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-transparent text-[14px] group">

                                            {/* Icon Column */}
                                            <div className="flex justify-center">
                                                <Icon className="w-5 h-5 text-[#6E6E6E]" />
                                            </div>

                                            {/* Main Content */}
                                            <div className="flex flex-col justify-center min-w-0">
                                                <div className="text-white font-medium truncate text-[14px]">{item.target}</div>
                                                <div className="text-[12px] text-muted-foreground flex items-center gap-1">
                                                    <span>{item.action}</span>
                                                </div>
                                            </div>

                                            {/* Time */}
                                            <div className="text-[14px] text-muted-foreground">{formatTime(item.timestamp)}</div>

                                            {/* Spacer */}
                                            <div className="text-[14px] text-muted-foreground"></div>

                                            {/* Menu Action */}
                                            <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1 hover:text-white text-muted-foreground transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
