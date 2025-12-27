"use client";

import React, { useState } from "react";
import {
    X,
    Copy,
    CheckCircle2,
    Link2,
    Mail,
    User,
    Calendar,
    Send
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { generateSurveyLink } from "@/app/actions/surveys";

interface GenerateLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    surveyId: string;
    surveyTitle: string;
    onSuccess: () => void;
}

export function GenerateLinkModal({ isOpen, onClose, surveyId, surveyTitle, onSuccess }: GenerateLinkModalProps) {
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [expiresInDays, setExpiresInDays] = useState(14);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const resetForm = () => {
        setClientName('');
        setClientEmail('');
        setExpiresInDays(14);
        setGeneratedLink(null);
        setCopied(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateSurveyLink(surveyId, {
                clientName: clientName.trim() || undefined,
                clientEmail: clientEmail.trim() || undefined,
                expiresInDays
            });

            if (result.success && result.data) {
                setGeneratedLink(result.data.url);
                onSuccess();
            }
        } catch (error) {
            console.error('Error generating link:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        if (generatedLink) {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-[#0F0F0F] rounded-2xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                {generatedLink ? 'Link wygenerowany!' : 'Wyślij ankietę'}
                            </h2>
                            <p className="text-[14px] text-muted-foreground mt-1">
                                {surveyTitle}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {generatedLink ? (
                        <div className="space-y-4">
                            <div className="bg-[#1B1B1B] rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 className="w-4 h-4 text-[#91E8B2]" />
                                    <span className="text-[14px] font-medium text-white">Link do ankiety</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={generatedLink}
                                        readOnly
                                        className="flex-1 bg-[#252525] border border-white/10 rounded-lg px-3 py-2 text-[14px] text-white focus:outline-none"
                                    />
                                    <Button
                                        onClick={copyToClipboard}
                                        className={copied ? "bg-[#91E8B2] text-black" : "bg-white text-black hover:bg-zinc-200"}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                                Skopiowano
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4 mr-1" />
                                                Kopiuj
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-[#91E8B2]/10 border border-[#91E8B2]/20 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#91E8B2] shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[14px] text-white font-medium">Link gotowy do wysłania</p>
                                        <p className="text-[14px] text-muted-foreground mt-1">
                                            Skopiuj link i wyślij go klientowi przez email lub komunikator.
                                            Otrzymasz powiadomienie gdy klient wypełni ankietę.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {clientName && (
                                <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                                    <User className="w-4 h-4" />
                                    <span>Dla: {clientName}</span>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-[14px] text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Link wygasa za {expiresInDays} dni</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    Imię klienta (opcjonalnie)
                                </label>
                                <Input
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="np. Jan Kowalski"
                                    className="bg-[#1B1B1B] border-white/10 text-[14px]"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email klienta (opcjonalnie)
                                </label>
                                <Input
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="jan@example.com"
                                    className="bg-[#1B1B1B] border-white/10 text-[14px]"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Ważność linku
                                </label>
                                <div className="flex gap-2">
                                    {[7, 14, 30].map(days => (
                                        <button
                                            key={days}
                                            onClick={() => setExpiresInDays(days)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-[14px] font-medium transition-colors ${
                                                expiresInDays === days
                                                    ? 'bg-white text-black'
                                                    : 'bg-[#1B1B1B] text-muted-foreground hover:text-white'
                                            }`}
                                        >
                                            {days} dni
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#1B1B1B] rounded-lg p-4 text-[14px] text-muted-foreground">
                                <p>
                                    Po wypełnieniu ankiety przez klienta, link wygaśnie automatycznie po 24 godzinach.
                                    Klient nie będzie mógł edytować odpowiedzi.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={handleClose}>
                        {generatedLink ? 'Zamknij' : 'Anuluj'}
                    </Button>
                    {!generatedLink && (
                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-white text-black hover:bg-zinc-200"
                        >
                            {isGenerating ? (
                                'Generowanie...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Wygeneruj link
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
