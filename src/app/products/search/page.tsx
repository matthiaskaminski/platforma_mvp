"use client";

import React from "react";
import { Search, ChevronLeft, Upload, ArrowUpRight, Bell, Moon, Share2, PenSquare } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

// Mock Data
const recommendedProducts = [
    {
        id: 1,
        name: "Łóżko tapicerowane Teddy-Bouclé",
        brand: "Westwing",
        price: "7 859,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/DEQ23WES93078-204130_d6587456a27fd9ecc8c678b730505a43_dtl_1.webp"
    },
    {
        id: 2,
        name: "Sofa modułowa Teddy-Bouclé",
        brand: "Westwing",
        price: "15 749,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png" // Placeholder
    },
    {
        id: 3,
        name: "Sofa modułowa Teddy-Bouclé z...", // Truncated title simulation
        brand: "Westwing",
        price: "13 949,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/509_0776c21ac3-tigr-bei-pp-1600.jpg" // Placeholder
    },
];

const activePromotions = [
    {
        id: 4,
        name: "Sofa ze skóry z recyklingu Hunter",
        brand: "Westwing",
        price: "5 779,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526570979_1355299693265757_7539015905078556121_n.jpg" // Placeholder
    },
    {
        id: 5,
        name: "Szafka RTV z drewna Larsen",
        brand: "Westwing",
        price: "5 849,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526585939_1355299613265765_6668356102677043657_n.jpg" // Placeholder
    },
    {
        id: 6,
        name: "Szafka RTV z drewna dębowego...",
        brand: "Westwing",
        price: "4 949,00 zł",
        image: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg" // Placeholder
    },
];

export default function ProductSearchPage() {
    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-500 overflow-hidden">
            {/* Header Bar */}
            {/* Header Removed as per user request (Global Header is sufficient) */}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1 min-h-0">

                {/* Left Column: Smart Search (Span 8) */}
                <div className="xl:col-span-8 flex flex-col h-full min-h-0">
                    <Card className="flex flex-col h-full p-8 md:p-12 items-center justify-center text-center relative overflow-hidden">
                        {/* Background Overlay if needed, or simple dark card */}

                        <div className="max-w-2xl w-full flex flex-col items-center z-10">
                            <h2 className="text-3xl font-medium text-[#E5E5E5] mb-4">Inteligentne wyszukiwanie produktów</h2>
                            <p className="text-lg text-[#E5E5E5] mb-2">Wrzuć zdjęcie lub wizualizację wnętrza aby wyszukać podobne produkty</p>
                            <p className="text-sm text-muted-foreground mb-12">Dla lepszych rezultatów, zadbaj o to aby zdjęcia lub wizualizacje były dobrej jakości.</p>

                            {/* Drop Zone */}
                            <div className="w-full aspect-video border-[1.5px] border-dashed border-white/10 bg-[#0E0E0E] rounded-[8px] flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer mb-12 group">
                                <Button variant="ghost" className="pointer-events-none group-hover:scale-110 transition-transform mb-4">
                                    <span className="text-2xl text-muted-foreground font-light">+</span>
                                </Button>
                                <p className="text-[#E5E5E5] mb-2 font-medium">Przeciągnij lub naciśnij aby dodać zdjęcie</p>
                                <p className="text-xs text-muted-foreground">Maksymalny rozmiar: 5MB • Obsługiwane formaty: JPG, PNG, WebP</p>
                            </div>

                            <Button className="bg-[#1B1B1B] hover:bg-[#252525] text-muted-foreground hover:text-white h-[56px] px-8 rounded-xl flex items-center gap-2 group transition-all w-full max-w-sm justify-between">
                                <span>Rozpocznij szukanie produktów</span>
                                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Recommendations (Span 4) */}
                <div className="xl:col-span-4 flex flex-col gap-3 h-full min-h-0">

                    {/* Recommended Products */}
                    {/* Recommended Products */}
                    <Card className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-medium text-[#E5E5E5]">Produkty które mogą Ci się spodobać</h3>
                        </div>
                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 no-scrollbar">
                            {recommendedProducts.map((prod) => (
                                <div key={prod.id} className="flex-1 flex gap-4 items-center p-2 bg-[#1B1B1B] rounded-xl group cursor-pointer hover:bg-[#232323] transition-colors overflow-hidden">
                                    <div className="h-full aspect-square bg-white rounded-lg flex-shrink-0 relative flex items-center justify-center p-2">
                                        <img src={prod.image} className="max-w-full max-h-full object-contain" alt={prod.name} />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1 pr-2">
                                        <div className="flex justify-between items-start">
                                            <div className="text-[16px] font-medium text-[#E5E5E5] leading-tight mb-1 line-clamp-2">{prod.name}</div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="text-[12px] text-muted-foreground">{prod.brand}</div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-[16px] font-semibold text-[#E5E5E5]">{prod.price}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Active Promotions */}
                    {/* Active Promotions */}
                    <Card className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[16px] font-medium text-[#E5E5E5]">Aktywne promocje</h3>
                        </div>
                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 min-h-0 no-scrollbar">
                            {activePromotions.map((prod) => (
                                <div key={prod.id} className="flex-1 flex gap-4 items-center p-2 bg-[#1B1B1B] rounded-xl group cursor-pointer hover:bg-[#232323] transition-colors overflow-hidden">
                                    <div className="h-full aspect-square bg-white rounded-lg flex-shrink-0 relative flex items-center justify-center p-2">
                                        <img src={prod.image} className="max-w-full max-h-full object-contain" alt={prod.name} />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1 pr-2">
                                        <div className="flex justify-between items-start">
                                            <div className="text-[16px] font-medium text-[#E5E5E5] leading-tight mb-1 line-clamp-2">{prod.name}</div>
                                            <ArrowUpRight className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <div className="text-[12px] text-muted-foreground">{prod.brand}</div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-[16px] font-semibold text-[#E5E5E5]">{prod.price}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
