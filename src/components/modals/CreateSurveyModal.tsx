"use client";

import React, { useState } from "react";
import {
    X,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Lightbulb,
    Home,
    UtensilsCrossed,
    Bath,
    Sofa,
    BedDouble,
    Settings2,
    GripVertical
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { createSurvey } from "@/app/actions/surveys";
import { PRESET_QUESTIONS } from "@/lib/survey-presets";

interface CreateSurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onSuccess: () => void;
}

interface Question {
    id: string;
    category?: string;
    question: string;
    type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'SCALE';
    options: string[];
    isRequired: boolean;
}

const categoryIcons: Record<string, React.ReactNode> = {
    'Oswietlenie': <Lightbulb className="w-4 h-4" />,
    'Lazienka': <Bath className="w-4 h-4" />,
    'Kuchnia': <UtensilsCrossed className="w-4 h-4" />,
    'Salon': <Sofa className="w-4 h-4" />,
    'Sypialnia': <BedDouble className="w-4 h-4" />,
    'Ogolne': <Home className="w-4 h-4" />,
};

const questionTypeLabels: Record<string, string> = {
    'SINGLE_CHOICE': 'Pojedynczy wybor',
    'MULTIPLE_CHOICE': 'Wielokrotny wybor',
    'TEXT': 'Tekst',
    'SCALE': 'Skala'
};

