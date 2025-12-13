"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createRoom } from "@/app/rooms/actions";
import { Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, LayoutGrid, Link as LinkIcon, CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddRoomSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
}

const ROOM_TYPES = [
    { id: "living", label: "Salon", icon: Armchair },
    { id: "kitchen", label: "Kuchnia", icon: Utensils },
    { id: "bedroom", label: "Sypialnia", icon: BedDouble },
    { id: "bathroom", label: "Łazienka", icon: Bath },
    { id: "kids", label: "Dziecięcy", icon: Baby },
    { id: "hall", label: "Przedpokój", icon: DoorOpen },
    { id: "other", label: "Inne", icon: LayoutGrid },
];

const STATUS_OPTIONS = [
    { id: "not_started", label: "Nie rozpoczęte", icon: Circle, color: "text-zinc-400" },
    { id: "in_progress", label: "W trakcie", icon: Clock, color: "text-[#91E8B2]" },
    { id: "finished", label: "Zakończone", icon: CheckCircle2, color: "text-green-500" },
];

export default function AddRoomSidebar({ open, onOpenChange, projectId }: AddRoomSidebarProps) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [type, setType] = useState("living");
    const [status, setStatus] = useState("not_started");
    const [area, setArea] = useState("");
    const [budget, setBudget] = useState("");
    const [coverImage, setCoverImage] = useState("");

    // Reset when opening
    useEffect(() => {
        if (open) {
            setName("");
            setType("living");
            setStatus("not_started");
            setArea("");
            setBudget("");
            setCoverImage("");
        }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            let finalName = name.trim();
            if (!finalName) {
                const selectedType = ROOM_TYPES.find(t => t.id === type);
                finalName = selectedType?.label || "Nowe Pomieszczenie";
                if (type === "other") finalName = "Nowe Pomieszczenie";
            }

            const formData = {
                name: finalName,
                type: type === "other" ? "other" : type,
                area: parseFloat(area) || 0,
                budgetAllocated: parseFloat(budget) || 0,
                status,
                coverImage: coverImage.trim() || undefined
            };

            const result = await createRoom(projectId, formData);
            if (result.success) {
                onOpenChange(false);
            } else {
                console.error(result.error);
            }
        });
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetHeader>
                <SheetTitle>Dodaj nowe pomieszczenie</SheetTitle>
                <SheetDescription>
                    Wypełnij szczegóły, aby utworzyć nowy pokój w projekcie.
                </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Type Selection */}
                <div>
                    <label className="text-sm font-medium text-zinc-300 block mb-3">Rodzaj pomieszczenia</label>
                    <div className="grid grid-cols-3 gap-3">
                        {ROOM_TYPES.map((t) => {
                            const Icon = t.icon;
                            const isSelected = type === t.id;
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={cn(
                                        "cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl transition-all gap-2 h-[80px]",
                                        isSelected
                                            ? "bg-white text-black"
                                            : "bg-[#232323] text-zinc-400 hover:bg-[#262626] hover:text-zinc-200"
                                    )}
                                >
                                    <Icon className="w-6 h-6" />
                                    <span className="text-xs font-medium">{t.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Name */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300 block">Nazwa pomieszczenia</label>
                    <Input
                        placeholder={type === 'other' ? "Wpisz nazwę własną..." : "np. Salon gościnny"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#232323] border-transparent text-white h-[48px] focus-visible:ring-1 focus-visible:ring-[#262626] focus-visible:border-transparent transition-colors placeholder:text-zinc-600"
                    />
                </div>

                {/* Status Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300 block">Status</label>
                    <div className="flex gap-2">
                        {STATUS_OPTIONS.map((s) => {
                            const Icon = s.icon;
                            const isSelected = status === s.id;
                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setStatus(s.id)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 h-[48px] rounded-xl transition-colors text-sm font-medium",
                                        isSelected
                                            ? "bg-white text-black"
                                            : "bg-[#232323] text-zinc-400 hover:bg-[#262626]"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {s.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 block">Metraż (m²)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            step="0.1"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            // No-spinner utility via Tailwind arbitrary values
                            className="bg-[#232323] border-transparent text-white h-[48px] focus-visible:ring-1 focus-visible:ring-[#262626] focus-visible:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300 block">Budżet (PLN)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            step="100"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="bg-[#232323] border-transparent text-white h-[48px] focus-visible:ring-1 focus-visible:ring-[#262626] focus-visible:border-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Cover Image */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300 block">Zdjęcie (Miniatura)</label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <LinkIcon className="w-4 h-4" />
                        </div>
                        <Input
                            placeholder="Wklej link do zdjęcia..."
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            className="bg-[#232323] border-transparent text-white h-[48px] pl-10 focus-visible:ring-1 focus-visible:ring-[#262626] focus-visible:border-transparent placeholder:text-zinc-600"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex gap-3 text-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 text-zinc-400 hover:text-white h-[48px] hover:bg-[#232323]"
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-white text-black hover:bg-zinc-200 font-semibold h-[48px]"
                    >
                        {isPending ? "Tworzenie..." : "Utwórz"}
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}
