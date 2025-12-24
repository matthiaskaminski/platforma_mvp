"use client";

import React, { useState, useMemo } from "react";
import {
    Check,
    ChevronDown,
    LayoutGrid,
    Hash,
    CheckCircle2,
    CreditCard,
    Calendar,
    Loader2,
    Wallet,
    ArrowUpRight,
    Download,
    FileSpreadsheet,
    Search,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProductStatus } from "@/app/actions/cart";

const PLACEHOLDER_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png";

interface BudgetItem {
    id: string;
    name: string;
    category: string | null;
    supplier: string | null;
    url: string | null;
    imageUrl: string | null;
    price: any;
    quantity: number;
    paidAmount: any;
    status: string;
}

interface BudgetListProps {
    budgetItems: BudgetItem[];
}

type StatusFilter = 'all' | 'to_pay' | 'paid';

// Status configurations with distinctive colors (same as Cart)
const productStatusConfig: Record<string, { label: string; dotColor: string }> = {
    'TO_ORDER': { label: "Do zamówienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'ORDERED': { label: "Zamówione", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]" },
    'PAID': { label: "Opłacone", dotColor: "bg-[#B291E8] shadow-[0_0_8px_rgba(178,145,232,0.4)]" },
    'DELIVERED': { label: "Dostarczone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'RETURNED': { label: "Zwrócone", dotColor: "bg-[#E89191] shadow-[0_0_8px_rgba(232,145,145,0.4)]" }
};

export const BudgetList = React.memo(function BudgetList({ budgetItems }: BudgetListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [changingStatusId, setChangingStatusId] = useState<string | null>(null);
    const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Filter items
    const filteredItems = useMemo(() => {
        return budgetItems.filter(item => {
            // Status filter
            const paidStatuses = ['PAID', 'DELIVERED'];
            if (statusFilter === 'paid') {
                if (!paidStatuses.includes(item.status)) return false;
            }
            if (statusFilter === 'to_pay') {
                if (paidStatuses.includes(item.status)) return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!item.name?.toLowerCase().includes(query) &&
                    !item.category?.toLowerCase().includes(query) &&
                    !item.supplier?.toLowerCase().includes(query)) {
                    return false;
                }
            }

            return true;
        });
    }, [budgetItems, statusFilter, searchQuery]);

    // Calculate totals
    const totals = useMemo(() => {
        const paidStatuses = ['PAID', 'DELIVERED'];
        const totalCost = filteredItems.reduce((acc, item) => {
            const price = Number(item.price) || 0;
            return acc + (price * item.quantity);
        }, 0);
        const totalPaid = filteredItems
            .filter(i => paidStatuses.includes(i.status))
            .reduce((acc, item) => {
                const price = Number(item.price) || 0;
                return acc + (price * item.quantity);
            }, 0);

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

    const handleStatusChange = async (item: BudgetItem, newStatus: string) => {
        setChangingStatusId(item.id);
        setStatusMenuOpen(null);

        try {
            await updateProductStatus(item.id, newStatus as any);
            // Trigger refresh
            window.location.reload();
        } catch (error) {
            console.error('Error changing status:', error);
        } finally {
            setChangingStatusId(null);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Create CSV content
            const headers = ['Lp.', 'Nazwa', 'Kategoria', 'Dostawca', 'Ilość', 'Cena jednostkowa', 'Cena łączna', 'Status'];
            const rows = filteredItems.map((item, index) => [
                index + 1,
                item.name || '',
                item.category || '',
                item.supplier || '',
                item.quantity,
                Number(item.price).toFixed(2),
                (Number(item.price) * item.quantity).toFixed(2),
                productStatusConfig[item.status]?.label || item.status
            ]);

            // Add totals
            rows.push([]);
            rows.push(['', '', '', '', '', 'SUMA:', totals.totalCost.toFixed(2), '']);
            rows.push(['', '', '', '', '', 'Opłacono:', totals.totalPaid.toFixed(2), '']);
            rows.push(['', '', '', '', '', 'Do zapłaty:', totals.toPay.toFixed(2), '']);

            const csvContent = [
                headers.join(';'),
                ...rows.map(row => row.join(';'))
            ].join('\n');

            // Download file
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `budzet_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusConfig = (status: string) => {
        return productStatusConfig[status] || productStatusConfig['TO_ORDER'];
    };

    if (budgetItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <Wallet className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-2">Brak pozycji budżetowych</p>
                <p className="text-sm text-muted-foreground">Dodaj produkty główne, aby zobaczyć budżet</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-hidden flex flex-col relative">
            {/* Toolbar */}
            <div className="px-6 py-3 flex items-center gap-3 shrink-0 border-b border-white/5">
                {/* Search */}
                <div className="relative w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Szukaj..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#1B1B1B] border-transparent focus:border-white/10 h-[40px] pl-10 w-full text-[14px]"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex bg-[#1B1B1B] rounded-lg p-1 h-[40px] items-center">
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors h-[32px]",
                            statusFilter === "all" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                        )}
                        onClick={() => setStatusFilter("all")}
                    >
                        Wszystkie
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors h-[32px]",
                            statusFilter === "to_pay" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                        )}
                        onClick={() => setStatusFilter("to_pay")}
                    >
                        Do zapłaty
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "px-3 py-1.5 rounded-md text-[14px] font-medium transition-colors h-[32px]",
                            statusFilter === "paid" ? "bg-[#252525] text-white" : "text-muted-foreground hover:text-white"
                        )}
                        onClick={() => setStatusFilter("paid")}
                    >
                        Opłacone
                    </Button>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Export button */}
                <Button
                    variant="ghost"
                    className="h-[40px] px-4 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white flex items-center gap-2"
                    onClick={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <FileSpreadsheet className="w-4 h-4" />
                    )}
                    <span className="text-[14px]">Eksportuj</span>
                </Button>
            </div>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-0 flex flex-col">
                {filteredItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                        <Wallet className="w-16 h-16 opacity-20" />
                        <p className="text-lg">Brak elementów spełniających kryteria</p>
                    </div>
                ) : (
                    <>
                        {/* Headers Row */}
                        <div className="sticky top-0 bg-[#0E0E0E] z-20">
                            <div className="grid grid-cols-[40px_50px_60px_2fr_1fr_80px_100px_120px_1.5fr_60px] gap-4 px-6 py-3 text-[14px] font-medium text-muted-foreground items-center">
                                <div className="flex justify-center">
                                    <button
                                        onClick={toggleSelectAll}
                                        className={cn(
                                            "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                            selectedIds.size === filteredItems.length && filteredItems.length > 0
                                                ? "bg-[#6E6E6E] border-[#6E6E6E] text-white"
                                                : "bg-transparent border-[#4A4A4A] hover:border-[#6E6E6E]"
                                        )}
                                    >
                                        {selectedIds.size === filteredItems.length && filteredItems.length > 0 && (
                                            <Check className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                                <div className="text-center">#</div>
                                <div></div> {/* Image placeholder header */}
                                <div className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> Nazwa</div>
                                <div className="flex items-center gap-2"><Hash className="w-4 h-4" /> Kategoria</div>
                                <div className="text-center">Ilość</div>
                                <div className="text-right">Cena jedn.</div>
                                <div className="text-right">Cena łączna</div>
                                <div className="flex items-center gap-2 justify-end">Status</div>
                                <div></div>
                            </div>
                            <div className="mx-6 border-b border-white/5"></div>
                        </div>

                        {/* List */}
                        <div className="px-0 pb-4">
                            {filteredItems.map((item, index) => {
                                const totalPrice = Number(item.price) * item.quantity;
                                const statusInfo = getStatusConfig(item.status);
                                const isSelected = selectedIds.has(item.id);
                                const isChangingStatus = changingStatusId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            "grid grid-cols-[40px_50px_60px_2fr_1fr_80px_100px_120px_1.5fr_60px] gap-4 py-4 items-center hover:bg-[#151515] transition-colors border-b border-white/5 last:border-0 text-[14px] px-6 group",
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
                                                        ? "bg-[#6E6E6E] border-[#6E6E6E] text-white"
                                                        : "bg-transparent border-[#4A4A4A] hover:border-[#6E6E6E]"
                                                )}
                                            >
                                                {isSelected && <Check className="w-3.5 h-3.5" />}
                                            </button>
                                        </div>

                                        {/* Index */}
                                        <div className="text-center text-muted-foreground/50">{index + 1}</div>

                                        {/* Image / Icon */}
                                        <div className="flex justify-center">
                                            {item.imageUrl ? (
                                                <div className="w-12 h-12 bg-white rounded-md overflow-hidden flex items-center justify-center">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={item.imageUrl || PLACEHOLDER_IMG} alt={item.name} className="w-full h-full object-contain mix-blend-multiply p-1" />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-[#151515] rounded-md flex items-center justify-center border border-white/5">
                                                    <Hash className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium truncate">{item.name}</span>
                                            {item.supplier && (
                                                <span className="text-xs text-muted-foreground truncate">{item.supplier}</span>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div className="text-muted-foreground truncate">{item.category || "Produkt"}</div>

                                        {/* Quantity */}
                                        <div className="text-center text-white">{item.quantity}</div>

                                        {/* Unit Price */}
                                        <div className="text-right text-muted-foreground">{formatCurrency(Number(item.price))}</div>

                                        {/* Total Price */}
                                        <div className="text-right text-white font-medium">{formatCurrency(totalPrice)}</div>

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
                                                        <span className="text-[#F3F3F3] text-[14px]">{statusInfo.label}</span>
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
                                                        {Object.entries(productStatusConfig).map(([key, config]) => (
                                                            <button
                                                                key={key}
                                                                onClick={() => handleStatusChange(item, key)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-2 px-3 py-2 text-[14px] hover:bg-white/5 transition-colors",
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

                {/* Spacer to push summary to bottom if list is short */}
                <div className="mt-auto"></div>
            </div>

            {/* Summary Sticky Footer */}
            <div className="shrink-0 bg-[#0F0F0F] z-30 p-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 bg-[#151515] py-4 w-full rounded-2xl">

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#252525] flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Pozycji</div>
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

            {/* Bottom Selection Toolbar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1B1B1B] border border-white/10 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
                    <span className="text-[14px] text-white">
                        Zaznaczono: <span className="font-semibold">{selectedIds.size}</span>
                    </span>
                    <div className="h-6 w-px bg-white/10" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSelectAll}
                        className="h-8 text-[14px]"
                    >
                        Zaznacz wszystko
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="h-8 text-[14px]"
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
});
