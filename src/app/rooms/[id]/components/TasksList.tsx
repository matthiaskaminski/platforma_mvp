"use client";

import React, { useState } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare, ChevronDown, Plus, X, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteSprint, deleteTask } from "@/app/actions/sprints";
import { useRouter } from "next/navigation";

interface Task {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    assignedTo: string | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface Sprint {
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    tasks: Task[];
    _count: {
        tasks: number;
    };
}

interface TasksListProps {
    tasks: Task[];
    sprints: Sprint[];
    roomId: string;
    projectId: string;
    onOpenSprintModal: () => void;
    onOpenTaskModal: () => void;
}

// Status configuration matching database enum
const statusConfig: Record<string, { label: string; badgeStatus: "overdue" | "in_progress" | "not_started" | "completed" }> = {
    'TODO': { label: "Do zrobienia", badgeStatus: "not_started" },
    'IN_PROGRESS': { label: "W trakcie", badgeStatus: "in_progress" },
    'DONE': { label: "Zakończone", badgeStatus: "completed" }
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

export const TasksList = React.memo(function TasksList({
    tasks,
    sprints,
    roomId,
    projectId,
    onOpenSprintModal,
    onOpenTaskModal
}: TasksListProps) {
    const router = useRouter();
    const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);
    const [selectedSprintDetails, setSelectedSprintDetails] = useState<Sprint | null>(null);
    const [sidebarClosing, setSidebarClosing] = useState(false);

    const toggleSprint = (id: string) => {
        setCollapsedSprints(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleTaskSelection = (taskId: string) => {
        setSelectedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const selectAllTasks = () => {
        const allTaskIds = tasks.map(t => t.id);
        setSelectedTasks(new Set(allTaskIds));
    };

    const deselectAllTasks = () => {
        setSelectedTasks(new Set());
    };

    const openTaskDetails = (task: Task) => {
        setSelectedTaskDetails(task);
        setSelectedSprintDetails(null);
    };

    const openSprintDetails = (sprint: Sprint) => {
        setSelectedSprintDetails(sprint);
        setSelectedTaskDetails(null);
    };

    const closeSidebar = () => {
        setSidebarClosing(true);
        setTimeout(() => {
            setSelectedTaskDetails(null);
            setSelectedSprintDetails(null);
            setSidebarClosing(false);
        }, 200);
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;

        const result = await deleteTask(taskId);
        if (result.success) {
            closeSidebar();
            router.refresh();
        } else {
            alert('Błąd podczas usuwania zadania');
        }
    };

    const handleDeleteSprint = async (sprintId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten sprint? Zadania w sprincie nie zostaną usunięte.')) return;

        const result = await deleteSprint(sprintId);
        if (result.success) {
            closeSidebar();
            router.refresh();
        } else {
            alert('Błąd podczas usuwania sprintu');
        }
    };

    const handleDeleteSelectedTasks = async () => {
        if (selectedTasks.size === 0) return;
        if (!confirm(`Czy na pewno chcesz usunąć zaznaczone zadania (${selectedTasks.size})?`)) return;

        const deletePromises = Array.from(selectedTasks).map(taskId => deleteTask(taskId));
        const results = await Promise.all(deletePromises);

        const allSuccessful = results.every(r => r.success);
        if (allSuccessful) {
            setSelectedTasks(new Set());
            router.refresh();
        } else {
            alert('Błąd podczas usuwania niektórych zadań');
        }
    };

    const formatDate = (date: Date | null) => {
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

    const isOverdue = (task: Task) => {
        if (!task.dueDate || task.status === 'DONE') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Empty state
    if (sprints.length === 0 && tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <Clock className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-4">Brak sprintów i zadań w tym pomieszczeniu</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="px-6 py-6 space-y-6">
                    {sprints.length === 0 ? (
                        // Show tasks without sprints
                        <div>
                            {/* Headers Row */}
                            <div className="sticky top-0 bg-[#0E0E0E] z-10">
                                <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)] gap-4 py-3 text-sm font-medium text-muted-foreground items-center">
                                    <div className="text-center"></div>
                                    <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Zadania</div>
                                    <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Status</div>
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data utworzenia</div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Termin</div>
                                    <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> ID Zadania</div>
                                </div>
                                <div className="border-b border-white/5"></div>
                            </div>

                            <div className="mt-4 space-y-0">
                                {tasks.map((task) => {
                                    const isChecked = selectedTasks.has(task.id);
                                    const overdue = isOverdue(task);
                                    const statusInfo = statusConfig[task.status] || statusConfig['TODO'];
                                    const displayStatus = overdue ? "overdue" : statusInfo.badgeStatus;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)] gap-4 py-4 items-center hover:bg-[#151515] transition-colors rounded-none border-b border-white/5 last:border-transparent text-[14px] ${isChecked ? 'bg-[#1a1a1a]' : ''}`}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleTaskSelection(task.id);
                                                    }}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 hover:border-white/40'}`}
                                                >
                                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {/* Name */}
                                            <div
                                                className={`font-medium cursor-pointer ${task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-white'}`}
                                                onClick={() => openTaskDetails(task)}
                                            >
                                                {task.title}
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center gap-2">
                                                <Badge status={displayStatus} dot className="bg-transparent px-0 font-normal gap-2 rounded-none hover:bg-transparent">
                                                    {overdue ? "Przeterminowane" : statusInfo.label}
                                                </Badge>
                                            </div>

                                            {/* Created Date */}
                                            <div className="text-muted-foreground">
                                                {formatDate(task.createdAt)}
                                            </div>

                                            {/* Due Date */}
                                            <div className={`${formatDate(task.dueDate).includes("Dziś") ? "text-white font-medium" : "text-muted-foreground"}`}>
                                                {formatDate(task.dueDate)}
                                            </div>

                                            {/* Task ID (truncated) */}
                                            <div className="text-muted-foreground font-mono text-xs truncate pr-4" title={task.id}>
                                                {task.id.substring(0, 8)}...
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        // Show sprints with tasks
                        sprints.map((sprint) => (
                            <div key={sprint.id} className="border-b border-white/5 pb-2 last:border-0">
                                {/* Sprint Header */}
                                <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white/80 hover:text-white transition-colors w-full py-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            toggleSprint(sprint.id);
                                        }}
                                        type="button"
                                        className="flex items-center gap-2 p-1 hover:bg-white/5 rounded transition-colors"
                                        aria-label={`Toggle ${sprint.name}`}
                                    >
                                        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${collapsedSprints[sprint.id] ? '-rotate-90' : ''}`} />
                                    </button>
                                    <div
                                        onClick={() => openSprintDetails(sprint)}
                                        className="cursor-pointer flex items-center gap-2 flex-1"
                                    >
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                        <span>{sprint.name}</span>
                                        {sprint.startDate && sprint.endDate && (
                                            <span className="text-[14px] text-muted-foreground/60 font-normal ml-2">
                                                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Column Headers for Sprint */}
                                {!collapsedSprints[sprint.id] && (
                                    <div className="ml-6">
                                        <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)] gap-4 py-2 text-xs font-medium text-muted-foreground/60 border-b border-white/5">
                                            <div></div>
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="w-3 h-3" />
                                                Zadania
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Flame className="w-3 h-3" />
                                                Status
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                Data rozpoczęcia
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                Data zakończenia
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3 h-3" />
                                                Notatka
                                            </div>
                                        </div>

                                        {sprint.tasks.length === 0 ? (
                                            <div className="text-muted-foreground text-sm py-4">
                                                Brak zadań w tym sprincie
                                            </div>
                                        ) : (
                                            sprint.tasks.map((task: Task) => {
                                                const overdue = isOverdue(task);
                                                const taskStatus = overdue ? 'overdue' : statusMap[task.status];
                                                const taskLabel = overdue ? 'Przeterminowane' : statusLabels[task.status];

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-transparent text-[14px] group/row rounded-none ${selectedTasks.has(task.id) ? 'bg-[#1a1a1a]' : ''}`}
                                                    >
                                                        {/* Checkbox */}
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleTaskSelection(task.id);
                                                                }}
                                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTasks.has(task.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 hover:border-white/40'}`}
                                                            >
                                                                {selectedTasks.has(task.id) && <Check className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>

                                                        {/* Name */}
                                                        <div
                                                            className={`font-medium cursor-pointer ${task.status === 'DONE' ? 'text-muted-foreground line-through' : 'text-white'}`}
                                                            onClick={() => openTaskDetails(task)}
                                                        >
                                                            {task.title}
                                                        </div>

                                                        {/* Status */}
                                                        <div className="flex items-center gap-2">
                                                            <Badge status={taskStatus} dot className="bg-transparent px-0 font-normal gap-2 rounded-none hover:bg-transparent text-[#EDEDED]">
                                                                {taskLabel}
                                                            </Badge>
                                                        </div>

                                                        {/* Start Date */}
                                                        <div className="text-muted-foreground text-sm">
                                                            {formatDate(task.createdAt)}
                                                        </div>

                                                        {/* Due Date / End Date */}
                                                        <div className="text-muted-foreground text-sm">
                                                            {formatDate(task.dueDate)}
                                                        </div>

                                                        {/* Description / Note */}
                                                        <div className="text-muted-foreground line-clamp-2 pr-4 text-sm">
                                                            {task.description || '-'}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Toolbar for Selected Tasks */}
            {selectedTasks.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1B1B1B] border border-white/10 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4">
                    <span className="text-sm text-white">
                        Zaznaczono: <span className="font-semibold">{selectedTasks.size}</span>
                    </span>
                    <div className="h-6 w-px bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllTasks}
                        className="h-8"
                    >
                        Zaznacz wszystko
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert('Funkcja w przygotowaniu')}
                        className="h-8"
                    >
                        Zmień pola
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert('Funkcja w przygotowaniu')}
                        className="h-8"
                    >
                        Zmień status
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteSelectedTasks}
                        className="h-8 text-red-400 hover:text-red-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń
                    </Button>
                    <div className="h-6 w-px bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllTasks}
                        className="h-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Right Sidebar - Task Details */}
            {selectedTaskDetails && (
                <div className={`fixed right-0 top-0 bottom-0 w-[500px] bg-[#0A0A0A] border-l border-white/10 z-50 overflow-y-auto transition-transform duration-200 ${sidebarClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-white mb-2">{selectedTaskDetails.title}</h2>
                                <p className="text-sm text-muted-foreground">Zadanie w pomieszczeniu</p>
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
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                                <Badge status={statusMap[selectedTaskDetails.status]} dot>
                                    {statusLabels[selectedTaskDetails.status]}
                                </Badge>
                            </div>

                            {selectedTaskDetails.description && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Opis</label>
                                    <p className="text-white">{selectedTaskDetails.description}</p>
                                </div>
                            )}

                            {selectedTaskDetails.dueDate && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Termin</label>
                                    <p className="text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(selectedTaskDetails.dueDate)}
                                    </p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-white/10">
                                <Button
                                    variant="secondary"
                                    className="w-full mb-2"
                                    onClick={() => {
                                        alert('Funkcja edycji w przygotowaniu');
                                    }}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edytuj zadanie
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteTask(selectedTaskDetails.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Usuń zadanie
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Sidebar - Sprint Details */}
            {selectedSprintDetails && (
                <div className={`fixed right-0 top-0 bottom-0 w-[500px] bg-[#0A0A0A] border-l border-white/10 z-50 overflow-y-auto transition-transform duration-200 ${sidebarClosing ? 'translate-x-full' : 'translate-x-0'}`}>
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-white mb-2">{selectedSprintDetails.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedSprintDetails._count.tasks} {selectedSprintDetails._count.tasks === 1 ? 'zadanie' : 'zadań'}
                                </p>
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
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Status</label>
                                <Badge status={
                                    (() => {
                                        const now = new Date();
                                        const start = selectedSprintDetails.startDate ? new Date(selectedSprintDetails.startDate) : null;
                                        const end = selectedSprintDetails.endDate ? new Date(selectedSprintDetails.endDate) : null;

                                        if (selectedSprintDetails.status === 'COMPLETED') return 'completed';
                                        if (!start || start > now) return 'not_started';
                                        if (end && end < now) return 'overdue';
                                        return 'in_progress';
                                    })()
                                } dot>
                                    {(() => {
                                        const now = new Date();
                                        const start = selectedSprintDetails.startDate ? new Date(selectedSprintDetails.startDate) : null;
                                        const end = selectedSprintDetails.endDate ? new Date(selectedSprintDetails.endDate) : null;

                                        if (selectedSprintDetails.status === 'COMPLETED') return 'Zakończony';
                                        if (!start || start > now) return 'Planowany';
                                        return 'W trakcie';
                                    })()}
                                </Badge>
                            </div>

                            {selectedSprintDetails.goal && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Cel sprintu</label>
                                    <p className="text-white">{selectedSprintDetails.goal}</p>
                                </div>
                            )}

                            {selectedSprintDetails.startDate && selectedSprintDetails.endDate && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground block mb-2">Czas trwania</label>
                                    <p className="text-white flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(selectedSprintDetails.startDate)} - {formatDate(selectedSprintDetails.endDate)}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Zadania w sprincie</label>
                                <div className="space-y-2">
                                    {selectedSprintDetails.tasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between p-3 bg-[#151515] rounded-lg">
                                            <div className="flex-1">
                                                <p className="text-white text-sm">{task.title}</p>
                                                <Badge status={statusMap[task.status]} dot className="mt-1">
                                                    {statusLabels[task.status]}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedSprintDetails.tasks.length === 0 && (
                                        <p className="text-muted-foreground text-sm">Brak zadań w tym sprincie</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <Button
                                    variant="secondary"
                                    className="w-full mb-2"
                                    onClick={() => {
                                        alert('Funkcja edycji w przygotowaniu');
                                    }}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edytuj sprint
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="w-full text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteSprint(selectedSprintDetails.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Usuń sprint
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
});
