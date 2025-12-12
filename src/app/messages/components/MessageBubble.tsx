import React from "react";
import { Message, User } from "../data";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: Message;
    sender: User;
}

export function MessageBubble({ message, sender }: MessageBubbleProps) {
    if (message.isMe) {
        return (
            <div className="flex flex-col items-end w-full mb-6">
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                    <span>{message.timestamp}</span>
                    <span className="font-medium text-white">Ty</span>
                    <div className="w-6 h-6 rounded bg-[#252525] flex items-center justify-center text-[10px] font-bold text-white/50">
                        S
                    </div>
                </div>
                <div className="bg-[#151515] p-6 rounded-2xl md:max-w-[80%] text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">
                    {message.text}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start w-full mb-6">
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <span className="font-medium text-white">{sender.name}</span>
                <span>{message.timestamp}</span>
            </div>
            <div className="bg-[#1B1B1B] p-6 rounded-2xl md:max-w-[80%] text-[14px] leading-relaxed text-white/90 whitespace-pre-wrap">
                {message.text}
            </div>
        </div>
    );
}
