"use client";

import React, { useState } from "react";
import { X, Clock, Armchair, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTask } from "@/app/actions/sprints";

interface Sprint {
    id: string;
    name: string;
    status: string;
}

interface Room {
    id: string;
    name: string;
    type: string;
}

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    sprints: Sprint[];
    rooms: Room[];
    defaultRoomId?: string;
}

export function CreateTaskModal({ isOpen, onClose, projectId, sprints, rooms, defaultRoomId }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sprintId, setSprintId] = useState('');
    const [roomId, setRoomId] = useState(defaultRoomId || '');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Podaj nazwe zadania');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createTask({
                projectId,
                title: title.trim(),
                description: description.trim() || undefined,
                sprintId: sprintId || undefined,
                roomId: roomId || undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined
            });

            if (result.success) {
                setTitle('');
                setDescription('');
                setSprintId('');
                setRoomId(defaultRoomId || '');
                setDueDate('');
                onClose();
            } else {
                alert('Blad podczas tworzenia zadania');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Blad podczas tworzenia zadania');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTitle('');
            setDescription('');
            setSprintId('');
            setRoomId(defaultRoomId || '');
            setDueDate('');
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
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[#151515] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#151515] z-10">
                    <h2 className="text-xl font-semibold">Nowe zadanie</h2>
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
                            Nazwa zadania <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="np. Spotkanie z klientem, Zakup materialow..."
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Opis (opcjonalnie)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Dodaj szczegoly zadania..."
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Sprint (opcjonalnie)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select
                                value={sprintId}
                                onChange={(e) => setSprintId(e.target.value)}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
                                disabled={isSubmitting}
                            >
                                <option value="">Brak sprintu (zadanie ogolne)</option>
                                {sprints.map(sprint => (
                                    <option key={sprint.id} value={sprint.id}>
                                        {sprint.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

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
                                <option value="">Brak pomieszczenia</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Termin wykonania (opcjonalnie)
                        </label>
                        <div className="relative cursor-pointer" onClick={() => (document.getElementById('due-date-input') as HTMLInputElement)?.showPicker?.()}>
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                            <Input
                                id="due-date-input"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                disabled={isSubmitting}
                                className="pl-10 cursor-pointer"
                            />
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
                            {isSubmitting ? 'Tworzenie...' : 'Utworz zadanie'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
