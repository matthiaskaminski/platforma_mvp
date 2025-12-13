'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

// Schema v5 (Audit Compliant)
const schemaDefinition = `
erDiagram
    %% --- UŻYTKOWNIK (Projektant) ---
    PROFILES ||--o{ SUBSCRIPTION : "posiada"
    PROFILES ||--o{ WISHLIST : "tworzy"
    PROFILES ||--o{ CLIENT : "zarządza"
    
    PROFILES {
        uuid id PK
        string email
        string first_name
        string last_name
        string studio_name
        enum user_type "Freelancer, Studio"
    }

    %% --- KLIENT ---
    CLIENT ||--o{ PROJECT : "zamawia"
    CLIENT {
        uuid id PK
        uuid designer_id FK
        enum type "PRIVATE, COMMERCIAL"
        string name
        string email
    }

    %% --- PROJEKT (Hub) ---
    PROJECT ||--o{ ROOM : "składa się z"
    PROJECT ||--o{ CONTACT : "książka kontaktów"
    PROJECT ||--o{ CONVERSATION : "czaty / wątki"
    PROJECT ||--o{ SURVEY : "ankiety"
    PROJECT ||--o{ MOODBOARD : "moodboardy"
    
    PROJECT {
        uuid id PK
        uuid client_id FK
        string name
        string status "ACTIVE, ARCHIVED"
        string address
        decimal budget_goal
        date deadline
    }

    %% --- WNĘTRZE (Pokój) ---
    ROOM ||--o{ PRODUCT_ITEM : "zawiera"
    ROOM ||--o{ GALLERY_IMAGE : "wizualizacje"
    ROOM ||--o{ TASK : "zadania"
    
    ROOM {
        uuid id PK
        uuid project_id FK
        string name
        enum type "LIVING_ROOM, KITCHEN..."
        decimal budget_allocated
    }

    %% --- INTERAKCJE (Nowe w v5) ---
    
    MOODBOARD {
        uuid id PK
        uuid project_id FK
        string name
        string status "DRAFT, SENT, APPROVED"
        json content_data "JSON z układem zdjęć"
    }

    SURVEY {
        uuid id PK
        uuid project_id FK
        string name
        string status "SENT, COMPLETED"
        json questions "Pytania"
        json answers "Odpowiedzi klienta"
    }

    CONVERSATION ||--o{ MESSAGE : "historia"
    CONVERSATION {
        uuid id PK
        uuid project_id FK
        uuid contact_id FK "Opcjonalne (jeśli rozmowa 1:1)"
        string topic
    }

    MESSAGE {
        uuid id PK
        uuid conversation_id FK
        uuid sender_id "ID usera lub klienta"
        text content
        timestamp created_at
    }

    %% --- ZASOBY (Produkty, Pliki, Zadania) ---

    WISHLIST ||--o{ PRODUCT_ITEM : "zawiera"
    PRODUCT_ITEM {
        uuid id PK
        uuid wishlist_id FK
        uuid room_id FK
        string name
        decimal price
        string status "ORDERED, PAID, DELIVERED"
        boolean is_in_cart
    }

    TASK {
        uuid id PK
        uuid project_id FK
        uuid room_id FK
        string title
        enum status "TODO, IN_PROGRESS, BLOCKED, DONE"
        date due_date
    }

    GALLERY_IMAGE {
        uuid id PK
        uuid room_id FK
        string url
        string caption
        boolean is_cover "Czy to zdjęcie główne pokoju?"
    }

    DOCUMENT {
        uuid id PK
        uuid project_id FK
        string name
        string url
        enum type "INVOICE, CONTRACT"
    }
`;

export default function SchemaPage() {
    const [isMermaidLoaded, setIsMermaidLoaded] = useState(false);

    useEffect(() => {
        if (isMermaidLoaded) {
            // @ts-ignore
            window.mermaid.initialize({ startOnLoad: true, theme: 'dark' });
            // @ts-ignore
            window.mermaid.contentLoaded();
        }
    }, [isMermaidLoaded]);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-4 md:p-8 overflow-x-auto">
            <Script
                src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"
                strategy="afterInteractive"
                onLoad={() => setIsMermaidLoaded(true)}
            />

            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-2 text-center text-white">Liru.app Database Schema v5 (Audit Compliant)</h1>
                <p className="text-center text-gray-400 mb-8">Schemat rozszerzony o Moodboardy, Ankiety, Czat i zaawansowane statusy.</p>

                <div className="bg-[#1a1a1a] p-4 md:p-8 rounded-2xl border border-white/10 overflow-x-auto">
                    <div className="mermaid flex justify-center min-w-[1000px]">
                        {schemaDefinition}
                    </div>
                </div>
            </div>
        </div>
    );
}