export function CreateSurveyModal({ isOpen, onClose, projectId, onSuccess }: CreateSurveyModalProps) {
    const [step, setStep] = useState<'info' | 'questions'>('info');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setStep('info');
        setTitle('');
        setDescription('');
        setQuestions([]);
        setExpandedCategories(new Set());
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const toggleCategory = (category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    };

    const addPresetQuestion = (category: string, presetQ: any) => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            category,
            question: presetQ.question,
            type: presetQ.type,
            options: presetQ.options || [],
            isRequired: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const addCustomQuestion = () => {
        const newQuestion: Question = {
            id: crypto.randomUUID(),
            category: 'Wlasne',
            question: '',
            type: 'SINGLE_CHOICE',
            options: [''],
            isRequired: true
        };
        setQuestions([...questions, newQuestion]);
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, ...updates } : q
        ));
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const addOption = (questionId: string) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: [...q.options, ''] }
                : q
        ));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: q.options.map((o, i) => i === optionIndex ? value : o) }
                : q
        ));
    };

    const removeOption = (questionId: string, optionIndex: number) => {
        setQuestions(questions.map(q =>
            q.id === questionId
                ? { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
                : q
        ));
    };

    const isQuestionFromPreset = (question: Question) => {
        for (const categoryKey of Object.keys(PRESET_QUESTIONS)) {
            const category = PRESET_QUESTIONS[categoryKey as keyof typeof PRESET_QUESTIONS];
            for (const presetQ of category.questions) {
                if (presetQ.question === question.question) {
                    return true;
                }
            }
        }
        return false;
    };

    const handleSubmit = async () => {
        if (!title.trim() || questions.length === 0) return;

        setIsSubmitting(true);
        try {
            const result = await createSurvey({
                projectId,
                title: title.trim(),
                description: description.trim() || undefined,
                questions: questions.map(q => ({
                    category: q.category,
                    question: q.question,
                    type: q.type,
                    options: q.options.filter(o => o.trim()),
                    isRequired: q.isRequired
                }))
            });

            if (result.success) {
                onSuccess();
                handleClose();
            }
        } catch (error) {
            console.error('Error creating survey:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            <div className="relative bg-[#0F0F0F] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {step === 'info' ? 'Nowa ankieta' : 'Dodaj pytania'}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {step === 'info'
                                ? 'Podaj nazwe i opis ankiety'
                                : 'Wybierz gotowe pytania lub dodaj wlasne'
                            }
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'info' ? (
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Nazwa ankiety *
                                </label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="np. Ankieta funkcjonalna - Apartament Mokotow"
                                    className="bg-[#1B1B1B] border-white/10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Opis (opcjonalnie)
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Krotki opis ankiety dla klienta..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-[#1B1B1B] border border-white/10 rounded-lg text-white placeholder:text-muted-foreground focus:outline-none focus:border-white/20 resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Preset Questions */}
                            <div>
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                                    Gotowe pytania
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(PRESET_QUESTIONS).map(([key, category]) => (
                                        <div key={key} className="bg-[#1B1B1B] rounded-lg border border-white/5">
                                            <button
                                                onClick={() => toggleCategory(key)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {categoryIcons[category.category] || <Settings2 className="w-4 h-4" />}
                                                    <span className="font-medium text-white">{category.category}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({category.questions.length} pytan)
                                                    </span>
                                                </div>
                                                {expandedCategories.has(key) ? (
                                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                )}
                                            </button>

                                            {expandedCategories.has(key) && (
                                                <div className="px-3 pb-3 space-y-2">
                                                    {category.questions.map((q, idx) => {
                                                        const isAdded = questions.some(
                                                            added => added.question === q.question
                                                        );
                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => !isAdded && addPresetQuestion(category.category, q)}
                                                                disabled={isAdded}
                                                                className={cn(
                                                                    "w-full text-left p-2 rounded-md text-sm transition-colors",
                                                                    isAdded
                                                                        ? "bg-[#91E8B2]/10 text-[#91E8B2] cursor-default"
                                                                        : "bg-[#252525] hover:bg-[#303030] text-white"
                                                                )}
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    {isAdded && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                                                                    <span className={isAdded ? "line-clamp-2" : "line-clamp-2"}>
                                                                        {q.question}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Questions */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                        Wybrane pytania ({questions.length})
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={addCustomQuestion}
                                        className="text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                        Wlasne pytanie
                                    </Button>
                                </div>

                                {questions.length === 0 ? (
                                    <div className="bg-[#1B1B1B] rounded-lg border border-white/5 p-8 text-center">
                                        <p className="text-muted-foreground text-sm">
                                            Wybierz pytania z listy lub dodaj wlasne
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {questions.map((q, index) => (
                                            <div
                                                key={q.id}
                                                className="bg-[#1B1B1B] rounded-lg border border-white/5 p-4"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                                        <span className="text-xs text-muted-foreground w-5">{index + 1}.</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        {isQuestionFromPreset(q) ? (
                                                            <p className="text-sm text-white">{q.question}</p>
                                                        ) : (
                                                            <Input
                                                                value={q.question}
                                                                onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                                                                placeholder="Tresc pytania..."
                                                                className="bg-[#252525] border-white/10 text-sm mb-2"
                                                            />
                                                        )}

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-[#252525] rounded">
                                                                {q.category}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-[#252525] rounded">
                                                                {questionTypeLabels[q.type]}
                                                            </span>
                                                        </div>

                                                        {/* Options editor for custom questions */}
                                                        {!isQuestionFromPreset(q) && (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && (
                                                            <div className="mt-3 space-y-2">
                                                                <p className="text-xs text-muted-foreground">Opcje odpowiedzi:</p>
                                                                {q.options.map((opt, optIdx) => (
                                                                    <div key={optIdx} className="flex items-center gap-2">
                                                                        <Input
                                                                            value={opt}
                                                                            onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                                            placeholder={`Opcja ${optIdx + 1}`}
                                                                            className="bg-[#252525] border-white/10 text-xs h-8"
                                                                        />
                                                                        {q.options.length > 1 && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeOption(q.id, optIdx)}
                                                                                className="h-8 w-8 shrink-0"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => addOption(q.id)}
                                                                    className="text-xs h-7"
                                                                >
                                                                    <Plus className="w-3 h-3 mr-1" />
                                                                    Dodaj opcje
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeQuestion(q.id)}
                                                        className="shrink-0 text-muted-foreground hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex items-center justify-between shrink-0">
                    {step === 'questions' && (
                        <Button
                            variant="ghost"
                            onClick={() => setStep('info')}
                        >
                            Wstecz
                        </Button>
                    )}
                    <div className="flex items-center gap-3 ml-auto">
                        <Button variant="ghost" onClick={handleClose}>
                            Anuluj
                        </Button>
                        {step === 'info' ? (
                            <Button
                                onClick={() => setStep('questions')}
                                disabled={!title.trim()}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Dalej
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={questions.length === 0 || isSubmitting}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                {isSubmitting ? 'Tworzenie...' : 'Stworz ankiete'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
