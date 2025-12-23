"use client";

import React, { useState, useEffect } from "react";
import { X, Link2, Loader2, Package, DollarSign, Image, Building2, Tag, Hash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { scrapeProductFromUrl, createProduct, ScrapedProductData } from "@/app/actions/products";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    wishlistId?: string;
    roomId?: string;
    onSuccess?: () => void;
}

type Step = "url" | "details";

export function AddProductModal({ isOpen, onClose, wishlistId, roomId, onSuccess }: AddProductModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>("url");
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Product form state
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [supplier, setSupplier] = useState("");
    const [category, setCategory] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [productUrl, setProductUrl] = useState("");
    const [productType, setProductType] = useState<'MAIN' | 'VARIANT'>('MAIN');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep("url");
            setUrl("");
            setError(null);
            setName("");
            setPrice("");
            setImageUrl("");
            setSupplier("");
            setCategory("");
            setQuantity("1");
            setProductUrl("");
            setProductType('MAIN');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleScrape = async () => {
        if (!url.trim()) {
            setError("Wprowadź URL produktu");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await scrapeProductFromUrl(url.trim());

            if (result.success && result.data) {
                const data = result.data;
                setName(data.title || "");
                setPrice(data.price?.toString() || "");
                setImageUrl(data.imageUrl || "");
                setSupplier(data.supplier || "");
                setProductUrl(data.url);
                setStep("details");
            } else {
                setError(result.error || "Nie udało się pobrać danych produktu");
            }
        } catch (err) {
            setError("Błąd podczas pobierania danych");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkipScrape = () => {
        setStep("details");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Podaj nazwę produktu");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const result = await createProduct({
                name: name.trim(),
                price: price ? parseFloat(price) : undefined,
                imageUrl: imageUrl.trim() || undefined,
                supplier: supplier.trim() || undefined,
                url: productUrl.trim() || undefined,
                category: category.trim() || undefined,
                quantity: parseInt(quantity) || 1,
                wishlistId,
                roomId,
                // Only set planningStatus when adding to room, otherwise LIKED for wishlist
                planningStatus: roomId ? productType : 'LIKED',
            });

            if (result.success) {
                router.refresh();
                onSuccess?.();
                onClose();
            } else {
                setError(result.error || "Nie udało się dodać produktu");
            }
        } catch (err) {
            setError("Błąd podczas dodawania produktu");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isLoading && !isSubmitting) {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#151515] rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-[#151515] z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#1B1B1B] rounded-lg">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold">
                            {step === "url" ? "Dodaj produkt z linku" : "Szczegóły produktu"}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                        disabled={isLoading || isSubmitting}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === "url" ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Link do produktu
                                </label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                    <Input
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://www.sklep.pl/produkt..."
                                        disabled={isLoading}
                                        className="pl-10"
                                        onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Wklej link do produktu ze sklepu internetowego. Automatycznie pobierzemy nazwę, cenę i zdjęcie.
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-between gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleSkipScrape}
                                    disabled={isLoading}
                                    className="text-muted-foreground"
                                >
                                    Dodaj ręcznie
                                </Button>
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handleClose}
                                        disabled={isLoading}
                                    >
                                        Anuluj
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleScrape}
                                        disabled={isLoading || !url.trim()}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Pobieranie...
                                            </>
                                        ) : (
                                            "Pobierz dane"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Preview Image */}
                            {imageUrl && (
                                <div className="aspect-video bg-white rounded-xl overflow-hidden flex items-center justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imageUrl}
                                        alt={name}
                                        className="max-w-full max-h-full object-contain p-4"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Nazwa produktu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nazwa produktu"
                                        disabled={isSubmitting}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Price & Quantity */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Cena (PLN)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            placeholder="0.00"
                                            disabled={isSubmitting}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Ilość
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder="1"
                                            disabled={isSubmitting}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Supplier & Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Producent / Sklep
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                        <Input
                                            value={supplier}
                                            onChange={(e) => setSupplier(e.target.value)}
                                            placeholder="np. IKEA, Westwing"
                                            disabled={isSubmitting}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Kategoria
                                    </label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                        <Input
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            placeholder="np. Meble, Oświetlenie"
                                            disabled={isSubmitting}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    URL zdjęcia
                                </label>
                                <div className="relative">
                                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                    <Input
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        disabled={isSubmitting}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Product URL */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Link do produktu
                                </label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                                    <Input
                                        value={productUrl}
                                        onChange={(e) => setProductUrl(e.target.value)}
                                        placeholder="https://www.sklep.pl/produkt..."
                                        disabled={isSubmitting}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Product Type - only show when adding to room */}
                            {roomId && (
                                <div>
                                    <label className="block text-sm font-medium mb-3">
                                        Typ produktu
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setProductType('MAIN')}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-xl transition-all text-left",
                                                productType === 'MAIN'
                                                    ? "bg-amber-500/20 ring-1 ring-amber-500/50"
                                                    : "bg-[#1B1B1B] hover:bg-[#252525]"
                                            )}
                                        >
                                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                                            <div>
                                                <p className="font-medium text-white">Główny</p>
                                                <p className="text-xs text-muted-foreground">Wliczany do budżetu</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProductType('VARIANT')}
                                            className={cn(
                                                "flex items-center gap-3 p-4 rounded-xl transition-all text-left",
                                                productType === 'VARIANT'
                                                    ? "bg-blue-500/20 ring-1 ring-blue-500/50"
                                                    : "bg-[#1B1B1B] hover:bg-[#252525]"
                                            )}
                                        >
                                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span>
                                            <div>
                                                <p className="font-medium text-white">Wariant</p>
                                                <p className="text-xs text-muted-foreground">Alternatywa</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setStep("url")}
                                    disabled={isSubmitting}
                                >
                                    Wstecz
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !name.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Dodawanie...
                                        </>
                                    ) : (
                                        "Dodaj produkt"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}
