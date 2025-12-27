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
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CreateSurveyModal } from "@/components/modals/CreateSurveyModal";
import { SurveyDetailModal } from "@/components/modals/SurveyDetailModal";
import { GenerateLinkModal } from "@/components/modals/GenerateLinkModal";
import { getSurveys, deleteSurvey, getSurveyById } from "@/app/actions/surveys";
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

    const handleViewSurvey = async (survey: Survey) => {
        // Fetch full survey data with responses
        const fullSurvey = await getSurveyById(survey.id);
        if (fullSurvey) {
            setSelectedSurvey(fullSurvey as any);
        } else {
            setSelectedSurvey(survey);
        }
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
        <div className="flex flex-col h-full animate-in fade-in duration-500 pb-0 overflow-hidden w-full">
            {/* Filters & Actions Row - matching rooms page style */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* Filter Bar */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto overflow-x-auto no-scrollbar">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Sortuj według</span>

                    {/* Filter Dropdowns */}
                    <div className="flex gap-2 ml-auto">
                        {/* Project Selector */}
                        <div className="relative">
                            <Button
                                variant="secondary"
                                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[180px] justify-between h-[48px]"
                            >
                                <span className="truncate">{selectedProject?.name || 'Wybierz projekt'}</span>
                                <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
                            </Button>

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

                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[110px] justify-between h-[48px]">
                            Status
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                        <Button variant="secondary" className="flex items-center gap-2 bg-[#1B1B1B] hover:bg-[#252525] text-sm px-4 py-2 rounded-lg transition-colors text-muted-foreground min-w-[140px] justify-between h-[48px]">
                            Data utworzenia
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </Button>
                    </div>
                </Card>

                {/* Add Button */}
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={!selectedProjectId}
                    className="self-center md:self-stretch h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm w-full md:w-auto"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj nową ankietę
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
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full overflow-y-auto pr-1 auto-rows-min",
                    surveys.length === 0 && "flex items-center justify-center"
                )}>
                    {surveys.map(survey => {
                        const status = statusConfig[survey.status] || statusConfig['DRAFT'];
                        const completedCount = getCompletedLinksCount(survey);

                        // Status mapping for Badge component
                        const badgeStatusMap: Record<string, 'finished' | 'in_progress' | 'not_started'> = {
                            'COMPLETED': 'finished',
                            'ACTIVE': 'in_progress',
                            'DRAFT': 'not_started',
                            'EXPIRED': 'finished'
                        };
                        const badgeStatus = badgeStatusMap[survey.status] || 'not_started';

                        return (
                            <Card
                                key={survey.id}
                                className="overflow-hidden flex flex-col p-4 gap-3 group hover:border-white/10 transition-colors w-full"
                            >
                                {/* Header Row */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-[#91E8B2] text-[#1B1B1B]">
                                            <ClipboardList className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[15px] text-white">{survey.title}</h3>
                                            <p className="text-[14px] text-muted-foreground">{formatDate(survey.createdAt)}</p>
                                        </div>
                                    </div>
                                    <Badge status={badgeStatus} dot className="bg-transparent px-0 font-medium text-[14px] gap-1.5">
                                        {status.label}
                                    </Badge>
                                </div>

                                {/* Stats Row */}
                                <div className="bg-[#1B1B1B] rounded-xl p-3">
                                    <div className="grid grid-cols-3 gap-3 text-center mb-3">
                                        <div>
                                            <div className="text-lg font-bold text-white">{survey._count.questions}</div>
                                            <div className="text-[14px] text-muted-foreground">pytań</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-white">{survey._count.links}</div>
                                            <div className="text-[14px] text-muted-foreground">linków</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-[#91E8B2]">{completedCount}</div>
                                            <div className="text-[14px] text-muted-foreground">odpowiedzi</div>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 bg-[#252525] rounded-full flex-1 overflow-hidden">
                                            <div
                                                className="h-full bg-[#91E8B2] rounded-full"
                                                style={{ width: `${survey._count.links > 0 ? Math.min((completedCount / survey._count.links) * 100, 100) : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[14px] text-muted-foreground min-w-[32px] text-right">
                                            {survey._count.links > 0 ? Math.round((completedCount / survey._count.links) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleViewSurvey(survey)}
                                        className="flex-1 bg-[#222222] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white text-sm font-medium rounded-lg transition-colors h-[40px]"
                                    >
                                        Szczegóły
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleGenerateLink(survey)}
                                        className="px-4 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium h-[40px]"
                                    >
                                        <Send className="w-4 h-4" />
                                        Wyślij
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleDeleteSurvey(survey.id)}
                                        className="px-3 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-red-400 transition-colors h-[40px]"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
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
