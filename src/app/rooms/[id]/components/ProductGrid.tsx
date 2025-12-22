"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, Package, Plus, Trash2, Loader2, ExternalLink, X, RefreshCw, StickyNote, Star, Layers, CheckCircle, XCircle } from "lucide-react";
import { deleteProduct, updateProduct, refreshProduct, approveProduct, rejectProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ProductPlanningStatus } from "@prisma/client";

interface Product {
    id: string;
    name: string;
    category: string | null;
    supplier: string | null;
    url: string | null;
    imageUrl: string | null;
    price: any;
    quantity: number;
    paidAmount: any;
    isInCart: boolean;
    planningStatus: string;
    status: string;
    notes?: string | null;
}

interface ProductGridProps {
    products: Product[];
    onAddProduct?: () => void;
}

// Planning status configuration (for room - Main/Variant)
const planningStatusConfig: Record<string, { label: string; dotColor: string; bgColor: string; icon: any }> = {
    'LIKED': { label: "Polubiony", dotColor: "bg-pink-500", bgColor: "bg-pink-500/20", icon: null },
    'MAIN': { label: "Glowny", dotColor: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]", bgColor: "bg-amber-500/20", icon: Star },
    'VARIANT': { label: "Wariant", dotColor: "bg-blue-500", bgColor: "bg-blue-500/20", icon: Layers },
    'APPROVED': { label: "Zatwierdzony", dotColor: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]", bgColor: "bg-emerald-500/20", icon: CheckCircle },
    'REJECTED': { label: "Odrzucony", dotColor: "bg-red-500", bgColor: "bg-red-500/20", icon: XCircle }
};

// Fulfillment status configuration (for approved products)
const statusConfig: Record<string, { label: string; dotColor: string }> = {
    'TO_ORDER': { label: "Do zamowienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'ORDERED': { label: "Zamowione", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]" },
    'PAID': { label: "Oplacone", dotColor: "bg-[#B291E8] shadow-[0_0_8px_rgba(178,145,232,0.4)]" },
    'DELIVERED': { label: "Dostarczone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'RETURNED': { label: "Zwrocone", dotColor: "bg-[#E89191] shadow-[0_0_8px_rgba(232,145,145,0.4)]" }
};

const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
    value,
    label: config.label,
    dotColor: config.dotColor
}));

// Only MAIN and VARIANT for room selection
const planningOptions = [
    { value: 'MAIN', label: 'Glowny', dotColor: planningStatusConfig.MAIN.dotColor },
    { value: 'VARIANT', label: 'Wariant', dotColor: planningStatusConfig.VARIANT.dotColor }
];

