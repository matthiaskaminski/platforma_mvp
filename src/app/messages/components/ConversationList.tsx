'use client';

import React, { useState, useEffect } from "react";
import { EmailThread } from "../data";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronDown, Plus, RefreshCw, Mail, Loader2, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { getKnownContacts, sendNewEmail } from "@/app/actions/messages";

interface Contact {
    email: string;
    name: string;
    role: string;
    projectName: string;
}

interface ConversationListProps {
    threads: EmailThread[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
}

export function ConversationList({ threads, selectedId, onSelect, isLoading, onRefresh }: ConversationListProps) {
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    // Load contacts when modal opens
    useEffect(() => {
        if (showComposeModal && contacts.length === 0) {
            loadContacts();
        }
    }, [showComposeModal]);

    const loadContacts = async () => {
        setLoadingContacts(true);
        try {
            const result = await getKnownContacts();
            if (result.success) {
                setContacts(result.contacts);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleSend = async () => {
        if (!selectedRecipient || !subject.trim() || !body.trim()) return;

        setIsSending(true);
        setSendError(null);

        try {
            const result = await sendNewEmail(selectedRecipient, subject.trim(), body.trim());

            if (result.success) {
                // Reset form and close modal
                setSelectedRecipient('');
                setSubject('');
                setBody('');
                setShowComposeModal(false);
                // Refresh thread list after a moment
                setTimeout(() => onRefresh?.(), 1000);
            } else {
                setSendError(result.error || 'Nie udało się wysłać wiadomości');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setSendError('Nie udało się wysłać wiadomości');
        } finally {
            setIsSending(false);
        }
    };

    const closeModal = () => {
        setShowComposeModal(false);
        setSelectedRecipient('');
        setSubject('');
        setBody('');
        setSendError(null);
    };

    return (
        <>
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
                            onClick={() => setShowComposeModal(true)}
                        >
                            <Plus className="w-5 h-5" />
                            Napisz nową wiadomość
                        </Button>
                    </div>
                </div>
            </div>

            {/* Compose Modal */}
            {showComposeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#151515] rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Nowa wiadomość</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeModal}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {sendError && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {sendError}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Recipient Select */}
                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Odbiorca *</label>
                                {loadingContacts ? (
                                    <div className="flex items-center gap-2 text-muted-foreground p-3">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Ładowanie kontaktów...</span>
                                    </div>
                                ) : contacts.length === 0 ? (
                                    <div className="p-3 text-muted-foreground text-sm bg-[#1B1B1B] rounded-xl">
                                        Brak kontaktów z adresem email. Dodaj kontakty w zakładce Kontakty.
                                    </div>
                                ) : (
                                    <select
                                        value={selectedRecipient}
                                        onChange={(e) => setSelectedRecipient(e.target.value)}
                                        className="w-full bg-[#1B1B1B] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px]"
                                    >
                                        <option value="">Wybierz odbiorcę</option>
                                        {contacts.map((contact, index) => (
                                            <option key={`${contact.email}-${index}`} value={contact.email}>
                                                {contact.name} ({contact.email}) - {contact.projectName}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Temat *</label>
                                <Input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Temat wiadomości"
                                    className="bg-[#1B1B1B] border-white/5"
                                />
                            </div>

                            {/* Body */}
                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Treść *</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Napisz treść wiadomości..."
                                    className="w-full bg-[#1B1B1B] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[200px]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={closeModal}
                            >
                                Anuluj
                            </Button>
                            <Button
                                className="flex-1 bg-white text-black hover:bg-gray-100"
                                onClick={handleSend}
                                disabled={isSending || !selectedRecipient || !subject.trim() || !body.trim()}
                            >
                                {isSending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Wyślij
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
