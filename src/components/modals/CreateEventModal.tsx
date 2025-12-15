"use client";

import React, { useState } from "react";
import { X, Calendar, Clock, Tag, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCalendarEvent } from "@/app/actions/calendar";

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    defaultDate?: Date;
}

const eventTypeOptions = [
    { value: 'MEETING', label: 'Spotkanie', color: '#9B6DD8' },
    { value: 'DELIVERY', label: 'Dostawa', color: '#E8B491' },
    { value: 'INSPECTION', label: 'Odbiór', color: '#91E8A8' },
    { value: 'DEADLINE', label: 'Termin', color: '#E89191' },
    { value: 'PAYMENT', label: 'Płatność', color: '#C8A853' },
    { value: 'INSTALLATION', label: 'Instalacja', color: '#A891E8' },
];

export function CreateEventModal({ isOpen, onClose, projectId, defaultDate }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(defaultDate ? defaultDate.toISOString().split('T')[0] : '');
    const [time, setTime] = useState('');
    const [type, setType] = useState('MEETING');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            alert('Podaj nazwę wydarzenia');
            return;
        }

        if (!date) {
            alert('Wybierz datę wydarzenia');
            return;
        }

        setIsSubmitting(true);

        try {
            // Combine date and time
            const eventDate = time
                ? new Date(`${date}T${time}:00`)
                : new Date(`${date}T00:00:00`);

            const result = await createCalendarEvent({
                projectId,
                title: title.trim(),
                date: eventDate,
                description: description.trim() || undefined,
                type
            });

            if (result.success) {
                setTitle('');
                setDate('');
                setTime('');
                setType('MEETING');
                setDescription('');
                onClose();
            } else {
                alert('Błąd podczas tworzenia wydarzenia');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Błąd podczas tworzenia wydarzenia');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setTitle('');
            setDate('');
            setTime('');
            setType('MEETING');
            setDescription('');
            onClose();
        }
    };

    const selectedTypeColor = eventTypeOptions.find(t => t.value === type)?.color || '#536AC8';

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
                    <div className="flex items-center gap-3">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: selectedTypeColor }}
                        />
                        <h2 className="text-xl font-semibold">Nowe wydarzenie</h2>
                    </div>
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
                            Nazwa wydarzenia <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="np. Spotkanie z klientem, Dostawa mebli..."
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Data <span className="text-red-500">*</span>
                            </label>
                            <div className="relative cursor-pointer" onClick={() => (document.getElementById('event-date-input') as HTMLInputElement)?.showPicker?.()}>
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    id="event-date-input"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-10 cursor-pointer"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Godzina (opcjonalnie)
                            </label>
                            <div className="relative cursor-pointer" onClick={() => (document.getElementById('event-time-input') as HTMLInputElement)?.showPicker?.()}>
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                <Input
                                    id="event-time-input"
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    disabled={isSubmitting}
                                    className="pl-10 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Typ wydarzenia
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
                                disabled={isSubmitting}
                            >
                                {eventTypeOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {eventTypeOptions.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setType(option.value)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                        type === option.value
                                            ? 'bg-white/10 text-white'
                                            : 'bg-[#1B1B1B] text-muted-foreground hover:bg-[#252525] hover:text-white'
                                    }`}
                                    disabled={isSubmitting}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: option.color }}
                                    />
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Opis (opcjonalnie)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Dodaj szczegóły wydarzenia..."
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-white/20 dark-scrollbar"
                            disabled={isSubmitting}
                        />
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
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz wydarzenie'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
