"use client";

import React, { useState } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare, Search, Filter, Plus, ChevronDown, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, Layers } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

// Mock Data
type TaskStatus = "Przeterminowane" | "W trakcie" | "Do zrobienia" | "Zakończone";

interface Task {
    id: number;
    name: string;
    status: TaskStatus;
    statusColor: string; // Tailwind class
    dotColor: string; // Tailwind class
    startDate: string;
    endDate: string;
    note: string;
    checked: boolean;
}

interface Sprint {
    id: number;
    title: string;
    dateRange: string;
    tasks: Task[];
}

interface RoomGroup {
    id: string;
    name: string;
    type: string;
    sprints: Sprint[];
}

const tasksData: RoomGroup[] = [
    {
        id: "general",
        name: "Zadania ogólne",
        type: "general",
        sprints: [
            {
                id: 1001,
                title: "Zadania bieżące",
                dateRange: "01.11 - 30.11",
                tasks: [
                    {
                        id: 101,
                        name: "Spotkanie z architektem ws. instalacji elektrycznej",
                        status: "Do zrobienia",
                        statusColor: "text-[#EDEDED]",
                        dotColor: "bg-[#6E8BCB] shadow-[0_0_8px_rgba(110,139,203,0.4)]",
                        startDate: "15.11.2024",
                        endDate: "20.11.2024",
                        note: "Uzgodnić rozmieszczenie gniazdek w kuchni i salonie.",
                        checked: false
                    },
                    {
                        id: 102,
                        name: "Opłacić fakturę za projekt wykonawczy",
                        status: "Przeterminowane",
                        statusColor: "text-[#EDEDED]",
                        dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]",
                        startDate: "01.11.2024",
                        endDate: "05.11.2024",
                        note: "Faktura FV/2024/11/01 - kwota 4500 zł netto.",
                        checked: false
                    }
                ]
            }
        ]
    },
    {
        id: "salon",
        name: "Salon",
        type: "living",
        sprints: [
            {
                id: 2001,
                title: "Sprint 1",
                dateRange: "01.11 - 14.11",
                tasks: [
                    {
                        id: 1,
                        name: "Skontaktować się z dostawcą lamp",
                        status: "Przeterminowane",
                        statusColor: "text-[#EDEDED]",
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
                        statusColor: "text-[#EDEDED]",
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
                        statusColor: "text-[#EDEDED]",
                        dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]",
                        startDate: "06.11.2025",
                        endDate: "Dziś",
                        note: "Dodać ostatnie zakupy (dywan, poduszki) i zaktualizować procent wykorzystania budżetu",
                        checked: false
                    }
                ]
            },
            {
                id: 2002,
                title: "Sprint 2",
                dateRange: "15.11 - 30.11",
                tasks: [
                    {
                        id: 4,
                        name: "Wybrać rośliny doniczkowe",
                        status: "W trakcie",
                        statusColor: "text-[#EDEDED]",
                        dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]",
                        startDate: "10.11.2024",
                        endDate: "Dziś",
                        note: "Klient poprosił o duże rośliny (Monstera, Fikus). Budżet: ~1,200 zł",
                        checked: true
                    }
                ]
            }
        ]
    },
    {
        id: "kitchen",
        name: "Kuchnia",
        type: "kitchen",
        sprints: [
            {
                id: 3001,
                title: "Sprint 1",
                dateRange: "01.11 - 14.11",
                tasks: [
                    {
                        id: 201,
                        name: "Wybrać kolor frontów szafek",
                        status: "W trakcie",
                        statusColor: "text-[#EDEDED]",
                        dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]",
                        startDate: "12.11.2024",
                        endDate: "25.11.2024",
                        note: "Klient waha się między matem a połyskiem. Przygotować wizualizacje.",
                        checked: false
                    }
                ]
            }
        ]
    },
    {
        id: "bedroom",
        name: "Sypialnia",
        type: "bedroom",
        sprints: [
            {
                id: 4001,
                title: "Sprint 1",
                dateRange: "01.11 - 14.11",
                tasks: [
                    {
                        id: 301,
                        name: "Zamówić materac",
                        status: "Do zrobienia",
                        statusColor: "text-[#EDEDED]",
                        dotColor: "bg-[#6E8BCB] shadow-[0_0_8px_rgba(110,139,203,0.4)]",
                        startDate: "-",
                        endDate: "30.11.2024",
                        note: "Wymiar 160x200, twardość H3.",
                        checked: false
                    }
                ]
            }
        ]
    }
];

const statusMap: Record<string, "overdue" | "in_progress" | "not_started" | "finished"> = {
    "Przeterminowane": "overdue",
    "W trakcie": "in_progress",
    "Do zrobienia": "not_started",
    "Zakończone": "finished"
};

const iconMap: Record<string, any> = {
    general: Layers,
    bathroom: Bath,
    living: Armchair,
    kitchen: Utensils,
    bedroom: BedDouble,
    kids: Baby,
    hall: DoorOpen
};

export default function TasksPage() {
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [collapsedSprints, setCollapsedSprints] = useState<Record<number, boolean>>({});

    const toggleGroup = (id: string) => {
        setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSprint = (id: number) => {
        setCollapsedSprints(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-0 overflow-hidden w-full">
            {/* Toolbar - Matches Rooms Page Styling */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* Left Side: "Lista zadań" Label + Search & Filter */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar min-h-[80px]">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Opcje wyszukiwania i sortowania</span>

                    <div className="flex gap-2 ml-auto items-center">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj zadania..."
                                className="pl-9 bg-[#1B1B1B] border-white/5 h-[48px] placeholder:text-muted-foreground"
                            />
                        </div>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Sortuj
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* Right Side: Add Button */}
                <Button className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm self-center md:self-stretch">
                    <Plus className="w-5 h-5" />
                    Dodaj zadanie
                </Button>
            </div>

            {/* Content Container */}
            <div className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    {/* Sticky Table Header */}
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

                    <div className="px-6 py-6 space-y-8">
                        {tasksData.map((group) => {
                            const Icon = iconMap[group.type] || Layers;
                            return (
                                <div key={group.id} className="pb-2 last:border-0">
                                    {/* Group Header (Room Name) */}
                                    <button
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex items-center gap-3 mb-4 text-lg font-bold text-white hover:text-[#E5E5E5] transition-colors w-full group py-2"
                                    >
                                        <div className={`transition-transform duration-200 ${collapsedGroups[group.id] ? '-rotate-90' : ''}`}>
                                            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                                        </div>

                                        {/* Icon Container - Matching Rooms Page Cards */}
                                        <div className="p-2 bg-[#1B1B1B] rounded-lg text-white/70">
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        <span>{group.name}</span>
                                    </button>

                                    {/* Sprints and Tasks */}
                                    {!collapsedGroups[group.id] && (
                                        <div className="space-y-6 ml-4">
                                            {group.sprints.map((sprint) => (
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
                                                                    className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)_40px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-transparent text-[14px] group/row rounded-none"
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
                                                                        <Badge status={statusMap[task.status] || "none"} dot className="bg-transparent px-0 font-normal gap-2 rounded-none hover:bg-transparent text-[#EDEDED]">
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
                                                                    <div className="text-muted-foreground line-clamp-2 pr-4 text-sm">
                                                                        {task.note}
                                                                    </div>

                                                                    {/* Menu */}
                                                                    <div className="flex justify-center opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer">
                                                                        <div className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
                                                                            <div className="w-1 h-1 bg-muted-foreground rounded-full shadow-[0_4px_0_currentColor,0_-4px_0_currentColor]"></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
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
