"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, MoreHorizontal, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, User, Edit3, ChevronDown, PlusCircle, Briefcase, Home } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CreateRoomModal, getRoomTypeLabel } from "@/components/modals/CreateRoomModal";
import { EditRoomModal } from "@/components/modals/EditRoomModal";
import { deleteRoom } from "@/app/actions/rooms";
import { RoomType, RoomStatus } from "@prisma/client";
import { getRoomColor } from "@/components/dashboard/DashboardClient";

// Mock Data for fallback
const PLACEHOLDER_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526585939_1355299613265765_6668356102677043657_n.jpg";

const statusConfig = {
    finished: { label: "Zakończone", color: "text-zinc-400", dot: "bg-zinc-400" },
    in_progress: { label: "W trakcie", color: "text-[#91E8B2]", dot: "bg-[#91E8B2]" },
    not_started: { label: "Nierozpoczęte", color: "text-[#91A3E8]", dot: "bg-[#91A3E8]" },
};

const iconMap: Record<string, any> = {
    BATHROOM: Bath,
    LIVING: Armchair,
    KITCHEN: Utensils,
    BEDROOM: BedDouble,
    KIDS: Baby,
    HALL: DoorOpen,
    OFFICE: Briefcase,
    OTHER: Home
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
    floorNumber?: number | null;
    img?: string;
    daysAgo?: string;
}

interface RoomsClientProps {
    rooms: RoomData[];
    projectId: string;
    projectBudget: number;
}

export default function RoomsClient({ rooms: initialRooms, projectId, projectBudget }: RoomsClientProps) {
    const [rooms, setRooms] = useState<RoomData[]>(initialRooms);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomData | null>(null);
    const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to pomieszczenie? Tej operacji nie można cofnąć.')) {
            return;
        }

        setDeletingRoomId(roomId);
        try {
            await deleteRoom(roomId);
            window.location.reload();
        } catch (error) {
            console.error('Error deleting room:', error);
            alert('Wystąpił błąd podczas usuwania pomieszczenia');
            setDeletingRoomId(null);
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
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="self-center md:self-stretch h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj nowe pomieszczenie
                </Button>
            </div>

            {/* Grid */}
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:grid-rows-2 gap-3 w-full flex-1 min-h-0 overflow-y-auto pr-1",
                rooms.length === 0 && "flex items-center justify-center"
            )}>
                {rooms.length > 0 ? rooms.map((room, roomIndex) => {
                    const Icon = iconMap[room.type] || Armchair;
                    // Safe status fallback
                    const configKey = (room.status in statusConfig) ? room.status as keyof typeof statusConfig : 'not_started';
                    const status = statusConfig[configKey];

                    // Calculate percentage of project budget this room represents
                    const projectPercentage = projectBudget > 0 ? (room.spent / projectBudget) * 100 : 0;

                    // Get unique color for this room
                    const roomColor = getRoomColor(roomIndex);

                    return (
                        <Card key={room.id} className="overflow-hidden flex flex-col p-4 gap-5 group hover:border-white/10 transition-colors w-full min-h-[400px]">
                            {/* Header Row */}
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="p-3 rounded-xl text-white"
                                        style={{ backgroundColor: roomColor }}
                                    >
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
                                <div className="w-[45%] relative rounded-xl overflow-hidden bg-[#1B1B1B]">
                                    {room.img ? (
                                        <div className="absolute inset-0 bg-neutral-800 group-hover:scale-105 transition-transform duration-700">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={room.img} alt={room.name} className="w-full h-full object-cover transition-opacity" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-[#232323]">
                                            <Icon className="w-6 h-6 text-[#6E6E6E]" />
                                        </div>
                                    )}
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
                                            <span className="text-base font-medium truncate max-w-[120px]" title={getRoomTypeLabel(room.type)}>{getRoomTypeLabel(room.type)}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Piętro</span>
                                            <span className="text-base font-medium">{room.floorNumber ?? 'Brak'}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Produkty</span>
                                            <span className="text-base font-medium">{room.productsCount}</span>
                                        </div>
                                    </div>

                                    {/* Budget - show spent amount and % of project budget */}
                                    <div className="space-y-1.5 pt-3 border-t border-white/5 mt-auto">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Wydano</span>
                                            <span className="text-base font-medium">{room.spent.toLocaleString('pl-PL')} zł</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm text-muted-foreground">Udział w budżecie</span>
                                            <span className="text-base font-medium">{projectPercentage.toFixed(1)}%</span>
                                        </div>

                                        {/* Progress Bar - shows percentage of project budget */}
                                        <div className="h-2 bg-[#252525] rounded-full mt-3 overflow-hidden w-full">
                                            <div className="h-full bg-white rounded-full relative" style={{ width: `${Math.min(projectPercentage, 100)}%` }}></div>
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
                                <Button
                                    variant="secondary"
                                    onClick={() => setEditingRoom(room)}
                                    className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-2 text-sm font-medium h-[48px]"
                                >
                                    <MoreHorizontal className="w-5 h-5" />
                                    Edytuj
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handleDeleteRoom(room.id)}
                                    disabled={deletingRoomId === room.id}
                                    className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium h-[48px]"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    {deletingRoomId === room.id ? 'Usuwanie...' : 'Usuń'}
                                </Button>
                            </div>
                        </Card>
                    )
                }) : (
                    <div className="flex flex-col items-center justify-center">
                        <Armchair className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="text-base text-muted-foreground">Brak pomieszczeń. Dodaj pierwsze!</p>
                    </div>
                )}
            </div>

            {/* Create Room Modal */}
            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                projectId={projectId}
            />

            {/* Edit Room Modal */}
            {editingRoom && (
                <EditRoomModal
                    isOpen={!!editingRoom}
                    onClose={() => setEditingRoom(null)}
                    room={{
                        id: editingRoom.id,
                        name: editingRoom.name,
                        type: editingRoom.type.toUpperCase() as RoomType,
                        status: editingRoom.status.toUpperCase() as RoomStatus,
                        area: editingRoom.area,
                        budgetAllocated: editingRoom.budget,
                        floorNumber: editingRoom.floorNumber,
                        coverImage: editingRoom.img || null,
                    }}
                />
            )}
        </div>
    );
}
