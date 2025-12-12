"use client";

import React from "react";
import { Plus, Trash2, MoreHorizontal } from "lucide-react";

const photos = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    url: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg",
    title: `Zdjęcie ${i + 1}`,
    date: "12.11.2024"
}));

export function GalleryGrid() {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6 pt-2">
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                {/* Upload Placeholder */}
                <div className="break-inside-avoid bg-[#151515] border border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer flex flex-col items-center justify-center p-8 hover:bg-[#1A1A1A] hover:border-white/20 transition-all group h-[200px]">
                    <div className="w-12 h-12 rounded-full bg-[#1B1B1B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-sm font-medium text-white">Dodaj zdjęcia</div>
                </div>

                {photos.map((photo) => (
                    <div key={photo.id} className="break-inside-avoid bg-[#151515] rounded-xl overflow-hidden group cursor-pointer relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.url} alt={photo.title} className="w-full h-auto object-cover hover:opacity-90 transition-opacity" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="text-white text-sm font-medium">{photo.title}</div>
                            <div className="text-xs text-white/70">{photo.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
