"use client";

import React, { useState } from "react";
import {
    Search,
    ChevronDown,
    Share2,
    Printer,
    Download,
    LayoutGrid,
    Hash,
    Flame,
    MoreVertical,
    ArrowUpRight,
    CheckCircle2,
    Calendar,
    CreditCard
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// Mock Data for Cart Items
const MOCK_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png";

const cartItems = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    name: `Produkt Designerski ${i + 1}`,
    room: i % 2 === 0 ? "Salon - Modern" : "Sypialnia Master",
    category: i % 3 === 0 ? "Produkty" : (i % 3 === 1 ? "Materiały" : "Usługi"),
    quantity: 1,
    price: 1500 + (i * 250),
    status: i % 4 === 0 ? "Opłacone" : "Do zapłaty",
    statusColor: "text-[#F3F3F3]",
    dotColor: i % 4 === 0 ? "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" : "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]",
    img: MOCK_IMG
}));

export default function CartPage() {
    // Calculate Totals
    const totalCost = cartItems.reduce((acc, item) => acc + item.price, 0);
    const totalPaid = cartItems.filter(i => i.status === "Opłacone").reduce((acc, item) => acc + item.price, 0);
    const toPay = totalCost - totalPaid;

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-500 overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3 px-0 pt-2">
                {/* Filter Bar */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Filtruj listę</span>

                    <div className="flex gap-2 ml-auto">
                        <div className="relative w-[300px] hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Szukaj produktu..."
                                className="bg-[#1B1B1B] border-transparent focus:border-white/10 h-[48px] pl-10 w-full"
                            />
                        </div>

                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Kategoria
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* Actions */}
                <Card className="p-4 h-auto md:h-auto flex items-center justify-center gap-2 px-4 shrink-0">
                    <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                        <Share2 className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                        <Printer className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                        <Download className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            {/* Main Content Area - Table + Sticky Footer */}
            <div className="flex-1 flex flex-col min-h-0 relative">

                {/* Scrollable List Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-0 flex flex-col">

                    {/* Sticky Table Header */}
                    <div className="sticky top-0 bg-[#0E0E0E] z-20 border-b border-white/5">
                        <div className="grid grid-cols-[50px_60px_3fr_2fr_1.5fr_1fr_1.5fr_50px] gap-4 px-6 py-4 text-sm font-medium text-muted-foreground items-center">
                            <div className="text-center">#</div>
                            <div></div> {/* Image */}
                            <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Nazwa produktu</div>
                            <div className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Pomieszczenie</div>
                            <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Kategoria</div>
                            <div className="text-right">Cena</div>
                            <div className="flex items-center gap-2 justify-end"><Flame className="w-4 h-4" /> Status</div>
                            <div></div> {/* Actions */}
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="px-0 pb-0">
                        {cartItems.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-[50px_60px_3fr_2fr_1.5fr_1fr_1.5fr_50px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-0 text-[14px] px-6 group">
                                {/* ID/Checkbox placeholder */}
                                <div className="text-center text-muted-foreground/50">{index + 1}</div>

                                {/* Image */}
                                <div className="flex justify-center">
                                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex items-center justify-center relative group/img">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="text-white font-medium truncate">{item.name}</div>
                                <div className="text-muted-foreground truncate">{item.room}</div>
                                <div className="text-muted-foreground">{item.category}</div>
                                <div className="text-right text-white font-medium">{item.price.toLocaleString('pl-PL')} zł</div>

                                {/* Status */}
                                <div className="flex items-center gap-2 justify-end">
                                    <div className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`}></div>
                                    <span className={item.statusColor}>{item.status}</span>
                                </div>

                                {/* Row Actions */}
                                <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Spacer to force scroll if needed or push footer */}
                    <div className="mt-auto"></div>
                </div>

                {/* Sticky Budget Summary Footer */}
                <div className="shrink-0 bg-[#0F0F0F] z-30 p-0 animate-in slide-in-from-bottom-5 duration-500">
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
                                <div className="text-xl font-bold text-white tracking-tight">{toPay.toLocaleString('pl-PL')} zł</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
