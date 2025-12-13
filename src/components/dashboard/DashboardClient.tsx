
"use client";

import React, { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, ClipboardList, Palette, Image as ImageIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { User } from '@supabase/supabase-js'

// Mock Data
const budgetData = [
    { name: "Wydano", value: 168400, color: "#E5E5E5" }, // White for Spent (Prominent)
    { name: "Planowane", value: 115200, color: "#6E6E6E" }, // Gray for Planned
    { name: "Pozostało", value: 86400, color: "#232323" }, // Dark for Remaining
];

const initialTiles = [
    { id: 'tile-1', label: "Mieszkanie", value: "", sub: "Rodzaj zabudowy" },
    { id: 'tile-2', label: "85m²", value: "", sub: "Metraż" },
    { id: 'tile-3', label: "1", value: "", sub: "Liczba pięter" },
    { id: 'tile-4', label: "6", value: "", sub: "Pomieszczenia" },
    { id: 'tile-5', label: "73", value: "", sub: "Produkty" },
    { id: 'tile-6', label: "12", value: "", sub: "Wykonane zadania" },
];

const newProducts = [
    {
        name: "Łóżko z drewna z plecionką",
        brand: "Westwing",
        price: "3 719,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/DEQ23WES93078-204130_d6587456a27fd9ecc8c678b730505a43_dtl_1.webp"
    },
    {
        name: "Stolik pomocniczy Tarse",
        brand: "Kave Home",
        price: "489,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png"
    },
    {
        name: "Dywan Tigris - Beige/Brown",
        brand: "Nordic Knots",
        price: "2 750,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/509_0776c21ac3-tigr-bei-pp-1600.jpg"
    },
];

const visualizationImages = [
    "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526570979_1355299693265757_7539015905078556121_n.jpg",
    "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526585939_1355299613265765_6668356102677043657_n.jpg",
    "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg",
    "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/527337457_1355299866599073_4633219416307881665_n.jpg"
];

// Presentation Component
function Tile({ tile, isOverlay, ...props }: { tile: any, isOverlay?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`p-4 rounded-2xl flex flex-col justify-between transition-colors touch-none select-none h-full bg-[var(--color-card)]
        ${isOverlay
                    ? "shadow-2xl scale-105 z-50 border-[var(--color-border)] cursor-grabbing"
                    : "cursor-grab hover:bg-[#1B1B1B] transition-colors"
                }
      `}
            {...props}
        >
            <span className="text-[28px] font-semibold">{tile.label}</span>
            <span className="text-sm text-muted-foreground font-medium tracking-wide">{tile.sub}</span>
        </div>
    );
}

function SortableTile({ id, tile }: { id: string, tile: any }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1, // Hide original when dragging (placeholder)
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
            <Tile tile={tile} />
        </div>
    );
}

interface DashboardClientProps {
    user: any // Accepting generic object (Profile or User) with email
    project: any // Type this properly if possible, or use explicit interface
    stats: {
        budget: { spent: number; planned: number; total: number; remaining: number }
        daysConfig: { start: Date; end: Date }
        activeTasks: number
    }
}

