'use client';

import React from "react";
import { EmailThread } from "../data";
import { Button } from "@/components/ui/Button";
import { ChevronDown, MoreHorizontal, Plus, RefreshCw, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
    threads: EmailThread[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
}

export function ConversationList({ threads, selectedId, onSelect, isLoading, onRefresh }: ConversationListProps) {
    return (
        <div className="flex flex-col h-full w-full md:w-[400px] shrink-0 gap-4">
            {/* Header */}
            <div>
                <h2 className="text-xl font-medium text-white mb-4">Twoje rozmowy</h2>
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex gap-4">
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                            Filtruj <ChevronDown className="w-4 h-4" />
                        </button>
                        <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                            Sortuj <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-[#1B1B1B] hover:bg-[#252525] h-[36px] px-4 rounded-lg text-muted-foreground text-sm font-medium"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Odśwież
                    </Button>
                </div>
            </div>

            {/* List Container */}
            <div className="flex-1 bg-[#151515] rounded-2xl flex flex-col overflow-hidden">
                {isLoading && threads.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm">Ładowanie wiadomości...</span>
                        </div>
                    </div>
                ) : threads.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Mail className="w-12 h-12 opacity-50" />
                            <span className="text-sm">Brak wiadomości</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                        {threads.map((thread) => (
                            <div
                                key={thread.id}
                                onClick={() => onSelect(thread.id)}
                                className={cn(
                                    "group p-4 rounded-xl cursor-pointer transition-all duration-200",
                                    selectedId === thread.id
                                        ? "bg-[#1B1B1B] ring-1 ring-white/10"
                                        : "bg-[#1B1B1B] hover:bg-[#252525]"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={cn(
                                        "font-medium text-[15px] flex items-center gap-2",
                                        selectedId === thread.id ? "text-white" : "text-white/80"
                                    )}>
                                        {thread.fromName}
                                        {thread.unreadCount > 0 && (
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        )}
                                    </h3>
                                </div>

                                <div className="text-[13px] text-white/60 mb-2 font-medium truncate">
                                    {thread.subject}
                                </div>

                                <div className="text-[14px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                    {thread.snippet}
                                </div>

                                <div className="text-sm text-muted-foreground/50 font-medium">
                                    {thread.date}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer Button inside the container */}
                <div className="p-4 pt-0">
                    <Button
                        className="w-full bg-[#1B1B1B] hover:bg-[#252525] text-muted-foreground hover:text-white h-[48px] rounded-xl flex items-center justify-center gap-2"
                        onClick={() => window.open('https://mail.google.com/mail/?view=cm', '_blank')}
                    >
                        <Plus className="w-5 h-5" />
                        Napisz nową wiadomość
                    </Button>
                </div>
            </div>
        </div>
    );
}
