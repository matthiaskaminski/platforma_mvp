"use client";

import React, { useState } from "react";
import { X, Package, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createMaterialService, createLaborService } from "@/app/actions/services";

interface AddServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: "MATERIAL" | "LABOR";
    rooms: { id: string; name: string; type: string }[];
    onSuccess: () => void;
}

type PlanningStatus = "DRAFT" | "PLANNED" | "APPROVED";

export function AddServiceModal({ isOpen, onClose, category, rooms, onSuccess }: AddServiceModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [planningStatus, setPlanningStatus] = useState<PlanningStatus>("PLANNED");

    // Material fields
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const [quantity, setQuantity] = useState("");
    const [materialType, setMaterialType] = useState("");
    const [url, setUrl] = useState("");

    // Labor fields
    const [subcontractor, setSubcontractor] = useState("");
    const [scope, setScope] = useState("");
    const [duration, setDuration] = useState("");

    // Common fields
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [roomId, setRoomId] = useState("");
    const [notes, setNotes] = useState("");

    const isMaterial = category === "MATERIAL";

    const resetForm = () => {
        setName("");
        setUnit("");
        setQuantity("");
        setMaterialType("");
        setUrl("");
        setSubcontractor("");
        setScope("");
        setDuration("");
        setPrice("");
        setImageUrl("");
        setRoomId("");
        setNotes("");
        setPlanningStatus("PLANNED");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let result;

            if (isMaterial) {
                result = await createMaterialService({
                    name: name.trim(),
                    unit: unit.trim() || undefined,
                    quantity: quantity ? parseFloat(quantity) : undefined,
                    price: parseFloat(price) || 0,
                    imageUrl: imageUrl.trim() || undefined,
                    url: url.trim() || undefined,
                    materialType: materialType.trim() || undefined,
                    planningStatus,
                    roomId: roomId || undefined,
                    notes: notes.trim() || undefined
                });
            } else {
                result = await createLaborService({
                    subcontractor: subcontractor.trim(),
                    scope: scope.trim() || undefined,
                    price: parseFloat(price) || 0,
                    imageUrl: imageUrl.trim() || undefined,
                    duration: duration.trim() || undefined,
                    planningStatus,
                    roomId: roomId || undefined,
                    notes: notes.trim() || undefined
                });
            }

            if (result.success) {
                handleClose();
                onSuccess();
            } else {
                alert(result.error || "Wystąpił błąd podczas dodawania usługi");
            }
        } catch (error) {
            console.error("Error creating service:", error);
            alert("Wystąpił błąd podczas dodawania usługi");
        }

        setIsSubmitting(false);
    };

    const isFormValid = isMaterial
        ? name.trim() && price
        : subcontractor.trim() && price;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-[#151515] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-white/5">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            isMaterial ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                        )}>
                            {isMaterial ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <h2 className="text-lg font-semibold text-white">
                            {isMaterial ? "Dodaj materiał" : "Dodaj robociznę"}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Planning Status */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Status planowania</label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className={cn(
                                    "flex-1 h-10",
                                    planningStatus === "DRAFT"
                                        ? "bg-[#252525] text-white"
                                        : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setPlanningStatus("DRAFT")}
                            >
                                Brudnopis
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className={cn(
                                    "flex-1 h-10",
                                    planningStatus === "PLANNED"
                                        ? "bg-[#252525] text-white"
                                        : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setPlanningStatus("PLANNED")}
                            >
                                Planowane
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className={cn(
                                    "flex-1 h-10",
                                    planningStatus === "APPROVED"
                                        ? "bg-[#91E8B2]/20 text-[#91E8B2]"
                                        : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setPlanningStatus("APPROVED")}
                            >
                                Zatwierdzone
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">
                            {planningStatus === "DRAFT" && "Brudnopis - nie wliczany do budżetu"}
                            {planningStatus === "PLANNED" && "Planowane - wliczane do budżetu estymacyjnego"}
                            {planningStatus === "APPROVED" && "Zatwierdzone - wliczane do budżetu rzeczywistego"}
                        </p>
                    </div>

                    {/* Category-specific fields */}
                    {isMaterial ? (
                        <>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Nazwa materiału *</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="np. Farba ceramiczna biała"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Jednostka</label>
                                    <Input
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        placeholder="np. szt., m², kg"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-2 block">Ilość</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="np. 10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Typ materiału</label>
                                <Input
                                    value={materialType}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                    placeholder="np. Farby, Podłogi, Oświetlenie"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Link do produktu</label>
                                <Input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Podwykonawca *</label>
                                <Input
                                    value={subcontractor}
                                    onChange={(e) => setSubcontractor(e.target.value)}
                                    placeholder="np. Jan Kowalski - Malarz"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Zakres prac</label>
                                <Input
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    placeholder="np. Malowanie ścian w salonie"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-2 block">Czas trwania</label>
                                <Input
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="np. 3 dni, 2 tygodnie"
                                />
                            </div>
                        </>
                    )}

                    {/* Common fields */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Cena całkowita (zł) *</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">URL zdjęcia</label>
                        <Input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Pomieszczenie</label>
                        <select
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full h-12 px-4 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                        >
                            <option value="">Bez przypisania</option>
                            {rooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    {room.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Notatki</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Dodatkowe informacje..."
                            className="w-full h-24 px-4 py-3 bg-[#1B1B1B] border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
                        />
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-5 border-t border-white/5">
                    <Button
                        type="button"
                        variant="ghost"
                        className="flex-1"
                        onClick={handleClose}
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className={cn(
                            "flex-1",
                            isMaterial
                                ? "bg-blue-500 hover:bg-blue-600"
                                : "bg-orange-500 hover:bg-orange-600"
                        )}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>Dodaj {isMaterial ? "materiał" : "robociznę"}</>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
