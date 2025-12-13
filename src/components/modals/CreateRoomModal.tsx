"use client";

import React, { useState } from "react";
import { X, Armchair, Utensils, BedDouble, Bath, Baby, DoorOpen, LayoutGrid, Circle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createRoom } from "@/app/actions/rooms";
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
    { id: 'NOT_STARTED' as RoomStatus, label: "Nie rozpoczęte", Icon: Circle },
    { id: 'IN_PROGRESS' as RoomStatus, label: "W trakcie", Icon: Clock },
    { id: 'FINISHED' as RoomStatus, label: "Zakończone", Icon: CheckCircle2 },
];

export function CreateRoomModal({ isOpen, onClose, projectId }: CreateRoomModalProps) {
    const [name, setName] = useState('');
    const [selectedType, setSelectedType] = useState<RoomType>('LIVING');
    const [selectedStatus, setSelectedStatus] = useState<RoomStatus>('NOT_STARTED');
    const [area, setArea] = useState('');
    const [budget, setBudget] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Auto-generate name if empty
        let finalName = name.trim();
        if (!finalName) {
            const typeLabel = ROOM_TYPES.find(t => t.id === selectedType)?.label;
            finalName = typeLabel || 'Nowe pomieszczenie';
        }

        setIsSubmitting(true);
        try {
            await createRoom({
                projectId,
                name: finalName,
                type: selectedType,
                area: area ? parseFloat(area) : undefined,
                budgetAllocated: budget ? parseFloat(budget) : undefined,
            });

            // Reset form
            setName('');
            setSelectedType('LIVING');
            setSelectedStatus('NOT_STARTED');
            setArea('');
            setBudget('');
            onClose();

            // Refresh will happen automatically via revalidatePath in server action
        } catch (error) {
            console.error('Error creating room:', error);
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
                                        "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-white/5 gap-2 min-h-[80px]",
                                        selectedType === id
                                            ? 'border-primary bg-white/5'
                                            : 'border-white/10'
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
                            {STATUS_OPTIONS.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setSelectedStatus(id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-white/5 gap-2 min-h-[70px]",
                                        selectedStatus === id
                                            ? 'border-primary bg-white/5'
                                            : 'border-white/10'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-xs font-medium text-center">{label}</span>
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
