"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Check, Building, Home, Building2, Warehouse } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateProjectModal } from "./modals/CreateProjectModal";

interface Project {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    status: string;
}

interface ProjectSwitcherProps {
    projects: Project[];
    currentProjectId: string;
    onProjectChange: (projectId: string) => void;
    onCreateProject: () => void;
}

const iconMap = {
    'Home': Home,
    'Building': Building,
    'Building2': Building2,
    'Warehouse': Warehouse,
};

export function ProjectSwitcher({
    projects,
    currentProjectId,
    onProjectChange,
    onCreateProject
}: ProjectSwitcherProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const currentProject = projects.find(p => p.id === currentProjectId);
    const ProjectIcon = currentProject?.icon ? iconMap[currentProject.icon as keyof typeof iconMap] : Home;

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#0E0E0E] hover:bg-[#151515] rounded-lg transition-colors text-base min-h-[48px]"
            >
                <span className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded flex items-center justify-center text-xs"
                        style={{ backgroundColor: currentProject?.color || '#3F3F46' }}
                    >
                        {ProjectIcon && <ProjectIcon className="w-4 h-4" />}
                    </div>
                    <span className="truncate">{currentProject?.name || 'Wybierz projekt'}</span>
                </span>
                <ChevronDown className={cn(
                    "w-5 h-5 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#151515] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {/* Projects List */}
                        <div className="py-2 max-h-[300px] overflow-y-auto">
                            {projects.map((project) => {
                                const Icon = project.icon ? iconMap[project.icon as keyof typeof iconMap] : Home;
                                const isActive = project.id === currentProjectId;

                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => {
                                            onProjectChange(project.id);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#1B1B1B] transition-colors",
                                            isActive && "bg-[#1B1B1B]"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded flex items-center justify-center"
                                                style={{ backgroundColor: project.color || '#3F3F46' }}
                                            >
                                                {Icon && <Icon className="w-4 h-4" />}
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-medium">{project.name}</span>
                                                <span className="text-xs text-muted-foreground capitalize">{project.status}</span>
                                            </div>
                                        </div>
                                        {isActive && <Check className="w-4 h-4 text-primary" />}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10" />

                        {/* Create New Project */}
                        <button
                            onClick={() => {
                                setIsCreateModalOpen(true);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-[#1B1B1B] transition-colors text-sm font-medium text-primary"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Nowy projekt</span>
                        </button>
                    </div>
                </>
            )}

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}
