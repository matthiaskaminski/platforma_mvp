"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Mail, Phone, Plus, X, Loader2, Edit2, Trash2, Building2, User, Share2 } from "lucide-react";
import Link from "next/link";
import { getAllContacts, addContactToProject, updateContact, deleteContact, getUserProjects, getActiveProjectId } from "@/app/actions/projects";

interface Contact {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    projectId: string;
    projectName: string;
}

interface Client {
    id: string;
    fullName: string | null;
    email: string;
    phoneNumber: string | null;
    projectId: string;
    projectName: string;
}

interface Project {
    id: string;
    name: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [sharingContact, setSharingContact] = useState<Contact | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        additionalProjects: [] as string[]
    });

    // Share form state
    const [shareProjectId, setShareProjectId] = useState('');

    // Load data
    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            try {
                const [contactsResult, projectsResult, activeId] = await Promise.all([
                    getAllContacts(),
                    getUserProjects(),
                    getActiveProjectId()
                ]);

                if (contactsResult.success) {
                    setContacts(contactsResult.contacts);
                    setClients(contactsResult.clients);
                }
                setProjects(projectsResult);
                setActiveProjectId(activeId);
            } catch (error) {
                console.error('Error loading contacts:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    // Combined list of contacts and clients
    const allContacts = [
        ...clients.map(c => ({
            id: c.id,
            name: c.fullName || c.email.split('@')[0],
            email: c.email,
            phone: c.phoneNumber,
            role: 'Klient',
            projectId: c.projectId,
            projectName: c.projectName,
            isClient: true
        })),
        ...contacts.map(c => ({
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            role: c.role || 'Kontakt',
            projectId: c.projectId,
            projectName: c.projectName,
            isClient: false
        }))
    ];

    // Filter contacts
    const filteredContacts = allContacts.filter(contact => {
        const query = searchQuery.toLowerCase();
        return (
            contact.name.toLowerCase().includes(query) ||
            (contact.email?.toLowerCase().includes(query)) ||
            (contact.role?.toLowerCase().includes(query)) ||
            contact.projectName.toLowerCase().includes(query)
        );
    });

    // Get active project name
    const activeProject = projects.find(p => p.id === activeProjectId);

    // Handle add contact
    const handleAddContact = async () => {
        if (!formData.name || !activeProjectId) return;

        setIsSaving(true);
        try {
            // Add to active project
            const result = await addContactToProject(activeProjectId, {
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                role: formData.role || undefined
            });

            if (result.success) {
                // Also add to additional projects if selected
                for (const projectId of formData.additionalProjects) {
                    await addContactToProject(projectId, {
                        name: formData.name,
                        email: formData.email || undefined,
                        phone: formData.phone || undefined,
                        role: formData.role || undefined
                    });
                }

                // Reload contacts
                const contactsResult = await getAllContacts();
                if (contactsResult.success) {
                    setContacts(contactsResult.contacts);
                    setClients(contactsResult.clients);
                }
                setShowAddModal(false);
                setFormData({ name: '', email: '', phone: '', role: '', additionalProjects: [] });
            }
        } catch (error) {
            console.error('Error adding contact:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle edit contact
    const handleEditContact = async () => {
        if (!editingContact || !formData.name) return;

        setIsSaving(true);
        try {
            const result = await updateContact(editingContact.id, {
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                role: formData.role || undefined
            });

            if (result.success) {
                // Reload contacts
                const contactsResult = await getAllContacts();
                if (contactsResult.success) {
                    setContacts(contactsResult.contacts);
                    setClients(contactsResult.clients);
                }
                setEditingContact(null);
                setFormData({ name: '', email: '', phone: '', role: '', additionalProjects: [] });
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle share contact to another project
    const handleShareContact = async () => {
        if (!sharingContact || !shareProjectId) return;

        setIsSaving(true);
        try {
            const result = await addContactToProject(shareProjectId, {
                name: sharingContact.name,
                email: sharingContact.email || undefined,
                phone: sharingContact.phone || undefined,
                role: sharingContact.role || undefined
            });

            if (result.success) {
                // Reload contacts
                const contactsResult = await getAllContacts();
                if (contactsResult.success) {
                    setContacts(contactsResult.contacts);
                    setClients(contactsResult.clients);
                }
                setSharingContact(null);
                setShareProjectId('');
            }
        } catch (error) {
            console.error('Error sharing contact:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete contact
    const handleDeleteContact = async (contactId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten kontakt?')) return;

        try {
            const result = await deleteContact(contactId);
            if (result.success) {
                setContacts(contacts.filter(c => c.id !== contactId));
            }
        } catch (error) {
            console.error('Error deleting contact:', error);
        }
    };

    // Open edit modal
    const openEditModal = (contact: any) => {
        if (contact.isClient) {
            // Clients can't be edited from here - need to go to project
            return;
        }
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            email: contact.email || '',
            phone: contact.phone || '',
            role: contact.role || '',
            additionalProjects: []
        });
    };

    // Open share modal
    const openShareModal = (contact: any) => {
        setSharingContact(contact);
        setShareProjectId('');
    };

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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-[#1B1B1B] border-white/5 h-[48px] placeholder:text-muted-foreground"
                            />
                        </div>
                    </div>
                </Card>

                {/* Right Side: Add Button */}
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="h-[80px] bg-[#151515] hover:bg-[#252525] text-white px-6 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm self-center md:self-stretch"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj kontakt
                </Button>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <User className="w-12 h-12 mb-4 opacity-50" />
                        <p>{searchQuery ? 'Brak kontaktów pasujących do wyszukiwania' : 'Brak kontaktów'}</p>
                        <p className="text-sm mt-2">Dodaj kontakty do swoich projektów</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filteredContacts.map((contact) => (
                            <div key={`${contact.isClient ? 'client' : 'contact'}-${contact.id}`} className="group relative">
                                {/* Card */}
                                <div className="bg-[#151515] rounded-2xl p-4 transition-colors flex flex-col h-full">
                                    {/* Header: Avatar + Menu */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-[#1B1B1B] flex items-center justify-center text-xl font-medium text-white shadow-inner">
                                            {contact.name.charAt(0).toUpperCase()}
                                        </div>
                                        {!contact.isClient && (
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-white h-8 w-8"
                                                    onClick={() => openShareModal(contact)}
                                                    title="Udostępnij do innego projektu"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-white h-8 w-8"
                                                    onClick={() => openEditModal(contact)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-red-400 h-8 w-8"
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold text-white mb-1">{contact.name}</h3>
                                        <p className="text-[14px] text-muted-foreground">{contact.role}</p>
                                    </div>

                                    {/* Project */}
                                    <div className="flex items-center gap-2 text-[14px] text-muted-foreground/60 mb-4">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>{contact.projectName}</span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 mb-6 flex-1">
                                        {contact.email && (
                                            <div className="flex items-center gap-3 text-[14px] text-muted-foreground/80">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <span className="truncate">{contact.email}</span>
                                            </div>
                                        )}
                                        {contact.phone && (
                                            <div className="flex items-center gap-3 text-[14px] text-muted-foreground/80">
                                                <Phone className="w-4 h-4 text-muted-foreground" />
                                                <span>{contact.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action */}
                                    {contact.email && (
                                        <Link href="/messages" className="mt-auto">
                                            <Button className="w-full bg-[#1B1B1B] hover:bg-[#252525] text-white h-[48px] rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-[14px]">
                                                <Mail className="w-4 h-4" />
                                                Napisz wiadomość
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Contact Modal */}
            {(showAddModal || editingContact) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#151515] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">
                                {editingContact ? 'Edytuj kontakt' : 'Dodaj kontakt'}
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingContact(null);
                                    setFormData({ name: '', email: '', phone: '', role: '', additionalProjects: [] });
                                }}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {/* Active Project Info - only for new contacts */}
                            {!editingContact && (
                                <div className="bg-[#1B1B1B] rounded-xl px-4 py-3 border border-white/5">
                                    <label className="text-[14px] text-muted-foreground block mb-1">Projekt główny</label>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-white text-[14px] font-medium">
                                            {activeProject?.name || 'Brak aktywnego projektu'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Imię i nazwisko *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Jan Kowalski"
                                    className="bg-[#1B1B1B] border-white/5"
                                />
                            </div>

                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Email</label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="jan@example.com"
                                    className="bg-[#1B1B1B] border-white/5"
                                />
                            </div>

                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Telefon</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+48 500 000 000"
                                    className="bg-[#1B1B1B] border-white/5"
                                />
                            </div>

                            <div>
                                <label className="text-[14px] text-muted-foreground mb-2 block">Rola</label>
                                <Input
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="np. Elektryk, Stolarz, Dostawca"
                                    className="bg-[#1B1B1B] border-white/5"
                                />
                            </div>

                            {/* Additional Projects - only for new contacts */}
                            {!editingContact && projects.filter(p => p.id !== activeProjectId).length > 0 && (
                                <div>
                                    <label className="text-[14px] text-muted-foreground mb-2 block">
                                        Dodaj również do innych projektów (opcjonalnie)
                                    </label>
                                    <div className="space-y-2 max-h-[120px] overflow-y-auto">
                                        {projects.filter(p => p.id !== activeProjectId).map(project => (
                                            <label
                                                key={project.id}
                                                className="flex items-center gap-3 bg-[#1B1B1B] rounded-xl px-4 py-2.5 cursor-pointer hover:bg-[#252525] transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.additionalProjects.includes(project.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                additionalProjects: [...formData.additionalProjects, project.id]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                additionalProjects: formData.additionalProjects.filter(id => id !== project.id)
                                                            });
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-white/20 bg-[#252525] text-white focus:ring-0 focus:ring-offset-0"
                                                />
                                                <span className="text-[14px] text-white">{project.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingContact(null);
                                    setFormData({ name: '', email: '', phone: '', role: '', additionalProjects: [] });
                                }}
                            >
                                Anuluj
                            </Button>
                            <Button
                                className="flex-1 bg-white text-black hover:bg-gray-100"
                                onClick={editingContact ? handleEditContact : handleAddContact}
                                disabled={isSaving || !formData.name || (!editingContact && !activeProjectId)}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    editingContact ? 'Zapisz' : 'Dodaj'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Contact Modal */}
            {sharingContact && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#151515] rounded-2xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">
                                Udostępnij kontakt
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setSharingContact(null);
                                    setShareProjectId('');
                                }}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Contact info */}
                        <div className="bg-[#1B1B1B] rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[#252525] flex items-center justify-center text-lg font-medium text-white">
                                    {sharingContact.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-medium">{sharingContact.name}</h3>
                                    <p className="text-[14px] text-muted-foreground">{sharingContact.role}</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[14px] text-muted-foreground mb-2 block">
                                Wybierz projekt do którego chcesz dodać kontakt
                            </label>
                            <select
                                value={shareProjectId}
                                onChange={(e) => setShareProjectId(e.target.value)}
                                className="w-full bg-[#1B1B1B] border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 text-[14px]"
                            >
                                <option value="">Wybierz projekt</option>
                                {projects
                                    .filter(p => p.id !== sharingContact.projectId)
                                    .map(project => (
                                        <option key={project.id} value={project.id}>{project.name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => {
                                    setSharingContact(null);
                                    setShareProjectId('');
                                }}
                            >
                                Anuluj
                            </Button>
                            <Button
                                className="flex-1 bg-white text-black hover:bg-gray-100"
                                onClick={handleShareContact}
                                disabled={isSaving || !shareProjectId}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    'Udostępnij'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
