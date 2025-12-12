"use client";

import React from "react";
import { Search, Bell, Edit3, Moon, Share2 } from "lucide-react";

interface TopbarProps {
    title?: React.ReactNode;
}

export function Topbar({ title = "Dashboard" }: TopbarProps) {
    return (
        <header className="h-20 pt-4 pb-2 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/50 flex items-center justify-between px-6 sticky top-0 z-10 transition-all">
            {/* Left: Title / Breadcrumbs */}
            <div>
                <h1 className="text-lg font-medium text-[#6E6E6E]">{title}</h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Szukaj"
                        className="bg-secondary/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary outline-none w-64 transition-all h-10"
                    />
                </div>

                {/* Icons */}
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground h-10 w-10 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground relative h-10 w-10 flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E5E5E5] text-black text-[9px] flex items-center justify-center rounded-full font-bold">3</span>
                </button>

                {/* Theme Toggle (Mock) */}
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground h-10 w-10 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                </button>

                {/* Share */}
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground h-10 w-10 flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
