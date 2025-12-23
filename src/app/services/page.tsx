"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, MoreHorizontal, Wrench, ChevronDown, Loader2, Package, Users, Check, Clock, FileText, ExternalLink, Edit3 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getServices, deleteService, approveService, getRoomsForProject } from "@/app/actions/services";
import { AddServiceModal } from "./components/AddServiceModal";

// Types
interface ServiceItem {
    id: string;
    category: "MATERIAL" | "LABOR";
    planningStatus: "DRAFT" | "PLANNED" | "APPROVED" | "REJECTED";
    // Material fields
    name: string | null;
    unit: string | null;
    quantity: number | null;
    price: number;
    imageUrl: string | null;
    url: string | null;
    materialType: string | null;
    materialStatus: string | null;
    // Labor fields
    subcontractor: string | null;
    scope: string | null;
    duration: string | null;
    laborStatus: string | null;
    // Common
    notes: string | null;
    createdAt: Date;
    room: { id: string; name: string } | null;
}

type CategoryFilter = "all" | "MATERIAL" | "LABOR";
type StatusFilter = "all" | "DRAFT" | "PLANNED" | "APPROVED";

// Status configurations
const planningStatusConfig: Record<string, { label: string; badgeStatus: "not_started" | "in_progress" | "completed" }> = {
    'DRAFT': { label: "Brudnopis", badgeStatus: "not_started" },
    'PLANNED': { label: "Planowane", badgeStatus: "in_progress" },
    'APPROVED': { label: "Zatwierdzone", badgeStatus: "completed" },
    'REJECTED': { label: "Odrzucone", badgeStatus: "not_started" }
};

const materialStatusConfig: Record<string, { label: string; color: string }> = {
    'TO_ORDER': { label: "Do zamówienia", color: "text-yellow-400" },
    'ORDERED': { label: "Zamówione", color: "text-blue-400" },
    'TO_PAY': { label: "Do zapłaty", color: "text-orange-400" },
    'PAID': { label: "Zapłacone", color: "text-green-400" },
    'ADVANCE_PAID': { label: "Zaliczka wpłacona", color: "text-cyan-400" },
    'RECEIVED': { label: "Odebrane", color: "text-purple-400" },
    'COMPLETED': { label: "Zakończone", color: "text-gray-400" }
};

