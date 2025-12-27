"use client";

import React, { useState } from "react";
import {
    X,
    Send,
    Link2,
    Copy,
    CheckCircle2,
    Clock,
    User,
    Mail,
    Calendar,
    ChevronDown,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SurveyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    survey: {
        id: string;
        title: string;
        description: string | null;
        status: string;
        createdAt: Date;
        questions: any[];
        links: any[];
    };
    onGenerateLink: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    'DRAFT': { label: 'Szkic', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    'ACTIVE': { label: 'Aktywna', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    'COMPLETED': { label: 'Zakonczona', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    'EXPIRED': { label: 'Wygasla', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' }
};

const linkStatusConfig: Record<string, { label: string; color: string }> = {
    'ACTIVE': { label: 'Aktywny', color: 'text-yellow-500' },
    'COMPLETED': { label: 'Wypelniony', color: 'text-green-500' },
    'EXPIRED': { label: 'Wygasly', color: 'text-red-500' }
};

const questionTypeLabels: Record<string, string> = {
    'SINGLE_CHOICE': 'Pojedynczy wybor',
    'MULTIPLE_CHOICE': 'Wielokrotny wybor',
    'TEXT': 'Tekst',
    'SCALE': 'Skala'
};

export function SurveyDetailModal({ isOpen, onClose, survey, onGenerateLink }: SurveyDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

    const status = statusConfig[survey.status] || statusConfig['DRAFT'];

    const toggleLink = (linkId: string) => {
        const newExpanded = new Set(expandedLinks);
        if (newExpanded.has(linkId)) {
            newExpanded.delete(linkId);
        } else {
            newExpanded.add(linkId);
        }
        setExpandedLinks(newExpanded);
    };

    const copyLink = async (token: string, linkId: string) => {
        const url = `${window.location.origin}/client/survey/${token}`;
        await navigator.clipboard.writeText(url);
        setCopiedLinkId(linkId);
        setTimeout(() => setCopiedLinkId(null), 2000);
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getResponseForQuestion = (responses: any[], questionId: string) => {
        const response = responses.find(r => r.questionId === questionId);
        if (!response) return null;

        const answer = response.answer;
        if (Array.isArray(answer)) {
            return answer.join(', ');
        }
        return String(answer);
    };

    const completedLinks = survey.links.filter((l: any) => l.status === 'COMPLETED');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-[#0F0F0F] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-xl font-semibold text-white">{survey.title}</h2>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border",
                                    status.color,
                                    status.bg
                                )}>
                                    {status.label}
                                </span>
                            </div>
                            {survey.description && (
                                <p className="text-sm text-muted-foreground">{survey.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {formatDate(survey.createdAt)}
                                </div>
                                <div>{survey.questions.length} pytan</div>
                                <div>{completedLinks.length} odpowiedzi</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 mt-4">
                        <button
                            onClick={() => setActiveTab('questions')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                activeTab === 'questions'
                                    ? "bg-white text-black"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Pytania
                        </button>
                        <button
                            onClick={() => setActiveTab('responses')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                                activeTab === 'responses'
                                    ? "bg-white text-black"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Odpowiedzi ({completedLinks.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'questions' ? (
                        <div className="space-y-4">
                            {survey.questions.map((q, index) => (
                                <div
                                    key={q.id}
                                    className="bg-[#1B1B1B] rounded-lg border border-white/5 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm text-muted-foreground w-6 shrink-0">
                                            {index + 1}.
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{q.question}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {q.category && (
                                                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-[#252525] rounded">
                                                        {q.category}
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground px-2 py-0.5 bg-[#252525] rounded">
                                                    {questionTypeLabels[q.type]}
                                                </span>
                                                {q.isRequired && (
                                                    <span className="text-xs text-red-400">*Wymagane</span>
                                                )}
                                            </div>
                                            {q.options && q.options.length > 0 && (
                                                <div className="mt-3 space-y-1">
                                                    {q.options.map((opt: string, idx: number) => (
                                                        <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <div className="w-3 h-3 rounded-full border border-white/20" />
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {survey.links.length === 0 ? (
                                <div className="text-center py-12">
                                    <Link2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Brak wyslanych linkow. Wygeneruj link i wyslij do klienta.
                                    </p>
                                </div>
                            ) : (
                                survey.links.map((link: any) => {
                                    const linkStatus = linkStatusConfig[link.status] || linkStatusConfig['ACTIVE'];
                                    const isExpanded = expandedLinks.has(link.id);

                                    return (
                                        <div
                                            key={link.id}
                                            className="bg-[#1B1B1B] rounded-lg border border-white/5 overflow-hidden"
                                        >
                                            {/* Link Header */}
                                            <div
                                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                                onClick={() => toggleLink(link.id)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                            <span className="font-medium text-white">
                                                                {link.clientName || 'Klient'}
                                                            </span>
                                                            <span className={cn("text-xs", linkStatus.color)}>
                                                                {linkStatus.label}
                                                            </span>
                                                        </div>
                                                        {link.clientEmail && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                <Mail className="w-3 h-3" />
                                                                {link.clientEmail}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-xs text-muted-foreground">
                                                        {link.completedAt ? (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                                                {formatDate(link.completedAt)}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Wygasa: {formatDate(link.expiresAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            copyLink(link.token, link.id);
                                                        }}
                                                        className="h-8"
                                                    >
                                                        {copiedLinkId === link.id ? (
                                                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Link Responses */}
                                            {isExpanded && link.responses && link.responses.length > 0 && (
                                                <div className="border-t border-white/5 p-4 bg-[#151515]">
                                                    <h4 className="text-sm font-medium text-white mb-3">Odpowiedzi</h4>
                                                    <div className="space-y-3">
                                                        {survey.questions.map((q: any, idx: number) => {
                                                            const answer = getResponseForQuestion(link.responses, q.id);
                                                            return (
                                                                <div key={q.id} className="text-sm">
                                                                    <p className="text-muted-foreground mb-1">
                                                                        {idx + 1}. {q.question}
                                                                    </p>
                                                                    <p className="text-white pl-4 border-l-2 border-[#91E8B2]">
                                                                        {answer || <span className="text-muted-foreground italic">Brak odpowiedzi</span>}
                                                                    </p>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {isExpanded && (!link.responses || link.responses.length === 0) && link.status !== 'COMPLETED' && (
                                                <div className="border-t border-white/5 p-4 bg-[#151515] text-center">
                                                    <p className="text-sm text-muted-foreground">
                                                        Oczekiwanie na odpowiedz...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={onClose}>
                        Zamknij
                    </Button>
                    <Button
                        onClick={onGenerateLink}
                        className="bg-white text-black hover:bg-zinc-200"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Wyslij do klienta
                    </Button>
                </div>
            </div>
        </div>
    );
}
