"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Armchair,
    Calendar,
    ListTodo,
    Mail,
    Users,
    Search,
    Heart,
    ShoppingCart,
    ClipboardList,
    Palette,
    Image as ImageIcon,
    MonitorPlay,
    Archive,
    PanelLeft
} from "lucide-react";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { UserMenu } from "./UserMenu";
import { setActiveProject } from "@/app/actions/projects";
import { logout } from "@/app/actions/auth";

const sidebarData = [
    {
        title: "PROJEKT",
        items: [
            { name: "Dashboard", icon: LayoutDashboard, href: "/" },
            { name: "Pomieszczenia", icon: Armchair, href: "/rooms" },
            { name: "Kalendarz", icon: Calendar, href: "/calendar" },
            { name: "Lista zadań", icon: ListTodo, href: "/tasks", badge: 2 },
            { name: "Korespondencja", icon: Mail, href: "/messages", badge: 3 },
            { name: "Kontakty", icon: Users, href: "/contacts" },
        ],
    },
    {
        title: "PRODUKTY",
        items: [
            { name: "Szukaj produktów", icon: Search, href: "/products/search" },
            { name: "Wishlisty", icon: Heart, href: "/wishlists" },
            { name: "Koszyk", icon: ShoppingCart, href: "/cart" },
        ],
    },
    {
        title: "INTERAKCJA Z KLIENTEM",
        items: [
            { name: "Ankiety", icon: ClipboardList, href: "/surveys" },
            { name: "Style", icon: Palette, href: "/styles" },
            { name: "Moodboardy", icon: ImageIcon, href: "/moodboards" },
            { name: "Prezentacje", icon: MonitorPlay, href: "/presentations" },
        ],
    },
    {
        title: "NADZÓR",
        items: [
            { name: "Przechowywanie", icon: Archive, href: "/storage" },
        ],
    },
];

interface SidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
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

export function Sidebar({
    isOpen = true,
    onToggle,
    projects = [],
    currentProjectId = '',
    user
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleProjectChange = async (projectId: string) => {
        await setActiveProject(projectId);
        router.refresh();
    };

    const handleCreateProject = () => {
        router.push('/onboarding');
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className={cn(
            "h-screen bg-[var(--color-sidebar)] flex flex-col font-sans transition-all duration-300",
            isOpen ? "w-[280px]" : "w-[60px]" // Reduced to 60px for icon only
        )}>
            {/* Logo Area */}
            <div className={cn("h-20 shrink-0 flex items-center transition-all px-4", isOpen ? "justify-between" : "justify-center !px-0")}>
                {isOpen && (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300 min-w-0">
                        <img src="https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/liru%20logo.svg" alt="Liru" className="h-8 w-auto" />
                    </div>
                )}

                <button
                    onClick={onToggle}
                    className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                    <PanelLeft className="w-5 h-5" />
                </button>
            </div>

            {/* Content Container - Hidden when closed */}
            <div className={cn(
                "flex-1 flex flex-col min-h-0 transition-opacity duration-200 overflow-hidden",
                isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                {/* Fixed width wrapper to prevent content squashing during transition */}
                <div className="w-[280px] flex flex-col h-full">
                    {/* Project Selector - Only visible when open */}
                    <div className="px-4 mb-6 mt-4">
                        <ProjectSwitcher
                            projects={projects}
                            currentProjectId={currentProjectId}
                            onProjectChange={handleProjectChange}
                            onCreateProject={handleCreateProject}
                        />
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-8 no-scrollbar">
                        {sidebarData.map((section) => (
                            <div key={section.title}>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-2 tracking-wider">
                                    {section.title}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center justify-between px-3 py-3 rounded-lg text-[16px] transition-colors duration-300 group min-h-[48px]",
                                                        isActive
                                                            ? "bg-[#0E0E0E] text-primary"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-[#151515]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={cn("w-5 h-5 transition-colors duration-300", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {item.badge && (
                                                        <span className="bg-white text-black text-sm font-bold px-2 py-0.5 rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* User Profile */}
                    <div className="p-4 border-t border-border mt-auto">
                        {user && (
                            <UserMenu
                                user={user}
                                onLogout={handleLogout}
                                onSettings={() => router.push('/settings')}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
