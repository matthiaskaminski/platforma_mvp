"use client";

import React from "react";
import Link from "next/link";
import { Plus, Trash2, MoreHorizontal, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, User, Edit3, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Mock Data
const PLACEHOLDER_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526585939_1355299613265765_6668356102677043657_n.jpg";

const rooms = [
    { id: 1, name: "Łazienka", type: "bathroom", status: "finished", daysAgo: "2 dni temu", area: "6,5m²", floor: 1, products: 12, budget: 54000, spent: 54000, img: PLACEHOLDER_IMG, tasks: 0 },
    { id: 2, name: "Salon", type: "living", status: "in_progress", daysAgo: "2 dni temu", area: "28m²", floor: 1, products: 18, budget: 96000, spent: 85600, img: PLACEHOLDER_IMG, tasks: 2 },
    { id: 3, name: "Kuchnia", type: "kitchen", status: "in_progress", daysAgo: "2 dni temu", area: "14m²", floor: 1, products: 15, budget: 84000, spent: 76200, img: PLACEHOLDER_IMG, tasks: 3 },
    { id: 4, name: "Sypialnia", type: "bedroom", status: "in_progress", daysAgo: "2 dni temu", area: "16m²", floor: 1, products: 14, budget: 60000, spent: 41600, img: PLACEHOLDER_IMG, tasks: 3 },
    { id: 5, name: "Pokój dziecięcy", type: "kids", status: "not_started", daysAgo: "2 dni temu", area: "8m²", floor: 1, products: 0, budget: 36000, spent: 0, img: PLACEHOLDER_IMG, tasks: 3 },
    { id: 6, name: "Przedpokój", type: "hall", status: "in_progress", daysAgo: "2 dni temu", area: "8,5m²", floor: 1, products: 5, budget: 24000, spent: 10200, img: PLACEHOLDER_IMG, tasks: 6 },
];

const statusConfig = {
    finished: { label: "Zakończone", color: "text-zinc-400", dot: "bg-zinc-400" },
    in_progress: { label: "W trakcie", color: "text-[#91E8B2]", dot: "bg-[#91E8B2]" },
    not_started: { label: "Nie rozpoczęte", color: "text-[#91A3E8]", dot: "bg-[#91A3E8]" },
};

const iconMap: Record<string, any> = {
    bathroom: Bath,
    living: Armchair,
    kitchen: Utensils,
    bedroom: BedDouble,
    kids: Baby,
    hall: DoorOpen
}

export default function RoomsPage() {
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-0 overflow-hidden w-full">

            {/* Filters & Actions Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* 1. Filter Bar - Separate Container */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Sortuj według</span>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[160px] justify-between h-[48px]">
                            Nazwa pomieszczenia
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[140px] justify-between h-[48px]">
                            Data utworzenia
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Budżet
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* 2. Add Button - Separate Element */}
                <Button className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm self-center md:self-stretch">
                    <Plus className="w-5 h-5" />
                    Dodaj nowe pomieszczenie
                </Button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 gap-3 w-full flex-1 min-h-0">
                {rooms.map((room) => {
                    const Icon = iconMap[room.type] || Armchair;
                    const statusKey = room.status as keyof typeof statusConfig; // e.g. 'in_progress'
                    const status = statusConfig[statusKey] || statusConfig.not_started;
                    const progress = (room.spent / room.budget) * 100;

                    return (
                        <Card key={room.id} className="overflow-hidden flex flex-col p-4 gap-5 group hover:border-white/10 transition-colors w-full h-full">
                            {/* Header Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#1B1B1B] rounded-xl text-white/70">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-[16px] text-white">{room.name}</h3>
                                            <Edit3 className="w-4 h-4 text-muted-foreground/40 cursor-pointer hover:text-white transition-colors" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">{room.daysAgo}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <span className="text-muted-foreground/60">Status:</span>
                                    {/* Using Badge Component */}
                                    <Badge status={room.status as "in_progress" | "finished" | "not_started"} dot className="bg-transparent px-0 font-semibold gap-2">
                                        {status.label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Middle Content: Image + Info Box */}
                            <div className="flex gap-4 flex-1 min-h-0">
                                {/* Left: Image */}
                                <div className="w-[45%] relative rounded-xl overflow-hidden bg-zinc-800">
                                    <div className="absolute inset-0 bg-neutral-800 group-hover:scale-105 transition-transform duration-700">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={room.img} alt={room.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Right: Info Box */}
                                <div className="flex-1 bg-[#1B1B1B] rounded-xl p-4 flex flex-col justify-between">
                                    {/* Task Badge */}
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">Zadania</span>
                                        <span
                                            className={cn("text-[14px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                                                room.tasks === 0 ? 'bg-[#2A2A2A] text-zinc-500' : 'bg-white text-black'
                                            )}
                                        >
                                            {room.tasks}
                                        </span>
                                    </div>

                                    {/* Stats Grid - Increased font sizes */}
                                    <div className="space-y-3 py-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Metraż</span>
                                            <span className="text-base font-medium">{room.area}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Piętro</span>
                                            <span className="text-base font-medium">{room.floor}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Liczba produktów</span>
                                            <span className="text-base font-medium">{room.products}</span>
                                        </div>
                                    </div>

                                    {/* Budget */}
                                    <div className="space-y-1.5 pt-3 border-t border-white/5 mt-auto">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Łączny budżet</span>
                                            <span className="text-base font-medium">{room.budget.toLocaleString('pl-PL')} zł</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Pozostało</span>
                                            <span className="text-base font-medium">{(room.budget - room.spent).toLocaleString('pl-PL')} zł</span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2 bg-[#252525] rounded-full mt-3 overflow-hidden w-full">
                                            <div className="h-full bg-white rounded-full relative" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Actions */}
                            <div className="flex gap-3 mt-auto">
                                <Link href={`/rooms/${room.id}`} className="flex-1">
                                    <Button className="w-full bg-[#222222] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white text-sm font-medium py-3 rounded-lg text-center transition-colors h-[48px]">
                                        Przejdź do pomieszczenia
                                    </Button>
                                </Link>
                                <Button variant="secondary" className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-2 text-sm font-medium h-[48px]">
                                    <MoreHorizontal className="w-5 h-5" />
                                    Edytuj
                                </Button>
                                <Button variant="secondary" className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium h-[48px]">
                                    <Trash2 className="w-5 h-5" />
                                    Usuń
                                </Button>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}
