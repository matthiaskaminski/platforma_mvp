import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        // Verify user is authenticated
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Generate Google OAuth URL
        const authUrl = getGoogleAuthUrl();

        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Error generating Google auth URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate auth URL' },
            { status: 500 }
        );
    }
}
