"use client";

import React, { useState } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// Mock Data
const sprints = [
    {
        id: 1,
        title: "Sprint 1",
        dateRange: "01.11 - 14.11",
        tasks: [
            {
                id: 1,
                name: "Skontaktować się z dostawcą lamp",
                status: "Przeterminowane",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]",
                startDate: "01.11.2024",
                endDate: "10.11.2024",
                note: "Opóźnienie dostawy lamp stojących - wymaga pilnego kontaktu! Produkt: Lampy stojące (2 szt.) - 5,600 zł",
                checked: false
            },
            {
                id: 2,
                name: "Zatwierdzić próbki tkanin do sofy",
                status: "Przeterminowane",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]",
                startDate: "05.11.2024",
                endDate: "Dziś 18:00",
                note: "Klient musi wybrać finalną tkaninę do poduszek",
                checked: true
            },
            {
                id: 3,
                name: "Zaktualizować budżet salonu",
                status: "W trakcie",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]",
                startDate: "06.11.2025",
                endDate: "Dziś",
                note: "Dodać ostatnie zakupy (dywan, poduszki) i zaktualizować procent wykorzystania budżetu",
                checked: false
            },
            {
                id: 4,
                name: "Wybrać rośliny doniczkowe",
                status: "W trakcie",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]",
                startDate: "10.11.2024",
                endDate: "Dziś",
                note: "Klient poprosił o duże rośliny (Monstera, Fikus). Budżet: ~1,200 zł",
                checked: true
            },
            {
                id: 5,
                name: "Zamówić dodatkowe poduszki dekoracyjne",
                status: "Do zrobienia",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#6E8BCB] shadow-[0_0_8px_rgba(110,139,203,0.4)]",
                startDate: "-",
                endDate: "13.11.2025",
                note: "8 szt. w różnych kolorach pasujących do dywanu i sofy (ciepłe beże, granat). Budżet: ~2,000 zł",
                checked: false
            }
        ]
    },
    {
        id: 2,
        title: "Sprint 2",
        dateRange: "15.11 - 30.11",
        tasks: [
            {
                id: 6,
                name: "Zaplanować montaż regałów String System",
                status: "Do zrobienia",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#6E8BCB] shadow-[0_0_8px_rgba(110,139,203,0.4)]",
                startDate: "-",
                endDate: "20.11.2025",
                note: "Regały dostarczone (08.11), potrzebny monter do instalacji na ścianie. Produkt: Regały String - 8,000 zł. Podzadania: 0/3",
                checked: false
            },
            {
                id: 7,
                name: "Zatwierdzić próbki tkanin do sofy",
                status: "Do zrobienia",
                statusColor: "text-[#F3F3F3]",
                dotColor: "bg-[#6E8BCB] shadow-[0_0_8px_rgba(110,139,203,0.4)]",
                startDate: "-",
                endDate: "21.11.2025",
                note: "Klient musi wybrać finalną tkaninę do poduszek",
                checked: false
            }
        ]
    }
];

const statusMap: Record<string, "overdue" | "in_progress" | "not_started"> = {
    "Przeterminowane": "overdue",
    "W trakcie": "in_progress",
    "Do zrobienia": "not_started"
};

export function TasksList() {
    const [collapsedSprints, setCollapsedSprints] = useState<Record<number, boolean>>({});

    const toggleSprint = (id: number) => {
        setCollapsedSprints(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {/* Headers Row */}
            {/* Headers Row */}
            <div className="sticky top-0 bg-[#0E0E0E] z-10">
                <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)_40px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground items-center">
                    <div className="text-center"></div>
                    <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Zadania</div>
                    <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Status</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data rozpoczęcia</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Data zakończenia</div>
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Notatka</div>
                    <div></div>
                </div>
                <div className="mx-6 border-b border-white/5"></div>
            </div>

            <div className="mt-4 px-6 space-y-6">
                {sprints.map((sprint) => (
                    <div key={sprint.id} className="border-b border-white/5 pb-2 last:border-0">
                        {/* Sprint Header */}
                        <button
                            onClick={() => toggleSprint(sprint.id)}
                            className="flex items-center gap-2 mb-2 text-sm font-medium text-white/80 hover:text-white transition-colors w-full group py-2"
                        >
                            <Clock className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                            <span>{sprint.title}</span>
                            <span className="text-[14px] text-muted-foreground/60 font-normal">{sprint.dateRange}</span>
                            <ChevronDownSimple className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${collapsedSprints[sprint.id] ? '-rotate-90' : ''}`} />
                        </button>

                        {/* Tasks Rows */}
                        {!collapsedSprints[sprint.id] && (
                            <div className="space-y-0">
                                {sprint.tasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)_40px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors rounded-none border-b border-white/5 last:border-transparent text-[14px]"
                                    >
                                        {/* Checkbox */}
                                        <div className="flex justify-center">
                                            <button className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${task.checked ? 'bg-white border-white text-black' : 'border-white/20 hover:border-white/40'}`}>
                                                {task.checked && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>

                                        {/* Name */}
                                        <div className={`font-medium ${task.checked ? 'text-muted-foreground line-through' : 'text-white'}`}>
                                            {task.name}
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-2">
                                            <Badge status={statusMap[task.status] || "none"} dot className="bg-transparent px-0 font-normal gap-2 rounded-none hover:bg-transparent">
                                                {task.status}
                                            </Badge>
                                        </div>

                                        {/* Start Date */}
                                        <div className="text-muted-foreground">
                                            {task.startDate}
                                        </div>

                                        {/* End Date */}
                                        <div className={`${task.endDate.includes("Dziś") ? "text-white font-medium" : "text-muted-foreground"}`}>
                                            {task.endDate}
                                        </div>

                                        {/* Note */}
                                        <div className="text-muted-foreground line-clamp-2 pr-4">
                                            {task.note}
                                        </div>

                                        {/* Menu */}
                                        <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            {/* Menu icon placeholder or similar action */}
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

function ChevronDownSimple({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
