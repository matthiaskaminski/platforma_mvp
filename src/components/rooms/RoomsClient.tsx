"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, MoreHorizontal, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, User, Edit3, ChevronDown, PlusCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { createRoom } from "@/app/rooms/actions"; // We will create this

// Mock Data for fallback
const PLACEHOLDER_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526585939_1355299613265765_6668356102677043657_n.jpg";

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

interface RoomData {
    id: string;
    name: string;
    type: string;
    status: string; // "finished" | "in_progress" | "not_started"
    area: number;
    tasksCount: number;
    productsCount: number;
    budget: number;
    spent: number;
    img?: string;
    daysAgo?: string;
}

interface RoomsClientProps {
    rooms: RoomData[];
    projectId: string;
}

export default function RoomsClient({ rooms: initialRooms, projectId }: RoomsClientProps) {
    const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateRoom = async () => {
        setIsCreating(true);
        // Temporary simplistic creation for standard "Salon" or similar
        // In real app, this should open a modal.
        try {
            // For now, let's just create a generic room to test integration
            // or maybe redirect to a create form? 
            // The user wanted "Implement Add Room Action".
            // Let's assume we want a quick add button for now or console log.
            console.log("Create room clicked");
            // For the first step, let's just trigger a server action with default data
            // to prove connectivity, or perhaps just show a modal (but I don't have a modal component ready).
            // Let's implement basic server action call.
            await createRoom(projectId, {
                name: "Nowe Pomieszczenie",
                type: "living",
                area: 0,
                budgetAllocated: 0
            });
            // In a perfect world we revalidate path, so we don't need to manually update state strictly,
            // but optimistic update is nice.
        } catch (error) {
            console.error("Failed to create room", error);
        } finally {
            setIsCreating(false);
        }
    };

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
                <form action={handleCreateRoom} className="self-center md:self-stretch">
                    <Button disabled={isCreating} type="submit" className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm w-full md:w-auto">
                        {isCreating ? <PlusCircle className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Dodaj nowe pomieszczenie
                    </Button>
                </form>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 gap-3 w-full flex-1 min-h-0 overflow-y-auto pr-1">
                {rooms.length > 0 ? rooms.map((room) => {
                    const Icon = iconMap[room.type] || Armchair;
                    // Safe status fallback
                    const configKey = (room.status in statusConfig) ? room.status as keyof typeof statusConfig : 'not_started';
                    const status = statusConfig[configKey];

                    const progress = room.budget > 0 ? (room.spent / room.budget) * 100 : 0;

                    return (
                        <Card key={room.id} className="overflow-hidden flex flex-col p-4 gap-5 group hover:border-white/10 transition-colors w-full min-h-[400px]">
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
                                        <p className="text-sm text-muted-foreground">{room.daysAgo || 'Niedawno'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <span className="text-muted-foreground/60">Status:</span>
                                    {/* Using Badge Component */}
                                    <Badge status={configKey} dot className="bg-transparent px-0 font-semibold gap-2">
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
                                        <img src={room.img || PLACEHOLDER_IMG} alt={room.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Right: Info Box */}
                                <div className="flex-1 bg-[#1B1B1B] rounded-xl p-4 flex flex-col justify-between">
                                    {/* Task Badge */}
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-muted-foreground">Zadania</span>
                                        <span
                                            className={cn("text-[14px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                                                room.tasksCount === 0 ? 'bg-[#2A2A2A] text-zinc-500' : 'bg-white text-black'
                                            )}
                                        >
                                            {room.tasksCount}
                                        </span>
                                    </div>

                                    {/* Stats Grid - Increased font sizes */}
                                    <div className="space-y-3 py-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Metraż</span>
                                            <span className="text-base font-medium">{room.area}m²</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Typ</span>
                                            <span className="text-base font-medium truncate max-w-[80px]" title={room.type}>{room.type}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Produkty</span>
                                            <span className="text-base font-medium">{room.productsCount}</span>
                                        </div>
                                    </div>

                                    {/* Budget */}
                                    <div className="space-y-1.5 pt-3 border-t border-white/5 mt-auto">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Budżet</span>
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
                }) : (
                    <div className="col-span-full flex flex-col items-center justify-center p-10 text-muted-foreground opacity-50">
                        <Armchair className="w-16 h-16 mb-4" />
                        <p className="text-lg">Brak pomieszczeń. Dodaj pierwsze!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
