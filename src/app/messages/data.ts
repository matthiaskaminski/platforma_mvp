export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string; // Initials or image URL
    role?: string;
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    isMe: boolean;
}

export interface Conversation {
    id: string;
    user: User;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: Message[];
}

export const CURRENT_USER_ID = "me";

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        user: {
            id: "u1",
            name: "Olga Bailey",
            email: "olga.bailey@gmail.com",
            role: "Korespondencja - Projekt Olga"
        },
        lastMessage: "Wszystko wygląda świetnie – wybieram kuchnię w jaśniejszym drewnie...",
        lastMessageTime: "dziś 17:45",
        unreadCount: 0,
        messages: [
            {
                id: "m1",
                senderId: "u1",
                text: "Dzień dobry,\nDziękuję za wiadomość. Zdecydowanie wolałabym jaśniejsze fronty w kuchni – dąb naturalny będzie idealny.\nPomysł z miętową glazurą też mi się bardzo podoba, proszę to wprowadzić.\nCzy mogłaby Pani przy okazji pokazać też warianty oświetlenia w salonie, o których wspominałyśmy?\nPozdrawiam,\nOlga",
                timestamp: "13:18",
                isMe: false
            },
            {
                id: "m2",
                senderId: "me",
                text: "Pani Olgo,\nPrzesyłam poprawione wizualizacje – dwa warianty kuchni (dąb naturalny i orzech), miętową glazurę w łazience oraz dwa pomysły na oświetlenie salonu.\nProszę zerknąć i dać znać, który układ najbardziej Pani odpowiada. Po akceptacji przejdziemy do zamówienia materiałów.\nPozdrawiam,\nSonya",
                timestamp: "16:41",
                isMe: true
            },
            {
                id: "m3",
                senderId: "u1",
                text: "Wszystko wygląda świetnie – wybieram kuchnię w jaśniejszym drewnie i oświetlenie liniowe w salonie.\nMożemy działać dalej. Proszę tylko potwierdzić, że budżet pozostaje bez zmian.\nPozdrawiam,\nOlga",
                timestamp: "17:45",
                isMe: false
            }
        ]
    },
    {
        id: "2",
        user: {
            id: "u2",
            name: "Piotr Zieliński (Elektryk)",
            email: "piotr@elektro.pl",
            role: "Elektryk"
        },
        lastMessage: "Termin montażu żyrandola w salonie",
        lastMessageTime: "dziś 11:40",
        unreadCount: 1,
        messages: []
    },
    {
        id: "3",
        user: {
            id: "u3",
            name: "Marcin Nowak (BoConcept)",
            email: "marcin@boconcept.pl",
            role: "Dostawca"
        },
        lastMessage: "Potwierdzenie zamówienia i termin dostawy",
        lastMessageTime: "dziś 09:01",
        unreadCount: 0,
        messages: []
    },
    {
        id: "4",
        user: {
            id: "u4",
            name: "DHL - Kurier",
            email: "kontakt@dhl.com",
            role: "Kurier"
        },
        lastMessage: "Dostawa dywanu - zmiana terminu dostawy",
        lastMessageTime: "01.11.2025",
        unreadCount: 0,
        messages: []
    },
    {
        id: "5",
        user: {
            id: "u5",
            name: "Karolina Lewandowska (Malarz)",
            email: "karolina@colors.pl",
            role: "Malarz"
        },
        lastMessage: "Uzgodnienie koloru ścian - próbki",
        lastMessageTime: "25.10.2025",
        unreadCount: 0,
        messages: []
    },
    {
        id: "6",
        user: {
            id: "u6",
            name: "Tomasz Dąbrowski (Stolarz)",
            email: "tomasz@woodwork.pl",
            role: "Stolarz"
        },
        lastMessage: "Wymiary regałów String System - montaż",
        lastMessageTime: "24.10.2025",
        unreadCount: 0,
        messages: []
    }
];
