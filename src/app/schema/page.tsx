'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

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
        string studio_name "Nazwa firmy"
        string nip
        string address
        string phone
        string logo_url
        enum user_type "Freelancer, Studio"
    }

    %% --- KLIENT ---
    CLIENT ||--o{ PROJECT : "zamawia"
    CLIENT {
        uuid id PK
        uuid designer_id FK
        enum type "PRIVATE, COMMERCIAL"
        string name "Nazwa Klienta"
        string nip
        string phone
        string email
    }

    %% --- PROJEKT (Centralny Punkt) ---
    PROJECT ||--o{ ROOM : "składa się z"
    PROJECT ||--o{ CONTACT : "lista kontaktów"
    PROJECT ||--o{ CALENDAR_EVENT : "kalendarz"
    PROJECT ||--o{ TASK : "zadania"
    PROJECT ||--o{ DOCUMENT : "pliki"
    
    PROJECT {
        uuid id PK
        uuid client_id FK
        uuid designer_id FK
        string name
        string address
        string status
        float total_area
        int floors_count
        int rooms_count
        decimal budget_goal
        string building_status
        string scope_of_work
        date start_date
        date deadline
    }

    %% --- WNĘTRZE (Pokój) ---
    ROOM ||--o{ PRODUCT_ITEM : "zawiera"
    ROOM ||--o{ NOTE : "notatki"
    
    ROOM {
        uuid id PK
        uuid project_id FK
        string name
        enum type
        float area
        int floor_number
        decimal budget_allocated
    }

    %% --- PRODUKTY & WISHLISTY (Core Logic) ---
    WISHLIST ||--o{ PRODUCT_ITEM : "zawiera"
    
    WISHLIST {
        uuid id PK
        uuid designer_id FK
        string name
    }

    PRODUCT_ITEM {
        uuid id PK
        uuid wishlist_id FK
        uuid room_id FK
        string name
        string category
        decimal price
        int quantity
        decimal paid_amount
        boolean is_in_cart
        string status
    }

    %% --- ZADANIA & KALENDARZ & PLIKI ---
    
    TASK {
        uuid id PK
        uuid project_id FK
        uuid room_id FK
        string title
        boolean is_done
        uuid assigned_to
    }

    DOCUMENT {
        uuid id PK
        uuid project_id FK
        uuid room_id FK
        string name
        string type
    }

    CONTACT {
        uuid id PK
        uuid project_id FK
        string name
        string role
        string phone
    }

    CALENDAR_EVENT {
        uuid id PK
        uuid project_id FK
        string title
        timestamp start_time
        timestamp end_time
    }

    NOTE {
        uuid id PK
        uuid room_id FK
        text content
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
                <h1 className="text-3xl font-bold mb-2 text-center text-white">Liru.app Database Schema v4 (Master)</h1>
                <p className="text-center text-gray-400 mb-8">Schemat bazy danych z uwzględnieniem Wishlist, Kontaktów i Kalendarza.</p>

                <div className="bg-[#1a1a1a] p-4 md:p-8 rounded-2xl border border-white/10 overflow-x-auto">
                    <div className="mermaid flex justify-center min-w-[1000px]">
                        {schemaDefinition}
                    </div>
                </div>
            </div>
        </div>
    );
}