// Status Dropdown Component
function StatusDropdown({
    currentStatus,
    onStatusChange,
    disabled
}: {
    currentStatus: string;
    onStatusChange: (status: string) => void;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const statusInfo = statusConfig[currentStatus] || statusConfig['TO_ORDER'];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Status trigger - looks like plain text, no button styling */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) setIsOpen(!isOpen);
                }}
                disabled={disabled}
                className={cn(
                    "flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></span>
                <span className="text-[#F3F3F3]">{statusInfo.label}</span>
            </button>

            {/* Dropdown menu - opens UPWARD and to the RIGHT to avoid being clipped */}
            {isOpen && (
                <div className="fixed w-48 bg-[#1B1B1B] border border-white/10 rounded-lg shadow-2xl py-1"
                    style={{
                        zIndex: 9999,
                        transform: 'translateY(-100%) translateY(-8px)'
                    }}
                >
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(option.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#232323] transition-colors text-left",
                                currentStatus === option.value && "bg-[#232323]"
                            )}
                        >
                            <span className={`w-2.5 h-2.5 rounded-full ${option.dotColor}`}></span>
                            <span className="text-[#F3F3F3] text-sm">{option.label}</span>
                            {currentStatus === option.value && (
                                <Check className="w-4 h-4 text-white ml-auto" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Planning Status Dropdown Component (Main/Variant)
function PlanningStatusDropdown({
    currentStatus,
    onStatusChange,
    disabled
}: {
    currentStatus: string;
    onStatusChange: (status: string) => void;
    disabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const statusInfo = planningStatusConfig[currentStatus] || planningStatusConfig['VARIANT'];
    const IconComponent = statusInfo.icon;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Don't allow changing if approved or rejected
    if (currentStatus === 'APPROVED' || currentStatus === 'REJECTED') {
        return (
            <div className="flex items-center gap-2">
                {IconComponent && <IconComponent className="w-4 h-4 text-current" />}
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></span>
                <span className="text-[#F3F3F3]">{statusInfo.label}</span>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) setIsOpen(!isOpen);
                }}
                disabled={disabled}
                className={cn(
                    "flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity",
                    disabled && "opacity-50 cursor-not-allowed"
                )}
            >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></span>
                <span className="text-[#F3F3F3]">{statusInfo.label}</span>
            </button>

            {isOpen && (
                <div className="fixed w-48 bg-[#1B1B1B] border border-white/10 rounded-lg shadow-2xl py-1"
                    style={{
                        zIndex: 9999,
                        transform: 'translateY(-100%) translateY(-8px)'
                    }}
                >
                    {planningOptions.map((option) => {
                        const OptionIcon = planningStatusConfig[option.value]?.icon;
                        return (
                            <button
                                key={option.value}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#232323] transition-colors text-left",
                                    currentStatus === option.value && "bg-[#232323]"
                                )}
                            >
                                {OptionIcon && <OptionIcon className="w-4 h-4" />}
                                <span className={`w-2.5 h-2.5 rounded-full ${option.dotColor}`}></span>
                                <span className="text-[#F3F3F3] text-sm">{option.label}</span>
                                {currentStatus === option.value && (
                                    <Check className="w-4 h-4 text-white ml-auto" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Product Edit Sidebar Component
function ProductEditSidebar({
    product,
    isOpen,
    onClose,
    onUpdate
}: {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}) {
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        quantity: 1,
        supplier: '',
        category: '',
        notes: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: Number(product.price) || 0,
                quantity: product.quantity || 1,
                supplier: product.supplier || '',
                category: product.category || '',
                notes: product.notes || ''
            });
        }
    }, [product]);

    const handleSave = async () => {
        if (!product) return;
        setIsSaving(true);
        try {
            const result = await updateProduct(product.id, {
                name: formData.name,
                price: formData.price,
                quantity: formData.quantity,
                supplier: formData.supplier || undefined,
                category: formData.category || undefined,
                notes: formData.notes || undefined
            });
            if (result.success) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefresh = async () => {
        if (!product) return;
        setIsRefreshing(true);
        try {
            const result = await refreshProduct(product.id);
            if (result.success) {
                onUpdate();
            } else {
                alert(result.error || "Nie udało się odświeżyć produktu");
            }
        } catch (error) {
            console.error("Error refreshing product:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!product) return;
        try {
            const result = await updateProduct(product.id, { status: newStatus as any });
            if (result.success) {
                onUpdate();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (!product) return null;

    const statusInfo = statusConfig[product.status] || statusConfig['TO_ORDER'];

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-md bg-[#151515] border-l border-white/5 z-50 flex flex-col transition-transform duration-300 ease-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
                    <h2 className="text-lg font-medium">Edycja produktu</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Product Image */}
                    <div className="aspect-video bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain p-4"
                            />
                        ) : (
                            <Package className="w-16 h-16 text-gray-300" />
                        )}
                    </div>

                    {/* Refresh Button */}
                    {product.url && (
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="w-full flex items-center justify-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white"
                        >
                            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                            {isRefreshing ? "Odświeżanie..." : "Odśwież dane ze strony"}
                        </Button>
                    )}

                    {/* Planning Status (Main/Variant) */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Typ produktu</label>
                        <PlanningStatusDropdown
                            currentStatus={product.planningStatus}
                            onStatusChange={async (status) => {
                                const result = await updateProduct(product.id, { planningStatus: status as any });
                                if (result.success) onUpdate();
                            }}
                        />
                    </div>

                    {/* Approve/Reject Buttons - only for MAIN products that are not yet approved/rejected */}
                    {(product.planningStatus === 'MAIN' || product.planningStatus === 'VARIANT') && (
                        <div className="flex gap-2">
                            <Button
                                onClick={async () => {
                                    const result = await approveProduct(product.id);
                                    if (result.success) {
                                        onUpdate();
                                        onClose();
                                    }
                                }}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Zatwierdz
                            </Button>
                            <Button
                                onClick={async () => {
                                    const result = await rejectProduct(product.id);
                                    if (result.success) {
                                        onUpdate();
                                        onClose();
                                    }
                                }}
                                variant="secondary"
                                className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border-red-600/30"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Odrzuc
                            </Button>
                        </div>
                    )}

                    {/* Fulfillment Status - only for APPROVED products */}
                    {product.planningStatus === 'APPROVED' && (
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Status realizacji</label>
                            <StatusDropdown
                                currentStatus={product.status}
                                onStatusChange={handleStatusChange}
                            />
                        </div>
                    )}

                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Nazwa produktu</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Price & Quantity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Cena (zł)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Ilość</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                            />
                        </div>
                    </div>

                    {/* Supplier */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Dostawca / Marka</label>
                        <input
                            type="text"
                            value={formData.supplier}
                            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Kategoria</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                            <StickyNote className="w-4 h-4" />
                            Notatki
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={4}
                            placeholder="Dodaj notatki do produktu..."
                            className="w-full px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20 resize-none"
                        />
                    </div>

                    {/* URL */}
                    {product.url && (
                        <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Link do sklepu</label>
                            <a
                                href={product.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2.5 bg-[#1B1B1B] border border-white/10 rounded-lg text-blue-400 hover:text-blue-300 transition-colors truncate"
                            >
                                <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate text-sm">{product.url}</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-white/5 flex gap-3 shrink-0">
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1 bg-[#232323] hover:bg-[#2a2a2a]"
                    >
                        Anuluj
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-white text-black hover:bg-gray-100"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zapisz"}
                    </Button>
                </div>
            </div>
        </>
    );
}

export const ProductGrid = React.memo(function ProductGrid({ products, onAddProduct }: ProductGridProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleDelete = async (productId: string) => {
        if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) return;

        setDeletingId(productId);
        try {
            const result = await deleteProduct(productId);
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        setTimeout(() => setSelectedProduct(null), 300);
    };

    const handleStatusChange = async (productId: string, newStatus: string) => {
        try {
            const result = await updateProduct(productId, { status: newStatus as any });
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <Package className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-2">Brak produktów w tym pomieszczeniu</p>
                <p className="text-sm text-muted-foreground mb-4">Dodaj produkty, aby je tutaj zobaczyć</p>
                {onAddProduct && (
                    <button
                        onClick={onAddProduct}
                        className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Dodaj produkt
                    </button>
                )}
            </div>
        );
    }

    const handlePlanningStatusChange = async (productId: string, newStatus: string) => {
        try {
            const result = await updateProduct(productId, { planningStatus: newStatus as any });
            if (result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error updating planning status:", error);
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 p-6 pt-2">
                {products.map((product) => {
                    const planningInfo = planningStatusConfig[product.planningStatus] || planningStatusConfig['VARIANT'];
                    const fulfillmentInfo = statusConfig[product.status] || statusConfig['TO_ORDER'];
                    const PlanningIcon = planningInfo.icon;
                    const price = Number(product.price).toLocaleString('pl-PL');
                    const isDeleting = deletingId === product.id;
                    const isApproved = product.planningStatus === 'APPROVED';
                    const isRejected = product.planningStatus === 'REJECTED';

                    return (
                        <div
                            key={product.id}
                            onClick={() => handleProductClick(product)}
                            className={cn(
                                "bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:ring-1 hover:ring-white/10 transition-all",
                                isDeleting && "opacity-50 pointer-events-none",
                                isRejected && "opacity-60"
                            )}
                        >
                            {/* Image Area */}
                            <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                                {/* Planning Status Badge */}
                                <div className="absolute top-2 left-2 z-10">
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                        planningInfo.bgColor,
                                        product.planningStatus === 'MAIN' && "text-amber-400",
                                        product.planningStatus === 'VARIANT' && "text-blue-400",
                                        product.planningStatus === 'APPROVED' && "text-emerald-400",
                                        product.planningStatus === 'REJECTED' && "text-red-400"
                                    )}>
                                        {PlanningIcon && <PlanningIcon className="w-3 h-3" />}
                                        {planningInfo.label}
                                    </div>
                                </div>
                                {/* Overlay Controls */}
                                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(product.id);
                                        }}
                                        className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50"
                                        title="Usun produkt"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3 h-3 text-red-500" />
                                        )}
                                    </button>
                                    {product.url && (
                                        <a
                                            href={product.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                            title="Otworz w sklepie"
                                        >
                                            <ExternalLink className="w-3 h-3 text-black" />
                                        </a>
                                    )}
                                </div>

                                {/* Image */}
                                {product.imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-contain mix-blend-multiply p-4"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <Package className="w-12 h-12 text-gray-300" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-3 flex flex-col flex-1 bg-[#1B1B1B]">
                                <h3 className="text-white text-base font-medium leading-tight mb-1 truncate" title={product.name}>
                                    {product.name}
                                </h3>
                                <p className="text-muted-foreground text-sm mb-3">
                                    {product.supplier || product.category || 'Brak dostawcy'}
                                </p>

                                <div className="mt-auto">
                                    <div className="flex justify-between items-end text-sm mb-2">
                                        <span className="text-muted-foreground">{product.quantity} szt.</span>
                                        <span className="text-white font-medium text-base">{price} zl</span>
                                    </div>

                                    {/* Planning Status or Fulfillment Status */}
                                    <div
                                        className="flex items-center gap-2 text-sm pt-2 border-t border-white/5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {isApproved ? (
                                            // Show fulfillment status for approved products
                                            <>
                                                <span className="text-muted-foreground">Realizacja</span>
                                                <div className="ml-auto">
                                                    <StatusDropdown
                                                        currentStatus={product.status}
                                                        onStatusChange={(status) => handleStatusChange(product.id, status)}
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            // Show planning status selector for non-approved products
                                            <>
                                                <span className="text-muted-foreground">Typ</span>
                                                <div className="ml-auto">
                                                    <PlanningStatusDropdown
                                                        currentStatus={product.planningStatus}
                                                        onStatusChange={(status) => handlePlanningStatusChange(product.id, status)}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add Product Card */}
                {onAddProduct && (
                    <div
                        onClick={onAddProduct}
                        className="bg-[#151515] rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all min-h-[300px] group text-muted-foreground hover:text-white"
                    >
                        <div className="w-12 h-12 rounded-full bg-[#1B1B1B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-medium">Dodaj produkt</span>
                    </div>
                )}
            </div>

            {/* Product Edit Sidebar */}
            <ProductEditSidebar
                product={selectedProduct}
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                onUpdate={() => router.refresh()}
            />
        </>
    );
});
