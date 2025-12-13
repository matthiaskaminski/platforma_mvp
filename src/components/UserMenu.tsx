"use client";

import React, { useState } from "react";
import { Settings, LogOut, User, HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserMenuProps {
    user: {
        email: string;
        fullName?: string;
        avatarUrl?: string;
    };
    onLogout: () => void;
    onSettings?: () => void;
}

export function UserMenu({ user, onLogout, onSettings }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const initials = user.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email.slice(0, 2).toUpperCase();

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#0E0E0E] transition-colors cursor-pointer min-h-[48px]"
            >
                <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.fullName || user.email}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium">
                            {initials}
                        </div>
                    )}
                    <div className="flex flex-col items-start">
                        <span className="text-base font-medium">{user.fullName || user.email.split('@')[0]}</span>
                        <span className="text-sm text-muted-foreground">Plan premium</span>
                    </div>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#151515] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* User Info */}
                        <div className="px-3 py-3 border-b border-white/10">
                            <div className="text-sm font-medium">{user.fullName || 'Użytkownik'}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    // Navigate to profile
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#1B1B1B] transition-colors text-sm"
                            >
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>Profil</span>
                            </button>

                            <button
                                onClick={() => {
                                    onSettings?.();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#1B1B1B] transition-colors text-sm"
                            >
                                <Settings className="w-4 h-4 text-muted-foreground" />
                                <span>Ustawienia</span>
                            </button>

                            <button
                                onClick={() => {
                                    // Navigate to help
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#1B1B1B] transition-colors text-sm"
                            >
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                <span>Pomoc</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Logout */}
                        <div className="py-2">
                            <button
                                onClick={() => {
                                    onLogout();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 transition-colors text-sm text-red-400 hover:text-red-300"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Wyloguj się</span>
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
