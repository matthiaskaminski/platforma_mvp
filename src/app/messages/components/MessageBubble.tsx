'use client';

import React from "react";
import { EmailMessage } from "../data";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: EmailMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (message.isMe) {
        return (
            <div className="flex flex-col items-end w-full mb-6">
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <span>{message.date}</span>
                    <span className="font-medium text-white">Ty</span>
                    <div className="w-6 h-6 rounded bg-[#252525] flex items-center justify-center text-[10px] font-bold text-white/50">
                        {getInitials(message.fromName || 'Me')}
                    </div>
                </div>
                <div className="bg-[#151515] p-6 rounded-2xl md:max-w-[80%] text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">
                    {message.body || message.snippet}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start w-full mb-6">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <div className="w-6 h-6 rounded bg-[#252525] flex items-center justify-center text-[10px] font-bold text-white/50">
                    {getInitials(message.fromName)}
                </div>
                <span className="font-medium text-white">{message.fromName}</span>
                <span>{message.date}</span>
            </div>
            <div className="bg-[#1B1B1B] p-6 rounded-2xl md:max-w-[80%] text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">
                {message.body || message.snippet}
            </div>
        </div>
    );
}
