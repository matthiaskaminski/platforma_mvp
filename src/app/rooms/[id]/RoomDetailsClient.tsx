"use client";

import React, { useState, useRef } from "react";
import {
    Plus, LayoutGrid, MoreHorizontal, Trash2, Settings, ChevronDown, Printer, Download, Upload
} from "lucide-react";
import { RoomStatsDnD } from "./components/RoomStatsDnD";
import { SummaryAccordion } from "./components/SummaryAccordion";
import { ProductGrid } from "./components/ProductGrid";
import { TasksList } from "./components/TasksList";
import { DocumentsGrid } from "./components/DocumentsGrid";
import { BudgetList } from "./components/BudgetList";
import { GalleryGrid } from "./components/GalleryGrid";
import { NotesList } from "./components/NotesList";
import { HistoryList } from "./components/HistoryList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { uploadRoomCoverImage } from "@/app/actions/rooms";
import { useRouter } from "next/navigation";

const ROOM_IMG_PLACEHOLDER = "https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/526853319_1355299613265765_6668356102677043657_n.jpg";

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

interface Task {
    id: string;
    title: string;
    status: string;
    assignedTo: string | null;
    dueDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

interface BudgetItem {
    id: string;
    name: string;
    category: string | null;
    supplier: string | null;
    imageUrl: string | null;
    price: any;
    quantity: number;
    paidAmount: any;
    status: string;
}

interface GalleryImage {
    id: string;
    url: string;
    caption: string | null;
    createdAt: Date;
}

interface Note {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

interface Document {
    id: string;
    name: string;
    url: string;
    type: string | null;
    size: number | null;
    uploadedAt: Date;
}

interface HistoryItem {
    id: string;
    type: string;
    action: string;
    target: string;
    timestamp: Date;
    icon: string;
}

interface ProjectSummary {
    budgetGoal: any;
    rooms: {
        productItems: {
            price: any;
            quantity: number;
            paidAmount: any;
            category: string | null;
        }[];
    }[];
    tasks: {
        id: string;
        title: string;
        status: string;
        dueDate: Date | null;
    }[];
}

interface RoomDetailsClientProps {
    roomData: {
        id: string;
        name: string;
        type: string;
        status: string;
        area: number | null;
        floorNumber: number | null;
        tasksCount: number;
        productsCount: number;
        coverImage: string | null;
        projectId: string;
        projectCoverImage: string | null;
    };
    products: Product[];
    tasks: Task[];
    budgetItems: BudgetItem[];
    galleryImages: GalleryImage[];
    notes: Note[];
    documents: Document[];
    history: HistoryItem[];
    projectSummary: ProjectSummary | null;
}

export default function RoomDetailsClient({ roomData, products, tasks, budgetItems, galleryImages, notes, documents, history, projectSummary }: RoomDetailsClientProps) {
    const [activeTab, setActiveTab] = useState("Produkty");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Proszę wybrać plik graficzny');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Plik jest zbyt duży. Maksymalny rozmiar to 5MB');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            await uploadRoomCoverImage(roomData.id, formData);
            router.refresh();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Wystąpił błąd podczas przesyłania zdjęcia');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-3 w-full overflow-hidden">

            {/* Left Column: Stats & Image */}
            <div className="w-full lg:w-[420px] flex flex-col shrink-0 h-full overflow-y-auto no-scrollbar gap-3">

                {/* 1. Drag & Drop Stats Grid */}
                <RoomStatsDnD roomData={roomData} />

                {/* 2. Big Image Tile - Room Cover Image - Fills remaining height */}
                <Card className="flex-1 min-h-[300px] rounded-2xl overflow-hidden relative group">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                    {roomData.coverImage ? (
                        <>
                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md w-auto h-auto"
                                    onClick={handleUploadClick}
                                    disabled={isUploading}
                                >
                                    <Settings className="w-5 h-5" />
                                </Button>
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={roomData.coverImage}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt="Room Visualization"
                            />
                        </>
                    ) : (
                        <button
                            onClick={handleUploadClick}
                            disabled={isUploading}
                            className="w-full h-full flex flex-col items-center justify-center bg-[#151515] p-8 hover:bg-[#1B1B1B] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#1B1B1B] flex items-center justify-center mb-4">
                                {isUploading ? (
                                    <Upload className="w-8 h-8 text-muted-foreground animate-pulse" />
                                ) : (
                                    <Plus className="w-8 h-8 text-muted-foreground" />
                                )}
                            </div>
                            <p className="text-white font-medium mb-2">
                                {isUploading ? 'Przesyłanie...' : 'Dodaj zdjęcie pomieszczenia'}
                            </p>
                            <p className="text-sm text-muted-foreground text-center max-w-xs">
                                Kliknij aby dodać zdjęcie wizualizacji dla tego pomieszczenia
                            </p>
                        </button>
                    )}
                </Card>
            </div>

