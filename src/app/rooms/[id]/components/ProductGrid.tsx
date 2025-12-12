"use client";

import React from "react";
import { Check, MoreHorizontal, ArrowUpRight } from "lucide-react";

// Placeholder image for all products as requested
const MOCK_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png";

const products = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: `Mebel Designerski ${i + 1}`,
    brand: "Westwing",
    price: `${(1000 + i * 250).toLocaleString('pl-PL')} zł`,
    amount: "1szt.",
    status: i % 3 === 0 ? "Zamówione" : "Do zamówienia",
    statusColor: "text-[#F3F3F3]", // Text always white/grey
    dotColor: i % 3 === 0 ? "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" : "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]", // Glowing dot
    img: MOCK_IMG
}));

export function ProductGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 p-6 pt-2">
            {products.map((p) => (
                <div key={p.id} className="bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full">
                    {/* Image Area - Fill Effect */}
                    <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                        {/* Overlay Controls */}
                        <div className="absolute top-2 left-2 z-10">
                            <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                {/* Checkbox placeholder */}
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"><MoreHorizontal className="w-4 h-4 text-black" /></button>
                            <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"><ArrowUpRight className="w-4 h-4 text-black" /></button>
                        </div>

                        {/* Image - Object Contain (No Crop) - with padding to avoid edge touching */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.img} alt={p.title} className="w-full h-full object-contain mix-blend-multiply p-4" />
                    </div>

                    {/* Content */}
                    <div className="p-3 flex flex-col flex-1 bg-[#1B1B1B]">
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
        </div>
    );
}
