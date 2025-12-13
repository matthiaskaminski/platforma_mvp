"use client";

import React, { useState } from "react";
import { X, Home, Building, Building2, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProject } from "@/app/actions/projects";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const icons = [
    { name: 'Home', Icon: Home, color: '#3F3F46' },
    { name: 'Building', Icon: Building, color: '#4F46E5' },
    { name: 'Building2', Icon: Building2, color: '#EC4899' },
    { name: 'Warehouse', Icon: Warehouse, color: '#10B981' },
];

const colors = [
    '#3F3F46', '#EF4444', '#F59E0B', '#10B981',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Home');
    const [selectedColor, setSelectedColor] = useState('#3F3F46');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await createProject({
                name: name.trim(),
                description: description.trim() || undefined,
                icon: selectedIcon,
                color: selectedColor
            });
            // Redirect handled by server action
        } catch (error) {
            console.error('Error creating project:', error);
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
                    <h2 className="text-xl font-semibold">Nowy projekt</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Nazwa projektu <span className="text-red-400">*</span>
                        </label>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="np. Mieszkanie Nowak"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Opis (opcjonalnie)
                        </label>
                        <Input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Krótki opis projektu"
                        />
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Ikona
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {icons.map(({ name, Icon }) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setSelectedIcon(name)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all min-h-[60px] ${
                                        selectedIcon === name
                                            ? 'bg-white text-black'
                                            : 'bg-[#232323] text-muted-foreground hover:bg-[#2a2a2a]'
                                    }`}
                                >
                                    <Icon className="w-6 h-6" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            Kolor
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-10 h-10 rounded-lg transition-all ${
                                        selectedColor === color
                                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#151515] scale-110'
                                            : 'hover:scale-105 opacity-70 hover:opacity-100'
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
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
                            disabled={!name.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz projekt'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
