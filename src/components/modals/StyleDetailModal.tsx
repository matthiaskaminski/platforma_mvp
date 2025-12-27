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
    Image as ImageIcon,
    Heart,
    MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface StyleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    quiz: {
        id: string;
        title: string;
        description: string | null;
        instruction: string | null;
        status: string;
        createdAt: Date;
        categories: {
            id: string;
            name: string;
            description: string | null;
            images: {
                id: string;
                imageUrl: string;
                caption: string | null;
            }[];
        }[];
        links: any[];
    };
    onGenerateLink: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    'DRAFT': { label: 'Szkic', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    'ACTIVE': { label: 'Aktywny', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    'COMPLETED': { label: 'Zakończony', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    'EXPIRED': { label: 'Wygasły', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' }
};

const linkStatusConfig: Record<string, { label: string; color: string }> = {
    'ACTIVE': { label: 'Aktywny', color: 'text-yellow-500' },
    'COMPLETED': { label: 'Wypełniony', color: 'text-green-500' },
    'EXPIRED': { label: 'Wygasły', color: 'text-red-500' }
};

export function StyleDetailModal({ isOpen, onClose, quiz, onGenerateLink }: StyleDetailModalProps) {
    const [activeTab, setActiveTab] = useState<'images' | 'responses'>('images');
    const [expandedLinks, setExpandedLinks] = useState<Set<string>>(new Set());
    const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const status = statusConfig[quiz.status] || statusConfig['DRAFT'];

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
        const url = `${window.location.origin}/client/style/${token}`;
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

    const getTotalImagesCount = () => {
        return quiz.categories.reduce((sum, cat) => sum + cat.images.length, 0);
    };

    const completedLinks = quiz.links.filter((l: any) => l.status === 'COMPLETED');

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
                                <h2 className="text-xl font-semibold text-white">{quiz.title}</h2>
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[14px] uppercase font-bold tracking-wider border",
                                    status.color,
                                    status.bg
                                )}>
                                    {status.label}
                                </span>
                            </div>
                            {quiz.description && (
                                <p className="text-[14px] text-muted-foreground">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-[14px] text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(quiz.createdAt)}
                                </div>
                                <div>{quiz.categories.length} kategorii</div>
                                <div>{getTotalImagesCount()} zdjęć</div>
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
                            onClick={() => setActiveTab('images')}
                            className={cn(
                                "px-4 py-2 text-[14px] font-medium rounded-lg transition-colors",
                                activeTab === 'images'
                                    ? "bg-white text-black"
                                    : "text-muted-foreground hover:text-white"
                            )}
                        >
                            Zdjęcia
                        </button>
                        <button
                            onClick={() => setActiveTab('responses')}
                            className={cn(
                                "px-4 py-2 text-[14px] font-medium rounded-lg transition-colors",
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
                    {activeTab === 'images' ? (
                        <div className="space-y-6">
                            {quiz.categories.map((category) => (
                                <div key={category.id}>
                                    <h3 className="text-[14px] font-medium text-white mb-3">
                                        {category.name}
                                        <span className="text-muted-foreground ml-2">
                                            ({category.images.length} zdjęć)
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {category.images.map((image) => (
                                            <div
                                                key={image.id}
                                                className="relative aspect-square rounded-lg overflow-hidden bg-[#1B1B1B] cursor-pointer group"
                                                onClick={() => setSelectedImage(selectedImage === image.id ? null : image.id)}
                                            >
                                                <img
                                                    src={image.imageUrl}
                                                    alt={image.caption || 'Style image'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                {image.caption && (
                                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                        <p className="text-[14px] text-white truncate">{image.caption}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {quiz.links.length === 0 ? (
                                <div className="text-center py-12">
                                    <Link2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-[14px]">
                                        Brak wysłanych linków. Wygeneruj link i wyślij do klienta.
                                    </p>
                                </div>
                            ) : (
                                quiz.links.map((link: any) => {
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
                                                            <span className="font-medium text-white text-[14px]">
                                                                {link.clientName || 'Klient'}
                                                            </span>
                                                            <span className={cn("text-[14px]", linkStatus.color)}>
                                                                {linkStatus.label}
                                                            </span>
                                                        </div>
                                                        {link.clientEmail && (
                                                            <div className="flex items-center gap-1 text-[14px] text-muted-foreground mt-1">
                                                                <Mail className="w-4 h-4" />
                                                                {link.clientEmail}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-[14px] text-muted-foreground">
                                                        {link.completedAt ? (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                                {formatDate(link.completedAt)}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
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

                                            {/* Link Selections */}
                                            {isExpanded && link.selections && link.selections.length > 0 && (
                                                <div className="border-t border-white/5 p-4 bg-[#151515]">
                                                    <h4 className="text-[14px] font-medium text-white mb-3 flex items-center gap-2">
                                                        <Heart className="w-4 h-4 text-[#91E8B2]" />
                                                        Wybrane zdjęcia ({link.selections.length})
                                                    </h4>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                        {link.selections.map((selection: any) => (
                                                            <div
                                                                key={selection.id}
                                                                className="relative aspect-square rounded-lg overflow-hidden bg-[#252525]"
                                                            >
                                                                <img
                                                                    src={selection.image.imageUrl}
                                                                    alt="Selected style"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                {selection.image.category && (
                                                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[14px] text-white">
                                                                        {selection.image.category.name}
                                                                    </div>
                                                                )}
                                                                {selection.comment && (
                                                                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                                        <div className="flex items-start gap-1">
                                                                            <MessageSquare className="w-3 h-3 text-[#91E8B2] shrink-0 mt-0.5" />
                                                                            <p className="text-[14px] text-white line-clamp-2">{selection.comment}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {isExpanded && (!link.selections || link.selections.length === 0) && link.status !== 'COMPLETED' && (
                                                <div className="border-t border-white/5 p-4 bg-[#151515] text-center">
                                                    <p className="text-[14px] text-muted-foreground">
                                                        Oczekiwanie na wybór klienta...
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
                        Wyślij do klienta
                    </Button>
                </div>
            </div>

            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={quiz.categories.flatMap(c => c.images).find(i => i.id === selectedImage)?.imageUrl}
                        alt="Preview"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                    />
                </div>
            )}
        </div>
    );
}
