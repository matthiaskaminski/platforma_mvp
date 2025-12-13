"use client";

import React, { useState, useRef } from "react";
import { X, Armchair, Utensils, BedDouble, Bath, Baby, DoorOpen, LayoutGrid, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { createRoom } from "@/app/actions/rooms";
import { uploadImage } from "@/app/actions/uploads";
import { cn } from "@/lib/utils";
import { RoomType, RoomStatus } from "@prisma/client";

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

const ROOM_TYPES = [
    { id: 'LIVING' as RoomType, label: "Salon", Icon: Armchair },
    { id: 'KITCHEN' as RoomType, label: "Kuchnia", Icon: Utensils },
    { id: 'BEDROOM' as RoomType, label: "Sypialnia", Icon: BedDouble },
    { id: 'BATHROOM' as RoomType, label: "Łazienka", Icon: Bath },
    { id: 'KIDS' as RoomType, label: "Dziecięcy", Icon: Baby },
    { id: 'HALL' as RoomType, label: "Przedpokój", Icon: DoorOpen },
    { id: 'OFFICE' as RoomType, label: "Biuro", Icon: LayoutGrid },
    { id: 'OTHER' as RoomType, label: "Inne", Icon: LayoutGrid },
];

const STATUS_OPTIONS = [
    { id: 'NOT_STARTED' as RoomStatus, label: "Nie rozpoczęte", badgeStatus: 'not_started' as const },
    { id: 'IN_PROGRESS' as RoomStatus, label: "W trakcie", badgeStatus: 'in_progress' as const },
    { id: 'FINISHED' as RoomStatus, label: "Zakończone", badgeStatus: 'finished' as const },
];

export function CreateRoomModal({ isOpen, onClose, projectId }: CreateRoomModalProps) {
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState<RoomType>('LIVING');
    const [selectedStatus, setSelectedStatus] = useState<RoomStatus>('NOT_STARTED');
    const [area, setArea] = useState('');
    const [budget, setBudget] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Tylko pliki JPG, PNG i WebP są dozwolone');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setUploadError('Plik jest za duży. Maksymalny rozmiar to 5MB');
            return;
        }

        setUploadError('');
        setCoverImage(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setCoverImage(null);
        setImagePreview('');
        setUploadError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-generate name if empty
        let finalName = name.trim();
        if (!finalName) {
            const typeLabel = ROOM_TYPES.find(t => t.id === selectedType)?.label;
            finalName = typeLabel || 'Nowe pomieszczenie';
        }

        setIsSubmitting(true);
        setUploadError('');
        try {
            let imageUrl: string | undefined;

            // Upload image if provided
            if (coverImage) {
                const formData = new FormData();
                formData.append('file', coverImage);

                const uploadResult = await uploadImage(formData);
                if (uploadResult.success && uploadResult.url) {
                    imageUrl = uploadResult.url;
                } else {
                    setUploadError(uploadResult.error || 'Failed to upload image');
                    setIsSubmitting(false);
                    return;
                }
            }

            await createRoom({
                projectId,
                name: finalName,
                type: selectedType,
                area: area ? parseFloat(area) : undefined,
                budgetAllocated: budget ? parseFloat(budget) : undefined,
                coverImage: imageUrl,
            });

            // Reset form
            setName('');
            setSelectedType('LIVING');
            setSelectedStatus('NOT_STARTED');
            setArea('');
            setBudget('');
            setCoverImage(null);
            setImagePreview('');
            setUploadError('');
            onClose();

            // Refresh will happen automatically via revalidatePath in server action
        } catch (error) {
            console.error('Error creating room:', error);
            setUploadError('Wystąpił błąd podczas tworzenia pomieszczenia');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#151515] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#151515] z-10">
                    <h2 className="text-xl font-semibold">Dodaj nowe pomieszczenie</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Room Type */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Rodzaj pomieszczenia <span className="text-red-400">*</span>
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {ROOM_TYPES.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedType(id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-lg transition-all gap-2 min-h-[80px]",
                                        selectedType === id
                                            ? 'bg-white text-black'
                                            : 'bg-[#232323] text-muted-foreground hover:bg-[#2a2a2a]'
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-xs font-medium text-center">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nazwa pomieszczenia
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={`np. ${ROOM_TYPES.find(t => t.id === selectedType)?.label} główny`}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Pozostaw puste, aby użyć domyślnej nazwy
                        </p>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Status
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map(({ id, label, badgeStatus }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedStatus(id)}
                                    className={cn(
                                        "flex items-center justify-center p-3 rounded-lg transition-all gap-2 min-h-[60px]",
                                        selectedStatus === id
                                            ? 'bg-white text-black'
                                            : 'bg-[#232323] hover:bg-[#2a2a2a]'
                                    )}
                                >
                                    <Badge
                                        status={badgeStatus}
                                        dot
                                        className={cn(
                                            "bg-transparent px-0 text-xs font-medium",
                                            selectedStatus === id ? 'text-black [&_span]:shadow-none' : ''
                                        )}
                                    >
                                        {label}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Area & Budget */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Metraż (m²)
                            </label>
                            <Input
                                type="number"
                                step="0.1"
                                min="0"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Budżet (PLN)
                            </label>
                            <Input
                                type="number"
                                step="100"
                                min="0"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Zdjęcie (Miniatura)
                        </label>

                        {!imagePreview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative cursor-pointer group"
                            >
                                <div className="flex items-center justify-center gap-3 p-6 rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 transition-colors bg-[#1B1B1B] hover:bg-[#232323]">
                                    <Upload className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground group-hover:text-white transition-colors">
                                            Kliknij aby wybrać zdjęcie
                                        </p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">
                                            JPG, PNG lub WebP (max 5MB)
                                        </p>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        ) : (
                            <div className="relative rounded-lg overflow-hidden bg-[#1B1B1B] border border-white/10">
                                <div className="aspect-video relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-white/90 hover:bg-white text-black h-8 px-3"
                                    >
                                        Zmień
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleRemoveImage}
                                        className="bg-red-500/90 hover:bg-red-500 text-white h-8 px-3"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </div>
                        )}

                        {uploadError && (
                            <p className="text-xs text-red-400 mt-2">
                                {uploadError}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz pomieszczenie'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
