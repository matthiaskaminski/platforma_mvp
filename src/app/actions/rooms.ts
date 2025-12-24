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
    budgetAllocated?: number | null  // null to remove budget limit
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

    const room = await prisma.room.findUnique({
        where: {
            id: roomId
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
            project: true
        }
    })

    // Verify ownership after fetch
    if (!room || room.project.designerId !== profile.id) {
        return null
    }

    // Return room with needed project fields
    // Using type assertion to match expected return type
    return {
        id: room.id,
        name: room.name,
        type: room.type,
        status: room.status,
        area: room.area,
        floorNumber: room.floorNumber,
        budgetAllocated: room.budgetAllocated,
        coverImage: room.coverImage,
        projectId: room.projectId,
        _count: room._count,
        project: {
            id: room.project.id,
            name: room.project.name,
            coverImage: room.project.coverImage
        }
    } as any
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

/**
 * Get tasks for a room
 */
export async function getRoomTasks(roomId: string) {
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

    const tasks = await prisma.task.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return tasks
}

/**
 * Get budget data for a room (uses products)
 */
export async function getRoomBudget(roomId: string) {
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

    // Fetch only MAIN products for budget (they are counted in budget)
    const products = await prisma.productItem.findMany({
        where: {
            roomId: roomId,
            planningStatus: 'MAIN'  // Only MAIN products count towards budget
        },
        select: {
            id: true,
            name: true,
            category: true,
            supplier: true,
            url: true,
            imageUrl: true,
            price: true,
            quantity: true,
            paidAmount: true,
            status: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return products
}

/**
 * Get gallery images for a room
 */
export async function getRoomGallery(roomId: string) {
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

    const galleryImages = await prisma.galleryImage.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return galleryImages
}

/**
 * Get notes for a room
 */
export async function getRoomNotes(roomId: string) {
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

    const notes = await prisma.note.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return notes
}

/**
 * Get documents for a project (displayed in room details page)
 */
export async function getProjectDocuments(projectId: string) {
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        return []
    }

    const documents = await prisma.document.findMany({
        where: {
            projectId: projectId
        },
        orderBy: {
            uploadedAt: 'desc'
        }
    })

    return documents
}

/**
 * Get project history (activity log compiled from various sources)
 */
export async function getProjectHistory(projectId: string) {
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        return []
    }

    // Gather recent activities from different sources
    const [tasks, products, documents, notes] = await Promise.all([
        // Recent tasks (created or updated)
        prisma.task.findMany({
            where: { projectId: projectId },
            orderBy: { updatedAt: 'desc' },
            take: 20,
            select: {
                id: true,
                title: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        }),
        // Recent products
        prisma.productItem.findMany({
            where: {
                room: {
                    projectId: projectId
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                name: true,
                createdAt: true,
                status: true
            }
        }),
        // Recent documents
        prisma.document.findMany({
            where: { projectId: projectId },
            orderBy: { uploadedAt: 'desc' },
            take: 20,
            select: {
                id: true,
                name: true,
                uploadedAt: true
            }
        }),
        // Recent notes
        prisma.note.findMany({
            where: {
                room: {
                    projectId: projectId
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                content: true,
                createdAt: true
            }
        })
    ])

    // Compile into unified history format
    const historyItems: any[] = []

    // Add tasks
    tasks.forEach(task => {
        historyItems.push({
            id: `task-${task.id}`,
            type: 'task',
            action: task.status === 'DONE' ? 'ukończono zadanie' : 'zaktualizowano zadanie',
            target: task.title,
            timestamp: task.updatedAt,
            icon: 'CheckCircle2'
        })
    })

    // Add products
    products.forEach(product => {
        historyItems.push({
            id: `product-${product.id}`,
            type: 'product',
            action: 'dodano produkt',
            target: product.name,
            timestamp: product.createdAt,
            icon: 'Package'
        })
    })

    // Add documents
    documents.forEach(doc => {
        historyItems.push({
            id: `document-${doc.id}`,
            type: 'document',
            action: 'dodano plik',
            target: doc.name,
            timestamp: doc.uploadedAt,
            icon: 'FileText'
        })
    })

    // Add notes
    notes.forEach(note => {
        const noteTitle = note.content.split('\n')[0].substring(0, 50) || 'Notatka'
        historyItems.push({
            id: `note-${note.id}`,
            type: 'note',
            action: 'dodano notatkę',
            target: noteTitle,
            timestamp: note.createdAt,
            icon: 'StickyNote'
        })
    })

    // Sort by timestamp descending
    historyItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Take top 50 items
    return historyItems.slice(0, 50)
}

/**
 * Get project summary for room details page
 */
export async function getProjectSummary(projectId: string) {
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

    // Get project with budget and tasks
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            designerId: profile.id
        },
        select: {
            budgetGoal: true,
            rooms: {
                select: {
                    productItems: {
                        select: {
                            price: true,
                            quantity: true,
                            paidAmount: true,
                            category: true
                        }
                    }
                }
            },
            tasks: {
                where: {
                    status: {
                        in: ['TODO', 'IN_PROGRESS']
                    }
                },
                orderBy: [
                    { dueDate: 'asc' }
                ],
                take: 2,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    dueDate: true
                }
            }
        }
    })

    return project
}

/**
 * Get room summary (budget and tasks for specific room)
 * Budget estymacyjny = sum of MAIN products only
 * Budget rzeczywisty = sum of APPROVED products only
 * If room has no budget, show % of project budget
 */
