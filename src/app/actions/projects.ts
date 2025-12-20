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

/**
 * Get project with clients and contacts
 */
export async function getProjectWithContacts(projectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return null
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return null
    }

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        },
        include: {
            clients: true,
            contacts: true
        }
    })

    return project
}

/**
 * Add client to project
 */
export async function addClientToProject(projectId: string, data: {
    email: string
    fullName?: string
    phoneNumber?: string
    nip?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, error: 'Profile not found' }
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        return { success: false, error: 'Project not found' }
    }

    const client = await prisma.client.create({
        data: {
            projectId,
            email: data.email,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            nip: data.nip
        }
    })

    revalidatePath('/')
    revalidatePath('/messages')

    return { success: true, client }
}

/**
 * Update client
 */
export async function updateClient(clientId: string, data: {
    email?: string
    fullName?: string
    phoneNumber?: string
    nip?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, error: 'Profile not found' }
    }

    // Find client and verify ownership through project
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { project: true }
    })

    if (!client || client.project.designerId !== profile.id) {
        return { success: false, error: 'Client not found' }
    }

    const updated = await prisma.client.update({
        where: { id: clientId },
        data
    })

    revalidatePath('/')
    revalidatePath('/messages')

    return { success: true, client: updated }
}

/**
 * Delete client
 */
export async function deleteClient(clientId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, error: 'Profile not found' }
    }

    // Find client and verify ownership through project
    const client = await prisma.client.findUnique({
        where: { id: clientId },
        include: { project: true }
    })

    if (!client || client.project.designerId !== profile.id) {
        return { success: false, error: 'Client not found' }
    }

    await prisma.client.delete({
        where: { id: clientId }
    })

    revalidatePath('/')
    revalidatePath('/messages')

    return { success: true }
}

/**
 * Add contact to project
 */
export async function addContactToProject(projectId: string, data: {
    name: string
    email?: string
    phone?: string
    role?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, error: 'Profile not found' }
    }

    // Verify ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        return { success: false, error: 'Project not found' }
    }

    const contact = await prisma.contact.create({
        data: {
            projectId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role
        }
    })

    revalidatePath('/')
    revalidatePath('/messages')
    revalidatePath('/contacts')

    return { success: true, contact }
}

/**
 * Update contact
 */
export async function updateContact(contactId: string, data: {
    name?: string
    email?: string
    phone?: string
    role?: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, error: 'Profile not found' }
    }

    // Find contact and verify ownership through project
    const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: { project: true }
    })

    if (!contact || contact.project.designerId !== profile.id) {
        return { success: false, error: 'Contact not found' }
    }

    const updated = await prisma.contact.update({
        where: { id: contactId },
        data
    })

    revalidatePath('/')
    revalidatePath('/messages')
    revalidatePath('/contacts')

    return { success: true, contact: updated }
}

/**
 * Delete contact
 */
export async function deleteContact(contactId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, error: 'Unauthorized' }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, error: 'Profile not found' }
    }

    // Find contact and verify ownership through project
    const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: { project: true }
    })

    if (!contact || contact.project.designerId !== profile.id) {
        return { success: false, error: 'Contact not found' }
    }

    await prisma.contact.delete({
        where: { id: contactId }
    })

    revalidatePath('/')
    revalidatePath('/messages')
    revalidatePath('/contacts')

    return { success: true }
}

/**
 * Get all contacts from all projects
 */
export async function getAllContacts() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return { success: false, contacts: [], clients: [] }
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return { success: false, contacts: [], clients: [] }
    }

    const projects = await prisma.project.findMany({
        where: { designerId: profile.id },
        include: {
            clients: true,
            contacts: true
        }
    })

    const contacts: any[] = []
    const clients: any[] = []

    projects.forEach(project => {
        project.clients.forEach(client => {
            clients.push({
                ...client,
                projectId: project.id,
                projectName: project.name
            })
        })
        project.contacts.forEach(contact => {
            contacts.push({
                ...contact,
                projectId: project.id,
                projectName: project.name
            })
        })
    })

    return { success: true, contacts, clients }
}

/**
 * Get active tasks count for sidebar badge
 */
export async function getActiveTasksCount() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return 0
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        return 0
    }

    const activeProjectId = await getActiveProjectId()

    if (!activeProjectId) {
        return 0
    }

    const count = await prisma.task.count({
        where: {
            projectId: activeProjectId,
            project: { designerId: profile.id },
            status: { not: 'DONE' }
        }
    })

    return count
}
