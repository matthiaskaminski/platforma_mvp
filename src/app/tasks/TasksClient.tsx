"use client";

import React, { useState, useEffect } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare, Plus, ChevronDown, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, Layers, ListTodo, X, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CreateSprintModal } from "@/components/modals/CreateSprintModal";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { deleteSprint, deleteTask, updateTask, updateSprint } from "@/app/actions/sprints";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    name: string;
    rooms: {
        id: string;
        name: string;
        type: string;
    }[];
}

interface TaskInSprint {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    dueDate: Date | null;
    createdAt: Date;
    room: {
        id: string;
        name: string;
        type: string;
    } | null;
}

interface Sprint {
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    roomId: string | null;
    tasks: TaskInSprint[];
    _count: {
        tasks: number;
    };
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    dueDate: Date | null;
    createdAt: Date;
    room: {
        id: string;
        name: string;
        type: string;
    } | null;
    sprint: {
        id: string;
        name: string;
        status: string;
    } | null;
}

interface TasksClientProps {
    project: Project;
    sprints: Sprint[];
    tasks: Task[];
}

const statusMap: Record<string, "overdue" | "in_progress" | "not_started" | "completed"> = {
    "TODO": "not_started",
    "IN_PROGRESS": "in_progress",
    "DONE": "completed",
    "READY": "completed"
};

const statusLabels: Record<string, string> = {
    "TODO": "Do zrobienia",
    "IN_PROGRESS": "W trakcie",
    "DONE": "Zakończone",
    "READY": "Gotowe"
};

const allStatuses = ["TODO", "IN_PROGRESS", "DONE", "READY"] as const;

const iconMap: Record<string, any> = {
    general: Layers,
    bathroom: Bath,
    BATHROOM: Bath,
    living: Armchair,
    LIVING: Armchair,
    kitchen: Utensils,
    KITCHEN: Utensils,
    bedroom: BedDouble,
    BEDROOM: BedDouble,
    kids: Baby,
    KIDS: Baby,
    hall: DoorOpen,
    HALL: DoorOpen,
    office: Layers,
    OFFICE: Layers,
    other: Layers,
    OTHER: Layers
};

