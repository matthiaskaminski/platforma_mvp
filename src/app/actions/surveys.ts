'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { SurveyQuestionType, SurveyStatus, SurveyLinkStatus } from '@prisma/client'
import crypto from 'crypto'

// PRESET_QUESTIONS moved to @/lib/survey-presets.ts (non-server file)

// ============================================
// SURVEY CRUD OPERATIONS
// ============================================

/**
 * Get all surveys for a project
 */
export async function getSurveys(projectId: string) {
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

    const surveys = await prisma.survey.findMany({
        where: { projectId },
        include: {
            questions: {
                orderBy: { order: 'asc' }
            },
            links: {
                include: {
                    _count: {
                        select: { responses: true }
                    }
                }
            },
            _count: {
                select: { questions: true, links: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return surveys
}

/**
 * Get a single survey by ID
 */
export async function getSurveyById(surveyId: string) {
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

    const survey = await prisma.survey.findFirst({
        where: {
            id: surveyId,
            project: {
                designerId: profile.id
            }
        },
        include: {
            project: {
                select: { id: true, name: true }
            },
            questions: {
                orderBy: { order: 'asc' }
            },
            links: {
                include: {
                    responses: {
                        include: {
                            question: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    return survey
}

/**
 * Create a new survey
 */
export async function createSurvey(data: {
    projectId: string
    title: string
    description?: string
    questions: {
        category?: string
        question: string
        type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT' | 'SCALE'
        options?: string[]
        isRequired?: boolean
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
        const survey = await prisma.survey.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                description: data.description,
                status: 'DRAFT',
                questions: {
                    create: data.questions.map((q, index) => ({
                        category: q.category,
                        question: q.question,
                        type: q.type as SurveyQuestionType,
                        options: q.options || [],
                        isRequired: q.isRequired ?? true,
                        order: index
                    }))
                }
            },
            include: {
                questions: true
            }
        })

        revalidatePath(`/projects/${data.projectId}`)
        revalidatePath('/surveys')

        return { success: true, data: survey }
    } catch (error) {
        console.error('Error creating survey:', error)
        return { success: false, error: 'Failed to create survey' }
    }
}

/**
 * Update survey
 */
export async function updateSurvey(surveyId: string, data: {
    title?: string
    description?: string
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

    // Verify survey ownership
    const survey = await prisma.survey.findFirst({
        where: {
            id: surveyId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!survey) {
        return { success: false, error: 'Survey not found' }
    }

    try {
        const updated = await prisma.survey.update({
            where: { id: surveyId },
            data: {
                title: data.title,
                description: data.description,
                status: data.status as SurveyStatus
            }
        })

        revalidatePath(`/surveys/${surveyId}`)
        revalidatePath('/surveys')

        return { success: true, data: updated }
    } catch (error) {
        console.error('Error updating survey:', error)
        return { success: false, error: 'Failed to update survey' }
    }
}

/**
 * Delete survey
 */
export async function deleteSurvey(surveyId: string) {
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

    // Verify survey ownership
    const survey = await prisma.survey.findFirst({
        where: {
            id: surveyId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!survey) {
        return { success: false, error: 'Survey not found' }
    }

    try {
        await prisma.survey.delete({
            where: { id: surveyId }
        })

        revalidatePath('/surveys')

        return { success: true }
    } catch (error) {
        console.error('Error deleting survey:', error)
        return { success: false, error: 'Failed to delete survey' }
    }
}

// ============================================
// SURVEY LINKS
// ============================================

/**
 * Generate a unique link for a survey
 */
export async function generateSurveyLink(surveyId: string, data: {
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

    // Verify survey ownership
    const survey = await prisma.survey.findFirst({
        where: {
            id: surveyId,
            project: {
                designerId: profile.id
            }
        }
    })

    if (!survey) {
        return { success: false, error: 'Survey not found' }
    }

    try {
        // Generate unique token
        const token = crypto.randomBytes(16).toString('hex')

        // Calculate expiry date (default 14 days)
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + (data.expiresInDays || 14))

        const link = await prisma.surveyLink.create({
            data: {
                surveyId,
                token,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                status: 'ACTIVE',
                expiresAt
            }
        })

        // Update survey status to ACTIVE if it was DRAFT
        if (survey.status === 'DRAFT') {
            await prisma.survey.update({
                where: { id: surveyId },
                data: { status: 'ACTIVE' }
            })
        }

        revalidatePath(`/surveys/${surveyId}`)

        return {
            success: true,
            data: {
                ...link,
                url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/client/survey/${token}`
            }
        }
    } catch (error) {
        console.error('Error generating survey link:', error)
        return { success: false, error: 'Failed to generate link' }
    }
}

/**
 * Get survey by link token (PUBLIC - no auth required)
 */
export async function getSurveyByToken(token: string) {
    const link = await prisma.surveyLink.findUnique({
        where: { token },
        include: {
            survey: {
                include: {
                    questions: {
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
            responses: true
        }
    })

    if (!link) {
        return { success: false, error: 'Link not found' }
    }

    // Check if link is expired
    if (link.status === 'EXPIRED' || new Date() > link.expiresAt) {
        if (link.status !== 'EXPIRED') {
            await prisma.surveyLink.update({
                where: { id: link.id },
                data: { status: 'EXPIRED' }
            })
        }
        return { success: false, error: 'Link expired' }
    }

    // Check if already completed
    if (link.status === 'COMPLETED') {
        return { success: false, error: 'Survey already completed' }
    }

    return { success: true, data: link }
}

// ============================================
// SURVEY RESPONSES (PUBLIC)
// ============================================

/**
 * Submit survey responses (PUBLIC - no auth required)
 */
export async function submitSurveyResponses(token: string, responses: {
    questionId: string
    answer: string | string[] | number
}[]) {
    const link = await prisma.surveyLink.findUnique({
        where: { token },
        include: {
            survey: {
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
        await prisma.surveyLink.update({
            where: { id: link.id },
            data: { status: 'EXPIRED' }
        })
        return { success: false, error: 'Link expired' }
    }

    try {
        // Create responses
        await prisma.surveyResponse.createMany({
            data: responses.map(r => ({
                linkId: link.id,
                questionId: r.questionId,
                answer: r.answer
            }))
        })

        // Calculate new expiry (24h after completion)
        const newExpiresAt = new Date()
        newExpiresAt.setHours(newExpiresAt.getHours() + 24)

        // Update link status to COMPLETED
        await prisma.surveyLink.update({
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
                profileId: link.survey.project.designerId,
                type: 'SURVEY_COMPLETED',
                title: 'Ankieta wypelniona',
                message: `${link.clientName || 'Klient'} wypelnil ankiete "${link.survey.title}" dla projektu "${link.survey.project.name}"`,
                data: {
                    surveyId: link.surveyId,
                    linkId: link.id
                }
            }
        })

        return { success: true }
    } catch (error) {
        console.error('Error submitting survey responses:', error)
        return { success: false, error: 'Failed to submit responses' }
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Get notifications for current user
 */
export async function getNotifications(limit: number = 20) {
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

    const notifications = await prisma.notification.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'desc' },
        take: limit
    })

    return notifications
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
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

    try {
        await prisma.notification.update({
            where: {
                id: notificationId,
                profileId: profile.id
            },
            data: { isRead: true }
        })

        return { success: true }
    } catch (error) {
        console.error('Error marking notification as read:', error)
        return { success: false, error: 'Failed to update notification' }
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
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

    try {
        await prisma.notification.updateMany({
            where: {
                profileId: profile.id,
                isRead: false
            },
            data: { isRead: true }
        })

        return { success: true }
    } catch (error) {
        console.error('Error marking notifications as read:', error)
        return { success: false, error: 'Failed to update notifications' }
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
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

    const count = await prisma.notification.count({
        where: {
            profileId: profile.id,
            isRead: false
        }
    })

    return count
}
