"use client";

import React from "react";
import { Check, Flame, Calendar, Clock, FileText, CheckSquare, MoreVertical, LayoutGrid, Hash, CheckCircle2, CreditCard } from "lucide-react";

const budgetItems = [
    { id: 1, name: "Sofa modułowa 3-os.", category: "Produkty", cost: 4500, paid: 4500, status: "Opłacone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]", statusColor: "text-[#F3F3F3]" },
    { id: 2, name: "Lampa stojąca (2 szt.)", category: "Produkty", cost: 2800, paid: 0, status: "Do zapłaty", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]", statusColor: "text-[#F3F3F3]" },
    { id: 3, name: "Montaż oświetlenia", category: "Usługi", cost: 500, paid: 0, status: "Do zapłaty", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]", statusColor: "text-[#F3F3F3]" },
    { id: 4, name: "Farba ceramiczna 10L", category: "Materiały", cost: 450, paid: 450, status: "Opłacone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]", statusColor: "text-[#F3F3F3]" },
    { id: 5, name: "Dywan wełniany 200x300", category: "Produkty", cost: 1200, paid: 0, status: "Do zapłaty", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]", statusColor: "text-[#F3F3F3]" },
    { id: 6, name: "Konsultacja projektowa", category: "Usługi", cost: 1500, paid: 1500, status: "Opłacone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]", statusColor: "text-[#F3F3F3]" },
    { id: 7, name: "Regały String System", category: "Produkty", cost: 8000, paid: 4000, status: "Częściowo", dotColor: "bg-[#6E8BCB] shadow-[0_0_8px_rgba(110,139,203,0.4)]", statusColor: "text-[#F3F3F3]" },
];

export function BudgetList() {
    const totalCost = budgetItems.reduce((acc, item) => acc + item.cost, 0);
    const totalPaid = budgetItems.reduce((acc, item) => acc + item.paid, 0);
    const remaining = totalCost - totalPaid;

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-0 flex flex-col relative">
            {/* Headers Row */}
            <div className="sticky top-0 bg-[#0E0E0E] z-20">
                <div className="grid grid-cols-[40px_60px_3fr_1.5fr_1fr_1fr_1.5fr_40px] gap-4 px-6 py-3 text-sm font-medium text-muted-foreground items-center">
                    <div className="text-center"></div>
                    <div></div> {/* Image placeholder header */}
                    <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Nazwa</div>
                    <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Kategoria</div>
                    <div className="text-right">Koszt</div>
                    <div className="text-right">Opłacono</div>
                    <div className="flex items-center gap-2 justify-end"><Flame className="w-4 h-4" /> Status</div>
                    <div></div>
                </div>
                <div className="mx-6 border-b border-white/5"></div>
            </div>

            {/* List */}
            <div className="px-6 pb-4">
                {budgetItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[40px_60px_3fr_1.5fr_1fr_1fr_1.5fr_40px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-0 text-[14px] group">
                        {/* Checkbox */}
                        <div className="flex justify-center">
                            <div className="w-5 h-5 rounded border border-white/30 bg-transparent flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                            </div>
                        </div>

                        {/* Image / Icon */}
                        <div className="flex justify-center">
                            {item.category === "Produkty" ? (
                                <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png" alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-[#151515] rounded-md flex items-center justify-center border border-white/5">
                                    <Hash className="w-6 h-6 text-muted-foreground" />
                                </div>
                            )}
                        </div>

                        <div className="text-white font-medium truncate">{item.name}</div>
                        <div className="text-muted-foreground">{item.category}</div>
                        <div className="text-right text-white">{item.cost.toLocaleString('pl-PL')} zł</div>
                        <div className="text-right text-muted-foreground">{item.paid.toLocaleString('pl-PL')} zł</div>
                        <div className="flex items-center gap-2 justify-end">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}></div>
                            <span className={item.statusColor}>{item.status}</span>
                        </div>
                        <div className="flex justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:text-white text-muted-foreground transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Spacer to push summary to bottom if list is short, or just let it sit at bottom of content */}
            <div className="mt-auto"></div>

            {/* Summary Sticky Footer */}
            <div className="sticky bottom-0 bg-[#0F0F0F] z-30 p-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 bg-[#1B1B1B] py-4 w-full rounded-2xl">

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-[#91E8B2]" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Łączna kwota</div>
                            <div className="text-xl font-bold text-white tracking-tight">{totalCost.toLocaleString('pl-PL')} zł</div>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-white/5"></div>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-[#E8B491]" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Opłacono</div>
                            <div className="text-xl font-bold text-white tracking-tight">{totalPaid.toLocaleString('pl-PL')} zł</div>
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-10 bg-white/5"></div>

                    <div className="flex items-center gap-3 mr-auto md:mr-0">
                        <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Do zapłaty</div>
                            <div className="text-xl font-bold text-white tracking-tight">{remaining.toLocaleString('pl-PL')} zł</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
