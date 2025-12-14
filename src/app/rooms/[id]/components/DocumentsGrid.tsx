"use client";

import React from "react";
import { FileText, Image as ImageIcon, File, MoreHorizontal, ArrowUpRight, Files } from "lucide-react";

interface Document {
    id: string;
    name: string;
    url: string;
    type: string | null;
    size: number | null;
    uploadedAt: Date;
}

interface DocumentsGridProps {
    documents: Document[];
}

// Determine icon based on file extension or type
const getDocumentIcon = (name: string, type: string | null) => {
    const extension = name.split('.').pop()?.toLowerCase();

    if (extension && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
        return ImageIcon;
    }

    if (extension && ['pdf'].includes(extension)) {
        return FileText;
    }

    return File;
};

// Check if file is an image for preview
const isImage = (name: string) => {
    const extension = name.split('.').pop()?.toLowerCase();
    return extension && ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension);
};

// Format file size
const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Format upload date
const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export function DocumentsGrid({ documents }: DocumentsGridProps) {
    if (documents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6">
                <Files className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-white font-medium mb-2">Brak dokumentów</p>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Dokumenty dodane do projektu pojawią się tutaj
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 p-6 pt-2">
            {documents.map((doc) => {
                const Icon = getDocumentIcon(doc.name, doc.type);
                const showImagePreview = isImage(doc.name);

                return (
                    <div key={doc.id} className="bg-[#151515] group rounded-xl overflow-hidden cursor-pointer flex flex-col h-full hover:bg-[#1A1A1A] transition-colors border border-transparent hover:border-white/5">
                        {/* Preview Area */}
                        <div className="aspect-square bg-[#151515] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                            {/* Overlay Controls */}
                            <div className="absolute top-2 left-2 z-10">
                                <div className="w-5 h-5 rounded border border-white/30 bg-transparent flex items-center justify-center cursor-pointer hover:border-white transition-colors">
                                    {/* Checkbox placeholder - could be active state */}
                                </div>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-6 h-6 rounded-full bg-[#1B1B1B] text-white flex items-center justify-center hover:bg-[#2a2a2a] transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-6 h-6 rounded-full bg-[#1B1B1B] text-white flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                </a>
                            </div>

                            {/* Content */}
                            {showImagePreview ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={doc.url}
                                    alt={doc.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <Icon className="w-12 h-12 text-muted-foreground opacity-50" />
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="p-3 bg-[#1B1B1B]">
                            <div className="text-white text-sm font-medium truncate mb-1" title={doc.name}>
                                {doc.name}
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                <span>{doc.type || 'Dokument'}</span>
                                <span>{formatDate(doc.uploadedAt)}</span>
                            </div>
                            {doc.size && (
                                <div className="text-xs text-muted-foreground mt-1">
                                    {formatFileSize(doc.size)}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
