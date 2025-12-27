"use client";

import React, { useState } from "react";
import {
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Send,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitSurveyResponses } from "@/app/actions/surveys";

interface Question {
    id: string;
    category: string | null;
    question: string;
    type: string;
    options: any; // JsonValue from Prisma
    isRequired: boolean;
    order: number;
}

interface SurveyData {
    id: string;
    survey: {
        id: string;
        title: string;
        description: string | null;
        questions: Question[];
        project: {
            name: string;
            designer: {
                fullName: string | null;
                studioName: string | null;
            };
        };
    };
    clientName: string | null;
}

interface SurveyClientPageProps {
    surveyData: SurveyData;
    token: string;
}

type Answers = Record<string, string | string[]>;

export default function SurveyClientPage({ surveyData, token }: SurveyClientPageProps) {
    const { survey } = surveyData;
    const questions = survey.questions;

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentQuestion = questions[currentStep];
    const isLastQuestion = currentStep === questions.length - 1;
    const progress = ((currentStep + 1) / questions.length) * 100;

    const designerName = survey.project.designer.studioName || survey.project.designer.fullName || 'Projektant';

    const handleSingleChoice = (option: string) => {
        setAnswers({ ...answers, [currentQuestion.id]: option });
    };

    const handleMultipleChoice = (option: string) => {
        const currentAnswers = (answers[currentQuestion.id] as string[]) || [];
        if (currentAnswers.includes(option)) {
            setAnswers({
                ...answers,
                [currentQuestion.id]: currentAnswers.filter(a => a !== option)
            });
        } else {
            setAnswers({
                ...answers,
                [currentQuestion.id]: [...currentAnswers, option]
            });
        }
    };

    const handleTextAnswer = (text: string) => {
        setAnswers({ ...answers, [currentQuestion.id]: text });
    };

    const handleScaleAnswer = (value: number) => {
        setAnswers({ ...answers, [currentQuestion.id]: String(value) });
    };

    const canProceed = () => {
        if (!currentQuestion.isRequired) return true;
        const answer = answers[currentQuestion.id];
        if (!answer) return false;
        if (Array.isArray(answer) && answer.length === 0) return false;
        if (typeof answer === 'string' && answer.trim() === '') return false;
        return true;
    };

    const handleNext = () => {
        if (isLastQuestion) {
            handleSubmit();
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const responses = Object.entries(answers).map(([questionId, answer]) => ({
                questionId,
                answer: answer as string | string[]
            }));

            const result = await submitSurveyResponses(token, responses);

            if (result.success) {
                setIsCompleted(true);
            } else {
                setError(result.error || 'Wystapil blad podczas wysylania odpowiedzi');
            }
        } catch (err) {
            setError('Wystapil blad podczas wysylania odpowiedzi');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Completed state
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-[#0F0F0F] rounded-2xl border border-white/10 p-8 text-center">
                    <div className="w-20 h-20 bg-[#91E8B2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-[#91E8B2]" />
                    </div>
                    <h1 className="text-2xl font-semibold text-white mb-3">
                        Dziekujemy!
                    </h1>
                    <p className="text-muted-foreground mb-6">
                        Twoje odpowiedzi zostaly wyslane do {designerName}.
                        Projektant skontaktuje sie z Toba wkrotce.
                    </p>
                    <div className="bg-[#1B1B1B] rounded-lg p-4 text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Projekt</p>
                        <p className="text-white font-medium">{survey.project.name}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
            {/* Header */}
            <header className="shrink-0 border-b border-white/5 bg-[#0F0F0F]">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Ankieta od {designerName}
                            </p>
                            <h1 className="text-lg font-semibold text-white">{survey.title}</h1>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-white font-medium">
                                {currentStep + 1} / {questions.length}
                            </p>
                            <p className="text-xs text-muted-foreground">pytan</p>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1 bg-[#1B1B1B] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#91E8B2] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    {/* Category badge */}
                    {currentQuestion.category && (
                        <div className="mb-4">
                            <span className="text-xs font-medium text-[#91E8B2] px-3 py-1 bg-[#91E8B2]/10 rounded-full">
                                {currentQuestion.category}
                            </span>
                        </div>
                    )}

                    {/* Question */}
                    <h2 className="text-2xl font-semibold text-white mb-8">
                        {currentQuestion.question}
                        {currentQuestion.isRequired && <span className="text-red-400 ml-1">*</span>}
                    </h2>

                    {/* Answer options */}
                    <div className="space-y-3">
                        {currentQuestion.type === 'SINGLE_CHOICE' && currentQuestion.options && (
                            (currentQuestion.options as string[]).map((option: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSingleChoice(option)}
                                    className={cn(
                                        "w-full text-left p-4 rounded-xl border-2 transition-all",
                                        answers[currentQuestion.id] === option
                                            ? "bg-[#91E8B2]/10 border-[#91E8B2] text-white"
                                            : "bg-[#0F0F0F] border-white/10 text-white hover:border-white/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                                            answers[currentQuestion.id] === option
                                                ? "border-[#91E8B2] bg-[#91E8B2]"
                                                : "border-white/30"
                                        )}>
                                            {answers[currentQuestion.id] === option && (
                                                <div className="w-2 h-2 bg-black rounded-full" />
                                            )}
                                        </div>
                                        <span className="text-[15px]">{option}</span>
                                    </div>
                                </button>
                            ))
                        )}

                        {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                            <>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Mozesz wybrac kilka opcji
                                </p>
                                {(currentQuestion.options as string[]).map((option: string, idx: number) => {
                                    const selected = ((answers[currentQuestion.id] as string[]) || []).includes(option);
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleMultipleChoice(option)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-xl border-2 transition-all",
                                                selected
                                                    ? "bg-[#91E8B2]/10 border-[#91E8B2] text-white"
                                                    : "bg-[#0F0F0F] border-white/10 text-white hover:border-white/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                                                    selected
                                                        ? "border-[#91E8B2] bg-[#91E8B2]"
                                                        : "border-white/30"
                                                )}>
                                                    {selected && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                                                    )}
                                                </div>
                                                <span className="text-[15px]">{option}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </>
                        )}

                        {currentQuestion.type === 'TEXT' && (
                            <textarea
                                value={(answers[currentQuestion.id] as string) || ''}
                                onChange={(e) => handleTextAnswer(e.target.value)}
                                placeholder="Wpisz swoja odpowiedz..."
                                rows={4}
                                className="w-full bg-[#0F0F0F] border-2 border-white/10 rounded-xl p-4 text-white placeholder:text-muted-foreground focus:outline-none focus:border-[#91E8B2] resize-none"
                            />
                        )}

                        {currentQuestion.type === 'SCALE' && (
                            <div className="flex justify-between gap-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                                    <button
                                        key={value}
                                        onClick={() => handleScaleAnswer(value)}
                                        className={cn(
                                            "flex-1 aspect-square rounded-xl border-2 flex items-center justify-center text-lg font-medium transition-all",
                                            answers[currentQuestion.id] === String(value)
                                                ? "bg-[#91E8B2] border-[#91E8B2] text-black"
                                                : "bg-[#0F0F0F] border-white/10 text-white hover:border-white/30"
                                        )}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer navigation */}
            <footer className="shrink-0 border-t border-white/5 bg-[#0F0F0F]">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                            currentStep === 0
                                ? "text-muted-foreground/50 cursor-not-allowed"
                                : "text-white hover:bg-white/5"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Wstecz
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || isSubmitting}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all",
                            canProceed() && !isSubmitting
                                ? "bg-[#91E8B2] text-black hover:bg-[#7dd4a0]"
                                : "bg-[#91E8B2]/30 text-black/50 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Wysylanie...
                            </>
                        ) : isLastQuestion ? (
                            <>
                                <Send className="w-4 h-4" />
                                Wyslij odpowiedzi
                            </>
                        ) : (
                            <>
                                Dalej
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </footer>
        </div>
    );
}
