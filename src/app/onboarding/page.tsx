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
        throw error
    }

    // Check if onboarding is complete by checking if a project exists
    // (Since we removed the boolean flag from schema)
    if (profile) {
        const project = await prisma.project.findFirst({
            where: { designerId: profile.id }
        })

        if (project) {
            redirect('/')
        }
    }

    return <OnboardingWizard initialProfile={profile} />
}
