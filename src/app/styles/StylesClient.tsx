"use client";

import React, { useState } from "react";
import {
    Palette,
    Plus,
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronDown,
    Trash2,
    Send,
    Image as ImageIcon
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { CreateStyleModal } from "@/components/modals/CreateStyleModal";
import { StyleDetailModal } from "@/components/modals/StyleDetailModal";
import { GenerateStyleLinkModal } from "@/components/modals/GenerateStyleLinkModal";
import { getStyleQuizzes, deleteStyleQuiz, getStyleQuizById } from "@/app/actions/styles";

interface StyleCategory {
    id: string;
    name: string;
    description: string | null;
    order: number;
    images: {
        id: string;
        imageUrl: string;
        caption: string | null;
        order: number;
    }[];
}

interface StyleQuiz {
    id: string;
    title: string;
    description: string | null;
    instruction: string | null;
    logoUrl: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    categories: StyleCategory[];
    links: any[];
    _count: {
        categories: number;
        links: number;
    };
}

interface Project {
    id: string;
    name: string;
    status: string;
}

interface StylesClientProps {
    initialQuizzes: StyleQuiz[];
    projects: Project[];
    initialProjectId: string | null;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    'DRAFT': { label: 'Szkic', color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
    'ACTIVE': { label: 'Aktywny', color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    'COMPLETED': { label: 'Zakończony', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    'EXPIRED': { label: 'Wygasły', color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' }
};

export default function StylesClient({ initialQuizzes, projects, initialProjectId }: StylesClientProps) {
    const [quizzes, setQuizzes] = useState<StyleQuiz[]>(initialQuizzes);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<StyleQuiz | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isGenerateLinkModalOpen, setIsGenerateLinkModalOpen] = useState(false);
    const [quizForLink, setQuizForLink] = useState<StyleQuiz | null>(null);

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    const handleProjectChange = async (projectId: string) => {
        setSelectedProjectId(projectId);
        setIsProjectDropdownOpen(false);
        const newQuizzes = await getStyleQuizzes(projectId);
        setQuizzes(newQuizzes);
    };

    const handleQuizCreated = async () => {
        if (selectedProjectId) {
            const newQuizzes = await getStyleQuizzes(selectedProjectId);
            setQuizzes(newQuizzes);
        }
        setIsCreateModalOpen(false);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (confirm('Czy na pewno chcesz usunąć ten quiz stylów?')) {
            await deleteStyleQuiz(quizId);
            if (selectedProjectId) {
                const newQuizzes = await getStyleQuizzes(selectedProjectId);
                setQuizzes(newQuizzes);
            }
        }
    };

    const handleViewQuiz = async (quiz: StyleQuiz) => {
        // Fetch full quiz data with selections
        const fullQuiz = await getStyleQuizById(quiz.id);
        if (fullQuiz) {
            setSelectedQuiz(fullQuiz as any);
        } else {
            setSelectedQuiz(quiz);
        }
        setIsDetailModalOpen(true);
    };

    const handleGenerateLink = (quiz: StyleQuiz) => {
        setQuizForLink(quiz);
        setIsGenerateLinkModalOpen(true);
    };

    const getCompletedLinksCount = (quiz: StyleQuiz) => {
        return quiz.links.filter((l: any) => l.status === 'COMPLETED').length;
    };

    const getTotalImagesCount = (quiz: StyleQuiz) => {
        return quiz.categories.reduce((sum, cat) => sum + cat.images.length, 0);
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
            {/* Filters & Actions Row */}
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
                    Dodaj nowy quiz stylów
                </Button>
            </div>

            {/* Content */}
            {!selectedProjectId ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center">
                    <Palette className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Wybierz projekt</h3>
                    <p className="text-muted-foreground max-w-md">
                        Aby zobaczyć lub stworzyć quiz stylów, najpierw wybierz projekt z listy powyżej.
                    </p>
                </Card>
            ) : quizzes.length === 0 ? (
                <Card className="p-12 flex flex-col items-center justify-center text-center">
                    <Palette className="w-16 h-16 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">Brak quizów stylów</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Stwórz pierwszy quiz stylów dla tego projektu, aby poznać preferencje wizualne klienta.
                    </p>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Stwórz quiz stylów
                    </Button>
                </Card>
            ) : (
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full overflow-y-auto pr-1 auto-rows-min",
                    quizzes.length === 0 && "flex items-center justify-center"
                )}>
                    {quizzes.map(quiz => {
                        const status = statusConfig[quiz.status] || statusConfig['DRAFT'];
                        const completedCount = getCompletedLinksCount(quiz);
                        const totalImages = getTotalImagesCount(quiz);

                        // Status mapping for Badge component
                        const badgeStatusMap: Record<string, 'finished' | 'in_progress' | 'not_started'> = {
                            'COMPLETED': 'finished',
                            'ACTIVE': 'in_progress',
                            'DRAFT': 'not_started',
                            'EXPIRED': 'finished'
                        };
                        const badgeStatus = badgeStatusMap[quiz.status] || 'not_started';

                        return (
                            <Card
                                key={quiz.id}
                                className="overflow-hidden flex flex-col p-4 gap-3 group hover:border-white/10 transition-colors w-full"
                            >
                                {/* Header Row */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-[#91E8B2] text-[#1B1B1B]">
                                            <Palette className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[15px] text-white">{quiz.title}</h3>
                                            <p className="text-[14px] text-muted-foreground">{formatDate(quiz.createdAt)}</p>
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
                                            <div className="text-lg font-bold text-white">{quiz._count.categories}</div>
                                            <div className="text-[14px] text-muted-foreground">kategorii</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-white">{totalImages}</div>
                                            <div className="text-[14px] text-muted-foreground">zdjęć</div>
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
                                                style={{ width: `${quiz._count.links > 0 ? Math.min((completedCount / quiz._count.links) * 100, 100) : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-[14px] text-muted-foreground min-w-[32px] text-right">
                                            {quiz._count.links > 0 ? Math.round((completedCount / quiz._count.links) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Bottom Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleViewQuiz(quiz)}
                                        className="flex-1 bg-[#222222] hover:bg-[#2a2a2a] text-zinc-300 hover:text-white text-sm font-medium rounded-lg transition-colors h-[40px]"
                                    >
                                        Szczegóły
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleGenerateLink(quiz)}
                                        className="px-4 bg-[#1B1B1B] hover:bg-[#252525] rounded-lg text-muted-foreground hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium h-[40px]"
                                    >
                                        <Send className="w-4 h-4" />
                                        Wyślij
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleDeleteQuiz(quiz.id)}
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
                <CreateStyleModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    projectId={selectedProjectId}
                    onSuccess={handleQuizCreated}
                />
            )}

            {selectedQuiz && (
                <StyleDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedQuiz(null);
                    }}
                    quiz={selectedQuiz}
                    onGenerateLink={() => {
                        setIsDetailModalOpen(false);
                        handleGenerateLink(selectedQuiz);
                    }}
                />
            )}

            {quizForLink && (
                <GenerateStyleLinkModal
                    isOpen={isGenerateLinkModalOpen}
                    onClose={() => {
                        setIsGenerateLinkModalOpen(false);
                        setQuizForLink(null);
                    }}
                    quizId={quizForLink.id}
                    quizTitle={quizForLink.title}
                    onSuccess={async () => {
                        if (selectedProjectId) {
                            const newQuizzes = await getStyleQuizzes(selectedProjectId);
                            setQuizzes(newQuizzes);
                        }
                    }}
                />
            )}
        </div>
    );
}
