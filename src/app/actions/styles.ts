'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { StyleQuizStatus, StyleLinkStatus } from '@prisma/client'
import crypto from 'crypto'

// ============================================
// STYLE QUIZ CRUD OPERATIONS
// ============================================

/**
 * Get all style quizzes for a project
 */
export async function getStyleQuizzes(projectId: string) {
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

    const quizzes = await prisma.styleQuiz.findMany({
        where: { projectId },
        include: {
            categories: {
                include: {
                    images: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            },
            links: {
                include: {
                    _count: {
                        select: { selections: true }
                    }
                }
            },
            _count: {
                select: { categories: true, links: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return quizzes
}

/**
 * Get a single style quiz by ID
 */
export async function getStyleQuizById(quizId: string) {
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

    const quiz = await prisma.styleQuiz.findFirst({
        where: {
            id: quizId,
            project: {
                designerId: profile.id
            }
        },
        include: {
            project: {
                select: { id: true, name: true }
            },
            categories: {
                include: {
                    images: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            },
            links: {
                include: {
                    selections: {
                        include: {
                            image: {
                                include: {
                                    category: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    return quiz
}

/**
 * Create a new style quiz
 */
export async function createStyleQuiz(data: {
    projectId: string
    title: string
    description?: string
    instruction?: string
    logoUrl?: string
    categories: {
        name: string
        description?: string
        images: {
            imageUrl: string
            caption?: string
        }[]
    }[]
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
        where: {
            id: data.projectId,
            designerId: profile.id
        }
    })

    if (!project) {
        return { success: false, error: 'Project not found' }
    }

    try {
        const quiz = await prisma.styleQuiz.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                instruction: data.instruction,
                logoUrl: data.logoUrl,
                status: 'DRAFT',
                categories: {
                    create: data.categories.map((cat, catIndex) => ({
                        name: cat.name,
                        description: cat.description,
                        order: catIndex,
                        images: {
                            create: cat.images.map((img, imgIndex) => ({
                                imageUrl: img.imageUrl,
                                caption: img.caption,
                                order: imgIndex
                            }))
                        }
                    }))
                }
            },
            include: {
                categories: {
                    include: {
                        images: true
                    }
                }
            }
        })

        revalidatePath(`/projects/${data.projectId}`)
        revalidatePath('/styles')

        return { success: true, data: quiz }
    } catch (error) {
        console.error('Error creating style quiz:', error)
        return { success: false, error: 'Failed to create style quiz' }
    }
}

/**
 * Update style quiz
 */
export async function updateStyleQuiz(quizId: string, data: {
    title?: string
    description?: string
    instruction?: string
    logoUrl?: string
    status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'
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

    // Verify quiz ownership
    const quiz = await prisma.styleQuiz.findFirst({
        where: {
            id: quizId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!quiz) {
        return { success: false, error: 'Style quiz not found' }
    }

    try {
        const updated = await prisma.styleQuiz.update({
            where: { id: quizId },
            data: {
                title: data.title,
                description: data.description,
                instruction: data.instruction,
                logoUrl: data.logoUrl,
                status: data.status as StyleQuizStatus
            }
        })

        revalidatePath(`/styles/${quizId}`)
        revalidatePath('/styles')

        return { success: true, data: updated }
    } catch (error) {
        console.error('Error updating style quiz:', error)
        return { success: false, error: 'Failed to update style quiz' }
    }
}

/**
 * Delete style quiz
 */
export async function deleteStyleQuiz(quizId: string) {
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

    // Verify quiz ownership
    const quiz = await prisma.styleQuiz.findFirst({
        where: {
            id: quizId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!quiz) {
        return { success: false, error: 'Style quiz not found' }
    }

    try {
        await prisma.styleQuiz.delete({
            where: { id: quizId }
        })

        revalidatePath('/styles')

        return { success: true }
    } catch (error) {
        console.error('Error deleting style quiz:', error)
        return { success: false, error: 'Failed to delete style quiz' }
    }
}

/**
 * Add category to quiz
 */
export async function addStyleCategory(quizId: string, data: {
    name: string
    description?: string
    images: {
        imageUrl: string
        caption?: string
    }[]
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

    // Verify quiz ownership
    const quiz = await prisma.styleQuiz.findFirst({
        where: {
            id: quizId,
            project: {
                designerId: profile.id
            }
        },
        include: {
            _count: { select: { categories: true } }
        }
    })

    if (!quiz) {
        return { success: false, error: 'Style quiz not found' }
    }

    try {
        const category = await prisma.styleCategory.create({
            data: {
                styleQuizId: quizId,
                name: data.name,
                description: data.description,
                order: quiz._count.categories,
                images: {
                    create: data.images.map((img, idx) => ({
                        imageUrl: img.imageUrl,
                        caption: img.caption,
                        order: idx
                    }))
                }
            },
            include: {
                images: true
            }
        })

        revalidatePath('/styles')

        return { success: true, data: category }
    } catch (error) {
        console.error('Error adding category:', error)
        return { success: false, error: 'Failed to add category' }
    }
}

/**
 * Add images to category
 */
export async function addStyleImages(categoryId: string, images: {
    imageUrl: string
    caption?: string
}[]) {
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

    // Verify category ownership
    const category = await prisma.styleCategory.findFirst({
        where: {
            id: categoryId,
            styleQuiz: {
                project: {
                    designerId: profile.id
                }
            }
        },
        include: {
            _count: { select: { images: true } }
        }
    })

    if (!category) {
        return { success: false, error: 'Category not found' }
    }

    try {
        const createdImages = await prisma.styleImage.createMany({
            data: images.map((img, idx) => ({
                categoryId,
                imageUrl: img.imageUrl,
                caption: img.caption,
                order: category._count.images + idx
            }))
        })

        revalidatePath('/styles')

        return { success: true, data: createdImages }
    } catch (error) {
        console.error('Error adding images:', error)
        return { success: false, error: 'Failed to add images' }
    }
}

// ============================================
// STYLE LINKS
// ============================================

/**
 * Generate a unique link for a style quiz
 */
export async function generateStyleLink(quizId: string, data: {
    clientName?: string
    clientEmail?: string
    expiresInDays?: number
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

    // Verify quiz ownership
    const quiz = await prisma.styleQuiz.findFirst({
        where: {
            id: quizId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!quiz) {
        return { success: false, error: 'Style quiz not found' }
    }

    try {
        // Generate unique token
        const token = crypto.randomBytes(16).toString('hex')

        // Calculate expiry date (default 14 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 14))

        const link = await prisma.styleLink.create({
            data: {
                styleQuizId: quizId,
                token,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                status: 'ACTIVE',
                expiresAt
            }
        })

        // Update quiz status to ACTIVE if it was DRAFT
        if (quiz.status === 'DRAFT') {
            await prisma.styleQuiz.update({
                where: { id: quizId },
                data: { status: 'ACTIVE' }
            })
        }

        revalidatePath(`/styles/${quizId}`)

        return {
            success: true,
            data: {
                ...link,
                url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/client/style/${token}`
            }
        }
    } catch (error) {
        console.error('Error generating style link:', error)
        return { success: false, error: 'Failed to generate link' }
    }
}

/**
 * Get style quiz by link token (PUBLIC - no auth required)
 */
export async function getStyleQuizByToken(token: string) {
    const link = await prisma.styleLink.findUnique({
        where: { token },
        include: {
            styleQuiz: {
                include: {
                    categories: {
                        include: {
                            images: {
                                orderBy: { order: 'asc' }
                            }
                        },
                        orderBy: { order: 'asc' }
                    },
                    project: {
                        select: {
                            name: true,
                            designer: {
                                select: {
                                    fullName: true,
                                    studioName: true
                                }
                            }
                        }
                    }
                }
            },
            selections: {
                include: {
                    image: true
                }
            }
        }
    })

    if (!link) {
        return { success: false, error: 'Link not found' }
    }

    // Check if link is expired
    if (link.status === 'EXPIRED' || new Date() > link.expiresAt) {
        if (link.status !== 'EXPIRED') {
            await prisma.styleLink.update({
                where: { id: link.id },
                data: { status: 'EXPIRED' }
            })
        }
        return { success: false, error: 'Link expired' }
    }

    // Check if already completed
    if (link.status === 'COMPLETED') {
        return { success: false, error: 'Style quiz already completed' }
    }

    return { success: true, data: link }
}

// ============================================
// STYLE SELECTIONS (PUBLIC)
// ============================================

/**
 * Submit style selections (PUBLIC - no auth required)
 */
export async function submitStyleSelections(token: string, selections: {
    imageId: string
    isSelected: boolean
    comment?: string
}[]) {
    const link = await prisma.styleLink.findUnique({
        where: { token },
        include: {
            styleQuiz: {
                include: {
                    project: {
                        select: {
                            designerId: true,
                            name: true
                        }
                    }
                }
            }
        }
    })

    if (!link) {
        return { success: false, error: 'Link not found' }
    }

    // Check if link is valid
    if (link.status !== 'ACTIVE') {
        return { success: false, error: 'Link is no longer active' }
    }

    if (new Date() > link.expiresAt) {
        await prisma.styleLink.update({
            where: { id: link.id },
            data: { status: 'EXPIRED' }
        })
        return { success: false, error: 'Link expired' }
    }

    try {
        // Create selections (only selected images)
        const selectedItems = selections.filter(s => s.isSelected)

        if (selectedItems.length > 0) {
            await prisma.styleSelection.createMany({
                data: selectedItems.map(s => ({
                    linkId: link.id,
                    imageId: s.imageId,
                    isSelected: true,
                    comment: s.comment
                }))
            })
        }

        // Calculate new expiry (24h after completion)
        const newExpiresAt = new Date()
        newExpiresAt.setHours(newExpiresAt.getHours() + 24)

        // Update link status to COMPLETED
        await prisma.styleLink.update({
            where: { id: link.id },
            data: {
                status: 'COMPLETED',
                completedAt: new Date(),
                expiresAt: newExpiresAt
            }
        })

        // Create notification for designer
        await prisma.notification.create({
            data: {
                profileId: link.styleQuiz.project.designerId,
                type: 'STYLE_COMPLETED',
                title: 'Style quiz wypełniony',
                message: `${link.clientName || 'Klient'} wypełnił quiz stylów "${link.styleQuiz.title}" dla projektu "${link.styleQuiz.project.name}"`,
                data: {
                    styleQuizId: link.styleQuizId,
                    linkId: link.id
                }
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error submitting style selections:', error)
        return { success: false, error: 'Failed to submit selections' }
    }
}

/**
 * Get total image count for a quiz
 */
export async function getStyleQuizImageCount(quizId: string) {
    const count = await prisma.styleImage.count({
        where: {
            category: {
                styleQuizId: quizId
            }
        }
    })

    return count
}
