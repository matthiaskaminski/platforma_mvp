"use client";

import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, ListTodo, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getRoomColor } from "@/components/dashboard/DashboardClient";

interface RoomBreakdown {
    id: string;
    name: string;
    spent: number;
    isCurrentRoom: boolean;
}

interface ProjectSummary {
    budgetGoal: any;  // Room-specific budget (can be null)
    projectBudget?: any;  // Project total budget for percentage calculation
    hasRoomBudget?: boolean;  // Flag to know if room has its own budget
    currentRoomId?: string;
    currentRoomName?: string;
    roomsBreakdown?: RoomBreakdown[];
    services?: {
        materialPlanned: number;
        materialApproved: number;
        laborPlanned: number;
        laborApproved: number;
    };
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

    // Get rooms breakdown data
    const roomsBreakdown = projectSummary?.roomsBreakdown || [];
    const currentRoomId = projectSummary?.currentRoomId;

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

    // Get services data - suma wszystkich usług (planowanych + zatwierdzonych) - budżet estymacyjny
    const servicesTotal = (projectSummary?.services?.materialPlanned || 0) +
                          (projectSummary?.services?.materialApproved || 0) +
                          (projectSummary?.services?.laborPlanned || 0) +
                          (projectSummary?.services?.laborApproved || 0);

    // Prepare chart data - current room colored, other rooms gray, services gray, remaining dark gray
    const budgetData = useMemo(() => {
        const projectBudget = Number(projectSummary?.projectBudget) || 0;
        const roomsTotal = roomsBreakdown.reduce((sum, r) => sum + r.spent, 0);
        const totalSpent = roomsTotal + servicesTotal;
        const remaining = Math.max(0, projectBudget - totalSpent);

        if (roomsBreakdown.length > 0 || servicesTotal > 0) {
            // Find current room and calculate other rooms total
            const currentRoom = roomsBreakdown.find(r => r.id === currentRoomId);
            const otherRoomsTotal = roomsBreakdown
                .filter(r => r.id !== currentRoomId)
                .reduce((sum, r) => sum + r.spent, 0);

            const data = [];

            // Current room - with color
            if (currentRoom && currentRoom.spent > 0) {
                const currentRoomIndex = roomsBreakdown.findIndex(r => r.id === currentRoomId);
                data.push({
                    name: currentRoom.name,
                    value: currentRoom.spent,
                    color: getRoomColor(currentRoomIndex >= 0 ? currentRoomIndex : 0),
                    isCurrentRoom: true
                });
            }

            // Other rooms combined - lighter gray
            if (otherRoomsTotal > 0) {
                data.push({
                    name: "Pozostałe pomieszczenia",
                    value: otherRoomsTotal,
                    color: "#8A8A8A",
                    isCurrentRoom: false
                });
            }

            // Services - darker gray (distinct from other rooms)
            if (servicesTotal > 0) {
                data.push({
                    name: "Usługi",
                    value: servicesTotal,
                    color: "#4A4A4A",
                    isCurrentRoom: false
                });
            }

            // Remaining budget - dark gray
            if (remaining > 0) {
                data.push({
                    name: "Pozostało",
                    value: remaining,
                    color: "#232323",
                    isCurrentRoom: false
                });
            }

            return data;
        }
        return [];
    }, [roomsBreakdown, projectSummary?.projectBudget, currentRoomId, servicesTotal]);

    // Format currency
    const formatCurrency = (value: number) => {
        return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
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

    // Calculate total spent for Łącznie (rooms + services)
    const totalSpent = roomsBreakdown.reduce((sum, r) => sum + r.spent, 0) + servicesTotal;

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
                                <div className="flex gap-8 h-full w-full items-stretch">
                                    {/* Budget List - 3 categories: current room, other rooms, services */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Budżet estymacyjny</h3>
                                        <div className="flex flex-col gap-4 overflow-y-auto no-scrollbar pr-2">
                                            {/* Current Room */}
                                            {(() => {
                                                const currentRoom = roomsBreakdown.find(r => r.id === currentRoomId);
                                                const currentRoomIndex = roomsBreakdown.findIndex(r => r.id === currentRoomId);
                                                if (currentRoom && currentRoom.spent > 0) {
                                                    return (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: getRoomColor(currentRoomIndex >= 0 ? currentRoomIndex : 0) }}
                                                                />
                                                                <span className="text-[15px] text-white font-semibold">
                                                                    {currentRoom.name}
                                                                </span>
                                                            </div>
                                                            <span className="text-[15px] text-white font-semibold tabular-nums">
                                                                {formatCurrency(currentRoom.spent)}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* Other Rooms Combined */}
                                            {(() => {
                                                const otherRoomsTotal = roomsBreakdown
                                                    .filter(r => r.id !== currentRoomId)
                                                    .reduce((sum, r) => sum + r.spent, 0);
                                                if (otherRoomsTotal > 0) {
                                                    return (
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <span
                                                                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: "#8A8A8A" }}
                                                                />
                                                                <span className="text-[15px] text-[#E5E5E5]">
                                                                    Pozostałe pomieszczenia
                                                                </span>
                                                            </div>
                                                            <span className="text-[15px] text-[#E5E5E5] font-medium tabular-nums">
                                                                {formatCurrency(otherRoomsTotal)}
                                                            </span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}

                                            {/* Services */}
                                            {servicesTotal > 0 && (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: "#4A4A4A" }}
                                                        />
                                                        <span className="text-[15px] text-[#E5E5E5]">Usługi</span>
                                                    </div>
                                                    <span className="text-[15px] text-[#E5E5E5] font-medium tabular-nums">
                                                        {formatCurrency(servicesTotal)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Empty state */}
                                            {roomsBreakdown.length === 0 && servicesTotal === 0 && (
                                                <div className="text-[14px] text-muted-foreground py-4">
                                                    Brak danych budżetowych
                                                </div>
                                            )}
                                        </div>

                                        {/* Total - Łącznie */}
                                        {(roomsBreakdown.length > 0 || servicesTotal > 0) && (
                                            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
                                                <span className="text-[15px] text-[#E5E5E5] font-semibold">Łącznie</span>
                                                <span className="text-[15px] text-[#E5E5E5] font-semibold tabular-nums">
                                                    {formatCurrency(totalSpent)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Chart - Like Dashboard */}
                                    {budgetData.length > 0 && (
                                        <div className="aspect-square h-full max-h-[200px] relative shrink-0 self-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={budgetData}
                                                        innerRadius="72%"
                                                        outerRadius="90%"
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        stroke="none"
                                                        cornerRadius={6}
                                                    >
                                                        {budgetData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-[24px] font-bold text-white">
                                                    {budget.projectPercentage}%
                                                </span>
                                                <span className="text-xs text-muted-foreground">budżetu projektu</span>
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
