"use client";

import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Armchair, Bath, Utensils, BedDouble, Baby, DoorOpen, MoreHorizontal } from "lucide-react";

// Icons Map
const iconMap: Record<string, any> = {
    BATHROOM: Bath,
    LIVING_ROOM: Armchair,
    KITCHEN: Utensils,
    BEDROOM: BedDouble,
    KIDS_ROOM: Baby,
    HALL: DoorOpen,
    OTHER: DoorOpen
}

// Status labels and colors
const statusConfig: Record<string, { label: string; color: string }> = {
    'not_started': { label: "Nierozpoczęte", color: "#808080" },
    'in_progress': { label: "W trakcie", color: "#91E8B2" },
    'finished': { label: "Zakończone", color: "#4A90E2" }
}

interface RoomStatsDnDProps {
    roomData: {
        name: string;
        type: string;
        status: string;
        area: number | null;
        floorNumber: number | null;
        tasksCount: number;
        productsCount: number;
    }
}

// Tile Component
function RoomStatTile({ item, roomType, isOverlay, ...props }: { item: any, roomType: string, isOverlay?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
    const Icon = iconMap[roomType] || DoorOpen;

    return (
        <div
            className={`bg-[#151515] p-4 rounded-2xl flex flex-col justify-between h-[110px] select-none touch-none
                ${isOverlay
                    ? "shadow-2xl scale-105 z-50 cursor-grabbing relative"
                    : "cursor-grab hover:bg-[#1B1B1B] transition-colors relative"
                }
            `}
            {...props}
        >
            {item.type === 'name' && (
                <>
                    <div className="flex items-center gap-2 text-white">
                        <Icon className="w-5 h-5 text-[#6E6E6E]" />
                        <span className="font-semibold text-[16px]">{item.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.sub}</span>
                </>
            )}

            {item.type === 'status' && (
                <>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]"></span>
                        <span className="font-semibold text-[14px] text-[#F3F3F3]">{item.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.sub}</span>
                    {!isOverlay && <div className="absolute top-4 right-4 text-muted-foreground/30"><MoreHorizontal className="w-4 h-4" /></div>}
                </>
            )}

            {item.type === 'text' && (
                <>
                    <span className="text-xl font-semibold text-white">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.sub}</span>
                </>
            )}
        </div>
    );
}

// Sortable Wrapper
function SortableStatTile({ id, item, roomType }: { id: string, item: any, roomType: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
            <RoomStatTile item={item} roomType={roomType} />
        </div>
    );
}

export function RoomStatsDnD({ roomData }: RoomStatsDnDProps) {
    const statusInfo = statusConfig[roomData.status] || statusConfig['not_started'];

    // Build stats array from roomData
    const buildStats = () => [
        { id: 'stat-name', type: 'name', label: roomData.name, sub: "Pomieszczenie" },
        { id: 'stat-status', type: 'status', label: statusInfo.label, sub: "Status", statusColor: statusInfo.color },
        { id: 'stat-area', type: 'text', label: roomData.area ? `${roomData.area}m²` : "Brak", sub: "Metraż" },
        { id: 'stat-floor', type: 'text', label: roomData.floorNumber?.toString() || "Brak", sub: "Piętro" },
        { id: 'stat-tasks', type: 'text', label: roomData.tasksCount.toString(), sub: "Wykonane zadania" },
        { id: 'stat-products', type: 'text', label: roomData.productsCount.toString(), sub: "Produkty" },
    ];

    const [items, setItems] = useState(buildStats());
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0' } },
        }),
    };

    const activeItem = activeId ? items.find(i => i.id === activeId) : null;

    return (
        <DndContext
            id="room-stats-dnd"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 gap-2">
                    {items.map((item) => (
                        <SortableStatTile key={item.id} id={item.id} item={item} roomType={roomData.type} />
                    ))}
                </div>
            </SortableContext>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeItem ? <RoomStatTile item={activeItem} roomType={roomData.type} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
