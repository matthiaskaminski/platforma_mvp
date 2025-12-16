import { NextRequest, NextResponse } from 'next/server';
import { getGoogleTokens, getGoogleUserInfo } from '@/lib/google';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Handle errors from Google
    if (error) {
        console.error('Google OAuth error:', error);
        return NextResponse.redirect(
            new URL('/settings?error=google_auth_failed', request.url)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL('/settings?error=no_code', request.url)
        );
    }

    try {
        // Get current user from Supabase
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.email) {
            return NextResponse.redirect(
                new URL('/login?error=not_authenticated', request.url)
            );
        }

        // Get profile
        const profile = await prisma.profile.findUnique({
            where: { email: user.email },
        });

        if (!profile) {
            return NextResponse.redirect(
                new URL('/settings?error=profile_not_found', request.url)
            );
        }

        // Exchange code for tokens
        const tokens = await getGoogleTokens(code);

        if (!tokens.access_token || !tokens.refresh_token) {
            console.error('Missing tokens from Google');
            return NextResponse.redirect(
                new URL('/settings?error=missing_tokens', request.url)
            );
        }

        // Get user info from Google
        const googleUser = await getGoogleUserInfo(tokens.access_token);

        if (!googleUser.email) {
            return NextResponse.redirect(
                new URL('/settings?error=no_email', request.url)
            );
        }

        // Calculate expiry date
        const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600 * 1000));

        // Save or update Gmail token
        await prisma.gmailToken.upsert({
            where: { profileId: profile.id },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
                gmailEmail: googleUser.email,
            },
            create: {
                profileId: profile.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt,
                gmailEmail: googleUser.email,
            },
        });

        // Redirect to settings with success
        return NextResponse.redirect(
            new URL('/settings?gmail=connected', request.url)
        );
    } catch (error) {
        console.error('Error processing Google OAuth callback:', error);
        return NextResponse.redirect(
            new URL('/settings?error=callback_failed', request.url)
        );
    }
}
