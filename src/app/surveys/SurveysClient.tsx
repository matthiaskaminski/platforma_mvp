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
    Send,
    MessageSquare
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
                    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full flex-1 min-h-0 overflow-y-auto pr-1",
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
                                className="overflow-hidden flex flex-col p-4 gap-5 group hover:border-white/10 transition-colors w-full min-h-[360px]"
                            >
                                {/* Header Row - like rooms */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-[#91E8B2] text-[#1B1B1B]">
                                            <ClipboardList className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[16px] text-white">{survey.title}</h3>
                                            <p className="text-sm text-muted-foreground">{formatDate(survey.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="text-muted-foreground/60">Status:</span>
                                        <Badge status={badgeStatus} dot className="bg-transparent px-0 font-semibold gap-2">
                                            {status.label}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Middle Content: Description + Info Box */}
                                <div className="flex gap-4 flex-1 min-h-0">
                                    {/* Left: Description or placeholder */}
                                    <div className="w-[45%] relative rounded-xl overflow-hidden bg-[#1B1B1B] flex items-center justify-center p-4">
                                        {survey.description ? (
                                            <p className="text-sm text-muted-foreground line-clamp-6">{survey.description}</p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-center">
                                                <MessageSquare className="w-8 h-8 text-[#6E6E6E] mb-2" />
                                                <span className="text-sm text-[#6E6E6E]">Brak opisu</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Info Box */}
                                    <div className="flex-1 bg-[#1B1B1B] rounded-xl p-4 flex flex-col justify-between">
                                        {/* Responses Badge */}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-muted-foreground">Odpowiedzi</span>
                                            <span
                                                className={cn("text-[14px] font-bold px-2 py-0.5 rounded-full min-w-[24px] text-center",
                                                    completedCount === 0 ? 'bg-[#2A2A2A] text-zinc-500' : 'bg-[#91E8B2] text-black'
                                                )}
                                            >
                                                {completedCount}
                                            </span>
                                        </div>

                                        {/* Stats Grid */}
                                        <div className="space-y-3 py-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-muted-foreground">Pytania</span>
                                                <span className="text-base font-medium">{survey._count.questions}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-muted-foreground">Wysłane linki</span>
                                                <span className="text-base font-medium">{survey._count.links}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-muted-foreground">Ukończone</span>
                                                <span className="text-base font-medium text-[#91E8B2]">{completedCount}</span>
                                            </div>
                                        </div>

                                        {/* Progress section */}
                                        <div className="space-y-1.5 pt-3 border-t border-white/5 mt-auto">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm text-muted-foreground">Postęp</span>
                                                <span className="text-base font-medium">
                                                    {survey._count.links > 0 ? Math.round((completedCount / survey._count.links) * 100) : 0}%
                                                </span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="h-2 bg-[#252525] rounded-full mt-3 overflow-hidden w-full">
                                                <div
                                                    className="h-full bg-[#91E8B2] rounded-full relative"
                                                    style={{ width: `${survey._count.links > 0 ? Math.min((completedCount / survey._count.links) * 100, 100) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Actions - like rooms */}
                                <div className="flex gap-3 mt-auto">
                                    <Button
                                        onClick={() => handleViewSurvey(survey)}
                                        className="flex-1 bg-[#222222] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white text-sm font-medium py-3 rounded-lg text-center transition-colors h-[48px]"
                                    >
                                        Szczegóły ankiety
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleGenerateLink(survey)}
                                        className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-2 text-sm font-medium h-[48px]"
                                    >
                                        <Send className="w-5 h-5" />
                                        Wyślij
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleDeleteSurvey(survey.id)}
                                        className="px-5 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium h-[48px]"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Usuń
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
