"use client";

import React, { useState, useRef } from "react";
import {
    X,
    Plus,
    Trash2,
    Image as ImageIcon,
    Upload,
    ChevronDown,
    ChevronUp,
    GripVertical,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createStyleQuiz } from "@/app/actions/styles";
import { createClient } from "@/utils/supabase/client";

interface CreateStyleModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onSuccess: () => void;
}

interface StyleImage {
    id: string;
    file?: File;
    imageUrl: string;
    caption: string;
    uploading?: boolean;
}

interface StyleCategory {
    id: string;
    name: string;
    description: string;
    images: StyleImage[];
    isExpanded: boolean;
}

const PRESET_CATEGORIES = [
    { name: 'Skandynawski', description: 'Jasne, minimalistyczne wnętrza z naturalnymi materiałami' },
    { name: 'Industrialny', description: 'Surowe materiały, cegła, metal, loftowy charakter' },
    { name: 'Nowoczesny', description: 'Czyste linie, funkcjonalność, nowoczesne materiały' },
    { name: 'Klasyczny', description: 'Elegancja, sztukateria, tradycyjne formy' },
    { name: 'Boho', description: 'Eklektyczny, ciepły, pełen wzorów i tekstur' },
    { name: 'Minimalistyczny', description: 'Prostota, mniej znaczy więcej, neutralne kolory' },
];

