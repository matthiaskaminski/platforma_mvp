'use server';

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { getGmailClient, refreshAccessToken } from '@/lib/google';

// Helper to get current user with Gmail token
async function getUserWithGmail() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) return null;

    const profile = await prisma.profile.findUnique({
        where: { email: user.email },
        include: { gmailToken: true },
    });

    return profile;
}

// Get valid Gmail client (refreshes token if needed)
async function getValidGmailClient(profile: any) {
    if (!profile.gmailToken) {
        throw new Error('Gmail not connected');
    }

    let { accessToken, refreshToken, expiresAt } = profile.gmailToken;

    // Check if token is expired or about to expire (5 min buffer)
    const isExpired = new Date(expiresAt) < new Date(Date.now() + 5 * 60 * 1000);

    if (isExpired) {
        console.log('Gmail token expired, attempting refresh...');
        try {
            const newCredentials = await refreshAccessToken(refreshToken);

            if (newCredentials.access_token) {
                accessToken = newCredentials.access_token;

                // Update token in database
                await prisma.gmailToken.update({
                    where: { profileId: profile.id },
                    data: {
                        accessToken: newCredentials.access_token,
                        expiresAt: new Date(newCredentials.expiry_date || Date.now() + 3600 * 1000),
                    },
                });
                console.log('Gmail token refreshed successfully');
            }
        } catch (error: any) {
            console.error('Error refreshing Gmail token:', error?.message || error);
            // If refresh fails, user needs to reconnect Gmail
            throw new Error('TOKEN_EXPIRED');
        }
    }

    return getGmailClient(accessToken, refreshToken);
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

// Parse email address from "Name <email@example.com>" format
function parseEmailAddress(email: string): { name: string; email: string } {
    const match = email.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
    if (match) {
        return {
            name: match[1]?.trim() || match[2].split('@')[0],
            email: match[2].trim()
        };
    }
    return { name: email.split('@')[0], email };
}

// Format date for display
function formatEmailDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return `dziś ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return `wczoraj ${date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Get all email threads for the inbox
export async function getEmailThreads(limit: number = 30) {
    const profile = await getUserWithGmail();

    if (!profile) {
        return { success: false, error: 'Not authenticated', threads: [] };
    }

    if (!profile.gmailToken) {
        return { success: false, error: 'Gmail not connected', threads: [], needsConnection: true };
    }

    try {
        const gmail = await getValidGmailClient(profile);
        const userEmail = profile.gmailToken.gmailEmail.toLowerCase();

        // Fetch thread list
        const threadsResponse = await gmail.users.threads.list({
            userId: 'me',
            maxResults: limit,
            labelIds: ['INBOX'],
        });

        const threadIds = threadsResponse.data.threads || [];

        if (threadIds.length === 0) {
            return { success: true, threads: [], message: 'No emails found' };
        }

        // Fetch thread details
        const threads: EmailThread[] = await Promise.all(
            threadIds.slice(0, limit).map(async (thread) => {
                const threadResponse = await gmail.users.threads.get({
                    userId: 'me',
                    id: thread.id!,
                    format: 'metadata',
                    metadataHeaders: ['From', 'To', 'Subject', 'Date'],
                });

                const messages = threadResponse.data.messages || [];
                const firstMessage = messages[0];
                const lastMessage = messages[messages.length - 1];

                const headers = lastMessage?.payload?.headers || [];
                const getHeader = (name: string) =>
                    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

                const fromHeader = getHeader('From');
                const parsed = parseEmailAddress(fromHeader);

                // Count unread messages
                const unreadCount = messages.filter(m =>
                    m.labelIds?.includes('UNREAD')
                ).length;

                return {
                    id: thread.id!,
                    threadId: thread.id!,
                    from: fromHeader,
                    fromEmail: parsed.email,
                    fromName: parsed.name,
                    to: getHeader('To'),
                    subject: getHeader('Subject') || '(bez tematu)',
                    date: formatEmailDate(getHeader('Date')),
                    snippet: lastMessage?.snippet || '',
                    unreadCount,
                    messages: [], // Will be loaded on demand
                };
            })
        );

        return { success: true, threads };
    } catch (error: any) {
        console.error('Error fetching email threads:', error?.message || error);

        // Check if token expired
        if (error?.message === 'TOKEN_EXPIRED') {
            return {
                success: false,
                error: 'Sesja Gmail wygasła. Połącz ponownie w ustawieniach.',
                threads: [],
                needsReconnect: true
            };
        }

        return { success: false, error: 'Nie udało się pobrać wiadomości', threads: [] };
    }
}

// Get full thread with all messages
export async function getFullEmailThread(threadId: string) {
    const profile = await getUserWithGmail();

    if (!profile || !profile.gmailToken) {
        return { success: false, error: 'Gmail not connected' };
    }

    try {
        const gmail = await getValidGmailClient(profile);
        const userEmail = profile.gmailToken.gmailEmail.toLowerCase();

        const threadResponse = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
            format: 'full',
        });

        const messages: EmailMessage[] = (threadResponse.data.messages || []).map(msg => {
            const headers = msg.payload?.headers || [];
            const getHeader = (name: string) =>
                headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

            const fromHeader = getHeader('From');
            const parsed = parseEmailAddress(fromHeader);

            // Check if this message is from the current user
            const isMe = parsed.email.toLowerCase() === userEmail;

            // Get body
            let body = '';
            if (msg.payload?.body?.data) {
                body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
            } else if (msg.payload?.parts) {
                const textPart = msg.payload.parts.find(p => p.mimeType === 'text/plain');
                const htmlPart = msg.payload.parts.find(p => p.mimeType === 'text/html');

                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                } else if (htmlPart?.body?.data) {
                    // Strip HTML tags for simple display
                    const html = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
                    body = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                }
            }

            return {
                id: msg.id!,
                from: fromHeader,
                fromEmail: parsed.email,
                fromName: parsed.name,
                to: getHeader('To'),
                subject: getHeader('Subject') || '(bez tematu)',
                date: formatEmailDate(getHeader('Date')),
                body,
                snippet: msg.snippet || '',
                isMe,
            };
        });

        // Mark thread as read
        try {
            await gmail.users.threads.modify({
                userId: 'me',
                id: threadId,
                requestBody: {
                    removeLabelIds: ['UNREAD'],
                },
            });
        } catch (e) {
            // Ignore errors when marking as read
        }

        return { success: true, messages };
    } catch (error) {
        console.error('Error fetching thread:', error);
        return { success: false, error: 'Failed to fetch email thread' };
    }
}

// Get Gmail connection status
export async function getMessagesGmailStatus() {
    const profile = await getUserWithGmail();

    if (!profile) {
        return { connected: false, email: null };
    }

    if (!profile.gmailToken) {
        return { connected: false, email: null };
    }

    return {
        connected: true,
        email: profile.gmailToken.gmailEmail,
    };
}
