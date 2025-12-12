"use client";

import React from "react";
import { Plus, MoreVertical, Calendar } from "lucide-react";

const notes = [
    { id: 1, title: "Wymiary wnęki pod szafę", content: "Szerokość: 124cm, Wysokość: 260cm, Głębokość: 65cm. Pamiętać o listwie przypodłogowej 8cm.", date: "10.11.2024", author: "Jan Kowalski" },
    { id: 2, title: "Preferencje kolorystyczne klienta", content: "Unikać żółci. Klient lubi ciepłe beże, oliwkę i akcenty w kolorze terakoty. Inspiracją jest styl Japandi.", date: "05.11.2024", author: "Olga Nowak" },
    { id: 3, title: "Spotkanie z elektrykiem", content: "Ustalono przesunięcie punktów świetlnych nad stołem o 15cm w lewo. Potrzebne kucie bruzdy.", date: "02.11.2024", author: "Jan Kowalski" },
];

export function NotesList() {
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {/* New Note Button */}


                {notes.map((note) => (
                    <div key={note.id} className="bg-[#151515] p-6 rounded-xl flex flex-col justify-between min-h-[200px] group relative hover:bg-[#1B1B1B] transition-colors">
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="text-muted-foreground hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Calendar className="w-5 h-5" /> {note.date}
                            </div>
                            <h3 className="text-[14px] font-medium text-white mb-2">{note.title}</h3>
                            <p className="text-[14px] text-muted-foreground leading-relaxed">{note.content}</p>
                        </div>

                        <div className="pt-4 mt-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium">
                                    {note.author.charAt(0)}
                                </div>
                                <span className="text-xs text-muted-foreground">{note.author}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
