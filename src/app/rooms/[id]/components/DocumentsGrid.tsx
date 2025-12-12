"use client";

import React from "react";
import { FileText, Image as ImageIcon, Box, MoreHorizontal, ArrowUpRight, Check } from "lucide-react";

// Mock Data
const documents = [
    { id: 1, title: "umowa_z_klientem_2024.pdf", type: "Umowa", icon: FileText, preview: null },
    { id: 2, title: "inspiracja_4.png", type: "Wizualizacja", icon: ImageIcon, preview: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png" },
    { id: 3, title: "rysunek_techniczny2_.pdf", type: "Rysunek techniczny", icon: FileText, preview: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png" }, // Mock preview
    { id: 4, title: "projekt_olga.skp", type: "Projekt 3D", icon: Box, preview: null },
    { id: 5, title: "inspiracja_3.png", type: "Wizualizacja", icon: ImageIcon, preview: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg" },
    { id: 6, title: "inspiracja_2.png", type: "Wizualizacja", icon: ImageIcon, preview: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg" },
    { id: 7, title: "inspiracja_1.png", type: "Wizualizacja", icon: ImageIcon, preview: "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299779932415_3850250429931914731_n.jpg" },
    { id: 8, title: "umowa_ekipa_remontowa2025.pdf", type: "Umowa", icon: FileText, preview: null },
];

export function DocumentsGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 p-6 pt-2">
            {documents.map((doc) => (
                <div key={doc.id} className="bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:bg-[#1A1A1A] transition-colors border border-transparent hover:border-white/5">
                    {/* Preview Area */}
                    <div className="aspect-square bg-[#151515] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                        {/* Overlay Controls */}
                        <div className="absolute top-2 left-2 z-10">
                            <div className="w-5 h-5 rounded border border-white/30 bg-transparent flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                                {/* Checkbox placeholder - could be active state */}
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-6 h-6 rounded-full bg-[#1B1B1B] text-white flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                            <button className="w-6 h-6 rounded-full bg-[#1B1B1B] text-white flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"><ArrowUpRight className="w-4 h-4" /></button>
                        </div>

                        {/* Content */}
                        {doc.preview ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={doc.preview} alt={doc.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <doc.icon className="w-12 h-12 text-muted-foreground opacity-50" />
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-3 bg-[#1B1B1B]">
                        <div className="text-white text-sm font-medium truncate mb-1" title={doc.title}>{doc.title}</div>
                        <div className="text-muted-foreground text-xs">{doc.type}</div>
                    </div>
                </div>
            ))}


        </div>
    );
}
