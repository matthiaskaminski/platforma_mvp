"use client";

import React from "react";
import { MonitorPlay, MoreHorizontal, FileText, Calendar as CalendarIcon, Clock } from "lucide-react";

export default function PresentationsPage() {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Prezentacje</h1>
                <button className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    + Nowa prezentacja
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-card border border-border rounded-xl overflow-hidden group hover:border-zinc-600 transition-all cursor-pointer">
                        <div className="aspect-video bg-zinc-800 relative">
                            {/* Thumbnail */}
                            <div className="absolute inset-0 bg-neutral-800 group-hover:scale-105 transition-transform duration-500"></div>

                            {/* Overlay Play */}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <MonitorPlay className="w-6 h-6 text-white ml-1" />
                                </div>
                            </div>

                            <div className="absolute top-3 right-3">
                                <button className="p-1.5 bg-black/50 hover:bg-black rounded text-muted-foreground hover:text-white backdrop-blur-sm transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold">Koncepcja Salonu V2</h3>
                                <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                    Aktywna
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">Projekt Olga • Utworzono przez Sonya Lubowitz</p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-zinc-800 pt-3">
                                <div className="flex items-center gap-1.5">
                                    <CalendarIcon className="w-3.5 h-3.5" /> 10.10.2025
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" /> 15 wyświetleń
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <FileText className="w-3.5 h-3.5" /> 2 wersje
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
