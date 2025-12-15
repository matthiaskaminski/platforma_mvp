"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Search, Plus, MoreHorizontal, ArrowUpRight, Share2, Printer, ChevronDown, Loader2, Trash2, Package, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getWishlistById } from "@/app/actions/wishlists";
import { deleteProduct, updateProduct } from "@/app/actions/products";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { useRouter } from "next/navigation";
import { ProductStatus } from "@prisma/client";

interface ProductItem {
    id: string;
    name: string;
    category: string | null;
    supplier: string | null;
    url: string | null;
    imageUrl: string | null;
    price: any;
    quantity: number;
    status: ProductStatus;
    createdAt: Date;
}

interface WishlistData {
    id: string;
    name: string;
    productItems: ProductItem[];
}

const statusConfig: Record<ProductStatus, { label: string; dotColor: string }> = {
    TO_ORDER: { label: "Do zamówienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    ORDERED: { label: "Zamówione", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]" },
    DELIVERED: { label: "Dostarczone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    PAID: { label: "Opłacone", dotColor: "bg-[#B291E8] shadow-[0_0_8px_rgba(178,145,232,0.4)]" },
    RETURNED: { label: "Zwrócone", dotColor: "bg-[#E89191] shadow-[0_0_8px_rgba(232,145,145,0.4)]" },
};

const allStatuses: ProductStatus[] = ["TO_ORDER", "ORDERED", "DELIVERED", "PAID", "RETURNED"];

export default function WishlistDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [wishlist, setWishlist] = useState<WishlistData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
    const [savingStatusId, setSavingStatusId] = useState<string | null>(null);

    useEffect(() => {
        loadWishlist();
    }, [resolvedParams.id]);

    const loadWishlist = async () => {
        setIsLoading(true);
        const result = await getWishlistById(resolvedParams.id);
        if (result.success && result.data) {
            setWishlist(result.data);
        }
        setIsLoading(false);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Czy na pewno chcesz usunąć ten produkt?")) return;

        setDeletingProductId(productId);
        const result = await deleteProduct(productId);
        if (result.success) {
            await loadWishlist();
        }
        setDeletingProductId(null);
    };

    const handleStatusChange = async (productId: string, newStatus: ProductStatus) => {
        setSavingStatusId(productId);
        const result = await updateProduct(productId, { status: newStatus });
        if (result.success) {
            // Update local state
            setWishlist(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    productItems: prev.productItems.map(p =>
                        p.id === productId ? { ...p, status: newStatus } : p
                    ),
                };
            });
        }
        setSavingStatusId(null);
        setEditingStatusId(null);
    };

    const filteredProducts = wishlist?.productItems.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!wishlist) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <Package className="w-16 h-16 opacity-20" />
                <p className="text-lg">Nie znaleziono wishlisty</p>
                <Link href="/wishlists">
                    <Button variant="secondary">Wróć do wishlist</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-500 overflow-hidden">

            {/* Toolbar (Sort + Actions) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* 1. Filter Bar - Card Container */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Sortuj według</span>

                    <div className="flex gap-2 ml-auto">
                        <div className="relative w-[300px] hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                            <Input
                                placeholder="Szukaj w wishliście..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-[#1B1B1B] border-transparent focus:border-white/10 h-[48px] pl-10 w-full"
                            />
                        </div>

                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Cena
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[120px] justify-between h-[48px]">
                            Nazwa
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* 2. Actions - Separate Group */}
                <div className="flex items-center gap-2 shrink-0 md:h-auto self-center md:self-stretch">
                    <Card className="p-4 h-[80px] flex items-center justify-center gap-2 px-4">
                        <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" className="h-[48px] w-[48px] rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white p-0 flex items-center justify-center">
                            <Printer className="w-5 h-5" />
                        </Button>
                    </Card>

                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Dodaj produkt
                    </Button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
                {filteredProducts.length === 0 ? (
                    <Card className="flex flex-col items-center justify-center gap-4 text-muted-foreground py-20">
                        <Package className="w-16 h-16 opacity-20" />
                        <p className="text-lg">
                            {searchQuery ? "Nie znaleziono produktów" : "Ta wishlista jest pusta"}
                        </p>
                        {!searchQuery && (
                            <Button onClick={() => setIsAddModalOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Dodaj pierwszy produkt
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {filteredProducts.map((p) => {
                            const statusInfo = statusConfig[p.status];
                            const isDeleting = deletingProductId === p.id;
                            const isEditingStatus = editingStatusId === p.id;
                            const isSavingStatus = savingStatusId === p.id;
                            const priceValue = Number(p.price);

                            return (
                                <div
                                    key={p.id}
                                    className={cn(
                                        "bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:ring-1 hover:ring-white/10 transition-all",
                                        isDeleting && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    {/* Image Area */}
                                    <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                                        {/* Overlay Controls */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                                {/* Checkbox */}
                                            </div>
                                        </div>
                                        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleDeleteProduct(p.id)}
                                                className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50"
                                                title="Usuń produkt"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="w-3 h-3 text-red-500 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                )}
                                            </button>
                                            {p.url && (
                                                <a
                                                    href={p.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                                    title="Otwórz w sklepie"
                                                >
                                                    <ExternalLink className="w-3 h-3 text-black" />
                                                </a>
                                            )}
                                        </div>

                                        {/* Image */}
                                        {p.imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={p.imageUrl}
                                                alt={p.name}
                                                className="w-full h-full object-contain mix-blend-multiply p-4"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={cn(
                                            "absolute inset-0 flex items-center justify-center",
                                            p.imageUrl ? "hidden" : ""
                                        )}>
                                            <Package className="w-12 h-12 text-gray-300" />
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex flex-col flex-1 bg-[#1B1B1B]">
                                        <h3 className="text-white text-base font-medium leading-tight mb-1 truncate">{p.name}</h3>
                                        <p className="text-muted-foreground text-sm mb-3">{p.supplier || "Nieznany producent"}</p>

                                        <div className="mt-auto">
                                            <div className="flex justify-between items-end text-sm mb-2">
                                                <span className="text-muted-foreground">{p.quantity} szt.</span>
                                                <span className="text-white font-medium text-base">
                                                    {priceValue.toLocaleString('pl-PL')} zł
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/5">
                                                <span className="text-muted-foreground">Status</span>
                                                {isEditingStatus ? (
                                                    <div className="flex flex-wrap gap-1 ml-auto">
                                                        {allStatuses.map((status) => (
                                                            <button
                                                                key={status}
                                                                onClick={() => handleStatusChange(p.id, status)}
                                                                disabled={isSavingStatus}
                                                                className={cn(
                                                                    "px-2 py-1 rounded text-xs transition-colors",
                                                                    p.status === status
                                                                        ? "bg-white/20 text-white"
                                                                        : "bg-[#252525] text-muted-foreground hover:bg-[#303030] hover:text-white"
                                                                )}
                                                            >
                                                                {statusConfig[status].label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="flex items-center gap-2 ml-auto cursor-pointer hover:opacity-80"
                                                        onClick={() => setEditingStatusId(p.id)}
                                                    >
                                                        {isSavingStatus ? (
                                                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                                        ) : (
                                                            <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></span>
                                                        )}
                                                        <span className="text-[#F3F3F3]">{statusInfo.label}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Add New Product Placeholder Card */}
                        <div
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#151515] rounded-xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all min-h-[300px] group text-muted-foreground hover:text-white"
                        >
                            <div className="w-12 h-12 rounded-full bg-[#1B1B1B] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="font-medium">Dodaj produkt</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                wishlistId={wishlist.id}
                onSuccess={loadWishlist}
            />
        </div>
    );
}
