"use client";

import React, { useState } from "react";
import {
    ClipboardList,
    Plus,
    MoreHorizontal,
    Calendar as CalendarIcon,
    Users,
    CheckCircle2,
    Clock,
    Link2,
    ChevronDown,
    Eye,
    Trash2,
    Copy,
    ExternalLink,
    FileText,
    Send
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { CreateSurveyModal } from "@/components/modals/CreateSurveyModal";
import { SurveyDetailModal } from "@/components/modals/SurveyDetailModal";
import { GenerateLinkModal } from "@/components/modals/GenerateLinkModal";
import { getSurveys, deleteSurvey } from "@/app/actions/surveys";
import { useRouter } from "next/navigation";

interface Survey {
    id: string;
    title: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    questions: any[];
    links: any[];
    _count: {
        questions: number;
        links: number;
    };
}

interface Project {
    id: string;
    name: string;
    status: string;
}

interface SurveysClientProps {
    initialSurveys: Survey[];
    projects: Project[];
    initialProjectId: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    'DRAFT': { label: 'Szkic', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    'ACTIVE': { label: 'Aktywna', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    'COMPLETED': { label: 'Zakonczona', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    'EXPIRED': { label: 'Wygasla', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' }
};

export default function SurveysClient({ initialSurveys, projects, initialProjectId }: SurveysClientProps) {
    const router = useRouter();
    const [surveys, setSurveys] = useState<Survey[]>(initialSurveys);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);
    const [surveyForLink, setSurveyForLink] = useState<Survey | null>(null);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const handleProjectChange = async (projectId: string) => {
        setSelectedProjectId(projectId);
        setIsProjectDropdownOpen(false);
        const newSurveys = await getSurveys(projectId);
        setSurveys(newSurveys);
    };

    const handleSurveyCreated = async () => {
        if (selectedProjectId) {
            const newSurveys = await getSurveys(selectedProjectId);
            setSurveys(newSurveys);
        }
        setIsCreateModalOpen(false);
    };

    const handleDeleteSurvey = async (surveyId: string) => {
        if (confirm('Czy na pewno chcesz usunac te ankiete?')) {
            await deleteSurvey(surveyId);
            if (selectedProjectId) {
                const newSurveys = await getSurveys(selectedProjectId);
                setSurveys(newSurveys);
            }
        }
        setMenuOpenId(null);
    };

    const handleViewSurvey = (survey: Survey) => {
        setSelectedSurvey(survey);
        setIsDetailModalOpen(true);
        setMenuOpenId(null);
    };

    const handleGenerateLink = (survey: Survey) => {
        setSurveyForLink(survey);
        setIsGenerateLinkModalOpen(true);
        setMenuOpenId(null);
    };

    const getCompletedLinksCount = (survey: Survey) => {
        return survey.links.filter((l: any) => l.status === 'COMPLETED').length;
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Ankiety</h1>

                    {/* Project Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                            className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-white">{selectedProject?.name || 'Wybierz projekt'}</span>
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>

                        {isProjectDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProjectDropdownOpen(false)}
                                />
                                <div className="absolute left-0 top-full mt-2 z-50 bg-[#1B1B1B] rounded-lg border border-white/10 shadow-xl py-1 min-w-[200px]">
                                    {projects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => handleProjectChange(project.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 transition-colors text-left",
                                                project.id === selectedProjectId && "bg-white/5"
                                            )}
                                        >
                                            <span className="text-white">{project.name}</span>
                                            {project.id === selectedProjectId && (
                                                <CheckCircle2 className="w-4 h-4 ml-auto text-[#91E8B2]" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!selectedProjectId}
                    className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Nowa ankieta
                </Button>
            </div>

            {/* Content */}
            {!selectedProjectId ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center">
                    <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Wybierz projekt</h3>
                    <p className="text-muted-foreground max-w-md">
                        Aby zobaczyc lub stworzyc ankiety, najpierw wybierz projekt z listy powyzej.
                    </p>
                </Card>
            ) : surveys.length === 0 ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center">
                    <ClipboardList className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Brak ankiet</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Stworz pierwsza ankiete dla tego projektu, aby poznac preferencje klienta.
                    </p>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Stworz ankiete
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {surveys.map(survey => {
                        const status = statusConfig[survey.status] || statusConfig['DRAFT'];
                        const completedCount = getCompletedLinksCount(survey);

                        return (
                            <Card
                                key={survey.id}
                                className="overflow-hidden group hover:border-zinc-600 transition-all cursor-pointer"
                                onClick={() => handleViewSurvey(survey)}
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-white truncate pr-2">{survey.title}</h3>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border shrink-0",
                                            status.color,
                                            status.bg
                                        )}>
                                            {status.label}
                                        </span>
                                    </div>
                                    {survey.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{survey.description}</p>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="p-4 bg-[#0F0F0F]">
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">{survey._count.questions}</div>
                                            <div className="text-xs text-muted-foreground">pytan</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-white">{survey._count.links}</div>
                                            <div className="text-xs text-muted-foreground">linkow</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-[#91E8B2]">{completedCount}</div>
                                            <div className="text-xs text-muted-foreground">odpowiedzi</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            {formatDate(survey.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-3 border-t border-white/5 flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateLink(survey);
                                        }}
                                        className="flex-1 h-9 text-xs"
                                    >
                                        <Send className="w-3.5 h-3.5 mr-1.5" />
                                        Wyslij do klienta
                                    </Button>
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setMenuOpenId(menuOpenId === survey.id ? null : survey.id);
                                            }}
                                            className="h-9 w-9"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>

                                        {menuOpenId === survey.id && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setMenuOpenId(null);
                                                    }}
                                                />
                                                <div className="absolute right-0 bottom-full mb-1 z-50 bg-[#1B1B1B] rounded-lg border border-white/10 shadow-xl py-1 min-w-[140px]">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewSurvey(survey);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Podglad
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteSurvey(survey.id);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Usun
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            {selectedProjectId && (
                <CreateSurveyModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    projectId={selectedProjectId}
                    onSuccess={handleSurveyCreated}
                />
            )}

            {selectedSurvey && (
                <SurveyDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedSurvey(null);
                    }}
                    survey={selectedSurvey}
                    onGenerateLink={() => {
                        setIsDetailModalOpen(false);
                        handleGenerateLink(selectedSurvey);
                    }}
                />
            )}

            {surveyForLink && (
                <GenerateLinkModal
                    isOpen={isGenerateLinkModalOpen}
                    onClose={() => {
                        setIsGenerateLinkModalOpen(false);
                        setSurveyForLink(null);
                    }}
                    surveyId={surveyForLink.id}
                    surveyTitle={surveyForLink.title}
                    onSuccess={async () => {
                        if (selectedProjectId) {
                            const newSurveys = await getSurveys(selectedProjectId);
                            setSurveys(newSurveys);
                        }
                    }}
                />
            )}
        </div>
    );
}
