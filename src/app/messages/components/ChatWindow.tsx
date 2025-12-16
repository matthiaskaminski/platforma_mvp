'use client';

import React from "react";
import { EmailThread, EmailMessage } from "../data";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/Button";
import { MoreVertical, Loader2, Mail, ExternalLink } from "lucide-react";

interface ChatWindowProps {
    thread: EmailThread | null;
    messages: EmailMessage[];
    isLoading?: boolean;
    userEmail?: string;
}

export function ChatWindow({ thread, messages, isLoading, userEmail }: ChatWindowProps) {
    if (!thread) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full rounded-3xl bg-[#0E0E0E] border border-white/5">
                <div className="flex flex-col items-center gap-3">
                    <Mail className="w-12 h-12 opacity-50" />
                    <span>Wybierz rozmowę</span>
                </div>
            </div>
        );
    }

    const handleOpenInGmail = () => {
        window.open(`https://mail.google.com/mail/u/0/#inbox/${thread.threadId}`, '_blank');
    };

    const handleReply = () => {
        // Open Gmail compose with reply
        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(thread.fromEmail)}&su=${encodeURIComponent('Re: ' + thread.subject)}`, '_blank');
    };

    return (
        <div className="flex-1 flex flex-col h-full rounded-3xl bg-[#0E0E0E] overflow-hidden ml-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-white truncate">{thread.fromName}</h2>
                        <span className="text-sm text-muted-foreground truncate">{thread.fromEmail}</span>
                    </div>
                    <div className="text-sm text-white/60 truncate">{thread.subject}</div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-white shrink-0"
                    onClick={handleOpenInGmail}
                    title="Otwórz w Gmail"
                >
                    <ExternalLink className="w-5 h-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col no-scrollbar">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-sm">Ładowanie wiadomości...</span>
                        </div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Brak wiadomości w tym wątku
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                        />
                    ))
                )}
            </div>

            {/* Reply Area */}
            <div className="shrink-0">
                <div className="bg-[#151515] p-6 flex items-center justify-center border-t border-white/5 min-h-[80px]">
                    <Button
                        onClick={handleReply}
                        className="bg-white text-black hover:bg-gray-100 px-6"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Odpowiedz w Gmail
                    </Button>
                </div>
            </div>
        </div>
    );
}
