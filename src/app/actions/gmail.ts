'use server';

import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma';
import { getGmailClient, refreshAccessToken } from '@/lib/google';
import { revalidatePath } from 'next/cache';

// Helper to get current user
async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) return null;

    const profile = await prisma.profile.findUnique({
        where: { email: user.email },
        include: { gmailToken: true },
    });

    return profile;
}

// Get Gmail connection status
export async function getGmailStatus() {
    const profile = await getUser();

    if (!profile) {
        return { connected: false, email: null };
    }

    if (!profile.gmailToken) {
        return { connected: false, email: null };
    }

    return {
        connected: true,
        email: profile.gmailToken.gmailEmail,
        expiresAt: profile.gmailToken.expiresAt,
    };
}

// Disconnect Gmail
export async function disconnectGmail() {
    const profile = await getUser();

    if (!profile) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        await prisma.gmailToken.delete({
            where: { profileId: profile.id },
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error disconnecting Gmail:', error);
        return { success: false, error: 'Failed to disconnect Gmail' };
    }
}

// Get valid Gmail client (refreshes token if needed)
async function getValidGmailClient(profile: any) {
    if (!profile.gmailToken) {
        throw new Error('Gmail not connected');
    }

    let { accessToken, refreshToken, expiresAt } = profile.gmailToken;

    // Check if token is expired or about to expire (5 min buffer)
    if (new Date(expiresAt) < new Date(Date.now() + 5 * 60 * 1000)) {
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
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw new Error('Failed to refresh Gmail token');
        }
    }

    return getGmailClient(accessToken, refreshToken);
}

// Fetch emails for a project (filtered by client and contacts)
export async function getProjectEmails(projectId: string, limit: number = 20) {
    const profile = await getUser();

    if (!profile || !profile.gmailToken) {
        return { success: false, error: 'Gmail not connected', emails: [] };
    }

    try {
        // Get project with client and contacts
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                designerId: profile.id,
            },
            include: {
                clients: true,
                contacts: true,
            },
        });

        if (!project) {
            return { success: false, error: 'Project not found', emails: [] };
        }

        // Collect all email addresses to filter by
        const emailAddresses: string[] = [];

        // Add client emails
        project.clients.forEach(client => {
            if (client.email) emailAddresses.push(client.email);
        });

        // Add contact emails
        project.contacts.forEach(contact => {
            if (contact.email) emailAddresses.push(contact.email);
        });

        if (emailAddresses.length === 0) {
            return { success: true, emails: [], message: 'No contacts with email addresses' };
        }

        // Build Gmail query
        const query = emailAddresses
            .map(email => `from:${email} OR to:${email}`)
            .join(' OR ');

        const gmail = await getValidGmailClient(profile);

        // Fetch message list
        const messagesResponse = await gmail.users.messages.list({
            userId: 'me',
            q: query,
            maxResults: limit,
        });

        const messageIds = messagesResponse.data.messages || [];

        if (messageIds.length === 0) {
            return { success: true, emails: [], message: 'No emails found' };
        }

        // Fetch full message details
        const emails = await Promise.all(
            messageIds.slice(0, limit).map(async (msg) => {
                const messageResponse = await gmail.users.messages.get({
                    userId: 'me',
                    id: msg.id!,
                    format: 'metadata',
                    metadataHeaders: ['From', 'To', 'Subject', 'Date'],
                });

                const headers = messageResponse.data.payload?.headers || [];
                const getHeader = (name: string) =>
                    headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

                return {
                    id: msg.id,
                    threadId: msg.threadId,
                    from: getHeader('From'),
                    to: getHeader('To'),
                    subject: getHeader('Subject'),
                    date: getHeader('Date'),
                    snippet: messageResponse.data.snippet,
                };
            })
        );

        return { success: true, emails };
    } catch (error) {
        console.error('Error fetching emails:', error);
        return { success: false, error: 'Failed to fetch emails', emails: [] };
    }
}

// Get email thread (full conversation)
export async function getEmailThread(threadId: string) {
    const profile = await getUser();

    if (!profile || !profile.gmailToken) {
        return { success: false, error: 'Gmail not connected' };
    }

    try {
        const gmail = await getValidGmailClient(profile);

        const threadResponse = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
            format: 'full',
        });

        const messages = threadResponse.data.messages?.map(msg => {
            const headers = msg.payload?.headers || [];
            const getHeader = (name: string) =>
                headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

            // Get body
            let body = '';
            if (msg.payload?.body?.data) {
                body = Buffer.from(msg.payload.body.data, 'base64').toString('utf-8');
            } else if (msg.payload?.parts) {
                const textPart = msg.payload.parts.find(p => p.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
                }
            }

            return {
                id: msg.id,
                from: getHeader('From'),
                to: getHeader('To'),
                subject: getHeader('Subject'),
                date: getHeader('Date'),
                body,
                snippet: msg.snippet,
            };
        }) || [];

        return { success: true, messages };
    } catch (error) {
        console.error('Error fetching thread:', error);
        return { success: false, error: 'Failed to fetch email thread' };
    }
}
