'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
    firstName: string
    lastName: string
    studioName?: string
    phone?: string
    nip?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    await prisma.profile.upsert({
        where: { email: user.email! },
        update: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            studioName: formData.studioName,
            phone: formData.phone,
            nip: formData.nip,
        },
        create: {
            id: user.id, // Sync with Auth ID
            email: user.email!,
            firstName: formData.firstName,
            lastName: formData.lastName,
            studioName: formData.studioName,
            phone: formData.phone,
            nip: formData.nip,
        }
    })

    revalidatePath('/onboarding')
    return { success: true }
}

export async function updateSubscription(plan: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Find profile first
    const profile = await prisma.profile.findUnique({
        where: { email: user.email! }
    })

    if (!profile) throw new Error('Profile not found')

    // Check if subscription exists, if not create, else update
    const existingSub = await prisma.subscription.findFirst({
        where: { profileId: profile.id }
    })

    if (existingSub) {
        await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
                plan,
                status: 'active',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
        })
    } else {
        await prisma.subscription.create({
            data: {
                profileId: profile.id,
                plan,
                status: 'active',
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        })
    }

    revalidatePath('/onboarding')
    return { success: true }
}

export async function updateTheme(preferences: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    await prisma.profile.update({
        where: { email: user.email! },
        data: {
            preferences: preferences // JSON
        }
    })

    // Also update logo if provided? For now assume it was handled via upload separately or included in preferences if it's just a URL
    if (preferences.logoUrl) {
        await prisma.profile.update({
            where: { email: user.email! },
            data: { logoUrl: preferences.logoUrl }
        })
    }

    revalidatePath('/onboarding')
    return { success: true }
}

export async function completeOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    await prisma.profile.update({
        where: { email: user.email! },
        data: {
            onboardingCompleted: true
        }
    })

    revalidatePath('/')
    return { success: true }
}
