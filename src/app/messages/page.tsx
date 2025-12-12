"use client";

import React, { useState } from "react";
import { ConversationList } from "./components/ConversationList";
import { ChatWindow } from "./components/ChatWindow";
import { MOCK_CONVERSATIONS } from "./data";

export default function MessagesPage() {
    const [selectedId, setSelectedId] = useState<string>("1");

    const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedId) || null;

    return (
        <div className="flex h-full w-full animate-in fade-in duration-500 overflow-hidden">
            <ConversationList
                conversations={MOCK_CONVERSATIONS}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
            <ChatWindow conversation={selectedConversation} />
        </div>
    );
}
