"use client";

import React from "react";
import { User, Package, FileText, CheckCircle2, Clock, MoreVertical } from "lucide-react";

const history = [
    {
        period: "Dziś",
        items: [
            { id: 1, type: "task", user: "Olga Nowak", action: "ukończyła zadanie", target: "Zatwierdzić próbki tkanin do sofy", time: "18:30", icon: CheckCircle2, color: "text-green-400" },
        ]
    },
    {
        period: "Wczoraj",
        items: [
            { id: 2, type: "product", user: "Jan Kowalski", action: "dodał produkt", target: "Sofa modułowa 3-os. Westwing", time: "12:15", icon: Package, color: "text-blue-400" },
        ]
    },
    {
        period: "Ten tydzień",
        items: [
            { id: 3, type: "document", user: "Olga Nowak", action: "dodała plik", target: "inspiracja_4.png", time: "10.11", icon: FileText, color: "text-purple-400" },
            { id: 4, type: "general", user: "Jan Kowalski", action: "zmienił status pokoju", target: "W trakcie", time: "05.11", icon: User, color: "text-orange-400" },
        ]
    }
];

export function HistoryList() {
    // Default: "Dziś" is expanded (NOT collapsed), others collapsed.
    // Assuming "Dziś" is usually the first item or has ID. using period name as key or logic.
    // Let's initialize with "Wczoraj" and "Ten tydzień" collapsed.
    const [collapsedPeriods, setCollapsedPeriods] = React.useState<Record<string, boolean>>({
        "Wczoraj": true,
        "Ten tydzień": true
    });

    const togglePeriod = (period: string) => {
        setCollapsedPeriods(prev => ({ ...prev, [period]: !prev[period] }));
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <div className="space-y-6">
                {history.map((group, idx) => (
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
                                {/* Chevron placeholder if needed, or just rely on click-to-toggle behavior. Adding Chevron for clarity */}
                            </button>
                            <div className="mx-6 border-b border-white/5"></div>
                        </div>

                        {/* List Rows */}
                        {!collapsedPeriods[group.period] && (
                            <div className="flex flex-col px-6 transition-all duration-300 ease-in-out">
                                {group.items.map((item) => (
                                    <div key={item.id} className="grid grid-cols-[40px_minmax(200px,2fr)_1fr_1fr_40px] gap-4 py-3 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-transparent text-[14px] group">

                                        {/* Icon Column (Simplified: No bg, #6E6E6E) */}
                                        <div className="flex justify-center">
                                            <item.icon className="w-5 h-5 text-[#6E6E6E]" />
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex flex-col justify-center min-w-0">
                                            <div className="text-white font-medium truncate text-[14px]">{item.target}</div>
                                            <div className="text-[12px] text-muted-foreground flex items-center gap-1">
                                                <span>{item.user}</span>
                                                <span>•</span>
                                                <span>{item.action}</span>
                                            </div>
                                        </div>

                                        {/* Time */}
                                        <div className="text-[14px] text-muted-foreground">{item.time}</div>

                                        {/* Spacer */}
                                        <div className="text-[14px] text-muted-foreground"></div>

                                        {/* Menu Action */}
                                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:text-white text-muted-foreground transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
