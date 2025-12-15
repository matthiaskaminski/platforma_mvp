"use client";

import React, { useState } from "react";
import { X, Calendar, Armchair } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSprint } from "@/app/actions/sprints";

interface Room {
    id: string;
    name: string;
    type: string;
}

interface CreateSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    rooms?: Room[];
    defaultRoomId?: string;
}

export function CreateSprintModal({ isOpen, onClose, projectId, rooms = [], defaultRoomId }: CreateSprintModalProps) {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [roomId, setRoomId] = useState(defaultRoomId || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await createSprint({
                projectId,
                name: name.trim() || 'Nowy sprint',
                goal: goal.trim() || undefined,
                roomId: roomId || undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            if (result.success) {
                setName('');
                setGoal('');
                setRoomId(defaultRoomId || '');
                setStartDate('');
                setEndDate('');
                onClose();
            } else {
                alert('Błąd podczas tworzenia sprintu');
            }
        } catch (error) {
            console.error('Error creating sprint:', error);
            alert('Błąd podczas tworzenia sprintu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setName('');
            setGoal('');
            setRoomId(defaultRoomId || '');
            setStartDate('');
            setEndDate('');
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#151515] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#151515] z-10">
                    <h2 className="text-xl font-semibold">Nowy sprint</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nazwa sprintu
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="np. Sprint 1, Przygotowanie projektu..."
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Cel sprintu (opcjonalnie)
                        </label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Opisz cel tego sprintu..."
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    {rooms.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Pomieszczenie (opcjonalnie)
                            </label>
                            <div className="relative">
                                <Armchair className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <select
                                    value={roomId}
                                    onChange={(e) => setRoomId(e.target.value)}
                                    className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    <option value="">Brak pomieszczenia (sprint ogólny)</option>
                                    {rooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Zadania dodane do tego sprintu będą automatycznie przypisane do wybranego pomieszczenia.
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Data rozpoczęcia
                            </label>
                            <div className="relative cursor-pointer" onClick={() => (document.getElementById('start-date-input') as HTMLInputElement)?.showPicker?.()}>
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    id="start-date-input"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-10 cursor-pointer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Data zakończenia
                            </label>
                            <div className="relative cursor-pointer" onClick={() => (document.getElementById('end-date-input') as HTMLInputElement)?.showPicker?.()}>
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    id="end-date-input"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-10 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz sprint'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
