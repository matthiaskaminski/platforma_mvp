"use client";

import React, { useState } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare, Search, Plus, ChevronDown, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, Layers, ListTodo, X, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { CreateSprintModal } from "@/components/modals/CreateSprintModal";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";

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
    "DONE": "completed"
};

const statusLabels: Record<string, string> = {
    "TODO": "Do zrobienia",
    "IN_PROGRESS": "W trakcie",
    "DONE": "ZakoDczone"
};

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
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const [collapsedSprints, setCollapsedSprints] = useState<Record<string, boolean>>({});
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | TaskInSprint | null>(null);
    const [selectedSprintDetails, setSelectedSprintDetails] = useState<Sprint | null>(null);

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
    };

    const openSprintDetails = (sprint: Sprint) => {
        setSelectedSprintDetails(sprint);
        setSelectedTaskDetails(null);
    };

    const closeSidebar = () => {
        setSelectedTaskDetails(null);
        setSelectedSprintDetails(null);
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

        // Group 1: General tasks (no room assigned)
        const generalTasks = tasks.filter(t => !t.room);
        if (generalTasks.length > 0 || sprints.some(s => s.tasks.every(t => !t.room))) {
            groups.push({
                id: 'general',
                name: 'Zadania ogolne',
                type: 'general',
                sprints: sprints.filter(s => s.tasks.some(t => !t.room) || s.tasks.length === 0).map(sprint => ({
                    ...sprint,
                    tasks: sprint.tasks.filter(t => !t.room)
                }))
            });
        }

        // Group by rooms
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

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-0 overflow-hidden w-full">
            {/* Toolbar - Matches Rooms Page Styling */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* Left Side: Search & Filter */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar min-h-[80px]">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Opcje wyszukiwania i sortowania</span>

                    <div className="flex gap-2 ml-auto items-center">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj zadania..."
                                className="pl-9 bg-[#1B1B1B] border-white/5 h-[48px] placeholder:text-muted-foreground"
                            />
                        </div>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Sortuj
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
                        className="h-[80px] bg-[#232323] hover:bg-[#2a2a2a] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Dodaj zadanie
                    </Button>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 min-h-0 flex flex-col p-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    {/* Sticky Table Header */}
                    <div className="sticky top-0 bg-[#0E0E0E] z-10">
                        <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_minmax(300px,3fr)_40px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground items-center">
                            <div className="text-center"></div>
                            <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Zadania</div>
                            <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Status</div>
                            <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Termin</div>
                            <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Opis</div>
                            <div></div>
                        </div>
                        <div className="mx-6 border-b border-white/5"></div>
                    </div>

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
                            tasksGrouped.map((group) => {
                                const Icon = iconMap[group.type] || Layers;
                                return (
                                    <div key={group.id} className="pb-2 last:border-0">
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
                                                    <div className="text-muted-foreground text-sm py-4">
                                                        Brak sprintow dla tego pomieszczenia
                                                    </div>
                                                ) : (
                                                    group.sprints.map((sprint: Sprint) => (
                                                        <div key={sprint.id} className="border-b border-white/5 pb-2 last:border-0">
                                                            {/* Sprint Header */}
                                                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-white/80 hover:text-white transition-colors w-full group py-2">
                                                                <button
                                                                    onClick={() => toggleSprint(sprint.id)}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${collapsedSprints[sprint.id] ? '-rotate-90' : ''}`} />
                                                                    <Clock className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                                                                </button>
                                                                <span
                                                                    onClick={() => openSprintDetails(sprint)}
                                                                    className="cursor-pointer hover:underline"
                                                                >
                                                                    {sprint.name}
                                                                </span>
                                                                {sprint.startDate && sprint.endDate && (
                                                                    <span className="text-[14px] text-muted-foreground/60 font-normal ml-2">
                                                                        {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Tasks Rows */}
                                                            {!collapsedSprints[sprint.id] && (
                                                                <div className="space-y-0">
                                                                    {sprint.tasks.length === 0 ? (
                                                                        <div className="text-muted-foreground text-sm py-4 ml-6">
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
                                                                                    className={`grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_minmax(300px,3fr)] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-transparent text-[14px] group/row rounded-none ${selectedTasks.has(task.id) ? 'bg-[#1a1a1a]' : ''}`}
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

                                                                                    {/* Due Date */}
                                                                                    <div className="text-muted-foreground">
                                                                                        {formatDate(task.dueDate)}
                                                                                    </div>

                                                                                    {/* Description */}
                                                                                    <div className="text-muted-foreground line-clamp-2 pr-4 text-sm col-span-2">
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
                        onClick={() => {}}
                        className="h-8"
                    >
                        Zmien pola
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
                        className="h-8"
                    >
                        Zmien status
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
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

            {/* Right Sidebar - Task Details */}
            {selectedTaskDetails && (
                <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-[#0A0A0A] border-l border-white/10 z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-white mb-2">{selectedTaskDetails.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {'room' in selectedTaskDetails && selectedTaskDetails.room ? selectedTaskDetails.room.name : 'Zadanie ogolne'}
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
                                <Button variant="secondary" className="w-full mb-2">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edytuj zadanie
                                </Button>
                                <Button variant="ghost" className="w-full text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Usun zadanie
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Sidebar - Sprint Details */}
            {selectedSprintDetails && (
                <div className="fixed right-0 top-0 bottom-0 w-[500px] bg-[#0A0A0A] border-l border-white/10 z-50 overflow-y-auto animate-in slide-in-from-right duration-200">
                    <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-white mb-2">{selectedSprintDetails.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedSprintDetails._count.tasks} {selectedSprintDetails._count.tasks === 1 ? 'zadanie' : 'zadan'}
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
                                        <p className="text-muted-foreground text-sm">Brak zadan w tym sprincie</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <Button variant="secondary" className="w-full mb-2">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edytuj sprint
                                </Button>
                                <Button variant="ghost" className="w-full text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Usun sprint
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateSprintModal
                isOpen={isSprintModalOpen}
                onClose={() => setIsSprintModalOpen(false)}
                projectId={project.id}
            />
            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                projectId={project.id}
                sprints={sprints}
                rooms={project.rooms}
            />
        </div>
    );
}
