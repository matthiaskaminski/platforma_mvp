"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    ChevronDown,
    Share2,
    Printer,
    Download,
    LayoutGrid,
    Hash,
    Flame,
    MoreVertical,
    Package,
    Users,
    Plus,
    Trash2,
    Check,
    Loader2,
    ExternalLink,
    Edit3,
    FileText,
    Clock,
    Wrench,
    Pencil,
    Undo2,
    X,
    Square,
    CheckSquare
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getServices, deleteService, approveService, revokeServiceApproval, updateService, getRoomsForProject } from "@/app/actions/services";
import { AddServiceModal } from "./components/AddServiceModal";

// Types
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
    room: { id: string; name: string } | null;
}

type CategoryFilter = "all" | "MATERIAL" | "LABOR";
type StatusFilter = "all" | "DRAFT" | "PLANNED" | "APPROVED";

// Status configurations
const planningStatusConfig: Record<string, { label: string; dotColor: string }> = {
    'DRAFT': { label: "Brudnopis", dotColor: "bg-[#6E6E6E]" },
    'PLANNED': { label: "Planowane", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'APPROVED': { label: "Zatwierdzone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'REJECTED': { label: "Odrzucone", dotColor: "bg-red-500" }
};

const materialStatusConfig: Record<string, { label: string }> = {
    'TO_ORDER': { label: "Do zamówienia" },
    'ORDERED': { label: "Zamówione" },
    'TO_PAY': { label: "Do zapłaty" },
    'PAID': { label: "Zapłacone" },
    'ADVANCE_PAID': { label: "Zaliczka" },
    'RECEIVED': { label: "Odebrane" },
    'COMPLETED': { label: "Zakończone" }
};

const laborStatusConfig: Record<string, { label: string }> = {
    'TO_ORDER': { label: "Do zlecenia" },
    'ORDERED': { label: "Zlecone" },
    'PAID': { label: "Opłacone" },
    'IN_PROGRESS': { label: "W trakcie" },
    'COMPLETED': { label: "Zakończone" }
};

export default function ServicesPage() {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [rooms, setRooms] = useState<{ id: string; name: string; type: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [revokingId, setRevokingId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

    const handleRevokeApproval = async (id: string) => {
        if (!confirm("Czy na pewno chcesz cofnąć zatwierdzenie tej usługi?")) return;

        setRevokingId(id);
        const result = await revokeServiceApproval(id);
        if (result.success) {
            await loadData();
        }
        setRevokingId(null);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredServices.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredServices.map(s => s.id)));
        }
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
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const name = service.category === "MATERIAL" ? service.name : service.subcontractor;
                if (!name?.toLowerCase().includes(query)) return false;
            }
            return true;
        });
    }, [services, categoryFilter, statusFilter, searchQuery]);

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
        return value.toLocaleString('pl-PL') + ' zł';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-500 overflow-hidden">

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3 px-0 pt-2">
                {/* Filter Bar */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Filtruj</span>

                    <div className="flex gap-2 ml-auto">
                        <div className="relative w-[250px] hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Szukaj usługi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#1B1B1B] border-transparent focus:border-white/10 h-[48px] pl-10 w-full"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="flex bg-[#1B1B1B] rounded-lg p-1 h-[48px] items-center">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px]",
                                    categoryFilter === "all" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setCategoryFilter("all")}
                            >
                                Wszystkie
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    categoryFilter === "MATERIAL" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setCategoryFilter("MATERIAL")}
                            >
                                <Package className="w-4 h-4" />
                                Materiały
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    categoryFilter === "LABOR" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setCategoryFilter("LABOR")}
                            >
                                <Users className="w-4 h-4" />
                                Robocizna
                            </Button>
                        </div>

                        {/* Status Filter */}
                        <div className="flex bg-[#1B1B1B] rounded-lg p-1 h-[48px] items-center">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px]",
                                    statusFilter === "all" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setStatusFilter("all")}
                            >
                                Wszystkie
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    statusFilter === "DRAFT" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setStatusFilter("DRAFT")}
                            >
                                <FileText className="w-4 h-4" />
                                Brudnopis
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    statusFilter === "PLANNED" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setStatusFilter("PLANNED")}
                            >
                                <Clock className="w-4 h-4" />
                                Planowane
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    statusFilter === "APPROVED" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setStatusFilter("APPROVED")}
                            >
                                <Check className="w-4 h-4" />
                                Zatwierdzone
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <Card className="p-4 h-auto md:h-auto flex items-center justify-center gap-2 px-4 shrink-0">
                    <Button
                        onClick={() => openAddModal("MATERIAL")}
                        className="h-[48px] px-4 rounded-lg bg-[#1B1B1B] hover:bg-[#252525] text-white flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <Package className="w-4 h-4" />
                        <span className="hidden lg:inline">Materiał</span>
                    </Button>
                    <Button
                        onClick={() => openAddModal("LABOR")}
                        className="h-[48px] px-4 rounded-lg bg-[#1B1B1B] hover:bg-[#252525] text-white flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <Users className="w-4 h-4" />
                        <span className="hidden lg:inline">Robocizna</span>
                    </Button>
                </Card>
            </div>

            {/* Main Content Area - Table + Sticky Footer */}
            <div className="flex-1 flex flex-col min-h-0 relative">

                {/* Scrollable List Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-0 flex flex-col">

                    {filteredServices.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <Wrench className="w-16 h-16 opacity-20" />
                            <p className="text-lg">Brak usług do wyświetlenia</p>
                            <div className="flex gap-2">
                                <Button onClick={() => openAddModal("MATERIAL")} className="bg-[#1B1B1B] hover:bg-[#252525]">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Dodaj materiał
                                </Button>
                                <Button onClick={() => openAddModal("LABOR")} className="bg-[#1B1B1B] hover:bg-[#252525]">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Dodaj robociznę
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Sticky Table Header */}
                            <div className="sticky top-0 bg-[#0E0E0E] z-20 border-b border-white/5">
                                <div className="grid grid-cols-[40px_50px_60px_2.5fr_2fr_1.5fr_1fr_1.5fr_120px] gap-4 px-6 py-4 text-sm font-medium text-muted-foreground items-center">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={toggleSelectAll}
                                            className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                selectedIds.size === filteredServices.length && filteredServices.length > 0
                                                    ? "bg-[#6E6E6E] border-[#6E6E6E] text-white"
                                                    : "bg-transparent border-[#4A4A4A] hover:border-[#6E6E6E]"
                                            )}
                                        >
                                            {selectedIds.size === filteredServices.length && filteredServices.length > 0 && (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-center">#</div>
                                    <div></div> {/* Icon */}
                                    <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Nazwa / Podwykonawca</div>
                                    <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Pomieszczenie</div>
                                    <div className="flex items-center gap-2">Szczegóły</div>
                                    <div className="text-right">Cena</div>
                                    <div className="flex items-center gap-2 justify-end"><Flame className="w-4 h-4" /> Status</div>
                                    <div className="text-center">Akcje</div>
                                </div>
                            </div>

                            {/* List Items */}
                            <div className="px-0 pb-0">
                                {filteredServices.map((service, index) => {
                                    const isMaterial = service.category === "MATERIAL";
                                    const statusInfo = planningStatusConfig[service.planningStatus] || planningStatusConfig['DRAFT'];
                                    const fulfillmentStatus = service.planningStatus === "APPROVED"
                                        ? (isMaterial
                                            ? materialStatusConfig[service.materialStatus || 'TO_ORDER']
                                            : laborStatusConfig[service.laborStatus || 'TO_ORDER'])
                                        : null;
                                    const isSelected = selectedIds.has(service.id);

                                    return (
                                        <div
                                            key={service.id}
                                            className={cn(
                                                "grid grid-cols-[40px_50px_60px_2.5fr_2fr_1.5fr_1fr_1.5fr_120px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-0 text-[14px] px-6 group",
                                                deletingId === service.id && "opacity-50 pointer-events-none",
                                                isSelected && "bg-[#1a1a1a]"
                                            )}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleSelection(service.id)}
                                                    className={cn(
                                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "bg-[#6E6E6E] border-[#6E6E6E] text-white"
                                                            : "bg-transparent border-[#4A4A4A] hover:border-[#6E6E6E]"
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {/* Index */}
                                            <div className="text-center text-muted-foreground/50">{index + 1}</div>

                                            {/* Category Icon */}
                                            <div className="flex justify-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-lg flex items-center justify-center",
                                                    isMaterial ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                                                )}>
                                                    {isMaterial ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                                </div>
                                            </div>

                                            {/* Name / Subcontractor */}
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium truncate">
                                                    {isMaterial ? service.name : service.subcontractor}
                                                </span>
                                                {isMaterial && service.materialType && (
                                                    <span className="text-xs text-muted-foreground">{service.materialType}</span>
                                                )}
                                                {!isMaterial && service.scope && (
                                                    <span className="text-xs text-muted-foreground truncate">{service.scope}</span>
                                                )}
                                            </div>

                                            {/* Room */}
                                            <div className="text-muted-foreground truncate">
                                                {service.room?.name || "—"}
                                            </div>

                                            {/* Details */}
                                            <div className="text-muted-foreground text-sm">
                                                {isMaterial ? (
                                                    service.quantity && service.unit ? `${service.quantity} ${service.unit}` : "—"
                                                ) : (
                                                    service.duration || "—"
                                                )}
                                            </div>

                                            {/* Price */}
                                            <div className="text-right text-white font-medium">
                                                {formatCurrency(service.price)}
                                            </div>

                                            {/* Status */}
                                            <div className="flex flex-col items-end gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></div>
                                                    <span className="text-[#F3F3F3]">{statusInfo.label}</span>
                                                </div>
                                                {fulfillmentStatus && (
                                                    <span className="text-xs text-muted-foreground">{fulfillmentStatus.label}</span>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center justify-center gap-1">
                                                {service.url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => window.open(service.url!, '_blank')}
                                                    >
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                )}
                                                {/* Edit button */}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => setEditingId(service.id)}
                                                >
                                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                                {service.planningStatus === "APPROVED" ? (
                                                    // Revoke approval button
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-[#E8B491]/20 rounded-full"
                                                        onClick={() => handleRevokeApproval(service.id)}
                                                        disabled={revokingId === service.id}
                                                        title="Cofnij zatwierdzenie"
                                                    >
                                                        {revokingId === service.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-[#E8B491]" />
                                                        ) : (
                                                            <Undo2 className="w-4 h-4 text-[#E8B491]" />
                                                        )}
                                                    </Button>
                                                ) : (
                                                    // Approve button
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-[#91E8B2]/20 rounded-full"
                                                        onClick={() => handleApproveService(service.id)}
                                                        disabled={approvingId === service.id}
                                                        title="Zatwierdź"
                                                    >
                                                        {approvingId === service.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin text-[#91E8B2]" />
                                                        ) : (
                                                            <Check className="w-4 h-4 text-[#91E8B2]" />
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-red-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteService(service.id)}
                                                    disabled={deletingId === service.id}
                                                >
                                                    {deletingId === service.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 text-red-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Spacer */}
                    <div className="mt-auto"></div>
                </div>

                {/* Sticky Budget Summary Footer */}
                <div className="shrink-0 bg-[#0F0F0F] z-30 p-0 animate-in slide-in-from-bottom-5 duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 bg-[#151515] py-4 w-full rounded-2xl">

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                                <Clock className="w-5 h-5 text-[#E8B491]" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Budżet estymacyjny</div>
                                <div className="text-xl font-bold text-white tracking-tight">{formatCurrency(totals.totalPlanned)}</div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                                <Package className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Materiały (plan/zatw.)</div>
                                <div className="text-lg font-bold text-white tracking-tight">
                                    {formatCurrency(totals.materialPlanned)} / <span className="text-[#91E8B2]">{formatCurrency(totals.materialApproved)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                                <Users className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Robocizna (plan/zatw.)</div>
                                <div className="text-lg font-bold text-white tracking-tight">
                                    {formatCurrency(totals.laborPlanned)} / <span className="text-[#91E8B2]">{formatCurrency(totals.laborApproved)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5"></div>

                        <div className="flex items-center gap-3 mr-auto md:mr-0">
                            <div className="w-10 h-10 rounded-full bg-[#91E8B2]/20 flex items-center justify-center">
                                <Check className="w-5 h-5 text-[#91E8B2]" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Budżet rzeczywisty</div>
                                <div className="text-xl font-bold text-[#91E8B2] tracking-tight">{formatCurrency(totals.totalApproved)}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Add Service Modal */}
            <AddServiceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                category={addModalCategory}
                rooms={rooms}
                onSuccess={loadData}
            />

            {/* Edit Service Modal */}
            {editingId && (
                <EditServiceModal
                    service={services.find(s => s.id === editingId)!}
                    rooms={rooms}
                    onClose={() => setEditingId(null)}
                    onSuccess={loadData}
                />
            )}

            {/* Bottom Selection Toolbar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1B1B1B] border border-white/10 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
                    <span className="text-sm text-white">
                        Zaznaczono: <span className="font-semibold">{selectedIds.size}</span>
                    </span>
                    <div className="h-6 w-px bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="h-8"
                    >
                        {selectedIds.size === filteredServices.length ? "Odznacz wszystko" : "Zaznacz wszystko"}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            const selectedServices = filteredServices.filter(s => selectedIds.has(s.id) && s.planningStatus !== "APPROVED");
                            if (selectedServices.length === 0) return;

                            for (const service of selectedServices) {
                                await approveService(service.id);
                            }
                            setSelectedIds(new Set());
                            await loadData();
                        }}
                        className="h-8 text-[#91E8B2] hover:text-[#91E8B2] hover:bg-[#91E8B2]/10"
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Zatwierdź zaznaczone
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            if (!confirm(`Czy na pewno chcesz usunąć ${selectedIds.size} usług?`)) return;

                            for (const id of selectedIds) {
                                await deleteService(id);
                            }
                            setSelectedIds(new Set());
                            await loadData();
                        }}
                        className="h-8 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń zaznaczone
                    </Button>
                    <div className="h-6 w-px bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIds(new Set())}
                        className="h-8"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

// Edit Service Modal Component
interface EditServiceModalProps {
    service: ServiceItem;
    rooms: { id: string; name: string; type: string }[];
    onClose: () => void;
    onSuccess: () => void;
}

function EditServiceModal({ service, rooms, onClose, onSuccess }: EditServiceModalProps) {
    const isMaterial = service.category === "MATERIAL";
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState(service.name || "");
    const [subcontractor, setSubcontractor] = useState(service.subcontractor || "");
    const [price, setPrice] = useState(service.price.toString());
    const [quantity, setQuantity] = useState(service.quantity?.toString() || "");
    const [unit, setUnit] = useState(service.unit || "");
    const [materialType, setMaterialType] = useState(service.materialType || "");
    const [scope, setScope] = useState(service.scope || "");
    const [duration, setDuration] = useState(service.duration || "");
    const [url, setUrl] = useState(service.url || "");
    const [notes, setNotes] = useState(service.notes || "");
    const [roomId, setRoomId] = useState(service.room?.id || "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const updateData: any = {
                price: parseFloat(price) || 0,
                url: url || null,
                notes: notes || null,
                roomId: roomId || null
            };

            if (isMaterial) {
                updateData.name = name;
                updateData.quantity = quantity ? parseFloat(quantity) : null;
                updateData.unit = unit || null;
                updateData.materialType = materialType || null;
            } else {
                updateData.subcontractor = subcontractor;
                updateData.scope = scope || null;
                updateData.duration = duration || null;
            }

            const result = await updateService(service.id, updateData);
            if (result.success) {
                onClose();
                onSuccess();
            }
        } catch (error) {
            console.error('Error updating service:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#151515] rounded-2xl p-6 w-full max-w-lg shadow-xl border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            isMaterial ? "bg-blue-500/10 text-blue-400" : "bg-orange-500/10 text-orange-400"
                        )}>
                            {isMaterial ? <Package className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                        </div>
                        <h2 className="text-lg font-semibold text-white">
                            Edytuj {isMaterial ? "materiał" : "robociznę"}
                        </h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isMaterial ? (
                        <>
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Nazwa</label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nazwa materiału"
                                    className="bg-[#1B1B1B] border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Typ materiału</label>
                                <Input
                                    value={materialType}
                                    onChange={(e) => setMaterialType(e.target.value)}
                                    placeholder="np. Drewno, Metal, itp."
                                    className="bg-[#1B1B1B] border-white/10"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">Ilość</label>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="0"
                                        className="bg-[#1B1B1B] border-white/10"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">Jednostka</label>
                                    <Input
                                        value={unit}
                                        onChange={(e) => setUnit(e.target.value)}
                                        placeholder="m², szt., kg"
                                        className="bg-[#1B1B1B] border-white/10"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Podwykonawca</label>
                                <Input
                                    value={subcontractor}
                                    onChange={(e) => setSubcontractor(e.target.value)}
                                    placeholder="Nazwa firmy lub osoby"
                                    className="bg-[#1B1B1B] border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Zakres prac</label>
                                <Input
                                    value={scope}
                                    onChange={(e) => setScope(e.target.value)}
                                    placeholder="Opis zakresu prac"
                                    className="bg-[#1B1B1B] border-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">Czas trwania</label>
                                <Input
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="np. 2 tygodnie"
                                    className="bg-[#1B1B1B] border-white/10"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Cena</label>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            className="bg-[#1B1B1B] border-white/10"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Pomieszczenie</label>
                        <select
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/20"
                        >
                            <option value="">Brak przypisania</option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">URL</label>
                        <Input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://..."
                            className="bg-[#1B1B1B] border-white/10"
                        />
                    </div>

                    <div>
                        <label className="text-sm text-muted-foreground mb-1 block">Notatki</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Dodatkowe informacje..."
                            rows={2}
                            className="w-full bg-[#1B1B1B] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 bg-[#1B1B1B] hover:bg-[#252525]"
                            onClick={onClose}
                        >
                            Anuluj
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-[#91E8B2]/10 hover:bg-[#91E8B2]/20 text-[#91E8B2]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Zapisz
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}
