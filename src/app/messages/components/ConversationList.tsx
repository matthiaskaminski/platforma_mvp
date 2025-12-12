import React from "react";
import { Conversation } from "../data";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronDown, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
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
                    <Button variant="secondary" className="bg-[#1B1B1B] hover:bg-[#252525] h-[36px] px-4 rounded-lg text-muted-foreground text-sm font-medium">
                        <MoreHorizontal className="w-4 h-4 mr-2" />
                        Edytuj
                    </Button>
                </div>
            </div>

            {/* List Container with integrated Button */}
            <div className="flex-1 bg-[#151515] rounded-2xl flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "group p-4 rounded-xl cursor-pointer transition-all duration-200",
                                selectedId === conv.id
                                    ? "bg-[#1B1B1B] ring-1 ring-white/5"
                                    : "bg-[#1B1B1B] hover:bg-[#252525]"
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={cn(
                                    "font-medium text-[15px]",
                                    selectedId === conv.id ? "text-white" : "text-white/80"
                                )}>
                                    {conv.user.name}
                                </h3>
                            </div>

                            <div className="text-[14px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                                {conv.user.role || conv.lastMessage}
                            </div>

                            <div className="text-sm text-muted-foreground/50 font-medium">
                                {conv.lastMessageTime}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Button inside the container */}
                <div className="p-4 pt-0">
                    <Button className="w-full bg-[#1B1B1B] hover:bg-[#252525] text-muted-foreground hover:text-white h-[48px] rounded-xl flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" />
                        Rozpocznij nową korespondencję
                    </Button>
                </div>
            </div>
        </div>
    );
}
