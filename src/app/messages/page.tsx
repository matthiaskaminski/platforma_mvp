'use client';

import React, { useState, useEffect, useCallback } from "react";
import { ConversationList } from "./components/ConversationList";
import { ChatWindow } from "./components/ChatWindow";
import { EmailThread, EmailMessage } from "./data";
import { getEmailThreads, getFullEmailThread, getMessagesGmailStatus } from "@/app/actions/messages";
import { Button } from "@/components/ui/Button";
import { Mail, Settings, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
    const [threads, setThreads] = useState<EmailThread[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<EmailMessage[]>([]);
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedThread = threads.find(t => t.id === selectedId) || null;

    // Check Gmail connection status
    useEffect(() => {
        async function checkStatus() {
            const status = await getMessagesGmailStatus();
            setGmailConnected(status.connected);
            setUserEmail(status.email);

            if (status.connected) {
                loadThreads();
            } else {
                setIsLoadingThreads(false);
            }
        }
        checkStatus();
    }, []);

    // Load email threads
    const loadThreads = useCallback(async () => {
        setIsLoadingThreads(true);
        setError(null);

        try {
            const result = await getEmailThreads(30);

            if (result.success) {
                setThreads(result.threads);
                // Auto-select first thread
                if (result.threads.length > 0 && !selectedId) {
                    setSelectedId(result.threads[0].id);
                }
            } else {
                setError(result.error || 'Failed to load emails');
            }
        } catch (err) {
            console.error('Error loading threads:', err);
            setError('Failed to load emails');
        } finally {
            setIsLoadingThreads(false);
        }
    }, [selectedId]);

    // Load messages when thread is selected
    useEffect(() => {
        if (!selectedId) {
            setMessages([]);
            return;
        }

        async function loadMessages() {
            setIsLoadingMessages(true);

            try {
                const result = await getFullEmailThread(selectedId!);

                if (result.success && result.messages) {
                    setMessages(result.messages);
                } else {
                    setMessages([]);
                }
            } catch (err) {
                console.error('Error loading messages:', err);
                setMessages([]);
            } finally {
                setIsLoadingMessages(false);
            }
        }

        loadMessages();
    }, [selectedId]);

    // Handle thread selection
    const handleSelect = (id: string) => {
        setSelectedId(id);
    };

    // Handle refresh
    const handleRefresh = () => {
        loadThreads();
    };

    // Not connected state
    if (gmailConnected === false) {
        return (
            <div className="flex h-full w-full items-center justify-center animate-in fade-in duration-500">
                <div className="max-w-md text-center p-8">
                    <div className="w-16 h-16 bg-[#151515] rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        Połącz Gmail
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        Aby wyświetlać wiadomości email w aplikacji, połącz swoje konto Gmail w ustawieniach.
                    </p>
                    <Link href="/settings">
                        <Button className="bg-white text-black hover:bg-gray-100">
                            <Settings className="w-4 h-4 mr-2" />
                            Przejdź do ustawień
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // Loading initial state
    if (gmailConnected === null) {
        return (
            <div className="flex h-full w-full items-center justify-center animate-in fade-in duration-500">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Sprawdzanie połączenia...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error && threads.length === 0) {
        return (
            <div className="flex h-full w-full items-center justify-center animate-in fade-in duration-500">
                <div className="max-w-md text-center p-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-3">
                        Błąd ładowania
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        {error}
                    </p>
                    <Button onClick={handleRefresh} className="bg-white text-black hover:bg-gray-100">
                        Spróbuj ponownie
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full animate-in fade-in duration-500 overflow-hidden">
            <ConversationList
                threads={threads}
                selectedId={selectedId}
                onSelect={handleSelect}
                isLoading={isLoadingThreads}
                onRefresh={handleRefresh}
            />
            <ChatWindow
                thread={selectedThread}
                messages={messages}
                isLoading={isLoadingMessages}
                userEmail={userEmail || undefined}
            />
        </div>
    );
}
