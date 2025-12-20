'use client';

import React, { useState, useRef, useEffect } from "react";
import { EmailThread, EmailMessage } from "../data";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/Button";
import { Loader2, Mail, ExternalLink, Send } from "lucide-react";
import { sendEmailReply } from "@/app/actions/messages";

interface ChatWindowProps {
    thread: EmailThread | null;
    messages: EmailMessage[];
    isLoading?: boolean;
    userEmail?: string;
    onMessageSent?: () => void;
}

export function ChatWindow({ thread, messages, isLoading, userEmail, onMessageSent }: ChatWindowProps) {
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Auto-resize textarea
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReplyText(e.target.value);
        setSendError(null);

        // Auto-resize
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
        }
    };

    const handleSendReply = async () => {
        if (!thread || !replyText.trim()) return;

        setIsSending(true);
        setSendError(null);

        try {
            // Determine who to reply to
            const lastMessage = messages[messages.length - 1];
            const replyTo = lastMessage?.isMe ? thread.fromEmail : lastMessage?.fromEmail || thread.fromEmail;
            const subject = thread.subject.startsWith('Re:') ? thread.subject : `Re: ${thread.subject}`;

            const result = await sendEmailReply(
                thread.threadId,
                replyTo,
                subject,
                replyText.trim(),
                lastMessage?.id
            );

            if (result.success) {
                setReplyText('');
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                }
                // Refresh messages
                onMessageSent?.();
            } else {
                setSendError(result.error || 'Nie udało się wysłać wiadomości');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            setSendError('Nie udało się wysłać wiadomości');
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendReply();
        }
    };

    if (!thread) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full ml-4">
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
                    <>
                        {messages.map((msg) => (
                            <MessageBubble
                                key={msg.id}
                                message={msg}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Reply Area */}
            <div className="shrink-0 border-t border-white/5">
                {sendError && (
                    <div className="px-6 py-2 bg-red-500/10 text-red-400 text-sm">
                        {sendError}
                    </div>
                )}
                <div className="bg-[#151515] p-4 flex items-end gap-3">
                    <textarea
                        ref={textareaRef}
                        value={replyText}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Napisz odpowiedź... (Enter aby wysłać, Shift+Enter nowa linia)"
                        className="flex-1 bg-[#1B1B1B] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[48px] max-h-[150px]"
                        rows={1}
                        disabled={isSending}
                    />
                    <Button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSending}
                        className="bg-white text-black hover:bg-gray-100 h-[48px] px-6 shrink-0"
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
    );
}
