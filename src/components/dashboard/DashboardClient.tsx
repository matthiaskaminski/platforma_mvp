
"use client";

import React, { useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, ClipboardList, Palette, Image as ImageIcon, X, Calendar, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverlay, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateTask } from "@/app/actions/sprints";
import type { User } from '@supabase/supabase-js'

// Mock Data


const initialTiles = [
    { id: 'tile-1', label: "Mieszkanie", value: "", sub: "Rodzaj zabudowy" },
    { id: 'tile-2', label: "85m²", value: "", sub: "Metraż" },
    { id: 'tile-3', label: "1", value: "", sub: "Liczba pięter" },
    { id: 'tile-4', label: "6", value: "", sub: "Pomieszczenia" },
    { id: 'tile-5', label: "73", value: "", sub: "Produkty" },
    { id: 'tile-6', label: "12", value: "", sub: "Wykonane zadania" },
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
    user: any
    project: any
    stats: {
        budget: {
            spent: number; planned: number; total: number; remaining: number
            breakdown?: { materials: number; furniture: number; labor: number }
        }
        daysConfig: { start: Date; end: Date }
        activeTasks: number
        counts?: { products: number; doneTasks: number; floors: number; rooms: number }
        interactions?: { surveys: number; moodboards: number; messages: number }
    }
    recentProducts: any[]
    visualizations: any[]
    recentTasks?: any[]
    calendarEvents?: any[]
}

