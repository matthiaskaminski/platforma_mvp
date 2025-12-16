import { google } from 'googleapis';

// Google OAuth2 client configuration
export function getGoogleOAuthClient() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`
    );
}

// Scopes required for Gmail API
export const GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
];

// Generate OAuth URL for user authorization
export function getGoogleAuthUrl(state?: string) {
    const oauth2Client = getGoogleOAuthClient();

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: GMAIL_SCOPES,
        prompt: 'consent', // Force consent screen to get refresh token
        state: state || '',
    });
}

// Exchange authorization code for tokens
export async function getGoogleTokens(code: string) {
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

// Get Gmail client with tokens
export function getGmailClient(accessToken: string, refreshToken: string) {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
    });

    return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Get user info from Google
export async function getGoogleUserInfo(accessToken: string) {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({ access_token: accessToken });

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    return data;
}

// Refresh access token if expired
export async function refreshAccessToken(refreshToken: string) {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
}