export default function TasksClient({ project, sprints, tasks }: TasksClientProps) {
    const router = useRouter();
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | TaskInSprint | null>(null);
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

    const toggleGroup = (id: string) => {
        setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    };

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

    const openTaskDetails = (task: Task | TaskInSprint) => {
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

    // Delete handlers
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

    // Format date helper
    const formatDate = (date: Date | null) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Check if task is overdue
    const isOverdue = (task: Task | TaskInSprint) => {
        if (!task.dueDate || task.status === 'DONE') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Group tasks by room and sprint
    const tasksGrouped = React.useMemo(() => {
        const groups: any[] = [];

        // Group 1: General tasks (no room assigned) - ALWAYS show this group
        const generalSprints = sprints.filter(s => s.tasks.some(t => !t.room) || s.tasks.length === 0).map(sprint => ({
            ...sprint,
            tasks: sprint.tasks.filter(t => !t.room)
        }));

        groups.push({
            id: 'general',
            name: 'Zadania ogolne',
            type: 'general',
            sprints: generalSprints
        });

        // Group by rooms - only if rooms exist
        project.rooms.forEach(room => {
            const roomTasks = tasks.filter(t => t.room?.id === room.id);
            const roomSprints = sprints.filter(s => s.tasks.some(t => t.room?.id === room.id));

            if (roomTasks.length > 0 || roomSprints.length > 0) {
                groups.push({
                    id: room.id,
                    name: room.name,
                    type: room.type,
                    sprints: roomSprints.map(sprint => ({
                        ...sprint,
                        tasks: sprint.tasks.filter(t => t.room?.id === room.id)
                    }))
                });
            }
        });

        return groups;
    }, [tasks, sprints, project.rooms]);

    // Auto-collapse empty groups on initial load
    useEffect(() => {
        const emptyGroups: Record<string, boolean> = {};
        tasksGrouped.forEach(group => {
            if (group.sprints.length === 0) {
                emptyGroups[group.id] = true;
            }
        });
        if (Object.keys(emptyGroups).length > 0) {
            setCollapsedGroups(prev => ({ ...emptyGroups, ...prev }));
        }
    }, []); // Only run on initial mount

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-0 overflow-hidden w-full">
            {/* Toolbar - Matches Rooms Page Styling */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* Left Side: Sorting & Filter Options */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar min-h-[80px]">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Opcje sortowania</span>

                    <div className="flex gap-2 ml-auto items-center">
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[130px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[130px] justify-between h-[48px]">
                            Priorytet
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[130px] justify-between h-[48px]">
                            Kategoria
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[150px] justify-between h-[48px]">
                            Sortuj: Data
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* Right Side: Add Buttons */}
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsSprintModalOpen(true)}
                        className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Dodaj sprint
                    </Button>
                    <Button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Dodaj zadanie
                    </Button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    <div className="px-6 py-6 space-y-8">
                        {tasksGrouped.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <ListTodo className="w-16 h-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-medium text-white mb-2">Brak zadań</h3>
                                <p className="text-muted-foreground mb-6">Zacznij od utworzenia pierwszego sprintu i dodaj zadania do projektu.</p>
                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setIsSprintModalOpen(true)}
                                        className="bg-[#232323] hover:bg-[#2a2a2a] text-white px-6 py-3 rounded-lg"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        Dodaj sprint
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            tasksGrouped.map((group, index) => {
                                const Icon = iconMap[group.type] || Layers;
                                return (
                                    <div key={group.id} className={`pb-8 ${index > 0 ? 'pt-8 border-t border-white/10' : ''}`}>
                                        {/* Group Header (Room Name) */}
                                        <button
                                            onClick={() => toggleGroup(group.id)}
                                            className="flex items-center gap-3 mb-4 text-lg font-bold text-white hover:text-[#E5E5E5] transition-colors w-full group py-2"
                                        >
                                            <div className={`transition-transform duration-200 ${collapsedGroups[group.id] ? '-rotate-90' : ''}`}>
                                                <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-white" />
                                            </div>

                                            {/* Icon Container */}
                                            <div className="p-2 bg-[#1B1B1B] rounded-lg text-white/70">
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <span>{group.name}</span>
                                        </button>

                                        {/* Sprints and Tasks */}
                                        {!collapsedGroups[group.id] && (
                                            <div className="space-y-6 ml-4">
                                                {group.sprints.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8">
                                                        <Clock className="w-8 h-8 mb-3 text-muted-foreground" />
                                                        <p className="text-base text-muted-foreground">Brak sprintów. Dodaj pierwszy!</p>
                                                    </div>
                                                ) : (
                                                    group.sprints.map((sprint: Sprint) => (
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
                                                                            Brak zadan w tym sprincie
                                                                        </div>
                                                                    ) : (
                                                                        sprint.tasks.map((task: TaskInSprint) => {
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
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
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
                        Zmien pola
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => alert('Funkcja w przygotowaniu')}
                        className="h-8"
                    >
                        Zmien status
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDeleteSelectedTasks}
                        className="h-8 text-red-400 hover:text-red-300"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usun
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
                                <p className="text-sm text-muted-foreground">
                                    {'room' in selectedTaskDetails && selectedTaskDetails.room ? selectedTaskDetails.room.name : 'Zadanie ogólne'}
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
                                    Usuń sprint
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateSprintModal
                isOpen={isSprintModalOpen}
                onClose={() => setIsSprintModalOpen(false)}
                projectId={project.id}
                rooms={project.rooms}
            />
            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                projectId={project.id}
                sprints={sprints.map(s => ({ ...s, roomId: s.roomId || null }))}
            />
        </div>
    );
}