export default function DashboardClient({ user, project, stats, recentProducts = [], visualizations = [], recentTasks = [], calendarEvents = [] }: DashboardClientProps) {
    const router = useRouter();
    const [statsTiles, setStatsTiles] = useState(initialTiles);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<any | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Inline editing states
    const [editingStatus, setEditingStatus] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState(false);
    const [editedDeadline, setEditedDeadline] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const openTaskDetails = (task: any) => {
        setSelectedTask(task);
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        setEditingStatus(false);
        setEditingDeadline(false);
        setTimeout(() => setSelectedTask(null), 300);
    };

    // Save status
    const saveStatus = async (newStatus: string) => {
        if (!selectedTask) return;
        setIsSaving(true);

        try {
            const result = await updateTask(selectedTask.id, { status: newStatus as any });
            if (result.success) {
                setSelectedTask({ ...selectedTask, status: newStatus as any });
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving status:', error);
        } finally {
            setIsSaving(false);
            setEditingStatus(false);
        }
    };

    // Start editing deadline
    const startEditingDeadline = () => {
        if (selectedTask) {
            const date = selectedTask.dueDate ? new Date(selectedTask.dueDate) : null;
            setEditedDeadline(date ? date.toISOString().split('T')[0] : '');
        }
        setEditingDeadline(true);
    };

    // Save deadline
    const saveDeadline = async () => {
        if (!selectedTask) return;
        setIsSaving(true);

        try {
            const newDate = editedDeadline ? new Date(editedDeadline) : undefined;
            const result = await updateTask(selectedTask.id, { dueDate: newDate });
            if (result.success) {
                setSelectedTask({ ...selectedTask, dueDate: newDate || null });
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving deadline:', error);
        } finally {
            setIsSaving(false);
            setEditingDeadline(false);
        }
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return "-";
        const taskDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDay = new Date(taskDate);
        taskDay.setHours(0, 0, 0, 0);

        if (taskDay.getTime() === today.getTime()) {
            return "Dziś";
        }

        return taskDate.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const statusMap: Record<string, "overdue" | "in_progress" | "not_started" | "completed"> = {
        "TODO": "not_started",
        "IN_PROGRESS": "in_progress",
        "DONE": "completed"
    };

    const statusLabels: Record<string, string> = {
        "TODO": "Do zrobienia",
        "IN_PROGRESS": "W trakcie",
        "DONE": "Zakończone"
    };

    const allStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

    // Dynamic Budget Data
    const budgetData = [
        { name: "Wydano", value: stats?.budget?.spent || 0, color: "#E5E5E5" },
        { name: "Planowane", value: stats?.budget?.planned || 0, color: "#6E6E6E" },
        { name: "Pozostało", value: stats?.budget?.remaining || 0, color: "#232323" },
    ];

    // Update tiles with real data if project exists
    // Update tiles with real data if project exists
    React.useEffect(() => {
        if (project && stats) {
            setStatsTiles(tiles => tiles.map(tile => {
                const counts = stats.counts || { products: 0, doneTasks: 0, floors: 0, rooms: 0 };

                // Helper to map icon to Polish label
                const getBuildingLabel = (icon: string) => {
                    const map: Record<string, string> = {
                        'Home': 'Dom',
                        'Building': 'Mieszkanie',
                        'Building2': 'Biuro',
                        'Warehouse': 'Lokal'
                    };
                    return map[icon] || project.name || 'Dom';
                };

                switch (tile.id) {
                    case 'tile-1': return { ...tile, label: getBuildingLabel(project.icon || 'Home') }
                    case 'tile-2': return { ...tile, label: `${project.totalArea || 0}m²` }
                    case 'tile-3': return { ...tile, label: String(counts.floors || 0) }
                    case 'tile-4': return { ...tile, label: String(counts.rooms || 0) }
                    case 'tile-5': return { ...tile, label: String(counts.products || 0) }
                    case 'tile-6': return { ...tile, label: String(counts.doneTasks || 0) }
                    default: return tile
                }
            }))
        }
    }, [project, stats])

    // Calendar Helper Logic
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 0=Sun, 1=Mon... make Mon=0

        const days = [];
        // Previous month filler
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = 0; i < startingDay; i++) {
            days.push({ day: prevMonthLastDay - startingDay + 1 + i, type: 'prev' });
        }
        // Current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, type: 'current' });
        }
        // Next month filler (to 42 grid or just 35)
        const remaining = 35 - days.length; // 5 rows
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, type: 'next' });
        }
        // If 35 isn't enough (e.g. starts Sat/Sun + 31 days), add row
        if (days.length < daysInMonth + startingDay) {
            const extra = 42 - days.length;
            for (let i = 1; i <= extra; i++) days.push({ day: (remaining > 0 ? remaining : 0) + i, type: 'next' });
        }

        return days;
    };

    const calendarDays = getDaysInMonth(currentDate);
    const monthNames = ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"];

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

    // Derived values for Budget Categories
    const breakdown = stats.budget.breakdown || { materials: 0, furniture: 0, labor: 0 };
    const maxVal = Math.max(breakdown.materials, breakdown.furniture, breakdown.labor, 1);

    // Derived values for Interactions
    const interactions = stats.interactions || { surveys: 0, moodboards: 0, messages: 0 };

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-700 overflow-hidden">
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
                            <h3 className="font-medium text-[20px] capitalize">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 p-0 hover:text-white text-muted-foreground"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-6 h-6 p-0 hover:text-white text-muted-foreground"
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2 text-center text-sm text-muted-foreground font-medium mb-1">
                            {['Po', 'Wt', 'Śr', 'Cz', 'Pi', 'So', 'Nd'].map(d => <span key={d}>{d}</span>)}
                        </div>
                        <div className="grid grid-cols-7 gap-2 flex-1 min-h-0 content-center">
                            {calendarDays.map((d, index) => {
                                const isToday = d.type === 'current' && d.day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

                                // Check if this day has events or tasks
                                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), d.day);
                                const dayEvents = d.type === 'current' ? [
                                    ...calendarEvents.filter(e => {
                                        const eventDate = new Date(e.date);
                                        return eventDate.getDate() === d.day &&
                                               eventDate.getMonth() === currentDate.getMonth() &&
                                               eventDate.getFullYear() === currentDate.getFullYear();
                                    }),
                                    ...recentTasks.filter(t => {
                                        if (!t.dueDate) return false;
                                        const taskDate = new Date(t.dueDate);
                                        return taskDate.getDate() === d.day &&
                                               taskDate.getMonth() === currentDate.getMonth() &&
                                               taskDate.getFullYear() === currentDate.getFullYear();
                                    })
                                ] : [];
                                const hasEvents = dayEvents.length > 0;

                                return (
                                    <div
                                        key={index}
                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all cursor-default border border-transparent relative
                                            ${d.type === 'current' ? 'text-muted-foreground hover:bg-[#2F2F2F] hover:text-white cursor-pointer' : 'opacity-20 text-muted-foreground'}
                                            ${isToday ? 'bg-[#F3F3F3] text-black font-bold hover:bg-[#F3F3F3] hover:text-black' : 'bg-[#232323]'}
                                            ${d.type !== 'current' ? 'bg-[#1B1B1B]' : ''}
                                        `}
                                    >
                                        {d.day}
                                        {hasEvents && (
                                            <div className="absolute bottom-1 flex gap-0.5">
                                                {dayEvents.slice(0, 3).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`w-1 h-1 rounded-full ${isToday ? 'bg-black/60' : 'bg-[#536AC8]'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        {/* Nearest Event Section */}
                        {(() => {
                            const upcomingEvents = [
                                ...calendarEvents.map(e => ({ ...e, isTask: false })),
                                ...recentTasks.filter(t => t.dueDate).map(t => ({
                                    id: t.id,
                                    title: t.title,
                                    date: t.dueDate,
                                    type: 'TASK',
                                    isTask: true
                                }))
                            ]
                            .filter(e => new Date(e.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                            const nearestEvent = upcomingEvents[0];
                            if (!nearestEvent) return null;

                            const eventTypeColors: Record<string, string> = {
                                MEETING: '#A2EAEF',
                                DELIVERY: '#EFC2A2',
                                INSPECTION: '#EFECA2',
                                DEADLINE: '#89B786',
                                PAYMENT: '#DCA2EF',
                                INSTALLATION: '#A2EAEF',
                                TASK: '#6E9EE8',
                            };

                            return (
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <h4 className="text-[14px] font-medium text-muted-foreground mb-2">Najbliższe wydarzenie</h4>
                                    <div className="flex items-center gap-2 text-[14px]">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                            style={{ backgroundColor: eventTypeColors[nearestEvent.type] || '#9B6DD8' }}
                                        />
                                        <span className="truncate flex-1 text-white">{nearestEvent.title}</span>
                                        <span className="text-muted-foreground text-[14px] shrink-0">
                                            {new Date(nearestEvent.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })()}
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
                                            data={budgetData} // TODO: Use real budget data for chart
                                            innerRadius="75%"
                                            outerRadius="92%"
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={8}
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
                            <div className="flex-1 w-full flex flex-col justify-center gap-5">
                                <div className="flex flex-col gap-4">
                                    {/* Kategoria 1 - Materiały */}
                                    <div>
                                        <div className="flex justify-between text-[14px] mb-1.5">
                                            <span className="text-[#E5E5E5] font-medium">Materiały budowlane</span>
                                            <span className="text-[#6E6E6E]">{Math.round((breakdown.materials / stats.budget.total) * 100) || 0}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden border-none">
                                            <div style={{ width: `${(breakdown.materials / maxVal) * 100}%` }} className="h-full bg-[#E5E5E5] rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Kategoria 2 - Meble */}
                                    <div>
                                        <div className="flex justify-between text-[14px] mb-1.5">
                                            <span className="text-[#E5E5E5] font-medium">Meble i dekoracje</span>
                                            <span className="text-[#6E6E6E]">{Math.round((breakdown.furniture / stats.budget.total) * 100) || 0}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden border-none">
                                            <div style={{ width: `${(breakdown.furniture / maxVal) * 100}%` }} className="h-full bg-[#6E6E6E] rounded-full"></div>
                                        </div>
                                    </div>

                                    {/* Kategoria 3 - Robocizna */}
                                    <div>
                                        <div className="flex justify-between text-[14px] mb-1.5">
                                            <span className="text-[#E5E5E5] font-medium">Robocizna</span>
                                            <span className="text-[#6E6E6E]">{Math.round((breakdown.labor / stats.budget.total) * 100) || 0}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#1B1B1B] rounded-full overflow-hidden border-none">
                                            <div style={{ width: `${(breakdown.labor / maxVal) * 100}%` }} className="h-full bg-[#232323] rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Invoices Status */}
                                <div className="pt-2 flex items-center border-t border-white/5 mt-1">
                                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]"></span>
                                        <span className="text-[14px] font-medium text-[#E5E5E5]">2 nieopłacone faktury</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Metrics (4 columns) */}
                        <div className="grid grid-cols-4 gap-2 border-t border-white/5 pt-4">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
                                    <span className="text-[14px] text-[#6E6E6E]">Wydano</span>
                                </div>
                                <span className="text-[16px] font-medium text-[#E5E5E5]">{formatMoney(stats.budget.spent)}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[#6E6E6E]"></div>
                                    <span className="text-[14px] text-[#6E6E6E]">Planowane</span>
                                </div>
                                <span className="text-[16px] font-medium text-[#E5E5E5]">{formatMoney(stats.budget.planned)}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-[#232323]"></div>
                                    <span className="text-[14px] text-[#6E6E6E]">Pozostało</span>
                                </div>
                                <span className="text-[16px] font-bold text-[#E5E5E5]">{formatMoney(stats.budget.remaining)}</span>
                            </div>
                            <div className="flex flex-col border-l border-white/5 pl-2">
                                <span className="text-[14px] text-[#6E6E6E] mb-1">Ten mies.</span>
                                <span className="text-[16px] font-medium text-[#E5E5E5]">{formatMoney(0)}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Split Row: Tasks & Interactions */}
                    <div className="grid grid-cols-2 gap-3 flex-[1.4] min-h-0">
                        {/* Tasks */}
                        <Card className="flex flex-col h-full min-h-0 relative">
                            <div className="flex items-center justify-between mb-5 shrink-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[20px] font-medium text-[#E5E5E5]">Lista zadań</h3>
                                    <span className="w-5 h-5 bg-[#E5E5E5] text-black text-xs font-bold rounded-full flex items-center justify-center">{stats.activeTasks}</span>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]"
                                    onClick={() => router.push('/tasks')}
                                >
                                    Zarządzaj
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2 flex-1 min-h-0">
                                {/* Show max 4 tasks or placeholder slots */}
                                {[0, 1, 2, 3].map((index) => {
                                    const task = recentTasks[index];
                                    if (task) {
                                        // Check if task is overdue
                                        const isOverdue = task.dueDate && task.status !== 'DONE' && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

                                        const statusColors: Record<string, string> = {
                                            "TODO": "bg-[#6E9EE8] shadow-[0_0_6px_rgba(110,158,232,0.4)]",
                                            "IN_PROGRESS": "bg-[#91E8A8] shadow-[0_0_6px_rgba(145,232,168,0.4)]",
                                            "DONE": "bg-[#6E6E6E]",
                                            "OVERDUE": "bg-[#E89191] shadow-[0_0_6px_rgba(232,145,145,0.4)]"
                                        };

                                        const dotColor = isOverdue ? statusColors["OVERDUE"] : (statusColors[task.status] || statusColors["TODO"]);
                                        const statusLabel = isOverdue ? "Przeterminowane" : (statusLabels[task.status] || "Do zrobienia");

                                        return (
                                            <div
                                                key={task.id || index}
                                                className="flex-1 flex flex-col justify-between p-3 bg-secondary/30 hover:bg-[#232323] transition-colors cursor-pointer rounded-lg"
                                                onClick={() => openTaskDetails(task)}
                                            >
                                                <h4 className="text-[14px] font-medium mb-2 truncate">{task.title}</h4>
                                                <div className="flex justify-between items-center text-[14px] leading-relaxed">
                                                    <span className="text-[#F1F1F1] flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${dotColor}`}></span> {statusLabel}</span>
                                                    <span className="text-muted-foreground">{task.room?.name || "Ogólne"}</span>
                                                </div>
                                                <div className="mt-2 text-[14px] text-muted-foreground flex justify-between leading-relaxed">
                                                    <span>Deadline</span>
                                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('pl-PL') : 'Brak'}</span>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <div key={`placeholder-${index}`} className="flex-1 flex items-center justify-center p-3 bg-secondary/20 rounded-lg">
                                                <span className="text-[14px] text-muted-foreground">Brak zadania</span>
                                            </div>
                                        );
                                    }
                                })}
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
                                    { name: "Ankiety", value: interactions.surveys, icon: ClipboardList },
                                    { name: "Style", value: 0, icon: Palette }, // No style table yet
                                    { name: "Moodboardy", value: interactions.moodboards, icon: ImageIcon },
                                    { name: "Wiadomości", value: interactions.messages, icon: ClipboardList }
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
                                            <div className="flex justify-between"><span>Aktywne</span> <span className="text-foreground">{item.value}</span></div>
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
                            {recentProducts.length > 0 ? (
                                recentProducts.map((prod, i) => (
                                    <div key={i} className="h-24 shrink-0 flex gap-4 items-center p-2 bg-[#1B1B1B] rounded-xl group cursor-pointer hover:bg-[#232323] transition-colors overflow-hidden">
                                        <div className="h-full aspect-square bg-white rounded-lg flex-shrink-0 relative flex items-center justify-center p-2">
                                            <img src={prod.imageUrl || "/placeholder.png"} className="max-w-full max-h-full object-contain" alt={prod.name} />
                                        </div>
                                        <div className="flex-1 min-w-0 py-1 pr-2">
                                            <div className="flex justify-between items-start">
                                                <div className="text-[16px] font-medium leading-tight mb-1 line-clamp-2">{prod.name}</div>
                                                <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                                            </div>
                                            <div className="text-sm text-muted-foreground">{prod.supplier || "Brak marki"}</div>
                                            <div className="flex justify-between items-end mt-2">
                                                <div className="text-[16px] font-semibold">{formatMoney(prod.price)}</div>
                                                <div className="text-sm text-muted-foreground">{prod.quantity} szt.</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                                    Brak produktów. Dodaj pierwszy produkt!
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Visualizations */}
                    <Card className="flex-1 min-h-0 flex flex-col">
                        <div className="flex justify-between items-center mb-5 shrink-0">
                            <h3 className="font-medium text-[20px]">Wizualizacje</h3>
                            <Button variant="secondary" size="sm" className="rounded-full h-auto py-1 px-3 border border-white/5 bg-[#232323] hover:bg-[#2a2a2a]">Zarządzaj</Button>
                        </div>
                        <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-0 flex-1">
                            {visualizations.length > 0 ? (
                                visualizations.slice(0, 4).map((img, i) => (
                                    <div key={i} className="relative bg-zinc-800 rounded-lg border border-[var(--color-border)]/50 overflow-hidden group w-full h-full min-h-[100px]">
                                        <img src={img.url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={`Wizualizacja ${i + 1}`} />
                                    </div>
                                ))
                            ) : (
                                // 4-icon placeholder state
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-center bg-[#1B1B1B] rounded-lg">
                                        <ImageIcon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

            </div>

            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSidebar}
            />

            {/* Right Sidebar - Task Details */}
            <div className={`fixed right-0 top-0 bottom-0 w-[500px] bg-[#0E0E0E] border-l border-white/10 z-50 overflow-y-auto dark-scrollbar transition-transform duration-300 ease-out ${sidebarOpen && selectedTask ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedTask && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-white mb-2">
                                    {selectedTask.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">Zadanie</p>
                            </div>
                            <button
                                onClick={closeSidebar}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Details */}
                        <div className="space-y-6">
                            {/* Editable Status */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                                {editingStatus ? (
                                    <div className="flex flex-wrap gap-2">
                                        {allStatuses.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => saveStatus(status)}
                                                disabled={isSaving}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedTask.status === status
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-[#1B1B1B] text-muted-foreground hover:bg-[#252525] hover:text-white'
                                                }`}
                                            >
                                                {statusLabels[status]}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setEditingStatus(false)}
                                            className="px-3 py-2 text-sm text-muted-foreground hover:text-white"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => setEditingStatus(true)}
                                        className="cursor-pointer inline-block"
                                    >
                                        {(() => {
                                            const isTaskOverdue = selectedTask.dueDate && selectedTask.status !== 'DONE' && new Date(selectedTask.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                                            const badgeStatus = isTaskOverdue ? 'overdue' : (statusMap[selectedTask.status] || 'not_started');
                                            const badgeLabel = isTaskOverdue ? 'Przeterminowane' : (statusLabels[selectedTask.status] || 'Do zrobienia');

                                            return (
                                                <Badge status={badgeStatus} dot className="hover:opacity-80 transition-opacity">
                                                    {badgeLabel}
                                                </Badge>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Opis</label>
                                <div className="min-h-[200px] p-3 bg-[#1B1B1B] rounded-lg border border-transparent">
                                    {selectedTask.description ? (
                                        <p className="text-white whitespace-pre-wrap">{selectedTask.description}</p>
                                    ) : (
                                        <p className="text-muted-foreground">Brak opisu</p>
                                    )}
                                </div>
                            </div>

                            {/* Editable Deadline */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Deadline</label>
                                {editingDeadline ? (
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={editedDeadline}
                                            onChange={(e) => setEditedDeadline(e.target.value)}
                                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={saveDeadline}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingDeadline(false)}
                                                disabled={isSaving}
                                            >
                                                Anuluj
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={startEditingDeadline}
                                        className="cursor-pointer p-3 bg-[#1B1B1B] rounded-lg hover:bg-[#222] transition-colors border border-transparent hover:border-white/10 flex items-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-white">
                                            {selectedTask.dueDate ? formatDate(selectedTask.dueDate) : 'Kliknij, aby ustawić deadline...'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {selectedTask.room && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Pomieszczenie</label>
                                    <p className="text-white">{selectedTask.room.name}</p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => {
                                        closeSidebar();
                                        router.push('/tasks');
                                    }}
                                >
                                    Przejdź do listy zadań
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
