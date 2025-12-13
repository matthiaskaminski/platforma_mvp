"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { ChevronLeft } from "lucide-react";

const titles: Record<string, string> = {
    "/": "Dashboard",
    "/rooms": "Pomieszczenia",
    "/calendar": "Kalendarz",
    "/tasks": "Lista zadań",
    "/messages": "Korespondencja",
    "/contacts": "Kontakty",
    "/products/search": "Szukaj produktów",
    "/wishlists": "Wishlisty",
    "/cart": "Koszyk",
    "/surveys": "Ankiety",
    "/styles": "Style",
    "/moodboards": "Moodboardy",
    "/presentations": "Prezentacje",
    "/storage": "Przechowywanie",
};

interface ClientLayoutProps {
    children: React.ReactNode;
    projects?: Array<{
        id: string;
        name: string;
        icon?: string;
        color?: string;
        status: string;
    }>;
    currentProjectId?: string;
    user?: {
        email: string;
        fullName?: string;
        avatarUrl?: string;
    };
}

export function ClientLayout({
    children,
    projects = [],
    currentProjectId = '',
    user
}: ClientLayoutProps) {
    const pathname = usePathname();

    let title: React.ReactNode = titles[pathname] || "Liru";

    // Dynamic Title for Room Details
    if (pathname.startsWith("/rooms/") && pathname.split("/").length === 3) {
        title = (
            <Link href="/rooms" className="flex items-center gap-1 text-[#6E6E6E] hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Pomieszczenia
            </Link>
        );
    }

    // Dynamic Title for Wishlist Details (MVP Hardcoded Name as requested)
    if (pathname.startsWith("/wishlists/") && pathname.split("/").length === 3) {
        title = (
            <Link href="/wishlists" className="flex items-center gap-1 text-[#6E6E6E] hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Salon - Wersja Modern
            </Link>
        );
    }

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    // Full screen layout for auth and onboarding
    if (pathname === '/login' || pathname.startsWith('/onboarding')) {
        return <div className="min-h-screen bg-background">{children}</div>;
    }

    return (
        <div className="flex w-full h-screen bg-[var(--color-sidebar)] text-foreground overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                projects={projects}
                currentProjectId={currentProjectId}
                user={user}
            />

            <div className="flex-1 flex flex-col h-full min-w-0 p-4 transition-all duration-300">
                <div className="flex-1 bg-background rounded-3xl overflow-hidden flex flex-col border border-white/5 relative">
                    <div className="absolute inset-0 pointer-events-none bg-white/5 opacity-[0.02]"></div>
                    <Topbar title={title} />
                    <main className="flex-1 overflow-y-auto bg-background p-6 md:p-8 custom-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
