"use client";

import React, { useState } from "react";
import { Clock, Flame, Check, Calendar, FileText, CheckSquare, ListTodo } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface Task {
    id: string;
    title: string;
    status: string;
    assignedTo: string | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface TasksListProps {
    tasks: Task[];
}

// Status configuration matching database enum
const statusConfig: Record<string, { label: string; badgeStatus: "overdue" | "in_progress" | "not_started" | "completed" }> = {
    'TODO': { label: "Do zrobienia", badgeStatus: "not_started" },
    'IN_PROGRESS': { label: "W trakcie", badgeStatus: "in_progress" },
    'DONE': { label: "Zakończone", badgeStatus: "completed" }
};

export const TasksList = React.memo(function TasksList({ tasks }: TasksListProps) {
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

    const toggleTask = (taskId: string) => {
        setCheckedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
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

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <ListTodo className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-2">Brak zadań w tym pomieszczeniu</p>
                <p className="text-sm text-muted-foreground">Dodaj zadania, aby je tutaj zobaczyć</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {/* Headers Row */}
            <div className="sticky top-0 bg-[#0E0E0E] z-10">
                <div className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)_40px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground items-center">
                    <div className="text-center"></div>
                    <div className="flex items-center gap-2"><CheckSquare className="w-4 h-4" /> Zadania</div>
                    <div className="flex items-center gap-2"><Flame className="w-4 h-4" /> Status</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Data utworzenia</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Termin</div>
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> ID Zadania</div>
                    <div></div>
                </div>
                <div className="mx-6 border-b border-white/5"></div>
            </div>

            <div className="mt-4 px-6 space-y-0">
                {tasks.map((task) => {
                    const isChecked = checkedTasks.has(task.id);
                    const overdue = isOverdue(task);
                    const statusInfo = statusConfig[task.status] || statusConfig['TODO'];
                    const displayStatus = overdue ? "overdue" : statusInfo.badgeStatus;

                    return (
                        <div
                            key={task.id}
                            className="grid grid-cols-[40px_minmax(250px,2fr)_150px_150px_150px_minmax(300px,3fr)_40px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors rounded-none border-b border-white/5 last:border-transparent text-[14px]"
                        >
                            {/* Checkbox */}
                            <div className="flex justify-center">
                                <button
                                    onClick={() => toggleTask(task.id)}
                                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-white border-white text-black' : 'border-white/20 hover:border-white/40'}`}
                                >
                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                </button>
                            </div>

                            {/* Name */}
                            <div className={`font-medium ${isChecked ? 'text-muted-foreground line-through' : 'text-white'}`}>
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

                            {/* Menu placeholder */}
                            <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                                {/* Menu icon placeholder or similar action */}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
