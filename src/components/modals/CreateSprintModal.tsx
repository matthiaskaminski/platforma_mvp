"use client";

import React, { useState } from "react";
import { X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createSprint } from "@/app/actions/sprints";

interface CreateSprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function CreateSprintModal({ isOpen, onClose, projectId }: CreateSprintModalProps) {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
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
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined
            });

            if (result.success) {
                setName('');
                setGoal('');
                setStartDate('');
                setEndDate('');
                onClose();
            } else {
                alert('Blad podczas tworzenia sprintu');
            }
        } catch (error) {
            console.error('Error creating sprint:', error);
            alert('Blad podczas tworzenia sprintu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setName('');
            setGoal('');
            setStartDate('');
            setEndDate('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#151515] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Nowy sprint</h2>
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
                            Nazwa sprintu
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="np. Sprint 1, Przygotowanie projektu..."
                            className="bg-[#1B1B1B] border-white/10 text-white placeholder:text-muted-foreground h-[48px]"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white">
                            Cel sprintu <span className="text-muted-foreground font-normal">(opcjonalnie)</span>
                        </label>
                        <textarea
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            placeholder="Opisz cel tego sprintu..."
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                Data rozpoczecia
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-[#1B1B1B] border-white/10 text-white pl-10 h-[48px]"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white">
                                Data zakonczenia
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-[#1B1B1B] border-white/10 text-white pl-10 h-[48px]"
                                    disabled={isSubmitting}
                                />
                            </div>
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
                            {isSubmitting ? 'Tworzenie...' : 'Utworz sprint'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
