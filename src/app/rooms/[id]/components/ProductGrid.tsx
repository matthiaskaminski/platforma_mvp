"use client";

import React, { useState } from "react";
import { Check, MoreHorizontal, Package, Plus, Trash2, Loader2, ExternalLink } from "lucide-react";
import { deleteProduct } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
    status: string;
}

interface ProductGridProps {
    products: Product[];
    onAddProduct?: () => void;
}

// Status configuration
const statusConfig: Record<string, { label: string; dotColor: string }> = {
    'TO_ORDER': { label: "Do zamówienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'ORDERED': { label: "Zamówione", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.4)]" },
    'DELIVERED': { label: "Dostarczone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'PAID': { label: "Opłacone", dotColor: "bg-[#B291E8] shadow-[0_0_8px_rgba(178,145,232,0.4)]" },
    'RETURNED': { label: "Zwrócone", dotColor: "bg-[#E89191] shadow-[0_0_8px_rgba(232,145,145,0.4)]" }
};

export const ProductGrid = React.memo(function ProductGrid({ products, onAddProduct }: ProductGridProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 p-6 pt-2">
            {products.map((product) => {
                const statusInfo = statusConfig[product.status] || statusConfig['TO_ORDER'];
                const price = Number(product.price).toLocaleString('pl-PL');
                const isDeleting = deletingId === product.id;

                return (
                    <div
                        key={product.id}
                        className={cn(
                            "bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:ring-1 hover:ring-white/10 transition-all",
                            isDeleting && "opacity-50 pointer-events-none"
                        )}
                    >
                        {/* Image Area - Fill Effect */}
                        <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                            {/* Overlay Controls */}
                            <div className="absolute top-2 left-2 z-10">
                                <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                    {product.isInCart && <Check className="w-3 h-3 text-black" />}
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(product.id);
                                    }}
                                    className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50"
                                    title="Usuń produkt"
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
                                        title="Otwórz w sklepie"
                                    >
                                        <ExternalLink className="w-3 h-3 text-black" />
                                    </a>
                                )}
                            </div>

                            {/* Image - Object Contain (No Crop) - with padding to avoid edge touching */}
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
                                    <span className="text-white font-medium text-base">{price} zł</span>
                                </div>

                                <div className="flex items-center gap-2 text-sm pt-2 border-t border-white/5">
                                    <span className="text-muted-foreground">Status</span>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></span>
                                        <span className="text-[#F3F3F3]">{statusInfo.label}</span>
                                    </div>
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
    );
});
