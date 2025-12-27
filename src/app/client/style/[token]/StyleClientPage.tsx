"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    Heart,
    Send,
    Loader2,
    MessageSquare,
    X,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitStyleSelections } from "@/app/actions/styles";

interface StyleImage {
    id: string;
    imageUrl: string;
    caption: string | null;
}

interface StyleCategory {
    id: string;
    name: string;
    description: string | null;
    images: StyleImage[];
}

interface StyleQuizData {
    id: string;
    styleQuiz: {
        id: string;
        title: string;
        description: string | null;
        instruction: string | null;
        categories: StyleCategory[];
        project: {
            name: string;
            designer: {
                fullName: string | null;
                studioName: string | null;
            };
        };
    };
    clientName: string | null;
}

interface StyleClientPageProps {
    quizData: StyleQuizData;
    token: string;
}

interface Selection {
    imageId: string;
    isSelected: boolean;
    comment: string;
}

export default function StyleClientPage({ quizData, token }: StyleClientPageProps) {
    const { styleQuiz } = quizData;

    const [selections, setSelections] = useState<Map<string, Selection>>(new Map());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<StyleImage | null>(null);
    const [commentingImage, setCommentingImage] = useState<string | null>(null);
    const [tempComment, setTempComment] = useState('');

    const designerName = styleQuiz.project.designer.studioName || styleQuiz.project.designer.fullName || 'Projektant';

    const toggleSelection = (imageId: string) => {
        const newSelections = new Map(selections);
        const existing = newSelections.get(imageId);

        if (existing) {
            newSelections.delete(imageId);
        } else {
            newSelections.set(imageId, {
                imageId,
                isSelected: true,
                comment: ''
            });
        }

        setSelections(newSelections);
    };

    const openCommentModal = (imageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const selection = selections.get(imageId);
        setTempComment(selection?.comment || '');
        setCommentingImage(imageId);
    };

    const saveComment = () => {
        if (!commentingImage) return;

        const newSelections = new Map(selections);
        const existing = newSelections.get(commentingImage);

        if (existing) {
            newSelections.set(commentingImage, {
                ...existing,
                comment: tempComment
            });
        } else {
            newSelections.set(commentingImage, {
                imageId: commentingImage,
                isSelected: true,
                comment: tempComment
            });
        }

        setSelections(newSelections);
        setCommentingImage(null);
        setTempComment('');
    };

    const getSelectedCount = () => selections.size;

    const getAllImages = () => {
        return styleQuiz.categories.flatMap(cat => cat.images);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const selectionsArray = Array.from(selections.values()).map(s => ({
                imageId: s.imageId,
                isSelected: s.isSelected,
                comment: s.comment || undefined
            }));

            const result = await submitStyleSelections(token, selectionsArray);

            if (result.success) {
                setIsCompleted(true);
            } else {
                setError(result.error || 'Wystąpił błąd podczas wysyłania wyborów');
            }
        } catch (err) {
            setError('Wystąpił błąd podczas wysyłania wyborów');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Completed state
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 text-center">
                    <div className="w-20 h-20 bg-[#91E8B2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-[#91E8B2]" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-3">
                        Dziękujemy!
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Twoje wybory zostały wysłane do {designerName}.
                        Projektant wykorzysta te informacje przy tworzeniu Twojego wnętrza.
                    </p>
                    <div className="bg-[#1B1B1B] rounded-lg p-4 text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Projekt</p>
                        <p className="text-white font-medium">{styleQuiz.project.name}</p>
                    </div>
                    <div className="mt-4 bg-[#91E8B2]/10 rounded-lg p-4">
                        <p className="text-[14px] text-[#91E8B2]">
                            Wybrałeś {getSelectedCount()} zdjęć jako swoje ulubione
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            {/* Header */}
            <header className="shrink-0 border-b border-white/5 bg-[#0F0F0F] sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Quiz stylów od {designerName}
                            </p>
                            <h1 className="text-lg font-semibold text-white">{styleQuiz.title}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-white font-medium flex items-center gap-1">
                                    <Heart className="w-4 h-4 text-[#91E8B2]" />
                                    {getSelectedCount()} wybranych
                                </p>
                            </div>
                            <button
                                onClick={handleSubmit}
                                disabled={getSelectedCount() === 0 || isSubmitting}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all",
                                    getSelectedCount() > 0 && !isSubmitting
                                        ? "bg-[#91E8B2] text-black hover:bg-[#7dd4a0]"
                                        : "bg-[#91E8B2]/30 text-black/50 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Wysyłanie...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Wyślij wybory
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Instruction */}
            {styleQuiz.instruction && (
                <div className="bg-[#0F0F0F] border-b border-white/5">
                    <div className="max-w-6xl mx-auto px-4 py-4">
                        <div className="flex items-start gap-3 bg-[#91E8B2]/10 rounded-lg p-4">
                            <Palette className="w-5 h-5 text-[#91E8B2] shrink-0 mt-0.5" />
                            <p className="text-[14px] text-white">{styleQuiz.instruction}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <main className="flex-1 py-6">
                <div className="max-w-6xl mx-auto px-4 space-y-8">
                    {styleQuiz.categories.map((category) => (
                        <div key={category.id}>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-white">{category.name}</h2>
                                {category.description && (
                                    <p className="text-[14px] text-muted-foreground mt-1">{category.description}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {category.images.map((image) => {
                                    const selection = selections.get(image.id);
                                    const isSelected = !!selection;
                                    const hasComment = selection?.comment && selection.comment.length > 0;

                                    return (
                                        <div
                                            key={image.id}
                                            onClick={() => toggleSelection(image.id)}
                                            className={cn(
                                                "relative aspect-square rounded-xl overflow-hidden cursor-pointer group transition-all duration-200",
                                                isSelected
                                                    ? "ring-4 ring-[#91E8B2] scale-[0.98]"
                                                    : "ring-0 hover:ring-2 hover:ring-white/30"
                                            )}
                                        >
                                            <img
                                                src={image.imageUrl}
                                                alt={image.caption || 'Style image'}
                                                className="w-full h-full object-cover"
                                            />

                                            {/* Selection indicator */}
                                            <div className={cn(
                                                "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                                isSelected
                                                    ? "bg-[#91E8B2] text-black"
                                                    : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                                            )}>
                                                <Heart className={cn("w-4 h-4", isSelected && "fill-current")} />
                                            </div>

                                            {/* Comment indicator */}
                                            {hasComment && (
                                                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-[#91E8B2] flex items-center justify-center">
                                                    <MessageSquare className="w-4 h-4 text-black" />
                                                </div>
                                            )}

                                            {/* Add comment button */}
                                            {isSelected && (
                                                <button
                                                    onClick={(e) => openCommentModal(image.id, e)}
                                                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/70 text-white text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"
                                                >
                                                    <MessageSquare className="w-3 h-3" />
                                                    {hasComment ? 'Edytuj' : 'Dodaj'} komentarz
                                                </button>
                                            )}

                                            {/* View larger on click hover */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Error message */}
            {error && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className="px-6 py-3 bg-red-500/90 text-white rounded-lg shadow-lg text-sm font-medium">
                        {error}
                    </div>
                </div>
            )}

            {/* Comment Modal */}
            {commentingImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommentingImage(null)} />
                    <div className="relative bg-[#0F0F0F] rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">Dodaj komentarz</h3>
                            <button
                                onClick={() => setCommentingImage(null)}
                                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-[14px] text-muted-foreground mb-3">
                                Opisz co Ci się podoba w tym zdjęciu lub jakie elementy chciałbyś wykorzystać.
                            </p>
                            <textarea
                                value={tempComment}
                                onChange={(e) => setTempComment(e.target.value)}
                                placeholder="np. Podoba mi się kolorystyka i styl mebli..."
                                rows={4}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg p-4 text-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-[#91E8B2] resize-none"
                                autoFocus
                            />
                        </div>
                        <div className="p-6 border-t border-white/5 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setCommentingImage(null)}
                                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-white transition-colors text-[14px]"
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={saveComment}
                                className="px-6 py-2 rounded-lg bg-[#91E8B2] text-black font-medium text-[14px] hover:bg-[#7dd4a0] transition-colors"
                            >
                                Zapisz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                        onClick={() => setPreviewImage(null)}
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={previewImage.imageUrl}
                        alt={previewImage.caption || 'Preview'}
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                    />
                </div>
            )}

            {/* Mobile Submit Button */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#0F0F0F] border-t border-white/5 z-40">
                <button
                    onClick={handleSubmit}
                    disabled={getSelectedCount() === 0 || isSubmitting}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-medium transition-all",
                        getSelectedCount() > 0 && !isSubmitting
                            ? "bg-[#91E8B2] text-black"
                            : "bg-[#91E8B2]/30 text-black/50 cursor-not-allowed"
                    )}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Wysyłanie...
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Wyślij wybory ({getSelectedCount()} zdjęć)
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
