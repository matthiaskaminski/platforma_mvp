import React from "react";
import { Conversation, Message } from "../data";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/Button";
import { MoreVertical, Mic, Image as ImageIcon } from "lucide-react";

interface ChatWindowProps {
    conversation?: Conversation | null;
}

export function ChatWindow({ conversation }: ChatWindowProps) {
    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full rounded-3xl bg-[#0E0E0E] border border-white/5">
                Wybierz rozmowę
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full rounded-3xl bg-[#0E0E0E] overflow-hidden ml-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">{conversation.user.name}</h2>
                    <span className="text-sm text-muted-foreground">{conversation.user.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col no-scrollbar">
                {conversation.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} sender={conversation.user} />
                ))}
            </div>

            {/* Input Area */}
            <div className="shrink-0">
                <div className="bg-[#151515] p-6 flex items-center gap-3 border-t border-white/5 min-h-[80px]">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white w-10 h-10 hover:bg-white/5 rounded-xl">
                        <Mic className="w-[20px] h-[20px]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white w-10 h-10 hover:bg-white/5 rounded-xl">
                        <ImageIcon className="w-[20px] h-[20px]" />
                    </Button>
                    <textarea
                        placeholder="Wprowadź wiadomość..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-base text-white placeholder:text-muted-foreground/50 px-4 resize-none py-0 overflow-hidden min-h-[24px] leading-relaxed"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