            {/* Right Column: Summary & content */}
            <div className="flex-1 flex flex-col min-w-0 h-full gap-3 overflow-hidden">

                {/* 1. Collapsible Summary Bar */}
                <SummaryAccordion projectSummary={projectSummary} />

                {/* 2. Main Content Container */}
                <div className="flex-1 flex flex-col min-h-0">

                    {/* Tabs Header */}
                    <div className="pt-2 shrink-0 relative px-6">
                        <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground overflow-x-auto no-scrollbar border-b border-white/5">
                            {["Produkty", "Zadania", "Dokumenty", "Budżet", "Galeria", "Notatki", "Historia"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-4 transition-colors relative whitespace-nowrap text-sm font-medium translate-y-[1px] border-b-2
                                        ${activeTab === tab
                                            ? "text-white border-white"
                                            : "text-muted-foreground hover:text-white border-transparent"
                                        }
                                    `}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground w-full sm:w-auto">
                            <Button variant="ghost" className="flex items-center gap-1 hover:text-white transition-colors h-[48px] px-3 rounded-lg hover:bg-white/5">Filtruj <ChevronDown className="w-3 h-3" /></Button>
                            <Button variant="ghost" className="flex items-center gap-1 hover:text-white transition-colors h-[48px] px-3 rounded-lg hover:bg-white/5">Sortuj <ChevronDown className="w-3 h-3" /></Button>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                            {activeTab === "Zadania" ? (
                                <>
                                    <Button className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]">
                                        <Plus className="w-5 h-5" /> Dodaj nowe zadanie
                                    </Button>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px]">
                                        <LayoutGrid className="w-5 h-5" /> Widok
                                    </Button>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                        <MoreHorizontal className="w-5 h-5" /> Edytuj
                                    </Button>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                        <Trash2 className="w-5 h-5" /> Usuń
                                    </Button>
                                </>
                            ) : activeTab === "Dokumenty" ? (
                                <>
                                    <Button className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]">
                                        <Plus className="w-5 h-5" /> Dodaj dokument
                                    </Button>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px]">
                                        <LayoutGrid className="w-5 h-5" /> Widok
                                    </Button>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                        <MoreHorizontal className="w-5 h-5" /> Edytuj
                                    </Button>
                                </>
                            ) : activeTab === "Budżet" ? (
                                <>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px]">
                                        <Printer className="w-5 h-5" /> Drukuj
                                    </Button>
                                    <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px]">
                                        <Download className="w-5 h-5" /> Eksportuj CSV
                                    </Button>
                                </>
                            ) : activeTab === "Notatki" ? (
                                <Button className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]">
                                    <Plus className="w-5 h-5" /> Dodaj notatkę
                                </Button>
                            ) : activeTab === "Galeria" || activeTab === "Historia" ? (
                                <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                    <MoreHorizontal className="w-5 h-5" /> Opcje
                                </Button>
                            ) : (
                                <>
                                    {products.length === 0 ? (
                                        <Button className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]">
                                            <Plus className="w-5 h-5" /> Dodaj produkty
                                        </Button>
                                    ) : (
                                        <>
                                            <Button className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]">
                                                <Plus className="w-5 h-5" /> Stwórz prezentację
                                            </Button>
                                            <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px]">
                                                <LayoutGrid className="w-5 h-5" /> Dodaj do koszyka
                                            </Button>
                                            <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                                <MoreHorizontal className="w-5 h-5" /> Edytuj
                                            </Button>
                                            <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                                <Trash2 className="w-5 h-5" /> Usuń
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content Viewer */}
                    {activeTab === "Produkty" ? (
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <ProductGrid products={products} />
                        </div>
                    ) : activeTab === "Zadania" ? (
                        <TasksList tasks={tasks} />
                    ) : activeTab === "Dokumenty" ? (
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <DocumentsGrid documents={documents} />
                        </div>
                    ) : activeTab === "Budżet" ? (
                        <BudgetList budgetItems={budgetItems} />
                    ) : activeTab === "Galeria" ? (
                        <GalleryGrid galleryImages={galleryImages} />
                    ) : activeTab === "Notatki" ? (
                        <NotesList notes={notes} />
                    ) : activeTab === "Historia" ? (
                        <HistoryList history={history} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <p className="mb-2">Widok dla zakładki {activeTab} jest w trakcie budowy.</p>
                                <Button
                                    onClick={() => setActiveTab("Produkty")}
                                    className="text-sm bg-[#232323] px-3 py-1 rounded-full text-white hover:bg-[#2a2a2a] transition-colors h-auto"
                                >
                                    Przełącz na Produkty
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
