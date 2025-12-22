"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Search, Plus, Share2, Printer, ChevronDown, Loader2, Trash2, Package, ExternalLink, Home, Heart, MoveRight, Star, Layers, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getWishlistById } from "@/app/actions/wishlists";
import { deleteProduct, moveProductToRoom } from "@/app/actions/products";
import { getActiveProjectRooms } from "@/app/actions/rooms";
import { AddProductModal } from "@/components/modals/AddProductModal";
import { useRouter } from "next/navigation";
import { ProductPlanningStatus } from "@prisma/client";

interface ProductItem {
    id: string;
    name: string;
    category: string | null;
    supplier: string | null;
    url: string | null;
    imageUrl: string | null;
    price: any;
    quantity: number;
    planningStatus: ProductPlanningStatus;
    createdAt: Date;
}

interface WishlistData {
    id: string;
    name: string;
    productItems: ProductItem[];
}

interface Room {
    id: string;
    name: string;
    type: string;
    coverImage: string | null;
}

export default function WishlistDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [wishlist, setWishlist] = useState<WishlistData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [movingProductId, setMovingProductId] = useState<string | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [selectedProductForMove, setSelectedProductForMove] = useState<string | null>(null);
    const [moveStep, setMoveStep] = useState<'type' | 'room'>('type');
    const [selectedProductType, setSelectedProductType] = useState<'MAIN' | 'VARIANT' | null>(null);

    useEffect(() => {
        loadWishlist();
        loadRooms();
    }, [resolvedParams.id]);

    const loadWishlist = async () => {
        setIsLoading(true);
        const result = await getWishlistById(resolvedParams.id);
        if (result.success && result.data) {
            setWishlist(result.data);
        }
        setIsLoading(false);
    };

    const loadRooms = async () => {
        const roomsData = await getActiveProjectRooms();
        setRooms(roomsData);
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm("Czy na pewno chcesz usunac ten produkt?")) return;

        setDeletingProductId(productId);
        const result = await deleteProduct(productId);
        if (result.success) {
            await loadWishlist();
        }
        setDeletingProductId(null);
    };

    const handleMoveToRoom = async (productId: string, roomId: string) => {
        if (!selectedProductType) return;
        setMovingProductId(productId);
        const result = await moveProductToRoom(productId, roomId, selectedProductType);
        if (result.success) {
            await loadWishlist();
            closeMoveModal();
        }
        setMovingProductId(null);
    };

    const openMoveModal = (productId: string) => {
        setSelectedProductForMove(productId);
        setMoveStep('type');
        setSelectedProductType(null);
        setShowMoveModal(true);
    };

    const closeMoveModal = () => {
        setShowMoveModal(false);
        setSelectedProductForMove(null);
        setMoveStep('type');
        setSelectedProductType(null);
    };

    const handleSelectProductType = (type: 'MAIN' | 'VARIANT') => {
        setSelectedProductType(type);
        setMoveStep('room');
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
                            const isDeleting = deletingProductId === p.id;
                            const isMoving = movingProductId === p.id;
                            const priceValue = Number(p.price);

                            return (
                                <div
                                    key={p.id}
                                    className={cn(
                                        "bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:ring-1 hover:ring-white/10 transition-all",
                                        (isDeleting || isMoving) && "opacity-50 pointer-events-none"
                                    )}
                                >
                                    {/* Image Area */}
                                    <div className="aspect-square bg-white relative flex items-center justify-center overflow-hidden">
                                        {/* Status Badge */}
                                        <div className="absolute top-2 left-2 z-10">
                                            <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/90 rounded-full text-white text-xs font-medium">
                                                <Heart className="w-3 h-3 fill-current" />
                                                Polubione
                                            </div>
                                        </div>
                                        {/* Overlay Controls */}
                                        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openMoveModal(p.id)}
                                                className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-blue-50"
                                                title="Przenies do pomieszczenia"
                                            >
                                                <MoveRight className="w-3 h-3 text-blue-500" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(p.id)}
                                                className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50"
                                                title="Usun produkt"
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
                                                    title="Otworz w sklepie"
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
                                                    {priceValue.toLocaleString('pl-PL')} zl
                                                </span>
                                            </div>

                                            {/* Move to room button */}
                                            <button
                                                onClick={() => openMoveModal(p.id)}
                                                className="w-full flex items-center justify-center gap-2 text-sm pt-2 mt-2 border-t border-white/5 text-muted-foreground hover:text-white transition-colors"
                                            >
                                                <Home className="w-4 h-4" />
                                                Przenies do pomieszczenia
                                            </button>
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

            {/* Move to Room Modal */}
            {showMoveModal && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-50"
                        onClick={closeMoveModal}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#151515] rounded-2xl p-6 w-full max-w-md shadow-xl border border-white/10">
                        {moveStep === 'type' ? (
                            <>
                                <h3 className="text-lg font-semibold text-white mb-2">Wybierz typ produktu</h3>
                                <p className="text-muted-foreground text-sm mb-6">Czy ten produkt ma byc glowny czy wariantem?</p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleSelectProductType('MAIN')}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] transition-colors text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Glowny</p>
                                            <p className="text-sm text-muted-foreground">Produkt wliczany do budzetu estymacyjnego</p>
                                        </div>
                                        <MoveRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                                    </button>

                                    <button
                                        onClick={() => handleSelectProductType('VARIANT')}
                                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] transition-colors text-left group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium">Wariant</p>
                                            <p className="text-sm text-muted-foreground">Alternatywa produktu glownego</p>
                                        </div>
                                        <MoveRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                                    </button>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={closeMoveModal}
                                    >
                                        Anuluj
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <button
                                        onClick={() => setMoveStep('type')}
                                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                    <h3 className="text-lg font-semibold text-white">Wybierz pomieszczenie</h3>
                                </div>

                                <div className="flex items-center gap-2 mb-4 px-2 py-1.5 bg-[#1B1B1B] rounded-lg">
                                    <span className={cn(
                                        "w-2.5 h-2.5 rounded-full",
                                        selectedProductType === 'MAIN'
                                            ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                            : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                                    )}></span>
                                    <span className="text-sm text-muted-foreground">
                                        Typ: <span className="text-white">{selectedProductType === 'MAIN' ? 'Glowny' : 'Wariant'}</span>
                                    </span>
                                </div>

                                {rooms.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground mb-4">Brak pomieszczen w projekcie</p>
                                        <Link href="/rooms">
                                            <Button>Utworz pomieszczenie</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {rooms.map((room) => (
                                            <button
                                                key={room.id}
                                                onClick={() => selectedProductForMove && handleMoveToRoom(selectedProductForMove, room.id)}
                                                disabled={movingProductId !== null}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1B1B1B] hover:bg-[#252525] transition-colors text-left"
                                            >
                                                {room.coverImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={room.coverImage} alt={room.name} className="w-12 h-12 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-[#252525] flex items-center justify-center">
                                                        <Home className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{room.name}</p>
                                                    <p className="text-sm text-muted-foreground capitalize">{room.type.toLowerCase().replace('_', ' ')}</p>
                                                </div>
                                                {movingProductId === selectedProductForMove ? (
                                                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                                                ) : (
                                                    <MoveRight className="w-5 h-5 text-muted-foreground" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <Button
                                        variant="secondary"
                                        className="w-full"
                                        onClick={closeMoveModal}
                                    >
                                        Anuluj
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
