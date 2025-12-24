"use client";

import React, { useState } from "react";
import { Package, Users, Plus, Trash2, Check, Loader2, ExternalLink, Clock, Wrench, Pencil, X, Undo2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { deleteService, approveService, revokeServiceApproval, updateService } from "@/app/actions/services";
import { useRouter } from "next/navigation";

interface ServiceItem {
    id: string;
    category: "MATERIAL" | "LABOR";
    planningStatus: "DRAFT" | "PLANNED" | "APPROVED" | "REJECTED";
    name: string | null;
    unit: string | null;
    quantity: number | null;
    price: number;
    imageUrl: string | null;
    url: string | null;
    materialType: string | null;
    materialStatus: string | null;
    subcontractor: string | null;
    scope: string | null;
    duration: string | null;
    laborStatus: string | null;
    notes: string | null;
    createdAt: Date;
}

interface ServicesListProps {
    services: ServiceItem[];
    onAddService: (category: "MATERIAL" | "LABOR") => void;
}

// Status configurations
const planningStatusConfig: Record<string, { label: string; dotColor: string }> = {
    'DRAFT': { label: "Brudnopis", dotColor: "bg-[#6E6E6E]" },
    'PLANNED': { label: "Planowane", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'APPROVED': { label: "Zatwierdzone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'REJECTED': { label: "Odrzucone", dotColor: "bg-red-500" }
};

const materialStatusLabels: Record<string, string> = {
    'TO_ORDER': "Do zamówienia",
    'ORDERED': "Zamówione",
    'TO_PAY': "Do zapłaty",
    'PAID': "Zapłacone",
    'ADVANCE_PAID': "Zaliczka",
    'RECEIVED': "Odebrane",
    'COMPLETED': "Zakończone"
};

const laborStatusLabels: Record<string, string> = {
    'TO_ORDER': "Do zlecenia",
    'ORDERED': "Zlecone",
    'PAID': "Opłacone",
    'IN_PROGRESS': "W trakcie",
    'COMPLETED': "Zakończone"
};

export function ServicesList({ services, onAddService }: ServicesListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("Czy na pewno chcesz usunąć tę usługę?")) return;

        setDeletingId(id);
        const result = await deleteService(id);
        if (result.success) {
            router.refresh();
        }
        setDeletingId(null);
    };

    const handleApprove = async (id: string) => {
        setApprovingId(id);
        const result = await approveService(id);
        if (result.success) {
            router.refresh();
        }
        setApprovingId(null);
    };

    const handleRevokeApproval = async (id: string) => {
        if (!confirm("Czy na pewno chcesz cofnąć zatwierdzenie tej usługi? Status zostanie zmieniony na 'Planowane'.")) return;

        setRevokingId(id);
        const result = await revokeServiceApproval(id);
        if (result.success) {
            router.refresh();
        }
        setRevokingId(null);
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
    };

    // Split services by category
    const materialServices = services.filter(s => s.category === "MATERIAL");
    const laborServices = services.filter(s => s.category === "LABOR");

    if (services.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground py-12">
                <Wrench className="w-16 h-16 opacity-20" />
                <p className="text-lg">Brak usług przypisanych do tego pomieszczenia</p>
                <div className="flex gap-2">
                    <Button onClick={() => onAddService("MATERIAL")} className="bg-[#1B1B1B] hover:bg-[#252525]">
                        <Plus className="w-4 h-4 mr-2" />
                        <Package className="w-4 h-4 mr-2" />
                        Dodaj materiał
                    </Button>
                    <Button onClick={() => onAddService("LABOR")} className="bg-[#1B1B1B] hover:bg-[#252525]">
                        <Plus className="w-4 h-4 mr-2" />
                        <Users className="w-4 h-4 mr-2" />
                        Dodaj robociznę
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 space-y-6">
            {/* Materials Section */}
            {materialServices.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Package className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Materiały</h3>
                        <span className="text-sm text-muted-foreground">({materialServices.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {materialServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onDelete={handleDelete}
                                onApprove={handleApprove}
                                onRevokeApproval={handleRevokeApproval}
                                onEdit={() => setEditingId(service.id)}
                                isDeleting={deletingId === service.id}
                                isApproving={approvingId === service.id}
                                isRevoking={revokingId === service.id}
                                isEditing={editingId === service.id}
                                onCancelEdit={() => setEditingId(null)}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Labor Section */}
            {laborServices.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Users className="w-5 h-5 text-orange-400" />
                        <h3 className="text-lg font-semibold text-white">Robocizna</h3>
                        <span className="text-sm text-muted-foreground">({laborServices.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {laborServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                                onDelete={handleDelete}
                                onApprove={handleApprove}
                                onRevokeApproval={handleRevokeApproval}
                                onEdit={() => setEditingId(service.id)}
                                isDeleting={deletingId === service.id}
                                isApproving={approvingId === service.id}
                                isRevoking={revokingId === service.id}
                                isEditing={editingId === service.id}
                                onCancelEdit={() => setEditingId(null)}
                                formatCurrency={formatCurrency}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Service Card Component
interface ServiceCardProps {
    service: ServiceItem;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    onRevokeApproval: (id: string) => void;
    onEdit: () => void;
    isDeleting: boolean;
    isApproving: boolean;
    isRevoking: boolean;
    isEditing: boolean;
    onCancelEdit: () => void;
    formatCurrency: (value: number) => string;
}

function ServiceCard({ service, onDelete, onApprove, onRevokeApproval, onEdit, isDeleting, isApproving, isRevoking, isEditing, onCancelEdit, formatCurrency }: ServiceCardProps) {
    const router = useRouter();
    const isMaterial = service.category === "MATERIAL";
    const statusInfo = planningStatusConfig[service.planningStatus] || planningStatusConfig['DRAFT'];
    const fulfillmentStatus = service.planningStatus === "APPROVED"
        ? (isMaterial
            ? materialStatusLabels[service.materialStatus || 'TO_ORDER']
            : laborStatusLabels[service.laborStatus || 'TO_ORDER'])
        : null;

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: service.name || '',
        subcontractor: service.subcontractor || '',
        price: service.price.toString(),
        quantity: service.quantity?.toString() || '',
        unit: service.unit || '',
        scope: service.scope || '',
        duration: service.duration || '',
        materialType: service.materialType || '',
        url: service.url || '',
        notes: service.notes || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveEdit = async () => {
        setIsSaving(true);
        try {
            const updateData: any = {
                price: parseFloat(editForm.price) || 0,
                url: editForm.url || null,
                notes: editForm.notes || null
            };

            if (isMaterial) {
                updateData.name = editForm.name;
                updateData.quantity = editForm.quantity ? parseFloat(editForm.quantity) : null;
                updateData.unit = editForm.unit || null;
                updateData.materialType = editForm.materialType || null;
            } else {
                updateData.subcontractor = editForm.subcontractor;
                updateData.scope = editForm.scope || null;
                updateData.duration = editForm.duration || null;
            }

            const result = await updateService(service.id, updateData);
            if (result.success) {
                router.refresh();
                onCancelEdit();
            }
        } catch (error) {
            console.error('Error updating service:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isEditing) {
        return (
            <Card className="overflow-hidden flex flex-col p-4 gap-3">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">Edytuj {isMaterial ? 'materiał' : 'robociznę'}</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={onCancelEdit}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-3">
                    {isMaterial ? (
                        <>
                            <input
                                type="text"
                                placeholder="Nazwa"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                            />
                            <input
                                type="text"
                                placeholder="Typ materiału"
                                value={editForm.materialType}
                                onChange={(e) => setEditForm({ ...editForm, materialType: e.target.value })}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Ilość"
                                    value={editForm.quantity}
                                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                    className="flex-1 bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                                />
                                <input
                                    type="text"
                                    placeholder="Jednostka"
                                    value={editForm.unit}
                                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                                    className="w-24 bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                placeholder="Podwykonawca"
                                value={editForm.subcontractor}
                                onChange={(e) => setEditForm({ ...editForm, subcontractor: e.target.value })}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                            />
                            <input
                                type="text"
                                placeholder="Zakres prac"
                                value={editForm.scope}
                                onChange={(e) => setEditForm({ ...editForm, scope: e.target.value })}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                            />
                            <input
                                type="text"
                                placeholder="Czas trwania"
                                value={editForm.duration}
                                onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                                className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                            />
                        </>
                    )}

                    <input
                        type="number"
                        placeholder="Cena"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                    />

                    <input
                        type="url"
                        placeholder="Link URL"
                        value={editForm.url}
                        onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                        className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20"
                    />

                    <textarea
                        placeholder="Notatki"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={2}
                        className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20 resize-none"
                    />
                </div>

                <div className="flex gap-2 mt-2">
                    <Button
                        size="sm"
                        className="flex-1 h-9 bg-[#91E8B2]/10 hover:bg-[#91E8B2]/20 text-[#91E8B2]"
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-1" />
                                Zapisz
                            </>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-9 bg-[#1B1B1B] hover:bg-[#252525]"
                        onClick={onCancelEdit}
                    >
                        Anuluj
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "overflow-hidden flex flex-col p-4 gap-3 group hover:border-white/10 transition-colors",
            isDeleting && "opacity-50 pointer-events-none"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2 rounded-lg",
                        isMaterial ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                    )}>
                        {isMaterial ? <Package className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                        <h4 className="font-medium text-[14px] text-white truncate max-w-[180px]">
                            {isMaterial ? service.name : service.subcontractor}
                        </h4>
                        {isMaterial && service.materialType && (
                            <p className="text-[14px] text-muted-foreground">{service.materialType}</p>
                        )}
                        {!isMaterial && service.scope && (
                            <p className="text-[14px] text-muted-foreground truncate max-w-[180px]">{service.scope}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></div>
                    <span className="text-[14px] text-muted-foreground">{statusInfo.label}</span>
                </div>
            </div>

            {/* Details */}
            <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted-foreground">
                    {isMaterial
                        ? (service.quantity && service.unit ? `${service.quantity} ${service.unit}` : "—")
                        : (service.duration || "—")
                    }
                </span>
                <span className="text-white font-semibold">{formatCurrency(service.price)}</span>
            </div>

            {/* Fulfillment Status */}
            {fulfillmentStatus && (
                <div className="flex items-center gap-2 text-[14px] bg-[#1B1B1B] px-2 py-1.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Realizacja:</span>
                    <span className="text-white">{fulfillmentStatus}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2 border-t border-white/5">
                {service.url && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 bg-[#1B1B1B] hover:bg-[#252525]"
                        onClick={() => window.open(service.url!, '_blank')}
                    >
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                )}

                {/* Edit button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 bg-[#1B1B1B] hover:bg-[#252525] text-muted-foreground hover:text-white"
                    onClick={onEdit}
                >
                    <Pencil className="w-3 h-3" />
                </Button>

                {service.planningStatus === "APPROVED" ? (
                    // Revoke approval button for approved services
                    <Button
                        size="sm"
                        className="flex-1 h-8 text-[14px] bg-[#E8B491]/10 hover:bg-[#E8B491]/20 text-[#E8B491]"
                        onClick={() => onRevokeApproval(service.id)}
                        disabled={isRevoking}
                    >
                        {isRevoking ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <>
                                <Undo2 className="w-3.5 h-3.5 mr-1" />
                                Cofnij
                            </>
                        )}
                    </Button>
                ) : (
                    // Approve button for non-approved services
                    <Button
                        size="sm"
                        className="flex-1 h-8 text-[14px] bg-[#91E8B2]/10 hover:bg-[#91E8B2]/20 text-[#91E8B2]"
                        onClick={() => onApprove(service.id)}
                        disabled={isApproving}
                    >
                        {isApproving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Zatwierdź
                            </>
                        )}
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 bg-[#1B1B1B] hover:bg-red-500/20 text-muted-foreground hover:text-red-400"
                    onClick={() => onDelete(service.id)}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                        <Trash2 className="w-3 h-3" />
                    )}
                </Button>
            </div>
        </Card>
    );
}
