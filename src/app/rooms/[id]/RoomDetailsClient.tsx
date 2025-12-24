"use client";

import React, { useState, useRef } from "react";
import {
    Plus, LayoutGrid, MoreHorizontal, Trash2, Settings, ChevronDown, Printer, Download, Upload, Package, Users
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
import { ServicesList } from "./components/ServicesList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { uploadRoomCoverImage } from "@/app/actions/rooms";
import { useRouter } from "next/navigation";
import { CreateSprintModal } from "@/components/modals/CreateSprintModal";
import { CreateTaskModal } from "@/components/modals/CreateTaskModal";
import { AddProductModal } from "@/components/modals/AddProductModal";

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
    planningStatus: string;
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
    url: string | null;
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

interface ServiceItem {
    id: string;
    category: "MATERIAL" | "LABOR";
    planningStatus: "DRAFT" | "PLANNED" | "APPROVED" | "REJECTED";
    name: string | null;
    unit: string | null;
    quantity: number | null;
    price: number;
    imageUrl: string | null;
    url: string | null;
    materialType: string | null;
    materialStatus: string | null;
    subcontractor: string | null;
    scope: string | null;
    duration: string | null;
    laborStatus: string | null;
    notes: string | null;
    createdAt: Date;
}

interface Sprint {
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    tasks: Task[];
    _count: {
        tasks: number;
    };
}

interface AllProjectSprint {
    id: string;
    name: string;
    goal: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    roomId: string | null;
    tasks: any[];
    _count: {
        tasks: number;
    };
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
    sprints: Sprint[];
    allProjectSprints: AllProjectSprint[];
    services: ServiceItem[];
}

// Product filter type
type ProductFilterType = 'all' | 'approved' | 'not_approved';

export default function RoomDetailsClient({ roomData, products, tasks, budgetItems, galleryImages, notes, documents, history, projectSummary, sprints, allProjectSprints, services }: RoomDetailsClientProps) {
    const [activeTab, setActiveTab] = useState("Produkty");
    const [isUploading, setIsUploading] = useState(false);
    const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productFilter, setProductFilter] = useState<ProductFilterType>('all');
    const [addServiceCategory, setAddServiceCategory] = useState<"MATERIAL" | "LABOR" | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Product counts for filter badges
    const approvedCount = products.filter(p => p.planningStatus === 'APPROVED').length;
    const notApprovedCount = products.filter(p => p.planningStatus !== 'APPROVED').length;

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
                <Card className="flex-1 min-h-[300px] rounded-2xl overflow-hidden relative group p-0">
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
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                alt="Room Visualization"
                                style={{ objectFit: 'cover' }}
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
                            {["Produkty", "Usługi", "Zadania", "Dokumenty", "Budżet", "Galeria", "Notatki", "Historia"].map((tab) => (
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
                        <div className="flex items-center gap-2 text-sm font-medium w-full sm:w-auto">
                            {/* Filtruj i Sortuj - zawsze widoczne */}
                            <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors h-[40px] px-3 rounded-lg hover:bg-white/5">Filtruj <ChevronDown className="w-3 h-3" /></Button>
                            <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground hover:text-white transition-colors h-[40px] px-3 rounded-lg hover:bg-white/5">Sortuj <ChevronDown className="w-3 h-3" /></Button>

                            {/* Separator */}
                            {activeTab === "Produkty" && (
                                <div className="h-6 w-px bg-white/10 mx-2" />
                            )}

                            {/* Przyciski filtrowania produktów - tylko dla zakładki Produkty */}
                            {activeTab === "Produkty" && (
                                <>
                                    <button
                                        onClick={() => setProductFilter('all')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                            productFilter === 'all'
                                                ? "bg-white text-black"
                                                : "bg-[#232323] text-muted-foreground hover:text-white hover:bg-[#2a2a2a]"
                                        }`}
                                    >
                                        Wszystkie
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                            productFilter === 'all'
                                                ? "bg-black/10 text-black/70"
                                                : "bg-white/10 text-white/50"
                                        }`}>
                                            {products.length}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setProductFilter('approved')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                            productFilter === 'approved'
                                                ? "bg-white text-black"
                                                : "bg-[#232323] text-muted-foreground hover:text-white hover:bg-[#2a2a2a]"
                                        }`}
                                    >
                                        Zatwierdzone
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                            productFilter === 'approved'
                                                ? "bg-black/10 text-black/70"
                                                : "bg-white/10 text-white/50"
                                        }`}>
                                            {approvedCount}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setProductFilter('not_approved')}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                            productFilter === 'not_approved'
                                                ? "bg-white text-black"
                                                : "bg-[#232323] text-muted-foreground hover:text-white hover:bg-[#2a2a2a]"
                                        }`}
                                    >
                                        Bez zatwierdzonych
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                                            productFilter === 'not_approved'
                                                ? "bg-black/10 text-black/70"
                                                : "bg-white/10 text-white/50"
                                        }`}>
                                            {notApprovedCount}
                                        </span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
                            {activeTab === "Zadania" ? (
                                <>
                                    <Button
                                        onClick={() => setIsSprintModalOpen(true)}
                                        className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] shadow-sm"
                                    >
                                        <Plus className="w-5 h-5" /> Dodaj sprint
                                    </Button>
                                    <Button
                                        onClick={() => setIsTaskModalOpen(true)}
                                        className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] shadow-sm"
                                    >
                                        <Plus className="w-5 h-5" /> Dodaj zadanie
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
                            ) : activeTab === "Usługi" ? (
                                <>
                                    <Button
                                        onClick={() => setAddServiceCategory("MATERIAL")}
                                        className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <Package className="w-4 h-4" />
                                        Dodaj materiał
                                    </Button>
                                    <Button
                                        onClick={() => setAddServiceCategory("LABOR")}
                                        className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <Users className="w-4 h-4" />
                                        Dodaj robociznę
                                    </Button>
                                </>
                            ) : activeTab === "Galeria" || activeTab === "Historia" ? (
                                <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                    <MoreHorizontal className="w-5 h-5" /> Opcje
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={() => setIsProductModalOpen(true)}
                                        className="flex items-center gap-2 bg-[#232323] hover:bg-[#2a2a2a] text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm min-h-[48px]"
                                    >
                                        <Plus className="w-5 h-5" /> Dodaj produkt
                                    </Button>
                                    {products.length > 0 && (
                                        <>
                                            <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px]">
                                                <LayoutGrid className="w-5 h-5" /> Widok
                                            </Button>
                                            <Button className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#232323] text-muted-foreground hover:text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px]">
                                                <MoreHorizontal className="w-5 h-5" /> Edytuj
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
                            <ProductGrid products={products} onAddProduct={() => setIsProductModalOpen(true)} filter={productFilter} />
                        </div>
                    ) : activeTab === "Usługi" ? (
                        <ServicesList services={services} onAddService={(category) => setAddServiceCategory(category)} />
                    ) : activeTab === "Zadania" ? (
                        <TasksList
                            tasks={tasks}
                            sprints={sprints}
                            roomId={roomData.id}
                            projectId={roomData.projectId}
                            onOpenSprintModal={() => setIsSprintModalOpen(true)}
                            onOpenTaskModal={() => setIsTaskModalOpen(true)}
                        />
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

            {/* Modals */}
            <CreateSprintModal
                isOpen={isSprintModalOpen}
                onClose={() => setIsSprintModalOpen(false)}
                projectId={roomData.projectId}
                rooms={[{ id: roomData.id, name: roomData.name, type: roomData.type }]}
                defaultRoomId={roomData.id}
            />
            <CreateTaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                projectId={roomData.projectId}
                sprints={allProjectSprints.map(s => ({ ...s, roomId: s.roomId || null }))}
                defaultRoomId={roomData.id}
            />
            <AddProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                roomId={roomData.id}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
