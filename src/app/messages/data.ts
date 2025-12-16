// Types for email display (compatible with Gmail API data)

export interface EmailUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

export interface EmailMessage {
    id: string;
    from: string;
    fromEmail: string;
    fromName: string;
    to: string;
    subject: string;
    date: string;
    body: string;
    snippet: string;
    isMe: boolean;
}

export interface EmailThread {
    id: string;
    threadId: string;
    from: string;
    fromEmail: string;
    fromName: string;
    to: string;
    subject: string;
    date: string;
    snippet: string;
    unreadCount: number;
    messages: EmailMessage[];
}

// Legacy types for backward compatibility
export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
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
