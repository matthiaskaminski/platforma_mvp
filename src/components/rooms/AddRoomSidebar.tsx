"use client";

import React, { useState, useTransition } from "react";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createRoom } from "@/app/rooms/actions";
import { Plus, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby } from "lucide-react";
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
];

export default function AddRoomSidebar({ open, onOpenChange, projectId }: AddRoomSidebarProps) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [type, setType] = useState("living");
    const [area, setArea] = useState("");
    const [budget, setBudget] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        startTransition(async () => {
            const formData = {
                name: name || ROOM_TYPES.find(t => t.id === type)?.label || "Nowe Pomieszczenie",
                type,
                area: parseFloat(area) || 0,
                budgetAllocated: parseFloat(budget) || 0
            };

            const result = await createRoom(projectId, formData);
            if (result.success) {
                onOpenChange(false);
                // Reset form
                setName("");
                setType("living");
                setArea("");
                setBudget("");
            } else {
                // handle error (toast?)
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
                <div className="grid grid-cols-3 gap-3">
                    {ROOM_TYPES.map((t) => {
                        const Icon = t.icon;
                        const isSelected = type === t.id;
                        return (
                            <div
                                key={t.id}
                                onClick={() => setType(t.id)}
                                className={cn(
                                    "cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2",
                                    isSelected
                                        ? "bg-white text-black border-white"
                                        : "bg-[#1B1B1B] text-zinc-400 border-white/5 hover:border-white/20 hover:text-zinc-200"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                <span className="text-xs font-medium">{t.label}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-300">Nazwa pomieszczenia</label>
                    <Input
                        placeholder="np. Salon gościnny"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#1B1B1B] border-white/10 text-white"
                    />
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Metraż (m²)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            step="0.1"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="bg-[#1B1B1B] border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Budżet (PLN)</label>
                        <Input
                            type="number"
                            placeholder="0"
                            step="100"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="bg-[#1B1B1B] border-white/10 text-white"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 text-zinc-400 hover:text-white"
                    >
                        Anuluj
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-white text-black hover:bg-zinc-200"
                    >
                        {isPending ? "Tworzenie..." : "Utwórz"}
                    </Button>
                </div>
            </form>
        </Sheet>
    );
}
