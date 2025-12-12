"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronDown, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const budgetData = [
    { name: "Produkty", value: 73400, color: "#F3F3F3" },
    { name: "Materiały", value: 8200, color: "#6E6E6E" },
    { name: "Usługi", value: 4000, color: "#2F2F2F" },
    { name: "Pozostało", value: 4000, color: "#232323" },
];

export function SummaryAccordion() {
    const [isOpen, setIsOpen] = useState(true);

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
                            {/* Left: Alerts ("Wymaga uwagi") - 45% width */}
                            <div className="w-[45%] shrink-0 flex flex-col">
                                <h3 className="text-sm font-medium text-muted-foreground mb-4">Wymaga uwagi</h3>
                                <div className="flex flex-col gap-3 flex-1">
                                    <div className="bg-[#1B1B1B] p-4 rounded-xl flex justify-between items-start group hover:bg-[#232323] transition-colors cursor-pointer flex-1">
                                        <div className="pr-4 flex flex-col justify-between h-full">
                                            <div className="text-sm font-medium text-white mb-1">Skontaktować się z dostawcą lamp</div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]"></span>
                                                <span className="text-[14px] text-[#F3F3F3]">Przeterminowane</span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Do: 10.11.2024</span>
                                    </div>
                                    <div className="bg-[#1B1B1B] p-4 rounded-xl flex justify-between items-start group hover:bg-[#232323] transition-colors cursor-pointer flex-1">
                                        <div className="pr-4 flex flex-col justify-between h-full">
                                            <div className="text-sm font-medium text-white mb-1">Zatwierdzić próbki tkanin do sofy</div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]"></span>
                                                <span className="text-[14px] text-[#F3F3F3]">Przeterminowane</span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-muted-foreground whitespace-nowrap">Do: dziś 18:00</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Budget - Fills remaining space and height */}
                            <div className="flex-1 flex gap-6 justify-end min-w-0 flex flex-col h-full justify-between">
                                <div className="flex gap-6 h-full">
                                    {/* List - Flexible */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h3 className="text-sm font-medium text-muted-foreground mb-4">Budżet</h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Produkty", val: "73 400,00 zł", color: "bg-[#F3F3F3]" },
                                                { label: "Materiały", val: "8 200,00 zł", color: "bg-[#6E6E6E]" },
                                                { label: "Usługi", val: "4 000,00 zł", color: "bg-[#2F2F2F]" },
                                                { label: "Pozostało", val: "4 000,00 zł", color: "bg-[#232323]" },
                                            ].map((item) => (
                                                <div key={item.label} className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-2 rounded-full ${item.color}`}></div>
                                                        <span className="text-muted-foreground">{item.label}</span>
                                                    </div>
                                                    <span className="font-medium text-white">{item.val}</span>
                                                </div>
                                            ))}
                                            <div className="pt-2 mt-2 border-t border-white/5 flex justify-between text-sm">
                                                <span className="text-muted-foreground">Łącznie</span>
                                                <span className="font-semibold text-white">96 000,00 zł</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chart */}
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
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[28px] font-bold text-white">89%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div >
    );
}
