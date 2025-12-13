"use client";

import React from "react";
import { Plus, MoreVertical, Calendar, FileText } from "lucide-react";

interface Note {
    id: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

interface NotesListProps {
    notes: Note[];
}

export function NotesList({ notes }: NotesListProps) {
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // Extract first line as title, rest as content
    const parseNote = (content: string) => {
        const lines = content.trim().split('\n');
        const title = lines[0] || "Notatka bez tytułu";
        const body = lines.slice(1).join('\n').trim() || content;
        return { title, body };
    };

    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <FileText className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-base text-muted-foreground mb-2">Brak notatek</p>
                <p className="text-sm text-muted-foreground">Dodaj notatki, aby je tutaj zobaczyć</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {notes.map((note) => {
                    const { title, body } = parseNote(note.content);

                    return (
                        <div key={note.id} className="bg-[#151515] p-6 rounded-xl flex flex-col justify-between min-h-[200px] group relative hover:bg-[#1B1B1B] transition-colors">
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-muted-foreground hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                    <Calendar className="w-5 h-5" /> {formatDate(note.createdAt)}
                                </div>
                                <h3 className="text-[14px] font-medium text-white mb-2 line-clamp-2">{title}</h3>
                                <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-4">{body}</p>
                            </div>

                            <div className="pt-4 mt-auto">
                                <div className="text-xs text-muted-foreground">
                                    {note.createdAt.getTime() !== note.updatedAt.getTime() && (
                                        <span>Edytowano: {formatDate(note.updatedAt)}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
