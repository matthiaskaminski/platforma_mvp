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
    ArrowUpRight,
    CheckCircle2,
    Calendar,
    CreditCard,
    Package,
    Users,
    Wrench,
    Loader2,
    ShoppingCart,
    Check,
    FileSpreadsheet,
    Trash2,
    X
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getCartItems, updateProductStatus, updateMaterialStatus, updateLaborStatus, exportCartItems } from "@/app/actions/cart";

// Types
interface CartItem {
    id: string;
    type: 'product' | 'service';
    name: string | null;
    room: string | null;
    roomId: string | null;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: string | null;
    imageUrl: string | null;
    url: string | null;
    supplier: string | null;
    createdAt: Date;
}

type CategoryFilter = 'all' | 'product' | 'material' | 'labor';
type StatusFilter = 'all' | 'to_pay' | 'paid';

// Status configurations with distinctive colors
const productStatusConfig: Record<string, { label: string; dotColor: string }> = {
    'TO_ORDER': { label: "Do zamówienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'ORDERED': { label: "Zamówione", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]" },
    'PAID': { label: "Opłacone", dotColor: "bg-[#B291E8] shadow-[0_0_8px_rgba(178,145,232,0.4)]" },
    'DELIVERED': { label: "Dostarczone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'RETURNED': { label: "Zwrócone", dotColor: "bg-[#E89191] shadow-[0_0_8px_rgba(232,145,145,0.4)]" }
};

const serviceStatusConfig: Record<string, { label: string; dotColor: string }> = {
    'TO_ORDER': { label: "Do zamówienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'ORDERED': { label: "Zamówione", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]" },
    'TO_PAY': { label: "Do zapłaty", dotColor: "bg-[#E8D891] shadow-[0_0_8px_rgba(232,216,145,0.4)]" },
    'PAID': { label: "Opłacone", dotColor: "bg-[#B291E8] shadow-[0_0_8px_rgba(178,145,232,0.4)]" },
    'ADVANCE_PAID': { label: "Zaliczka", dotColor: "bg-[#91D8E8] shadow-[0_0_8px_rgba(145,216,232,0.4)]" },
    'RECEIVED': { label: "Odebrane", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'IN_PROGRESS': { label: "W trakcie", dotColor: "bg-[#E891D8] shadow-[0_0_8px_rgba(232,145,216,0.4)]" },
    'COMPLETED': { label: "Zakończone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" }
};

export default function CartPage() {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
    const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setIsLoading(true);
        const result = await getCartItems();
        if (result.success && result.data) {
            setItems(result.data);
        }
        setIsLoading(false);
    };

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            // Category filter
            if (categoryFilter === 'product' && item.type !== 'product') return false;
            if (categoryFilter === 'material' && item.category !== 'Materiał') return false;
            if (categoryFilter === 'labor' && item.category !== 'Robocizna') return false;

            // Status filter
            if (statusFilter === 'paid') {
                const paidStatuses = ['PAID', 'DELIVERED', 'COMPLETED', 'RECEIVED'];
                if (!item.status || !paidStatuses.includes(item.status)) return false;
            }
            if (statusFilter === 'to_pay') {
                const paidStatuses = ['PAID', 'DELIVERED', 'COMPLETED', 'RECEIVED'];
                if (item.status && paidStatuses.includes(item.status)) return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!item.name?.toLowerCase().includes(query) &&
                    !item.room?.toLowerCase().includes(query) &&
                    !item.supplier?.toLowerCase().includes(query)) {
                    return false;
                }
            }

            return true;
        });
    }, [items, categoryFilter, statusFilter, searchQuery]);

    // Calculate totals
    const totals = useMemo(() => {
        const paidStatuses = ['PAID', 'DELIVERED', 'COMPLETED', 'RECEIVED'];
        const totalCost = filteredItems.reduce((acc, item) => acc + item.totalPrice, 0);
        const totalPaid = filteredItems
            .filter(i => i.status && paidStatuses.includes(i.status))
            .reduce((acc, item) => acc + item.totalPrice, 0);

        return {
            totalCost,
            totalPaid,
            toPay: totalCost - totalPaid
        };
    }, [filteredItems]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
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
        if (selectedIds.size === filteredItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredItems.map(i => i.id)));
        }
    };

    const handleStatusChange = async (item: CartItem, newStatus: string) => {
        setChangingStatusId(item.id);
        setStatusMenuOpen(null);

        try {
            if (item.type === 'product') {
                await updateProductStatus(item.id, newStatus as any);
            } else if (item.category === 'Materiał') {
                await updateMaterialStatus(item.id, newStatus as any);
            } else {
                await updateLaborStatus(item.id, newStatus as any);
            }
            await loadItems();
        } catch (error) {
            console.error('Error changing status:', error);
        } finally {
            setChangingStatusId(null);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportCartItems();
            if (result.success && result.data) {
                // Create and download file
                const blob = new Blob(['\ufeff' + result.data], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename || 'koszyk.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusConfig = (item: CartItem) => {
        if (item.type === 'product') {
            return productStatusConfig[item.status || 'TO_ORDER'] || productStatusConfig['TO_ORDER'];
        }
        return serviceStatusConfig[item.status || 'TO_ORDER'] || serviceStatusConfig['TO_ORDER'];
    };

    const getAvailableStatuses = (item: CartItem) => {
        if (item.type === 'product') {
            return Object.entries(productStatusConfig);
        }
        if (item.category === 'Materiał') {
            return Object.entries(serviceStatusConfig).filter(([key]) =>
                ['TO_ORDER', 'ORDERED', 'TO_PAY', 'PAID', 'ADVANCE_PAID', 'RECEIVED', 'COMPLETED'].includes(key)
            );
        }
        return Object.entries(serviceStatusConfig).filter(([key]) =>
            ['TO_ORDER', 'ORDERED', 'PAID', 'IN_PROGRESS', 'COMPLETED'].includes(key)
        );
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
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Koszyk</span>

                    <div className="flex gap-2 ml-auto">
                        <div className="relative w-[250px] hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Szukaj..."
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
                                    categoryFilter === "product" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setCategoryFilter("product")}
                            >
                                <Package className="w-4 h-4" />
                                Produkty
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    categoryFilter === "material" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setCategoryFilter("material")}
                            >
                                <Wrench className="w-4 h-4" />
                                Materiały
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px] flex items-center gap-1.5",
                                    categoryFilter === "labor" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setCategoryFilter("labor")}
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
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px]",
                                    statusFilter === "to_pay" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setStatusFilter("to_pay")}
                            >
                                Do zapłaty
                            </Button>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors h-[40px]",
                                    statusFilter === "paid" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                                )}
                                onClick={() => setStatusFilter("paid")}
                            >
                                Opłacone
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Actions */}
                <Card className="p-4 h-auto md:h-auto flex items-center justify-center gap-2 px-4 shrink-0">
                    <Button
                        variant="ghost"
                        className="h-[48px] px-4 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white flex items-center gap-2"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <FileSpreadsheet className="w-5 h-5" />
                        )}
                        <span className="hidden lg:inline">Eksportuj</span>
                    </Button>
                    <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                        <Printer className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            {/* Main Content Area - Table + Sticky Footer */}
            <div className="flex-1 flex flex-col min-h-0 relative">

                {/* Scrollable List Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-0 flex flex-col">

                    {filteredItems.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <ShoppingCart className="w-16 h-16 opacity-20" />
                            <p className="text-lg">
                                {items.length === 0
                                    ? "Koszyk jest pusty"
                                    : "Brak elementów spełniających kryteria"
                                }
                            </p>
                            <p className="text-sm text-muted-foreground/60 max-w-md text-center">
                                Zatwierdzone produkty i usługi pojawią się tutaj automatycznie
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Sticky Table Header */}
                            <div className="sticky top-0 bg-[#0E0E0E] z-20 border-b border-white/5">
                                <div className="grid grid-cols-[40px_50px_60px_2.5fr_1.5fr_1fr_80px_100px_120px_1.5fr_80px] gap-4 px-6 py-4 text-sm font-medium text-muted-foreground items-center">
                                    <div className="flex justify-center">
                                        <button
                                            onClick={toggleSelectAll}
                                            className={cn(
                                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                selectedIds.size === filteredItems.length && filteredItems.length > 0
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "bg-transparent border-gray-500 hover:border-gray-400"
                                            )}
                                        >
                                            {selectedIds.size === filteredItems.length && filteredItems.length > 0 && (
                                                <Check className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-center">#</div>
                                    <div></div> {/* Image */}
                                    <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Nazwa</div>
                                    <div className="flex items-center gap-2"><ArrowUpRight className="w-4 h-4" /> Pomieszczenie</div>
                                    <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Typ</div>
                                    <div className="text-center">Ilość</div>
                                    <div className="text-right">Cena jedn.</div>
                                    <div className="text-right">Cena łączna</div>
                                    <div className="flex items-center gap-2 justify-end"><Flame className="w-4 h-4" /> Status</div>
                                    <div></div> {/* Actions */}
                                </div>
                            </div>

                            {/* List Items */}
                            <div className="px-0 pb-0">
                                {filteredItems.map((item, index) => {
                                    const statusInfo = getStatusConfig(item);
                                    const isSelected = selectedIds.has(item.id);
                                    const isChangingStatus = changingStatusId === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className={cn(
                                                "grid grid-cols-[40px_50px_60px_2.5fr_1.5fr_1fr_80px_100px_120px_1.5fr_80px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-0 text-[14px] px-6 group",
                                                isSelected && "bg-[#1a1a1a]"
                                            )}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex justify-center">
                                                <button
                                                    onClick={() => toggleSelection(item.id)}
                                                    className={cn(
                                                        "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                                        isSelected
                                                            ? "bg-blue-500 border-blue-500 text-white"
                                                            : "bg-transparent border-gray-500 hover:border-gray-400"
                                                    )}
                                                >
                                                    {isSelected && <Check className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>

                                            {/* Index */}
                                            <div className="text-center text-muted-foreground/50">{index + 1}</div>

                                            {/* Image */}
                                            <div className="flex justify-center">
                                                {item.imageUrl ? (
                                                    <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex items-center justify-center">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={item.imageUrl} alt={item.name || ''} className="w-full h-full object-contain mix-blend-multiply p-1" />
                                                    </div>
                                                ) : (
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-md flex items-center justify-center",
                                                        item.type === 'product' ? "bg-purple-500/10" :
                                                            item.category === 'Materiał' ? "bg-blue-500/10" : "bg-orange-500/10"
                                                    )}>
                                                        {item.type === 'product' ? (
                                                            <Package className="w-5 h-5 text-purple-400" />
                                                        ) : item.category === 'Materiał' ? (
                                                            <Wrench className="w-5 h-5 text-blue-400" />
                                                        ) : (
                                                            <Users className="w-5 h-5 text-orange-400" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium truncate">{item.name || '—'}</span>
                                                {item.supplier && (
                                                    <span className="text-xs text-muted-foreground truncate">{item.supplier}</span>
                                                )}
                                            </div>

                                            {/* Room */}
                                            <div className="text-muted-foreground truncate">{item.room || '—'}</div>

                                            {/* Type */}
                                            <div className="text-muted-foreground text-sm">{item.category}</div>

                                            {/* Quantity */}
                                            <div className="text-center text-white">{item.quantity}</div>

                                            {/* Unit Price */}
                                            <div className="text-right text-muted-foreground">{formatCurrency(item.unitPrice)}</div>

                                            {/* Total Price */}
                                            <div className="text-right text-white font-medium">{formatCurrency(item.totalPrice)}</div>

                                            {/* Status with dropdown */}
                                            <div className="flex items-center gap-2 justify-end relative">
                                                <button
                                                    onClick={() => setStatusMenuOpen(statusMenuOpen === item.id ? null : item.id)}
                                                    disabled={isChangingStatus}
                                                    className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 rounded transition-colors"
                                                >
                                                    {isChangingStatus ? (
                                                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <>
                                                            <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></div>
                                                            <span className="text-[#F3F3F3] text-sm">{statusInfo.label}</span>
                                                            <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                                        </>
                                                    )}
                                                </button>

                                                {/* Status dropdown menu */}
                                                {statusMenuOpen === item.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-40"
                                                            onClick={() => setStatusMenuOpen(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 z-50 bg-[#1B1B1B] rounded-lg border border-white/10 shadow-xl py-1 min-w-[160px]">
                                                            {getAvailableStatuses(item).map(([key, config]) => (
                                                                <button
                                                                    key={key}
                                                                    onClick={() => handleStatusChange(item, key)}
                                                                    className={cn(
                                                                        "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors",
                                                                        item.status === key && "bg-white/5"
                                                                    )}
                                                                >
                                                                    <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
                                                                    <span className="text-white">{config.label}</span>
                                                                    {item.status === key && (
                                                                        <Check className="w-3 h-3 ml-auto text-[#91E8B2]" />
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.url && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white/10 rounded-full"
                                                        onClick={() => window.open(item.url!, '_blank')}
                                                    >
                                                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                )}
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
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pozycji w koszyku</div>
                                <div className="text-xl font-bold text-white tracking-tight">{filteredItems.length}</div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Łączna kwota</div>
                                <div className="text-xl font-bold text-white tracking-tight">{formatCurrency(totals.totalCost)}</div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5"></div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#91E8B2]/20 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-[#91E8B2]" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Opłacono</div>
                                <div className="text-xl font-bold text-[#91E8B2] tracking-tight">{formatCurrency(totals.totalPaid)}</div>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5"></div>

                        <div className="flex items-center gap-3 mr-auto md:mr-0">
                            <div className="w-10 h-10 rounded-full bg-[#E8B491]/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-[#E8B491]" />
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Do zapłaty</div>
                                <div className="text-xl font-bold text-[#E8B491] tracking-tight">{formatCurrency(totals.toPay)}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

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
                        Zaznacz wszystko
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-8"
                    >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Eksportuj zaznaczone
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
