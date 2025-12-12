"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Mail, Phone, Plus, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { MOCK_CONVERSATIONS } from "../messages/data";

// Extracting users from mock conversations and adding phone numbers
const contacts = MOCK_CONVERSATIONS.map(c => ({
    ...c.user,
    phone: "+48 500 000 000", // Mock phone
    role: c.user.role || "Współpracownik"
}));

export default function ContactsPage() {
    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-500 pb-0 overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch gap-3 shrink-0 mb-3">
                {/* Left Side: Label + Search */}
                <Card className="flex-1 p-4 flex gap-4 items-center w-full md:w-auto min-h-[80px]">
                    <span className="text-[16px] font-medium text-[#DBDAD9] whitespace-nowrap px-2">Twoje kontakty</span>

                    <div className="flex gap-2 ml-auto items-center">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj kontaktu..."
                                className="pl-9 bg-[#1B1B1B] border-white/5 h-[48px] placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                </Card>

                {/* Right Side: Add Button */}
                <Button className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm self-center md:self-stretch">
                    <Plus className="w-5 h-5" />
                    Dodaj kontakt
                </Button>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="group relative">
                            {/* Card */}
                            <div className="bg-[#151515] rounded-3xl p-4 transition-colors flex flex-col h-full">
                                {/* Header: Avatar + Menu */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-[#1B1B1B] flex items-center justify-center text-xl font-medium text-white shadow-inner">
                                        {contact.name.charAt(0)}
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white -mt-2 -mr-2">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Info */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-white mb-1">{contact.name}</h3>
                                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 mb-8 flex-1">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span>{contact.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span>{contact.phone}</span>
                                    </div>
                                </div>

                                {/* Action */}
                                <Link href="/messages" className="mt-auto">
                                    <Button className="w-full bg-[#1B1B1B] hover:bg-[#252525] text-white h-[48px] rounded-xl flex items-center justify-center gap-2 transition-all duration-300">
                                        <Mail className="w-4 h-4" />
                                        Napisz wiadomość
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