export async function getRoomSummary(roomId: string) {
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

    // Get room with products, tasks and project budget
    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            project: {
                designerId: profile.id
            }
        },
        select: {
            id: true,
            name: true,
            budgetAllocated: true,  // Room-specific budget (optional)
            project: {
                select: {
                    id: true,
                    budgetGoal: true  // Project total budget
                }
            },
            productItems: {
                select: {
                    price: true,
                    quantity: true,
                    paidAmount: true,
                    category: true,
                    planningStatus: true  // Include planning status for budget calculation
                }
            },
            tasks: {
                where: {
                    status: {
                        in: ['TODO', 'IN_PROGRESS']
                    }
                },
                orderBy: [
                    { dueDate: 'asc' }
                ],
                take: 2,
                select: {
                    id: true,
                    title: true,
                    status: true,
                    dueDate: true
                }
            }
        }
    })

    if (!room) {
        return null
    }

    // Get all rooms in the project for budget breakdown
    const allProjectRooms = await prisma.room.findMany({
        where: {
            projectId: room.project.id
        },
        select: {
            id: true,
            name: true,
            productItems: {
                where: {
                    planningStatus: 'MAIN'
                },
                select: {
                    price: true,
                    quantity: true
                }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })

    // Get services for the project
    const projectServices = await prisma.serviceItem.findMany({
        where: {
            projectId: room.project.id
        },
        select: {
            category: true,
            planningStatus: true,
            price: true,
            roomId: true
        }
    })

    // Calculate services budget
    let materialPlanned = 0;
    let materialApproved = 0;
    let laborPlanned = 0;
    let laborApproved = 0;

    projectServices.forEach(service => {
        const price = Number(service.price) || 0;
        if (service.category === 'MATERIAL') {
            if (service.planningStatus === 'PLANNED') materialPlanned += price;
            if (service.planningStatus === 'APPROVED') materialApproved += price;
        } else if (service.category === 'LABOR') {
            if (service.planningStatus === 'PLANNED') laborPlanned += price;
            if (service.planningStatus === 'APPROVED') laborApproved += price;
        }
    });

    // Calculate spent for each room
    const roomsBreakdown = allProjectRooms.map(r => {
        const spent = r.productItems.reduce((sum, item) => {
            return sum + (Number(item.price) * item.quantity)
        }, 0)
        return {
            id: r.id,
            name: r.name,
            spent,
            isCurrentRoom: r.id === roomId
        }
    }).filter(r => r.spent > 0)
    .sort((a, b) => b.spent - a.spent)

    // Filter products for estimated budget (only MAIN products)
    const mainProducts = room.productItems.filter(p => p.planningStatus === 'MAIN');

    // Check if room has its own budget (not null AND greater than 0)
    const roomBudgetValue = Number(room.budgetAllocated) || 0;
    const hasRoomBudget = room.budgetAllocated !== null && roomBudgetValue > 0;

    // Return room budget if set, otherwise return project budget for percentage calculation
    return {
        budgetGoal: room.budgetAllocated,  // Room-specific budget (can be null)
        projectBudget: room.project.budgetGoal,  // Project total budget for percentage
        hasRoomBudget,  // Flag to know if room has its own budget (not null AND > 0)
        rooms: [{ productItems: mainProducts }],  // Only MAIN products for budget calculation
        allProducts: room.productItems,  // All products for reference
        tasks: room.tasks,
        currentRoomId: roomId,
        currentRoomName: room.name,
        roomsBreakdown,  // All rooms with their spent amounts
        services: { materialPlanned, materialApproved, laborPlanned, laborApproved }  // Services budget
    }
}

/**
 * Upload room cover image
 */
export async function uploadRoomCoverImage(roomId: string, formData: FormData) {
    try {
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
        const fileName = `${user.id}/${Date.now()}-room-${roomId}.${fileExt}`

        // Upload to Supabase Storage - using File directly
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('room-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            throw new Error(`Upload failed: ${uploadError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('room-images')
            .getPublicUrl(fileName)

        // Update room with cover image URL
        await prisma.room.update({
            where: { id: roomId },
            data: { coverImage: publicUrl }
        })

        revalidatePath('/rooms')
        revalidatePath(`/rooms/${roomId}`)

        return { url: publicUrl }
    } catch (error) {
        console.error('uploadRoomCoverImage error:', error)
        throw error
    }
}

/**
 * Get all rooms for the active project
 */
export async function getActiveProjectRooms() {
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

    // Get active project ID from cookies
    const cookies = await import('next/headers').then(m => m.cookies())
    const activeProjectId = cookies.get('active-project-id')?.value

    // If we have an active project, use it; otherwise get rooms from all projects
    if (activeProjectId) {
        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: activeProjectId,
                designerId: profile.id
            }
        })

        if (project) {
            const rooms = await prisma.room.findMany({
                where: {
                    projectId: activeProjectId
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    coverImage: true
                },
                orderBy: {
                    name: 'asc'
                }
            })
            return rooms
        }
    }

    // Fallback: get rooms from all designer's projects
    const rooms = await prisma.room.findMany({
        where: {
            project: {
                designerId: profile.id
            }
        },
        select: {
            id: true,
            name: true,
            type: true,
            coverImage: true
        },
        orderBy: {
            name: 'asc'
        }
    })

    return rooms
}
