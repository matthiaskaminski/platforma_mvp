import { getGmailStatus } from '@/app/actions/gmail';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const gmailStatus = await getGmailStatus();

    return <SettingsClient gmailStatus={gmailStatus} />;
}
