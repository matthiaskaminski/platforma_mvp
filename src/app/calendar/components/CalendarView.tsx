"use client";

import React, { useState } from "react";
import { addMonths, subMonths } from "date-fns";
import { X, Calendar, Clock, CheckSquare, Trash2 } from "lucide-react";
import { CalendarHeader } from "./CalendarHeader";
import { MonthView } from "./MonthView";
import { CreateEventModal } from "@/components/modals/CreateEventModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { deleteCalendarEvent, updateCalendarEvent } from "@/app/actions/calendar";
import { updateTask, deleteTask } from "@/app/actions/sprints";
import { useRouter } from "next/navigation";

interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    description?: string | null;
    type: string;
    isTask: boolean;
    color: string;
    status?: string;
    roomName?: string;
    sprintName?: string;
}

interface CalendarViewProps {
    events: CalendarEvent[];
    projectId: string;
}

const eventTypeLabels: Record<string, string> = {
    MEETING: 'Spotkanie',
    DELIVERY: 'Dostawa',
    INSPECTION: 'Odbiór',
    DEADLINE: 'Termin',
    PAYMENT: 'Płatność',
    INSTALLATION: 'Instalacja',
    TASK: 'Zadanie',
};

const eventTypeColors: Record<string, string> = {
    MEETING: '#878FA9',
    DELIVERY: '#B79074',
    INSPECTION: '#A4A490',
    DEADLINE: '#89B786',
    PAYMENT: '#DCA2EF',
    INSTALLATION: '#A2EAEF',
    TASK: '#6E9EE8',
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

export function CalendarView({ events, projectId }: CalendarViewProps) {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<"month" | "week" | "day">("month");
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CalendarEvent | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Editing states for tasks
    const [editingStatus, setEditingStatus] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
    const handleToday = () => setCurrentDate(new Date());

    const openItemDetails = (item: CalendarEvent) => {
        setSelectedItem(item);
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        setEditingStatus(false);
        setTimeout(() => setSelectedItem(null), 300);
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('pl-PL', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        if (hours === 0 && minutes === 0) return null;
        return d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    const handleDelete = async () => {
        if (!selectedItem) return;
        if (!confirm('Czy na pewno chcesz usunąć?')) return;

        setIsSaving(true);
        try {
            if (selectedItem.isTask) {
                await deleteTask(selectedItem.id);
            } else {
                await deleteCalendarEvent(selectedItem.id);
            }
            closeSidebar();
            router.refresh();
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const saveStatus = async (newStatus: string) => {
        if (!selectedItem || !selectedItem.isTask) return;
        setIsSaving(true);

        try {
            const result = await updateTask(selectedItem.id, { status: newStatus as any });
            if (result.success) {
                setSelectedItem({ ...selectedItem, status: newStatus });
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving status:', error);
        } finally {
            setIsSaving(false);
            setEditingStatus(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden text-foreground relative">
            <CalendarHeader
                currentDate={currentDate}
                onPrevDate={handlePrevMonth}
                onNextDate={handleNextMonth}
                onToday={handleToday}
                view={view}
                onViewChange={setView}
                onAddEvent={() => setIsEventModalOpen(true)}
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {view === "month" && (
                    <MonthView
                        currentDate={currentDate}
                        events={events}
                        onEventClick={openItemDetails}
                    />
                )}
                {/* Week and Day views can be added here later */}
            </div>

            <CreateEventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                projectId={projectId}
            />

            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-[#151515] border-l border-white/10 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedItem && (
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: eventTypeColors[selectedItem.type] || '#9B6DD8' }}
                                />
                                <h2 className="text-lg font-semibold truncate">{selectedItem.title}</h2>
                            </div>
                            <button
                                onClick={closeSidebar}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Type Badge */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Typ</label>
                                <div className="flex items-center gap-2">
                                    {selectedItem.isTask ? (
                                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span
                                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                                        style={{ backgroundColor: eventTypeColors[selectedItem.type] || '#9B6DD8' }}
                                    >
                                        {eventTypeLabels[selectedItem.type] || selectedItem.type}
                                    </span>
                                </div>
                            </div>

                            {/* Date & Time */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Data i godzina</label>
                                <div className="p-3 bg-[#1B1B1B] rounded-lg flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-white capitalize">{formatDate(selectedItem.date)}</span>
                                    {formatTime(selectedItem.date) && (
                                        <>
                                            <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                                            <span className="text-white">{formatTime(selectedItem.date)}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Status (only for tasks) */}
                            {selectedItem.isTask && selectedItem.status && (
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
                                                        selectedItem.status === status
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
                                            <Badge
                                                status={statusMap[selectedItem.status] || 'not_started'}
                                                dot
                                                className="hover:opacity-80 transition-opacity"
                                            >
                                                {statusLabels[selectedItem.status] || 'Do zrobienia'}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Opis</label>
                                <div className="min-h-[150px] p-3 bg-[#1B1B1B] rounded-lg">
                                    {selectedItem.description ? (
                                        <p className="text-white whitespace-pre-wrap">{selectedItem.description}</p>
                                    ) : (
                                        <p className="text-muted-foreground">Brak opisu</p>
                                    )}
                                </div>
                            </div>

                            {/* Room (only for tasks) */}
                            {selectedItem.isTask && selectedItem.roomName && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Pomieszczenie</label>
                                    <p className="text-white">{selectedItem.roomName}</p>
                                </div>
                            )}

                            {/* Sprint (only for tasks) */}
                            {selectedItem.isTask && selectedItem.sprintName && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Sprint</label>
                                    <p className="text-white">{selectedItem.sprintName}</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/10">
                            <Button
                                variant="ghost"
                                className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                onClick={handleDelete}
                                disabled={isSaving}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {isSaving ? 'Usuwanie...' : 'Usuń'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
