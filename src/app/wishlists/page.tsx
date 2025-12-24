"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, MoreHorizontal, Heart, ChevronDown, Edit3, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { getWishlists, createWishlist, deleteWishlist, updateWishlist } from "@/app/actions/wishlists";

interface WishlistData {
    id: string;
    name: string;
    createdAt: Date;
    productCount: number;
    totalBudget: number;
    totalSpent: number;
    coverImage: string | null;
}

const statusConfig = {
    completed: { label: "Skompletowane", color: "text-[#B2B2B2]", dot: "bg-[#B2B2B2]" },
    in_progress: { label: "W trakcie", color: "text-[#91E8B2]", dot: "bg-[#91E8B2]" },
    not_started: { label: "Planowane", color: "text-[#91A3E8]", dot: "bg-[#91A3E8]" },
};

function getWishlistStatus(totalBudget: number, totalSpent: number): "completed" | "in_progress" | "not_started" {
    if (totalBudget === 0) return "not_started";
    if (totalSpent >= totalBudget) return "completed";
    if (totalSpent > 0) return "in_progress";
    return "not_started";
}

export default function WishlistsPage() {
    const [wishlists, setWishlists] = useState<WishlistData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [newWishlistName, setNewWishlistName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadWishlists();
    }, []);

    const loadWishlists = async () => {
        setIsLoading(true);
        const result = await getWishlists();
        if (result.success && result.data) {
            setWishlists(result.data);
        }
        setIsLoading(false);
    };

    const handleCreateWishlist = async () => {
        if (!newWishlistName.trim()) return;

        setIsCreating(true);
        const result = await createWishlist(newWishlistName.trim());
        if (result.success) {
            setNewWishlistName("");
            setShowCreateInput(false);
            await loadWishlists();
        }
        setIsCreating(false);
    };

    const handleUpdateWishlist = async (id: string) => {
        if (!editingName.trim()) return;

        const result = await updateWishlist(id, { name: editingName.trim() });
        if (result.success) {
            setEditingId(null);
            setEditingName("");
            await loadWishlists();
        }
    };

    const handleDeleteWishlist = async (id: string) => {
        if (!confirm("Czy na pewno chcesz usunąć tę wishlistę? Wszystkie produkty zostaną usunięte.")) return;

        setDeletingId(id);
        const result = await deleteWishlist(id);
        if (result.success) {
            await loadWishlists();
        }
        setDeletingId(null);
    };

    const startEditing = (wishlist: WishlistData) => {
        setEditingId(wishlist.id);
        setEditingName(wishlist.name);
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

            {/* Filters & Actions Row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* 1. Filter Bar - Separate Container */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Sortuj według</span>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2 ml-auto">
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[160px] justify-between h-[48px]">
                            Nazwa wishlisty
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[140px] justify-between h-[48px]">
                            Data utworzenia
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Budżet
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* 2. Add Button - Separate Element */}
                {showCreateInput ? (
                    <Card className="h-[80px] px-4 rounded-2xl flex items-center gap-3">
                        <Input
                            value={newWishlistName}
                            onChange={(e) => setNewWishlistName(e.target.value)}
                            placeholder="Nazwa nowej wishlisty..."
                            className="w-[250px]"
                            onKeyDown={(e) => e.key === "Enter" && handleCreateWishlist()}
                            autoFocus
                        />
                        <Button
                            onClick={handleCreateWishlist}
                            disabled={isCreating || !newWishlistName.trim()}
                            className="whitespace-nowrap"
                        >
                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Utwórz"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowCreateInput(false);
                                setNewWishlistName("");
                            }}
                        >
                            Anuluj
                        </Button>
                    </Card>
                ) : (
                    <Button
                        onClick={() => setShowCreateInput(true)}
                        className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm self-center md:self-stretch"
                    >
                        <Plus className="w-5 h-5" />
                        Stwórz nową wishlistę
                    </Button>
                )}
            </div>

            {/* Grid */}
            {wishlists.length === 0 ? (
                <Card className="flex-1 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                    <Heart className="w-16 h-16 opacity-20" />
                    <p className="text-lg">Nie masz jeszcze żadnych wishlist</p>
                    <Button onClick={() => setShowCreateInput(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Stwórz pierwszą wishlistę
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full flex-1 min-h-0 overflow-y-auto">
                    {wishlists.map((list) => {
                        const statusKey = getWishlistStatus(list.totalBudget, list.totalSpent);
                        const status = statusConfig[statusKey];
                        const formattedDate = new Date(list.createdAt).toLocaleDateString('pl-PL');
                        const isDeleting = deletingId === list.id;

                        return (
                            <Card key={list.id} className={cn(
                                "overflow-hidden flex flex-col p-4 gap-5 group hover:border-white/10 transition-colors w-full h-[400px]",
                                isDeleting && "opacity-50 pointer-events-none"
                            )}>
                                {/* Header Row */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#1B1B1B] rounded-xl text-white/70">
                                            <Heart className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                {editingId === list.id ? (
                                                    <Input
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleUpdateWishlist(list.id);
                                                            if (e.key === "Escape") {
                                                                setEditingId(null);
                                                                setEditingName("");
                                                            }
                                                        }}
                                                        onBlur={() => handleUpdateWishlist(list.id)}
                                                        className="h-7 text-base font-semibold"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <>
                                                        <h3 className="font-semibold text-[16px] text-white">{list.name}</h3>
                                                        <Edit3
                                                            className="w-4 h-4 text-muted-foreground/40 cursor-pointer hover:text-white transition-colors"
                                                            onClick={() => startEditing(list)}
                                                        />
                                                    </>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{formattedDate}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="text-muted-foreground/60">Status:</span>
                                        <Badge status={statusKey} dot className="bg-transparent px-0 font-semibold gap-2">
                                            {status.label}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Middle Content: Image + Info Box */}
                                <div className="flex gap-4 flex-1 min-h-0">
                                    {/* Left: Image */}
                                    <div className="w-[45%] relative rounded-xl overflow-hidden bg-zinc-800">
                                        <div className="absolute inset-0 bg-neutral-800 group-hover:scale-105 transition-transform duration-700">
                                            {list.coverImage ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={list.coverImage}
                                                    alt={list.name}
                                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Heart className="w-12 h-12 text-white/10" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Info Box */}
                                    <div className="flex-1 bg-[#1B1B1B] rounded-xl p-4 flex flex-col justify-between">
                                        {/* Products Count */}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-muted-foreground">Produktów</span>
                                            <span className={cn("text-[14px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                                                list.productCount === 0 ? 'bg-[#2A2A2A] text-zinc-500' : 'bg-white text-black'
                                            )}>
                                                {list.productCount}
                                            </span>
                                        </div>

                                        {/* Budget Stats */}
                                        <div className="space-y-1.5 pt-3 border-t border-white/5 mt-auto">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-muted-foreground">Budżet</span>
                                                <span className="text-base font-medium">{list.totalBudget.toLocaleString('pl-PL')} zł</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Actions */}
                                <div className="flex gap-3 mt-auto">
                                    <Link href={`/wishlists/${list.id}`} className="flex-1">
                                        <Button className="w-full bg-[#222222] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white text-sm font-medium py-3 rounded-lg text-center transition-colors h-[48px]">
                                            Przejdź do listy
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="secondary"
                                        className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-2 text-sm font-medium h-[48px]"
                                        onClick={() => startEditing(list)}
                                    >
                                        <MoreHorizontal className="w-5 h-5" />
                                        Edytuj
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium h-[48px]"
                                        onClick={() => handleDeleteWishlist(list.id)}
                                        disabled={isDeleting}
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                        Usuń
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
