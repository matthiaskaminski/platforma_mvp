"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Search, Plus, MoreHorizontal, ArrowUpRight, Share2, Printer, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// Mock Products Data (Reusing structure from ProductGrid to ensure match)
const MOCK_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png";

const products = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Mebel Designerski ${i + 1}`,
    brand: "Westwing",
    price: `${(1000 + i * 250).toLocaleString('pl-PL')} zł`,
    amount: "1szt.",
    status: i % 3 === 0 ? "Zamówione" : "Do zamówienia",
    statusColor: "text-[#F3F3F3]",
    dotColor: i % 3 === 0 ? "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" : "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]",
    img: MOCK_IMG
}));

export default function WishlistDetailsPage({ params }: { params: { id: string } }) {
    // Header title "Salon - Wersja Modern" handled in ClientLayout now.

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-500 overflow-hidden">

            {/* Toolbar (Sort + Actions) - Adapted from Wishlist Index Style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* 1. Filter Bar - Card Container */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Sortuj według</span>

                    <div className="flex gap-2 ml-auto">
                        <div className="relative w-[300px] hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Szukaj w wishliście..."
                                className="bg-[#1B1B1B] border-transparent focus:border-white/10 h-[48px] pl-10 w-full"
                            />
                        </div>

                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Cena
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Nazwa
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* 2. Actions - Separate Group */}
                <div className="flex items-center gap-2 shrink-0 md:h-auto self-center md:self-stretch">
                    <Card className="p-4 h-[80px] flex items-center justify-center gap-2 px-4">
                        <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                            <Printer className="w-5 h-5" />
                        </Button>
                    </Card>

                    <Button className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm">
                        <Plus className="w-5 h-5" />
                        Dodaj produkt
                    </Button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {products.map((p) => (
                        <div key={p.id} className="bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:ring-1 hover:ring-white/10 transition-all">
                            {/* Image Area */}
                            <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                                {/* Overlay Controls */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                        {/* Checkbox */}
                                    </div>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"><MoreHorizontal className="w-4 h-4 text-black" /></button>
                                    <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"><ArrowUpRight className="w-4 h-4 text-black" /></button>
                                </div>

                                {/* Image */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={p.img} alt={p.title} className="w-full h-full object-contain mix-blend-multiply p-4" />
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1 bg-[#1B1B1B]">
                                <h3 className="text-white text-base font-medium leading-tight mb-1 truncate">{p.title}</h3>
                                <p className="text-muted-foreground text-sm mb-3">{p.brand}</p>

                                <div className="mt-auto">
                                    <div className="flex justify-between items-end text-sm mb-2">
                                        <span className="text-muted-foreground">{p.amount}</span>
                                        <span className="text-white font-medium text-base">{p.price}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/5">
                                        <span className="text-muted-foreground">Status</span>
                                        <div className="flex items-center gap-2 ml-auto">
                                            <span className={`w-2.5 h-2.5 rounded-full ${p.dotColor}`}></span>
                                            <span className={`${p.statusColor}`}>{p.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add New Product Placeholder Card */}
                    <div className="bg-[#151515] rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all min-h-[300px] group text-muted-foreground hover:text-white">
                        <div className="w-12 h-12 rounded-full bg-[#1B1B1B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Dodaj produkt</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
