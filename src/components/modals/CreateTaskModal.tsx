"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Armchair } from "lucide-react";
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
}

export function CreateTaskModal({ isOpen, onClose, projectId, sprints, rooms }: CreateTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [sprintId, setSprintId] = useState('');
    const [roomId, setRoomId] = useState('');
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
                setRoomId('');
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
            setRoomId('');
            setDueDate('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#151515] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Nowe zadanie</h2>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-white disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Nazwa zadania <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="np. Spotkanie z klientem, Zakup materialow..."
                            className="bg-[#1B1B1B] border-white/10 text-white placeholder:text-muted-foreground h-[48px]"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Opis <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Dodaj szczegoly zadania..."
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Sprint <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select
                                value={sprintId}
                                onChange={(e) => setSprintId(e.target.value)}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white h-[48px] focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Pomieszczenie <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
                        </label>
                        <div className="relative">
                            <Armchair className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white h-[48px] focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Termin wykonania <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="bg-[#1B1B1B] border-white/10 text-white pl-10 h-[48px]"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="px-6"
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 bg-[#232323] hover:bg-[#2a2a2a]"
                        >
                            {isSubmitting ? 'Tworzenie...' : 'Utworz zadanie'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
