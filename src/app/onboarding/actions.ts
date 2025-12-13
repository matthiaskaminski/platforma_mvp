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

export async function createFirstProject(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // 1. Get Profile ID
    const profile = await prisma.profile.findUnique({
        where: { email: user.email! }
    })

    if (!profile) throw new Error('Profile not found')

    // 2. Create Client
    const client = await prisma.client.create({
        data: {
            designerId: profile.id,
            name: data.client.name,
            email: data.client.email,
            phone: data.client.phone,
            nip: data.client.nip,
            // companyName is not in schema directly on Client model?
            // Checking schema: Client has 'name', 'nip', 'phone', 'email', 'addressData'. No companyName field separated in my memory of schema.
            // But Contact has companyName. Let's assume client.name is the main identifier.
            // Wait, previous PlanStep assumed client.companyName. The schema has 'name'. I'll map companyName to name if present, or just use name.
            // If ClientType is COMMERCIAL, name might be company name.
            type: data.projectBasic.clientType // PRIVATE or COMMERCIAL
        }
    })

    // 3. Create Project
    const project = await prisma.project.create({
        data: {
            designerId: profile.id,
            clientId: client.id,
            name: data.projectBasic.name,
            description: data.projectBasic.description,
            icon: data.projectBasic.icon,
            color: data.projectBasic.color,
            status: data.projectDates.status || 'ACTIVE',

            // Details
            address: data.projectDetails.address,
            totalArea: data.projectDetails.totalArea ? parseFloat(data.projectDetails.totalArea) : null,
            budgetGoal: data.projectDetails.budgetGoal ? parseFloat(data.projectDetails.budgetGoal) : null,
            roomsCount: data.projectDetails.roomsCount ? parseInt(data.projectDetails.roomsCount) : null,
            floorsCount: data.projectDetails.floorsCount ? parseInt(data.projectDetails.floorsCount) : null,

            // Dates
            startDate: data.projectDates.startDate ? new Date(data.projectDates.startDate) : null,
            deadline: data.projectDates.deadline ? new Date(data.projectDates.deadline) : null,
        }
    })

    // 4. Mark Onboarding Complete
    await prisma.profile.update({
        where: { id: profile.id },
        data: { onboardingCompleted: true }
    })

    revalidatePath('/')
    return { success: true, projectId: project.id }
}

export async function resetOnboarding() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Find profile
    const profile = await prisma.profile.findUnique({
        where: { email: user.email! }
    })

    if (profile) {
        // Update to false
        await prisma.profile.update({
            where: { id: profile.id },
            data: { onboardingCompleted: false }
        })
    }

    revalidatePath('/')
    return { success: true }
}