const laborStatusConfig: Record<string, { label: string; color: string }> = {
    'TO_ORDER': { label: "Do zamówienia", color: "text-yellow-400" },
    'ORDERED': { label: "Zamówione", color: "text-blue-400" },
    'PAID': { label: "Zapłacone", color: "text-green-400" },
    'IN_PROGRESS': { label: "W trakcie", color: "text-orange-400" },
    'COMPLETED': { label: "Zakończone", color: "text-gray-400" }
};

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [rooms, setRooms] = useState<{ id: string; name: string; type: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addModalCategory, setAddModalCategory] = useState<"MATERIAL" | "LABOR">("MATERIAL");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const [servicesResult, roomsResult] = await Promise.all([
            getServices(),
            getRoomsForProject()
        ]);

        if (servicesResult.success && servicesResult.data) {
            setServices(servicesResult.data as ServiceItem[]);
        }
        if (roomsResult.success && roomsResult.data) {
            setRooms(roomsResult.data);
        }
        setIsLoading(false);
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm("Czy na pewno chcesz usunąć tę usługę?")) return;

        setDeletingId(id);
        const result = await deleteService(id);
        if (result.success) {
            await loadData();
        }
        setDeletingId(null);
    };

    const handleApproveService = async (id: string) => {
        setApprovingId(id);
        const result = await approveService(id);
        if (result.success) {
            await loadData();
        }
        setApprovingId(null);
    };

    const openAddModal = (category: "MATERIAL" | "LABOR") => {
        setAddModalCategory(category);
        setIsAddModalOpen(true);
    };

    // Filter services
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            if (categoryFilter !== "all" && service.category !== categoryFilter) return false;
            if (statusFilter !== "all" && service.planningStatus !== statusFilter) return false;
            return true;
        });
    }, [services, categoryFilter, statusFilter]);

    // Split by category
    const materialServices = filteredServices.filter(s => s.category === "MATERIAL");
    const laborServices = filteredServices.filter(s => s.category === "LABOR");

    // Calculate totals
    const totals = useMemo(() => {
        const materialPlanned = services.filter(s => s.category === "MATERIAL" && s.planningStatus === "PLANNED").reduce((sum, s) => sum + s.price, 0);
        const materialApproved = services.filter(s => s.category === "MATERIAL" && s.planningStatus === "APPROVED").reduce((sum, s) => sum + s.price, 0);
        const laborPlanned = services.filter(s => s.category === "LABOR" && s.planningStatus === "PLANNED").reduce((sum, s) => sum + s.price, 0);
        const laborApproved = services.filter(s => s.category === "LABOR" && s.planningStatus === "APPROVED").reduce((sum, s) => sum + s.price, 0);

        return {
            materialPlanned,
            materialApproved,
            laborPlanned,
            laborApproved,
            totalPlanned: materialPlanned + laborPlanned,
            totalApproved: materialApproved + laborApproved
        };
    }, [services]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-0 overflow-hidden w-full">
            {/* Header with totals */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* Summary Cards */}
                <div className="flex gap-3 flex-1">
                    <Card className="flex-1 p-4 flex flex-col justify-center">
                        <span className="text-sm text-muted-foreground mb-1">Budżet estymacyjny</span>
                        <span className="text-xl font-bold text-white">{formatCurrency(totals.totalPlanned)}</span>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">Materiały: <span className="text-white">{formatCurrency(totals.materialPlanned)}</span></span>
                            <span className="text-muted-foreground">Robocizna: <span className="text-white">{formatCurrency(totals.laborPlanned)}</span></span>
                        </div>
                    </Card>
                    <Card className="flex-1 p-4 flex flex-col justify-center">
                        <span className="text-sm text-muted-foreground mb-1">Budżet rzeczywisty</span>
                        <span className="text-xl font-bold text-[#91E8B2]">{formatCurrency(totals.totalApproved)}</span>
                        <div className="flex gap-4 mt-2 text-sm">
                            <span className="text-muted-foreground">Materiały: <span className="text-[#91E8B2]">{formatCurrency(totals.materialApproved)}</span></span>
                            <span className="text-muted-foreground">Robocizna: <span className="text-[#91E8B2]">{formatCurrency(totals.laborApproved)}</span></span>
                        </div>
                    </Card>
                </div>

                {/* Filter & Add Buttons */}
                <div className="flex gap-2 items-stretch">
                    {/* Category Filter */}
                    <div className="flex bg-[#151515] rounded-xl p-1 h-[80px] items-center">
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                categoryFilter === "all" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setCategoryFilter("all")}
                        >
                            Wszystkie
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                categoryFilter === "MATERIAL" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setCategoryFilter("MATERIAL")}
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Materiały
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                categoryFilter === "LABOR" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setCategoryFilter("LABOR")}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Robocizna
                        </Button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex bg-[#151515] rounded-xl p-1 h-[80px] items-center">
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                statusFilter === "all" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setStatusFilter("all")}
                        >
                            Wszystkie
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                statusFilter === "DRAFT" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setStatusFilter("DRAFT")}
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Brudnopis
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                statusFilter === "PLANNED" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setStatusFilter("PLANNED")}
                        >
                            <Clock className="w-4 h-4 mr-2" />
                            Planowane
                        </Button>
                        <Button
                            variant="ghost"
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                statusFilter === "APPROVED" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                            )}
                            onClick={() => setStatusFilter("APPROVED")}
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Zatwierdzone
                        </Button>
                    </div>

                    {/* Add Buttons */}
                    <div className="flex flex-col gap-1 h-[80px]">
                        <Button
                            onClick={() => openAddModal("MATERIAL")}
                            className="flex-1 bg-[#151515] hover:bg-[#252525] text-white px-4 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <Package className="w-4 h-4" />
                            Materiał
                        </Button>
                        <Button
                            onClick={() => openAddModal("LABOR")}
                            className="flex-1 bg-[#151515] hover:bg-[#252525] text-white px-4 rounded-xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <Users className="w-4 h-4" />
                            Robocizna
                        </Button>
                    </div>
                </div>
            </div>

            {/* Services List */}
            {filteredServices.length === 0 ? (
                <Card className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Wrench className="w-16 h-16 opacity-20" />
                    <p className="text-lg">Brak usług do wyświetlenia</p>
                    <div className="flex gap-2">
                        <Button onClick={() => openAddModal("MATERIAL")}>
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj materiał
                        </Button>
                        <Button onClick={() => openAddModal("LABOR")} variant="secondary">
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj robociznę
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-6">
                    {/* Materials Section */}
                    {(categoryFilter === "all" || categoryFilter === "MATERIAL") && materialServices.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Package className="w-5 h-5 text-muted-foreground" />
                                <h2 className="text-lg font-semibold text-white">Materiały</h2>
                                <span className="text-sm text-muted-foreground">({materialServices.length})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {materialServices.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        onDelete={handleDeleteService}
                                        onApprove={handleApproveService}
                                        isDeleting={deletingId === service.id}
                                        isApproving={approvingId === service.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Labor Section */}
                    {(categoryFilter === "all" || categoryFilter === "LABOR") && laborServices.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-5 h-5 text-muted-foreground" />
                                <h2 className="text-lg font-semibold text-white">Robocizna</h2>
                                <span className="text-sm text-muted-foreground">({laborServices.length})</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {laborServices.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        onDelete={handleDeleteService}
                                        onApprove={handleApproveService}
                                        isDeleting={deletingId === service.id}
                                        isApproving={approvingId === service.id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Add Service Modal */}
            <AddServiceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                category={addModalCategory}
                rooms={rooms}
                onSuccess={loadData}
            />
        </div>
    );
}

// Service Card Component
interface ServiceCardProps {
    service: ServiceItem;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    isDeleting: boolean;
    isApproving: boolean;
}

function ServiceCard({ service, onDelete, onApprove, isDeleting, isApproving }: ServiceCardProps) {
    const isMaterial = service.category === "MATERIAL";
    const statusInfo = planningStatusConfig[service.planningStatus] || planningStatusConfig['DRAFT'];

    // Get fulfillment status for approved items
    const fulfillmentStatus = service.planningStatus === "APPROVED"
        ? (isMaterial
            ? materialStatusConfig[service.materialStatus || 'TO_ORDER']
            : laborStatusConfig[service.laborStatus || 'TO_ORDER'])
        : null;

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
    };

    return (
        <Card className={cn(
            "overflow-hidden flex flex-col p-4 gap-4 group hover:border-white/10 transition-colors",
            isDeleting && "opacity-50 pointer-events-none"
        )}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "p-2.5 rounded-xl",
                        isMaterial ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                    )}>
                        {isMaterial ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15px] text-white">
                            {isMaterial ? service.name : service.subcontractor}
                        </h3>
                        {service.room && (
                            <p className="text-sm text-muted-foreground">{service.room.name}</p>
                        )}
                    </div>
                </div>
                <Badge status={statusInfo.badgeStatus} dot className="bg-transparent px-0 text-[13px] gap-2">
                    {statusInfo.label}
                </Badge>
            </div>

            {/* Content */}
            <div className="flex gap-3 flex-1">
                {/* Image */}
                {service.imageUrl && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                        <img
                            src={service.imageUrl}
                            alt={isMaterial ? service.name || "" : service.subcontractor || ""}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Details */}
                <div className="flex-1 space-y-2 text-sm">
                    {isMaterial ? (
                        <>
                            {service.materialType && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Typ:</span>
                                    <span className="text-white">{service.materialType}</span>
                                </div>
                            )}
                            {service.quantity && service.unit && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ilość:</span>
                                    <span className="text-white">{service.quantity} {service.unit}</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {service.scope && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Zakres:</span>
                                    <span className="text-white truncate max-w-[150px]">{service.scope}</span>
                                </div>
                            )}
                            {service.duration && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Czas trwania:</span>
                                    <span className="text-white">{service.duration}</span>
                                </div>
                            )}
                        </>
                    )}
                    <div className="flex justify-between pt-2 border-t border-white/5">
                        <span className="text-muted-foreground">Cena:</span>
                        <span className="text-white font-semibold">{formatCurrency(service.price)}</span>
                    </div>
                </div>
            </div>

            {/* Fulfillment Status (only for approved) */}
            {fulfillmentStatus && (
                <div className="flex items-center gap-2 text-sm bg-[#1B1B1B] px-3 py-2 rounded-lg">
                    <span className="text-muted-foreground">Status realizacji:</span>
                    <span className={fulfillmentStatus.color}>{fulfillmentStatus.label}</span>
                </div>
            )}

            {/* Notes */}
            {service.notes && (
                <p className="text-sm text-muted-foreground italic line-clamp-2">{service.notes}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2">
                {service.url && (
                    <Button
                        variant="secondary"
                        className="flex-1 bg-[#1B1B1B] hover:bg-[#252525] text-sm h-[40px]"
                        onClick={() => window.open(service.url!, '_blank')}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Link
                    </Button>
                )}

                {service.planningStatus !== "APPROVED" && (
                    <Button
                        className="flex-1 bg-[#91E8B2]/10 hover:bg-[#91E8B2]/20 text-[#91E8B2] text-sm h-[40px]"
                        onClick={() => onApprove(service.id)}
                        disabled={isApproving}
                    >
                        {isApproving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Zatwierdź
                            </>
                        )}
                    </Button>
                )}

                <Button
                    variant="secondary"
                    className="px-3 bg-[#1B1B1B] hover:bg-[#252525] text-muted-foreground hover:text-white h-[40px]"
                >
                    <Edit3 className="w-4 h-4" />
                </Button>

                <Button
                    variant="secondary"
                    className="px-3 bg-[#1B1B1B] hover:bg-[#252525] text-muted-foreground hover:text-red-400 h-[40px]"
                    onClick={() => onDelete(service.id)}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </Card>
    );
}
