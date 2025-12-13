"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Sheet, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createRoom } from "@/app/rooms/actions";
import { Plus, Armchair, BedDouble, Bath, Utensils, DoorOpen, Baby, LayoutGrid, Type } from "lucide-react";
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
    { id: "other", label: "Inne", icon: LayoutGrid }, // Custom option
];

export default function AddRoomSidebar({ open, onOpenChange, projectId }: AddRoomSidebarProps) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [type, setType] = useState("living");
    const [area, setArea] = useState("");
    const [budget, setBudget] = useState("");

    // Reset when opening
    useEffect(() => {
        if (open) {
            setName("");
            setType("living");
            setArea("");
            setBudget("");
        }
    }, [open]);

    // Focus name input when "Inne" is selected
    useEffect(() => {
        if (type === "other") {
            // Optional: could auto-focus name input ref here
            if (!name) setName("");
        } else {
            // Reset name to default label IF user hasn't typed a custom one?
            // Actually, clearer UX is: Name is empty by default (placeholder shows example).
            // When type is selected, we might pre-fill? No, placeholder covers it.
        }
    }, [type]);

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
                budgetAllocated: parseFloat(budget) || 0
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

            <form onSubmit={handleSubmit} className="space-y-8">
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
                                    "cursor-pointer flex flex-col items-center justify-center p-3 rounded-xl border transition-all gap-2 h-[80px]",
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
                <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-300 block">Nazwa pomieszczenia</label>
                    <Input
                        placeholder={type === 'other' ? "Wpisz nazwę własną..." : "np. Salon gościnny"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#1B1B1B] border-white/10 text-white h-[48px] focus-visible:ring-[#232323] focus-visible:border-[#232323] transition-colors"
                    />
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
                            className="bg-[#1B1B1B] border-white/10 text-white h-[48px] focus-visible:ring-[#232323] focus-visible:border-[#232323]"
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
                            className="bg-[#1B1B1B] border-white/10 text-white h-[48px] focus-visible:ring-[#232323] focus-visible:border-[#232323]"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex gap-3 text-sm">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 text-zinc-400 hover:text-white h-[48px]"
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
