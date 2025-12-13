'use server'

import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { RoomType, RoomStatus } from '@prisma/client'

/**
 * Create a new room
 */
export async function createRoom(data: {
    projectId: string
    name: string
    type: RoomType
    area?: number
    floorNumber?: number
    budgetAllocated?: number
    coverImage?: string
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: {
            id: data.projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        throw new Error('Project not found or unauthorized')
    }

    // Create room
    const room = await prisma.room.create({
        data: {
            projectId: data.projectId,
            name: data.name,
            type: data.type,
            status: 'NOT_STARTED',
            area: data.area,
            floorNumber: data.floorNumber,
            budgetAllocated: data.budgetAllocated,
            coverImage: data.coverImage
        }
    })

    revalidatePath('/rooms')
    revalidatePath(`/rooms/${room.id}`)

    return room
}

/**
 * Update room
 */
export async function updateRoom(roomId: string, data: {
    name?: string
    type?: RoomType
    status?: RoomStatus
    area?: number
    floorNumber?: number
    budgetAllocated?: number
    coverImage?: string
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

    // Verify room ownership through project
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { project: true }
    })

    if (!room || room.project.designerId !== profile.id) {
        throw new Error('Room not found or unauthorized')
    }

    // Update room
    const updated = await prisma.room.update({
        where: { id: roomId },
        data
    })

    revalidatePath('/rooms')
    revalidatePath(`/rooms/${roomId}`)

    return updated
}

/**
 * Delete room
 */
export async function deleteRoom(roomId: string) {
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

    // Verify room ownership through project
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { project: true }
    })

    if (!room || room.project.designerId !== profile.id) {
        throw new Error('Room not found or unauthorized')
    }

    // Delete room (cascade will handle related data)
    await prisma.room.delete({
        where: { id: roomId }
    })

    revalidatePath('/rooms')
}

/**
 * Get room by ID
 */
export async function getRoomById(roomId: string) {
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

    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            project: {
                designerId: profile.id
            }
        },
        include: {
            // Only fetch counts for better performance
            _count: {
                select: {
                    productItems: true,
                    tasks: true,
                    notes: true,
                    galleryImages: true
                }
            },
            project: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    return room
}

/**
 * Get products for a room
 */
export async function getRoomProducts(roomId: string) {
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

    // Verify room ownership
    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!room) {
        return []
    }

    const products = await prisma.productItem.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return products
}
