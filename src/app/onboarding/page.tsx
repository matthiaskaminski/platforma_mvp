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

    let profile = null
    try {
        profile = await prisma.profile.findUnique({
            where: { email: user.email! }
        })
    } catch (error) {
        console.error("DB Error in Onboarding Page:", error)
        // If DB is down, we can't really proceed, but logging is crucial
        throw error
    }

    if (profile?.onboardingCompleted) {
        redirect('/')
    }

    return <OnboardingWizard initialProfile={profile} />
}