export function CreateStyleModal({ isOpen, onClose, projectId, onSuccess }: CreateStyleModalProps) {
    const [step, setStep] = useState<'info' | 'categories'>('info');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [instruction, setInstruction] = useState('Wybierz zdjęcia, które najlepiej oddają Twój styl i preferencje estetyczne.');
    const [categories, setCategories] = useState<StyleCategory[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingCategoryId, setUploadingCategoryId] = useState<string | null>(null);

    const resetForm = () => {
        setStep('info');
        setTitle('');
        setDescription('');
        setInstruction('Wybierz zdjęcia, które najlepiej oddają Twój styl i preferencje estetyczne.');
        setCategories([]);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const addCategory = (preset?: { name: string; description: string }) => {
        const newCategory: StyleCategory = {
            id: crypto.randomUUID(),
            name: preset?.name || '',
            description: preset?.description || '',
            images: [],
            isExpanded: true
        };
        setCategories([...categories, newCategory]);
    };

    const updateCategory = (id: string, updates: Partial<StyleCategory>) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, ...updates } : cat
        ));
    };

    const removeCategory = (id: string) => {
        setCategories(categories.filter(cat => cat.id !== id));
    };

    const toggleCategoryExpanded = (id: string) => {
        setCategories(categories.map(cat =>
            cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat
        ));
    };

    const uploadImage = async (categoryId: string, file: File): Promise<string | null> => {
        const supabase = createClient();

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `styles/${projectId}/${fileName}`;

        const { error } = await supabase.storage
            .from('project-files')
            .upload(filePath, file);

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('project-files')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleFilesSelected = async (categoryId: string, files: FileList) => {
        setUploadingCategoryId(categoryId);

        const category = categories.find(c => c.id === categoryId);
        if (!category) return;

        const newImages: StyleImage[] = [];

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) continue;

            const tempId = crypto.randomUUID();

            // Add placeholder image
            newImages.push({
                id: tempId,
                file,
                imageUrl: URL.createObjectURL(file),
                caption: '',
                uploading: true
            });
        }

        // Add all placeholder images first
        updateCategory(categoryId, {
            images: [...category.images, ...newImages]
        });

        // Then upload each file
        for (const img of newImages) {
            if (!img.file) continue;

            const uploadedUrl = await uploadImage(categoryId, img.file);

            if (uploadedUrl) {
                setCategories(prev => prev.map(cat => {
                    if (cat.id !== categoryId) return cat;
                    return {
                        ...cat,
                        images: cat.images.map(image =>
                            image.id === img.id
                                ? { ...image, imageUrl: uploadedUrl, uploading: false }
                                : image
                        )
                    };
                }));
            } else {
                // Remove failed upload
                setCategories(prev => prev.map(cat => {
                    if (cat.id !== categoryId) return cat;
                    return {
                        ...cat,
                        images: cat.images.filter(image => image.id !== img.id)
                    };
                }));
            }
        }

        setUploadingCategoryId(null);
    };

    const removeImage = (categoryId: string, imageId: string) => {
        setCategories(categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
                ...cat,
                images: cat.images.filter(img => img.id !== imageId)
            };
        }));
    };

    const updateImageCaption = (categoryId: string, imageId: string, caption: string) => {
        setCategories(categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
                ...cat,
                images: cat.images.map(img =>
                    img.id === imageId ? { ...img, caption } : img
                )
            };
        }));
    };

    const getTotalImagesCount = () => {
        return categories.reduce((sum, cat) => sum + cat.images.length, 0);
    };

    const isCategoryPreset = (categoryName: string) => {
        return PRESET_CATEGORIES.some(p => p.name === categoryName);
    };

    const handleSubmit = async () => {
        if (!title.trim() || categories.length === 0) return;

        // Check if all categories have at least one image
        const validCategories = categories.filter(cat => cat.name.trim() && cat.images.length > 0);
        if (validCategories.length === 0) return;

        setIsSubmitting(true);
        try {
            const result = await createStyleQuiz({
                projectId,
                title: title.trim(),
                description: description.trim() || undefined,
                instruction: instruction.trim() || undefined,
                categories: validCategories.map(cat => ({
                    name: cat.name.trim(),
                    description: cat.description.trim() || undefined,
                    images: cat.images.map(img => ({
                        imageUrl: img.imageUrl,
                        caption: img.caption.trim() || undefined
                    }))
                }))
            });

            if (result.success) {
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error creating style quiz:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-[#0F0F0F] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {step === 'info' ? 'Nowy quiz stylów' : 'Dodaj style i zdjęcia'}
                        </h2>
                        <p className="text-[14px] text-muted-foreground mt-1">
                            {step === 'info'
                                ? 'Podaj nazwę i opis quizu stylów'
                                : 'Dodaj kategorie stylów i wgraj zdjęcia'
                            }
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'info' ? (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">
                                    Nazwa quizu *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="np. Quiz stylów - Apartament Mokotów"
                                    className="bg-[#1B1B1B] border-white/10 text-[14px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">
                                    Opis (opcjonalnie)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Krótki opis quizu dla klienta..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1B1B1B] border border-white/10 rounded-lg text-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-white/20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-medium text-white mb-2">
                                    Instrukcja dla klienta
                                </label>
                                <textarea
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                    placeholder="Tekst instrukcji wyświetlany klientowi..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-[#1B1B1B] border border-white/10 rounded-lg text-white text-[14px] placeholder:text-muted-foreground focus:outline-none focus:border-white/20 resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preset Categories */}
                            <div>
                                <h3 className="text-[14px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                    Gotowe kategorie stylów
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {PRESET_CATEGORIES.map((preset) => {
                                        const isAdded = categories.some(c => c.name === preset.name);
                                        return (
                                            <button
                                                key={preset.name}
                                                onClick={() => !isAdded && addCategory(preset)}
                                                disabled={isAdded}
                                                className={cn(
                                                    "px-3 py-2 rounded-lg text-[14px] font-medium transition-colors",
                                                    isAdded
                                                        ? "bg-[#91E8B2]/10 text-[#91E8B2] cursor-default"
                                                        : "bg-[#1B1B1B] text-white hover:bg-[#252525]"
                                                )}
                                            >
                                                {preset.name}
                                            </button>
                                        );
                                    })}
                                    <button
                                        onClick={() => addCategory()}
                                        className="px-3 py-2 rounded-lg text-[14px] font-medium bg-[#1B1B1B] text-muted-foreground hover:bg-[#252525] hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Własna kategoria
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="text-[14px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                                    Dodane kategorie ({categories.length}) · {getTotalImagesCount()} zdjęć
                                </h3>

                                {categories.length === 0 ? (
                                    <div className="bg-[#1B1B1B] rounded-lg border border-white/5 p-8 text-center">
                                        <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                        <p className="text-muted-foreground text-[14px]">
                                            Wybierz kategorie stylów z listy powyżej
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {categories.map((category) => (
                                            <div
                                                key={category.id}
                                                className="bg-[#1B1B1B] rounded-lg border border-white/5 overflow-hidden"
                                            >
                                                {/* Category Header */}
                                                <div
                                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                                    onClick={() => toggleCategoryExpanded(category.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                                        <div>
                                                            {isCategoryPreset(category.name) ? (
                                                                <span className="font-medium text-white text-[14px]">{category.name}</span>
                                                            ) : (
                                                                <Input
                                                                    value={category.name}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        updateCategory(category.id, { name: e.target.value });
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    placeholder="Nazwa kategorii..."
                                                                    className="bg-[#252525] border-white/10 text-[14px] h-8 w-48"
                                                                />
                                                            )}
                                                            <span className="text-[14px] text-muted-foreground ml-2">
                                                                ({category.images.length} zdjęć)
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeCategory(category.id);
                                                            }}
                                                            className="text-muted-foreground hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        {category.isExpanded ? (
                                                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Category Content */}
                                                {category.isExpanded && (
                                                    <div className="px-4 pb-4 border-t border-white/5 pt-4">
                                                        {/* Images Grid */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                                            {category.images.map((image) => (
                                                                <div
                                                                    key={image.id}
                                                                    className="relative aspect-square rounded-lg overflow-hidden bg-[#252525] group"
                                                                >
                                                                    <img
                                                                        src={image.imageUrl}
                                                                        alt={image.caption || 'Style image'}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    {image.uploading && (
                                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        onClick={() => removeImage(category.id, image.id)}
                                                                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            {/* Upload Button */}
                                                            <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-colors">
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    multiple
                                                                    className="hidden"
                                                                    onChange={(e) => {
                                                                        if (e.target.files) {
                                                                            handleFilesSelected(category.id, e.target.files);
                                                                        }
                                                                    }}
                                                                />
                                                                {uploadingCategoryId === category.id ? (
                                                                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                                                                ) : (
                                                                    <>
                                                                        <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                                                                        <span className="text-[14px] text-muted-foreground">Dodaj</span>
                                                                    </>
                                                                )}
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between shrink-0">
                    {step === 'categories' && (
                        <Button
                            variant="ghost"
                            onClick={() => setStep('info')}
                        >
                            Wstecz
                        </Button>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                        <Button variant="ghost" onClick={handleClose}>
                            Anuluj
                        </Button>
                        {step === 'info' ? (
                            <Button
                                onClick={() => setStep('categories')}
                                disabled={!title.trim()}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Dalej
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={categories.length === 0 || getTotalImagesCount() === 0 || isSubmitting}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                {isSubmitting ? 'Tworzenie...' : 'Stwórz quiz stylów'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
