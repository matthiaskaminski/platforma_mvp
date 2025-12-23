"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, ListTodo, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProjectSummary {
    budgetGoal: any;  // Room-specific budget (can be null)
    projectBudget?: any;  // Project total budget for percentage calculation
    hasRoomBudget?: boolean;  // Flag to know if room has its own budget
    rooms: {
        productItems: {
            price: any;
            quantity: number;
            paidAmount: any;
            category: string | null;
        }[];
    }[];
    tasks: {
        id: string;
        title: string;
        status: string;
        dueDate: Date | null;
    }[];
}

interface SummaryAccordionProps {
    projectSummary: ProjectSummary | null;
}

const statusConfig: Record<string, { label: string; badgeStatus: "overdue" | "in_progress" | "not_started" | "completed" }> = {
    'TODO': { label: "Do zrobienia", badgeStatus: "not_started" },
    'IN_PROGRESS': { label: "W trakcie", badgeStatus: "in_progress" },
    'DONE': { label: "Zakończone", badgeStatus: "completed" }
};

export function SummaryAccordion({ projectSummary }: SummaryAccordionProps) {
    const [isOpen, setIsOpen] = useState(true);

    // Calculate budget data from project summary - memoized to avoid recalculation on every render
    const budget = useMemo(() => {
        if (!projectSummary) {
            return {
                products: 0,
                materials: 0,
                services: 0,
                total: 0,
                budgetGoal: 0,
                projectBudget: 0,
                hasRoomBudget: false,
                remaining: 0,
                percentage: 0,
                projectPercentage: 0
            };
        }

        let products = 0;
        let materials = 0;
        let services = 0;

        // Sum up all product items across all rooms
        projectSummary.rooms.forEach(room => {
            room.productItems.forEach(item => {
                const price = Number(item.price) || 0;
                const total = price * item.quantity;

                // Categorize by category field
                const category = item.category?.toLowerCase() || '';
                if (category.includes('materiał') || category.includes('material')) {
                    materials += total;
                } else if (category.includes('usługa') || category.includes('service')) {
                    services += total;
                } else {
                    products += total;
                }
            });
        });

        const total = products + materials + services;
        const budgetGoal = Number(projectSummary.budgetGoal) || 0;
        const projectBudget = Number(projectSummary.projectBudget) || 0;
        const hasRoomBudget = projectSummary.hasRoomBudget ?? (budgetGoal > 0);

        // If room has its own budget, calculate remaining and percentage based on room budget
        // Otherwise, calculate percentage based on project budget
        const remaining = hasRoomBudget && budgetGoal > 0 ? Math.max(0, budgetGoal - total) : 0;
        const percentage = hasRoomBudget && budgetGoal > 0 ? Math.round((total / budgetGoal) * 100) : 0;
        const projectPercentage = projectBudget > 0 ? Math.round((total / projectBudget) * 100) : 0;

        return {
            products,
            materials,
            services,
            remaining,
            total,
            budgetGoal,
            projectBudget,
            hasRoomBudget,
            percentage,
            projectPercentage
        };
    }, [projectSummary]);

    // Prepare chart data
    // If room has its own budget: show spent categories + remaining room budget
    // If no room budget: show spent categories as part of project budget (remaining = project budget - room total)
    const budgetData = useMemo(() => {
        if (budget.hasRoomBudget) {
            // Room has its own budget - show categories + remaining from room budget
            return [
                { name: "Produkty", value: budget.products, color: "#F3F3F3" },
                { name: "Materiały", value: budget.materials, color: "#6E6E6E" },
                { name: "Usługi", value: budget.services, color: "#2F2F2F" },
                { name: "Pozostało", value: budget.remaining, color: "#232323" },
            ].filter(item => item.value && item.value > 0);
        } else {
            // No room budget - show room's share of project budget
            const projectRemaining = Math.max(0, budget.projectBudget - budget.total);
            return [
                { name: "To pomieszczenie", value: budget.total, color: "#F3F3F3" },
                { name: "Pozostały budżet", value: projectRemaining, color: "#232323" },
            ].filter(item => item.value && item.value > 0);
        }
    }, [budget]);

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 2
        }).format(value);
    };

    // Format date
    const formatDate = (date: Date | null) => {
        if (!date) return "Brak terminu";

        const dateObj = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(dateObj);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
            return `dziś ${dateObj.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
        }

        return dateObj.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Check if task is overdue
    const isOverdue = (task: any) => {
        if (!task.dueDate || task.status === 'DONE') return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    };

    // Get top 2 tasks
    const topTasks = projectSummary?.tasks.slice(0, 2) || [];

    return (
        <div className="bg-[#151515] rounded-2xl overflow-hidden shrink-0">
            {/* Header / Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 transition-colors cursor-pointer"
            >
                <span className="text-lg font-medium text-white">Podsumowanie</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 flex flex-col xl:flex-row gap-8 items-stretch">
                            {/* Left: Tasks ("Wymaga uwagi") - 45% width */}
                            <div className="w-full xl:w-[45%] shrink-0 flex flex-col">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Wymaga uwagi</h3>
                                <div className="flex flex-col gap-3 flex-1">
                                    {topTasks.length === 0 ? (
                                        <div className="bg-[#1B1B1B] p-6 rounded-xl flex flex-col items-center justify-center text-center flex-1">
                                            <ListTodo className="w-8 h-8 mb-3 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground mb-3">Brak zadań do wykonania</p>
                                            <Button variant="ghost" className="border border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 text-muted-foreground hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                                                <Plus className="w-4 h-4 mr-2" /> Dodaj zadanie
                                            </Button>
                                        </div>
                                    ) : (
                                        topTasks.map((task) => {
                                            const taskOverdue = isOverdue(task);
                                            const statusInfo = statusConfig[task.status] || statusConfig['TODO'];

                                            return (
                                                <div key={task.id} className="bg-[#1B1B1B] p-4 rounded-xl flex justify-between items-start group hover:bg-[#232323] transition-colors cursor-pointer flex-1">
                                                    <div className="pr-4 flex flex-col justify-between h-full">
                                                        <div className="text-sm font-medium text-white mb-1">{task.title}</div>
                                                        <Badge
                                                            status={taskOverdue ? "overdue" : statusInfo.badgeStatus}
                                                            dot
                                                            className="bg-transparent px-0 text-[14px] gap-2 hover:bg-transparent"
                                                        >
                                                            {taskOverdue ? "Przeterminowane" : statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                                                        Do: {formatDate(task.dueDate)}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Right: Budget - Fills remaining space and height */}
                            <div className="flex-1 flex gap-6 justify-end min-w-0">
                                <div className="flex gap-6 h-full w-full">
                                    {/* List - Flexible */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Budżet estymacyjny</h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Produkty", val: budget.products, color: "bg-[#F3F3F3]" },
                                                { label: "Materiały", val: budget.materials, color: "bg-[#6E6E6E]" },
                                                { label: "Usługi", val: budget.services, color: "bg-[#2F2F2F]" },
                                                ...(budget.hasRoomBudget ? [{ label: "Pozostało", val: budget.remaining, color: "bg-[#232323]" }] : []),
                                            ].filter(item => item.val && item.val > 0).map((item) => (
                                                <div key={item.label} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-2 rounded-full ${item.color}`}></div>
                                                        <span className="text-muted-foreground">{item.label}</span>
                                                    </div>
                                                    <span className="font-medium text-white">{formatCurrency(item.val!)}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 mt-2 border-t border-white/5 flex justify-between text-sm">
                                                <span className="text-muted-foreground">Łącznie</span>
                                                <span className="font-semibold text-white">{formatCurrency(budget.total)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart */}
                                    {budgetData.length > 0 && budget.total > 0 && (
                                        <div className="w-[220px] h-[220px] relative shrink-0 self-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={budgetData}
                                                        innerRadius="75%"
                                                        outerRadius="92%"
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                        stroke="none"
                                                        cornerRadius={4}
                                                    >
                                                        {budgetData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-[28px] font-bold text-white">
                                                    {budget.hasRoomBudget ? budget.percentage : budget.projectPercentage}%
                                                </span>
                                                {!budget.hasRoomBudget && budget.projectBudget > 0 && (
                                                    <span className="text-xs text-muted-foreground">budżetu projektu</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
