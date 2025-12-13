"use client";

import React from "react";
import { Check, MoreHorizontal, ArrowUpRight, Package } from "lucide-react";

// Placeholder image for products without image
const PLACEHOLDER_IMG = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png";

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
}

// Status configuration
const statusConfig: Record<string, { label: string; dotColor: string }> = {
    'TO_ORDER': { label: "Do zamówienia", dotColor: "bg-[#E8B491] shadow-[0_0_8px_rgba(232,180,145,0.4)]" },
    'ORDERED': { label: "Zamówione", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'DELIVERED': { label: "Dostarczone", dotColor: "bg-[#91A3E8] shadow-[0_0_8px_rgba(145,163,232,0.5)]" },
    'PAID': { label: "Opłacone", dotColor: "bg-[#91E8B2] shadow-[0_0_8px_rgba(145,232,178,0.5)]" },
    'RETURNED': { label: "Zwrócone", dotColor: "bg-zinc-500 shadow-[0_0_8px_rgba(113,113,122,0.3)]" }
};

export function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <Package className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-2">Brak produktów w tym pomieszczeniu</p>
                <p className="text-sm text-muted-foreground">Dodaj produkty, aby je tutaj zobaczyć</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-3 p-6 pt-2">
            {products.map((product) => {
                const statusInfo = statusConfig[product.status] || statusConfig['TO_ORDER'];
                const price = Number(product.price).toLocaleString('pl-PL');
                const imageUrl = product.imageUrl || PLACEHOLDER_IMG;

                return (
                    <div key={product.id} className="bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full">
                        {/* Image Area - Fill Effect */}
                        <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                            {/* Overlay Controls */}
                            <div className="absolute top-2 left-2 z-10">
                                <div className="w-5 h-5 rounded border border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                                    {product.isInCart && <Check className="w-3 h-3 text-black" />}
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50">
                                    <MoreHorizontal className="w-4 h-4 text-black" />
                                </button>
                                {product.url && (
                                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50">
                                        <ArrowUpRight className="w-4 h-4 text-black" />
                                    </a>
                                )}
                            </div>

                            {/* Image - Object Contain (No Crop) - with padding to avoid edge touching */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imageUrl} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-4" />
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
                                    <span className="text-muted-foreground">{product.quantity}szt.</span>
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
        </div>
    );
}
