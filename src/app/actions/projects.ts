'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * Get all projects for current user
 */
export async function getUserProjects() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return []
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return []
    }

    const projects = await prisma.project.findMany({
        where: { designerId: profile.id },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            status: true,
            createdAt: true,
        }
    })

    return projects
}

/**
 * Set active project in cookie
 */
export async function setActiveProject(projectId: string) {
    const cookieStore = await cookies()
    cookieStore.set('active-project-id', projectId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    revalidatePath('/')
    revalidatePath('/rooms')
    revalidatePath('/calendar')
    revalidatePath('/tasks')
}

/**
 * Get active project ID from cookie
 */
export async function getActiveProjectId(): Promise<string | null> {
    const cookieStore = await cookies()
    const activeProjectId = cookieStore.get('active-project-id')
    return activeProjectId?.value || null
}

/**
 * Delete project
 */
export async function deleteProject(projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        throw new Error('Unauthorized')
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        throw new Error('Profile not found')
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        throw new Error('Project not found or unauthorized')
    }

    // Delete project (cascade will handle related data)
    await prisma.project.delete({
        where: { id: projectId }
    })

    // If this was the active project, clear the cookie
    const activeProjectId = await getActiveProjectId()
    if (activeProjectId === projectId) {
        const cookieStore = await cookies()
        cookieStore.delete('active-project-id')
    }

    revalidatePath('/')
    revalidatePath('/rooms')
}

/**
 * Update project
 */
export async function updateProject(projectId: string, data: {
    name?: string
    description?: string
    icon?: string
    color?: string
    status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'
    address?: string
    city?: string
    postalCode?: string
    totalArea?: number
    floorsCount?: number
    roomsCount?: number
    budgetGoal?: number
    startDate?: Date
    deadline?: Date
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        throw new Error('Unauthorized')
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        throw new Error('Profile not found')
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        throw new Error('Project not found or unauthorized')
    }

    // Update project
    const updated = await prisma.project.update({
        where: { id: projectId },
        data
    })

    revalidatePath('/')
    revalidatePath('/rooms')

    return updated
}

/**
 * Create new project (simple version)
 */
export async function createProject(data: {
    name: string
    description?: string
    icon?: string
    color?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        throw new Error('Unauthorized')
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        throw new Error('Profile not found')
    }

    // Create project
    const project = await prisma.project.create({
        data: {
            designerId: profile.id,
            name: data.name,
            description: data.description,
            icon: data.icon || 'Home',
            color: data.color || '#3F3F46',
            status: 'ACTIVE'
        }
    })

    // Set as active project
    await setActiveProject(project.id)

    revalidatePath('/')
    redirect('/')
}

/**
 * Upload project cover image
 */
export async function uploadProjectCoverImage(projectId: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        throw new Error('Unauthorized')
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        throw new Error('Profile not found')
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        throw new Error('Project not found or unauthorized')
    }

    const file = formData.get('file') as File
    if (!file) {
        throw new Error('No file provided')
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${projectId}-${Date.now()}.${fileExt}`
    const filePath = `projects/${fileName}`

    // Upload to Supabase Storage - using File directly
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Liru')
        .upload(filePath, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
        })

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('Liru')
        .getPublicUrl(filePath)

    // Update project with cover image URL
    await prisma.project.update({
        where: { id: projectId },
        data: { coverImage: publicUrl }
    })

    revalidatePath('/rooms/[id]', 'page')

    return { url: publicUrl }
}
