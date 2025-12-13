import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import OnboardingWizard from './OnboardingWizard'

export default async function OnboardingPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email! }
    })

    if (profile?.onboardingCompleted) {
        redirect('/')
    }

    return <OnboardingWizard initialProfile={profile} />
}