export default function DashboardClient({ user, project, stats }: DashboardClientProps) {
    const [statsTiles, setStatsTiles] = useState(initialTiles);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Update tiles with real data if project exists
    React.useEffect(() => {
        if (project && stats) {
            setStatsTiles(tiles => tiles.map(tile => {
                switch (tile.id) {
                    case 'tile-1': return { ...tile, value: project.name } // Use Name instead of type for now
                    case 'tile-2': return { ...tile, value: `${project.totalArea || 0}m²` }
                    case 'tile-3': return { ...tile, value: String(project.floorsCount || 0) }
                    case 'tile-4': return { ...tile, value: String(project.roomsCount || 0) }
                    case 'tile-5': return { ...tile, value: "0" } // TODO: Count products properly
                    case 'tile-6': return { ...tile, value: String(stats.activeTasks) }
                    default: return tile
                }
            }))
        }
    }, [project, stats])

    // Helpers for formatting
    const formatMoney = (amount: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 }).format(amount).replace('zł', ' zł')

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setStatsTiles((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    }

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0',
                },
            },
        }),
    };

    const activeTile = activeId ? statsTiles.find(t => t.id === activeId) : null;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
            {/* Header Bar */}
            <Card className="shrink-0 flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-3 min-h-[80px]">
                <div className="flex items-center gap-3">
                    <h2 className="text-[28px] font-bold tracking-tight text-[#E5E5E5]">
                        Cześć, {user?.email?.split('@')[0] || 'Gościu'}! 👋
                    </h2>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground">Status projektu:</span>
                    <div className="flex items-center gap-2">
                        <Badge status="in_progress" dot className="px-0 text-[20px] bg-transparent font-normal text-foreground [&_span]:shadow-[0_0_8px_rgba(145,232,178,0.5)]">Aktywny</Badge>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground">Data rozpoczęcia:</span>
                    <span className="text-foreground text-[20px]">{new Date(project?.startDate || new Date()).toLocaleDateString('pl-PL')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground">Data zakończenia:</span>
                    <span className="text-foreground text-[20px]">{new Date(project?.deadline || new Date()).toLocaleDateString('pl-PL')}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <span className="text-muted-foreground">Pozostało:</span>
                    <span className="text-foreground text-[20px]">
                        {Math.ceil((new Date(project?.deadline || new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dni
                    </span>
                </div>
            </Card>

            {/* Grid Layout - 3 Columns */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1 min-h-0">

                {/* Column 1: Stats & Calendar */}
                <div className="xl:col-span-3 flex flex-col gap-3 h-full min-h-0">
                    {/* Stats Tiles Grid (Sortable) */}
                    <DndContext
                        id="dashboard-dnd-context"
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={statsTiles.map(tile => tile.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                                {statsTiles.map((tile) => (
                                    <SortableTile key={tile.id} id={tile.id} tile={tile} />
                                ))}
                            </div>
                        </SortableContext>

                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeTile ? <Tile tile={activeTile} isOverlay /> : null}
                        </DragOverlay>
                    </DndContext>

                    {/* Calendar */}
                    <Card className="flex flex-col justify-center shrink-0 min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-[20px]">Październik</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="w-6 h-6 p-0 hover:text-white text-muted-foreground"><ChevronLeft className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="w-6 h-6 p-0 hover:text-white text-muted-foreground"><ChevronRight className="w-4 h-4" /></Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground font-medium mb-1">
                            {['Po', 'Wt', 'Śr', 'Cz', 'Pi', 'So', 'Nd'].map(d => <span key={d}>{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2 flex-1 min-h-0 content-center">
                            {[29, 30].map((day) => (
                                <div key={`prev-${day}`} className="aspect-square flex items-center justify-center rounded-lg text-sm bg-[#1B1B1B] text-muted-foreground/50">
                                    {day}
                                </div>
                            ))}
                            {Array.from({ length: 31 }).map((_, i) => {
                                const day = i + 1;
                                const isToday = day === 10;
                                return (
                                    <div
                                        key={day}
                                        className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all cursor-pointer border border-transparent
                      ${isToday
                                                ? 'bg-[#F3F3F3] text-black font-bold'
                                                : 'bg-[#232323] text-muted-foreground hover:bg-[#2F2F2F] hover:text-white'
                                            }`}
                                    >
                                        {day}
                                    </div>
                                )
                            })}
                            {[1, 2].map((day) => (
                                <div key={`next-${day}`} className="aspect-square flex items-center justify-center rounded-lg text-sm bg-[#1B1B1B] text-muted-foreground/50">
                                    {day}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Column 2: Budget & Tasks/Interactions */}
                <div className="xl:col-span-5 flex flex-col gap-3 h-full min-h-0">

                    {/* Budget Widget - Redesigned V2 */}
                    <Card className="flex flex-col gap-4 relative overflow-hidden flex-1 min-h-0">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"></div>

                        {/* Header: Title & Button */}
                        <div className="flex justify-between items-center shrink-0">
                            <h3 className="font-medium text-[20px]">Budżet</h3>
                            <Button variant="secondary" size="sm" className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]">Planer</Button>
                        </div>

                        {/* Main Content: Chart + Categories */}
                        <div className="flex flex-col md:flex-row gap-6 items-center flex-1 min-h-0">
                            {/* Chart (Donut) */}
                            <div className="w-full md:w-5/12 h-full relative flex flex-col items-center justify-center shrink-0 min-h-[140px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={budgetData}
                                            innerRadius="75%" // Thinner donut
                                            outerRadius="92%"
                                            paddingAngle={5} // Gaps
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={8} // Rounded ends
                                        >
                                            {budgetData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[#6E6E6E] text-xs font-medium mb-0.5">Całkowity</span>
                                    <span className="text-[20px] font-bold tracking-tight text-[#E5E5E5]">{formatMoney(stats.budget.total)}</span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="flex-1 w-full flex flex-col justify-center gap-5"> {/* Increased gap (gap-5) */}
                                <div className="flex flex-col gap-4"> {/* Increased item gap (gap-4) */}
                                    {/* Kategoria 1 */}
                                    <div>
                                        <div className="flex justify-between text-[14px] mb-1.5"> {/* 14px Text */}
                                            <span className="text-[#E5E5E5] font-medium">Materiały budowlane</span>
                                            <span className="text-[#6E6E6E]">90%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden border-none"> {/* Thicker bar h-2.5 */}
                                            <div className="h-full bg-[#E5E5E5] w-[90%] rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Kategoria 2 */}
                                    <div>
                                        <div className="flex justify-between text-[14px] mb-1.5"> {/* 14px Text */}
                                            <span className="text-[#E5E5E5] font-medium">Meble i dekoracje</span>
                                            <span className="text-[#6E6E6E]">40%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden border-none"> {/* Thicker bar h-2.5 */}
                                            <div className="h-full bg-[#6E6E6E] w-[40%] rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Kategoria 3 */}
                                    <div>
                                        <div className="flex justify-between text-[14px] mb-1.5"> {/* 14px Text */}
                                            <span className="text-[#E5E5E5] font-medium">Robocizna</span>
                                            <span className="text-[#6E6E6E]">60%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden border-none"> {/* Thicker bar h-2.5 */}
                                            <div className="h-full bg-[#232323] w-[60%] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoices Status */}
                                <div className="pt-2 flex items-center border-t border-white/5 mt-1">
                                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]"></span>
                                        <span className="text-[14px] font-medium text-[#E5E5E5]">2 nieopłacone faktury</span> {/* 14px Text */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Metrics (4 columns) */}
                        <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div> {/* Color dot from Chart (Wydano) */}
                                    <span className="text-[14px] text-[#6E6E6E]">Wydano</span> {/* 14px Label */}
                                </div>
                                <span className="text-[16px] font-medium text-[#6E6E6E]">{formatMoney(stats.budget.spent)}</span> {/* 16px Value */}
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[#6E6E6E]"></div> {/* Color dot from Chart (Planowane) */}
                                    <span className="text-[14px] text-[#6E6E6E]">Planowane</span> {/* 14px Label */}
                                </div>
                                <span className="text-[16px] font-medium text-[#E5E5E5]">{formatMoney(stats.budget.planned)}</span> {/* 16px Value */}
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[#232323]"></div> {/* Color dot from Chart (Pozostało) */}
                                    <span className="text-[14px] text-[#6E6E6E]">Pozostało</span> {/* 14px Label, Replaces Razem */}
                                </div>
                                <span className="text-[16px] font-bold text-[#E5E5E5]">{formatMoney(stats.budget.remaining)}</span> {/* 16px Value */}
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-2">
                                <span className="text-[14px] text-[#6E6E6E] mb-1">Ten mies.</span> {/* 14px Label */}
                                <span className="text-[16px] font-medium text-[#E5E5E5]">{formatMoney(0)}</span> {/* 16px Value */}
                            </div>
                        </div>
                    </Card>

                    {/* Split Row: Tasks & Interactions */}
                    <div className="grid grid-cols-2 gap-3 flex-[1.4] min-h-0">
                        {/* Tasks */}
                        <Card className="flex flex-col h-full min-h-0">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[20px] font-medium text-[#E5E5E5]">Lista zadań</h3>
                                    <span className="w-5 h-5 bg-[#E5E5E5] text-black text-xs font-bold rounded-full flex items-center justify-center">2</span>
                                </div>
                                <Button variant="secondary" size="sm" className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]">Zarządzaj</Button>
                            </div>

                            <Button variant="ghost" className="w-full py-3 border border-dashed border-white/10 rounded-lg text-muted-foreground hover:text-white hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium mb-4 justify-center">
                                + Dodaj nowe zadanie
                            </Button>

                            <div className="space-y-3 flex-1 flex flex-col overflow-y-auto pr-1 min-h-0 no-scrollbar">
                                <div className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 hover:bg-[#232323] transition-colors cursor-pointer rounded-xl">
                                    <h4 className="text-[16px] font-medium mb-1">Skontaktować się z dostawcą lamp</h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#F1F1F1] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]"></span> Przeterminowane</span>
                                        <span className="text-muted-foreground">Salon</span>
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                                        <span>Data zakończenia</span>
                                        <span>10.11.2025</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 hover:bg-[#232323] transition-colors cursor-pointer rounded-xl">
                                    <h4 className="text-[16px] font-medium mb-1">Zatwierdzić próbki tkanin do sofy</h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#F1F1F1] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]"></span> Przeterminowane</span>
                                        <span className="text-muted-foreground">Salon</span>
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                                        <span>Data zakończenia</span>
                                        <span>11.11.2025</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 hover:bg-[#232323] transition-colors cursor-pointer rounded-xl">
                                    <h4 className="text-[16px] font-medium mb-1">Wybrać łóżko z drewnianą ramą</h4>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#F1F1F1] flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]"></span> W trakcie</span>
                                        <span className="text-muted-foreground">Sypialnia</span>
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                                        <span>Data zakończenia</span>
                                        <span>26.11.2025</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Interactions */}
                        <Card className="flex flex-col h-full min-h-0">
                            <div className="flex justify-between items-center mb-5 shrink-0">
                                <h3 className="font-medium text-[20px]">Interakcja z klientem</h3>
                                <Button variant="secondary" size="sm" className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]">Zarządzaj</Button>
                            </div>
                            <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 no-scrollbar">
                                {[
                                    { name: "Ankiety", created: 3, sent: 3, replies: 2, icon: ClipboardList },
                                    { name: "Style", created: 1, sent: 1, replies: 1, icon: Palette },
                                    { name: "Moodboardy", created: 4, sent: 2, replies: 2, icon: ImageIcon, newReply: true },
                                ].map((item, i) => (
                                    <div key={i} className={`flex-1 flex flex-col justify-between p-3 bg-secondary/30 hover:bg-[#232323] transition-colors cursor-pointer rounded-xl`}>
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex items-center gap-2">
                                                <item.icon className="w-5 h-5 text-muted-foreground" />
                                                <span className="text-[16px] font-medium">{item.name}</span>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-0.5 text-sm text-muted-foreground">
                                            <div className="flex justify-between"><span>Stworzone</span> <span className="text-foreground">{item.created}</span></div>
                                            <div className="flex justify-between"><span>Wysłane</span> <span className="text-foreground">{item.sent}</span></div>
                                            <div className="flex justify-between"><span>Odpowiedzi</span> <span className="text-foreground">{item.replies}</span></div>
                                            {item.newReply && <div className="pt-1 text-white/80">Masz nową odpowiedź!</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Column 3: Products & Visualizations */}
                <div className="xl:col-span-4 flex flex-col gap-3 h-full min-h-0">
                    {/* Last Added */}
                    <Card className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[20px] font-medium text-[#E5E5E5]">Ostatnio dodane produkty</h3>
                            </div>
                            <Button variant="secondary" size="sm" className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]">Zarządzaj</Button>
                        </div>
                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 no-scrollbar">
                            {newProducts.map((prod, i) => (
                                <div key={i} className="flex-1 flex gap-4 items-center p-2 bg-[#1B1B1B] rounded-xl group cursor-pointer hover:bg-[#232323] transition-colors overflow-hidden">
                                    <div className="h-full aspect-square bg-white rounded-lg flex-shrink-0 relative flex items-center justify-center p-2">
                                        <img src={prod.image} className="max-w-full max-h-full object-contain" alt={prod.name} />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1 pr-2">
                                        <div className="flex justify-between items-start">
                                            <div className="text-[16px] font-medium leading-tight mb-1 line-clamp-2">{prod.name}</div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                                        </div>
                                        <div className="text-sm text-muted-foreground">{prod.brand}</div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-[16px] font-semibold">{prod.price}</div>
                                            <div className="text-sm text-muted-foreground">1szt.</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Visualizations */}
                    <Card className="flex-1 min-h-0 flex flex-col">
                        <div className="flex justify-between items-center mb-5 shrink-0">
                            <h3 className="font-medium text-[20px]">Wizualizacje</h3>
                            <Button variant="secondary" size="sm" className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]">Zarządzaj</Button>
                        </div>
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-0 flex-1">
                            {visualizationImages.slice(0, 4).map((imgSrc, i) => (
                                <div key={i} className="relative bg-zinc-800 rounded-lg border border-[var(--color-border)]/50 overflow-hidden group w-full h-full">
                                    <img src={imgSrc} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Wizualizacja ${i + 1}`} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
