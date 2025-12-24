"use client";

import React, { useState } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare, ChevronDown, Plus, X, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deleteSprint, deleteTask, updateTask, updateSprint } from "@/app/actions/sprints";
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

const allStatuses = ["TODO", "IN_PROGRESS", "DONE"] as const;

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
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Inline editing states
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editingStatus, setEditingStatus] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedDeadline, setEditedDeadline] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [descriptionHeight, setDescriptionHeight] = useState<number>(200);
    const descriptionDisplayRef = React.useRef<HTMLDivElement>(null);

    // Inline status editing in list view
    const [inlineEditingStatusTaskId, setInlineEditingStatusTaskId] = useState<string | null>(null);

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
        setSidebarOpen(true);
    };

    const openSprintDetails = (sprint: Sprint) => {
        setSelectedSprintDetails(sprint);
        setSelectedTaskDetails(null);
        setSidebarOpen(true);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
        setEditingTitle(false);
        setEditingDescription(false);
        setEditingStatus(false);
        setEditingDeadline(false);
        setTimeout(() => {
            setSelectedTaskDetails(null);
            setSelectedSprintDetails(null);
        }, 300);
    };

    // Start editing title
    const startEditingTitle = () => {
        if (selectedTaskDetails) {
            setEditedTitle(selectedTaskDetails.title);
        } else if (selectedSprintDetails) {
            setEditedTitle(selectedSprintDetails.name);
        }
        setEditingTitle(true);
    };

    // Start editing description
    const startEditingDescription = () => {
        // Capture the height of the display element before switching to edit mode
        if (descriptionDisplayRef.current) {
            const height = descriptionDisplayRef.current.offsetHeight;
            setDescriptionHeight(Math.max(height, 200)); // Minimum 200px
        }
        if (selectedTaskDetails) {
            setEditedDescription(selectedTaskDetails.description || '');
        } else if (selectedSprintDetails) {
            setEditedDescription(selectedSprintDetails.goal || '');
        }
        setEditingDescription(true);
    };

    // Save title
    const saveTitle = async () => {
        if (!editedTitle.trim()) return;
        setIsSaving(true);

        try {
            if (selectedTaskDetails) {
                const result = await updateTask(selectedTaskDetails.id, { title: editedTitle.trim() });
                if (result.success) {
                    setSelectedTaskDetails({ ...selectedTaskDetails, title: editedTitle.trim() });
                }
            } else if (selectedSprintDetails) {
                const result = await updateSprint(selectedSprintDetails.id, { name: editedTitle.trim() });
                if (result.success) {
                    setSelectedSprintDetails({ ...selectedSprintDetails, name: editedTitle.trim() });
                }
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving title:', error);
        } finally {
            setIsSaving(false);
            setEditingTitle(false);
        }
    };

    // Save description
    const saveDescription = async () => {
        setIsSaving(true);

        try {
            if (selectedTaskDetails) {
                const result = await updateTask(selectedTaskDetails.id, { description: editedDescription.trim() || undefined });
                if (result.success) {
                    setSelectedTaskDetails({ ...selectedTaskDetails, description: editedDescription.trim() || null });
                }
            } else if (selectedSprintDetails) {
                const result = await updateSprint(selectedSprintDetails.id, { goal: editedDescription.trim() || undefined });
                if (result.success) {
                    setSelectedSprintDetails({ ...selectedSprintDetails, goal: editedDescription.trim() || null });
                }
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving description:', error);
        } finally {
            setIsSaving(false);
            setEditingDescription(false);
        }
    };

    // Save status
    const saveStatus = async (newStatus: string) => {
        if (!selectedTaskDetails) return;
        setIsSaving(true);

        try {
            const result = await updateTask(selectedTaskDetails.id, { status: newStatus as any });
            if (result.success) {
                setSelectedTaskDetails({ ...selectedTaskDetails, status: newStatus as any });
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving status:', error);
        } finally {
            setIsSaving(false);
            setEditingStatus(false);
        }
    };

    // Save status inline from list view
    const saveInlineStatus = async (taskId: string, newStatus: string) => {
        setIsSaving(true);
        try {
            const result = await updateTask(taskId, { status: newStatus as any });
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error('Error saving status:', error);
        } finally {
            setIsSaving(false);
            setInlineEditingStatusTaskId(null);
        }
    };

    // Start editing deadline
    const startEditingDeadline = () => {
        if (selectedTaskDetails) {
            const date = selectedTaskDetails.dueDate ? new Date(selectedTaskDetails.dueDate) : null;
            setEditedDeadline(date ? date.toISOString().split('T')[0] : '');
        }
        setEditingDeadline(true);
    };

    // Save deadline
    const saveDeadline = async () => {
        if (!selectedTaskDetails) return;
        setIsSaving(true);

        try {
            const newDate = editedDeadline ? new Date(editedDeadline) : undefined;
            const result = await updateTask(selectedTaskDetails.id, { dueDate: newDate });
            if (result.success) {
                setSelectedTaskDetails({ ...selectedTaskDetails, dueDate: newDate || null });
            }
            router.refresh();
        } catch (error) {
            console.error('Error saving deadline:', error);
        } finally {
            setIsSaving(false);
            setEditingDeadline(false);
        }
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
            <div className="flex-1 flex flex-col items-center justify-center h-full p-6">
                <Clock className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-4">Brak sprintow i zadan w tym pomieszczeniu</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col relative">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="px-6 py-6 space-y-6">
                    {sprints.length === 0 ? (
                        // Show tasks without sprints
                        <div>
                            {/* Headers Row */}
                            <div className="sticky top-0 bg-[#0E0E0E] z-10">
                                <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)] gap-4 py-3 text-[14px] font-medium text-muted-foreground items-center">
                                    <div className="text-center"></div>
                                    <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Zadania</div>
                                    <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Status</div>
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data utworzenia</div>
                                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Deadline</div>
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
                                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#6E6E6E] border-[#6E6E6E] text-white' : 'border-[#4A4A4A] hover:border-[#6E6E6E]'}`}
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
                                            <div className="flex items-center gap-2 relative">
                                                {inlineEditingStatusTaskId === task.id ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {allStatuses.map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    saveInlineStatus(task.id, status);
                                                                }}
                                                                disabled={isSaving}
                                                                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                                    task.status === status
                                                                        ? 'bg-white/20 text-white'
                                                                        : 'bg-[#1B1B1B] text-muted-foreground hover:bg-[#252525] hover:text-white'
                                                                }`}
                                                            >
                                                                {statusLabels[status]}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setInlineEditingStatusTaskId(null);
                                                            }}
                                                            className="px-2 py-1 text-xs text-muted-foreground hover:text-white"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setInlineEditingStatusTaskId(task.id);
                                                        }}
                                                        className="cursor-pointer"
                                                    >
                                                        <Badge status={displayStatus} dot className="bg-transparent px-0 font-normal gap-2 rounded-none hover:bg-transparent hover:opacity-80 transition-opacity">
                                                            {overdue ? "Przeterminowane" : statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                )}
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
                                            <div className="text-muted-foreground font-mono text-[14px] truncate pr-4" title={task.id}>
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
                                        <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)] gap-4 py-2 text-[14px] font-medium text-muted-foreground/60 border-b border-white/5">
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
                                                Deadline
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
                                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedTasks.has(task.id) ? 'bg-[#6E6E6E] border-[#6E6E6E] text-white' : 'border-[#4A4A4A] hover:border-[#6E6E6E]'}`}
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
                                                        <div className="flex items-center gap-2 relative">
                                                            {inlineEditingStatusTaskId === task.id ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {allStatuses.map((status) => (
                                                                        <button
                                                                            key={status}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                saveInlineStatus(task.id, status);
                                                                            }}
                                                                            disabled={isSaving}
                                                                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                                                                task.status === status
                                                                                    ? 'bg-white/20 text-white'
                                                                                    : 'bg-[#1B1B1B] text-muted-foreground hover:bg-[#252525] hover:text-white'
                                                                            }`}
                                                                        >
                                                                            {statusLabels[status]}
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setInlineEditingStatusTaskId(null);
                                                                        }}
                                                                        className="px-2 py-1 text-xs text-muted-foreground hover:text-white"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setInlineEditingStatusTaskId(task.id);
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Badge status={taskStatus} dot className="bg-transparent px-0 font-normal gap-2 rounded-none hover:bg-transparent text-[#EDEDED] hover:opacity-80 transition-opacity">
                                                                        {taskLabel}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Start Date */}
                                                        <div className="text-muted-foreground text-[14px]">
                                                            {formatDate(task.createdAt)}
                                                        </div>

                                                        {/* Due Date / End Date */}
                                                        <div className="text-muted-foreground text-[14px]">
                                                            {formatDate(task.dueDate)}
                                                        </div>

                                                        {/* Description / Note */}
                                                        <div className="text-muted-foreground line-clamp-2 pr-4 text-[14px]">
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

            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeSidebar}
            />

            {/* Right Sidebar - Task Details */}
            <div className={`fixed right-0 top-0 bottom-0 w-[500px] bg-[#0E0E0E] border-l border-white/10 z-50 overflow-y-auto dark-scrollbar transition-transform duration-300 ease-out ${sidebarOpen && selectedTaskDetails ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedTaskDetails && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                {editingTitle ? (
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        onBlur={saveTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveTitle();
                                            if (e.key === 'Escape') setEditingTitle(false);
                                        }}
                                        className="text-2xl font-semibold text-white bg-transparent border-b-2 border-white/20 focus:border-white/50 outline-none w-full mb-2"
                                        autoFocus
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <h2
                                        className="text-2xl font-semibold text-white mb-2 cursor-pointer hover:bg-white/5 px-2 py-1 -mx-2 rounded transition-colors"
                                        onClick={startEditingTitle}
                                    >
                                        {selectedTaskDetails.title}
                                    </h2>
                                )}
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
                                                    selectedTaskDetails.status === status
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
                                        <Badge status={statusMap[selectedTaskDetails.status]} dot className="hover:opacity-80 transition-opacity">
                                            {statusLabels[selectedTaskDetails.status]}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Editable Description - Jira style */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Opis</label>
                                {editingDescription ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            style={{ height: `${descriptionHeight}px` }}
                                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-white/20 dark-scrollbar"
                                            placeholder="Dodaj opis zadania..."
                                            autoFocus
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={saveDescription}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingDescription(false)}
                                                disabled={isSaving}
                                            >
                                                Anuluj
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        ref={descriptionDisplayRef}
                                        onClick={startEditingDescription}
                                        className="min-h-[200px] p-3 bg-[#1B1B1B] rounded-lg cursor-pointer hover:bg-[#222] transition-colors border border-transparent hover:border-white/10"
                                    >
                                        {selectedTaskDetails.description ? (
                                            <p className="text-white whitespace-pre-wrap">{selectedTaskDetails.description}</p>
                                        ) : (
                                            <p className="text-muted-foreground">Kliknij, aby dodać opis...</p>
                                        )}
                                    </div>
                                )}
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
                                            {selectedTaskDetails.dueDate ? formatDate(selectedTaskDetails.dueDate) : 'Kliknij, aby ustawić deadline...'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/10">
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
                )}
            </div>

            {/* Right Sidebar - Sprint Details */}
            <div className={`fixed right-0 top-0 bottom-0 w-[500px] bg-[#0E0E0E] border-l border-white/10 z-50 overflow-y-auto dark-scrollbar transition-transform duration-300 ease-out ${sidebarOpen && selectedSprintDetails ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedSprintDetails && (
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                {editingTitle ? (
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        onBlur={saveTitle}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') saveTitle();
                                            if (e.key === 'Escape') setEditingTitle(false);
                                        }}
                                        className="text-2xl font-semibold text-white bg-transparent border-b-2 border-white/20 focus:border-white/50 outline-none w-full mb-2"
                                        autoFocus
                                        disabled={isSaving}
                                    />
                                ) : (
                                    <h2
                                        className="text-2xl font-semibold text-white mb-2 cursor-pointer hover:bg-white/5 px-2 py-1 -mx-2 rounded transition-colors"
                                        onClick={startEditingTitle}
                                    >
                                        {selectedSprintDetails.name}
                                    </h2>
                                )}
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

                            {/* Editable Goal - Jira style */}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground block mb-2">Cel sprintu</label>
                                {editingDescription ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={editedDescription}
                                            onChange={(e) => setEditedDescription(e.target.value)}
                                            style={{ height: `${descriptionHeight}px` }}
                                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-white/20 dark-scrollbar"
                                            placeholder="Dodaj cel sprintu..."
                                            autoFocus
                                            disabled={isSaving}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={saveDescription}
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingDescription(false)}
                                                disabled={isSaving}
                                            >
                                                Anuluj
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        ref={descriptionDisplayRef}
                                        onClick={startEditingDescription}
                                        className="min-h-[200px] p-3 bg-[#1B1B1B] rounded-lg cursor-pointer hover:bg-[#222] transition-colors border border-transparent hover:border-white/10"
                                    >
                                        {selectedSprintDetails.goal ? (
                                            <p className="text-white whitespace-pre-wrap">{selectedSprintDetails.goal}</p>
                                        ) : (
                                            <p className="text-muted-foreground">Kliknij, aby dodać cel sprintu...</p>
                                        )}
                                    </div>
                                )}
                            </div>

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
                                    variant="ghost"
                                    className="w-full text-red-400 hover:text-red-300"
                                    onClick={() => handleDeleteSprint(selectedSprintDetails.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Usun sprint
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
