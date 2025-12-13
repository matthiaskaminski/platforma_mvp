
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import RoomsClient from '@/components/rooms/RoomsClient'
import { getActiveProjectId } from '../actions/projects'

// Server Component for Rooms Page
export default async function RoomsPage() {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
        redirect('/login')
    }

    // 2. Get Profile
    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        redirect('/login')
    }

    // 3. Get Active Project from cookie
    const activeProjectId = await getActiveProjectId()

    let project = null

    if (activeProjectId) {
        project = await prisma.project.findFirst({
            where: {
                id: activeProjectId,
                designerId: profile.id
            },
            include: {
                rooms: {
                    include: {
                        productItems: true,
                        tasks: true
                    },
                    orderBy: { name: 'asc' }
                }
            }
        })
    }

    // Fallback: get first ACTIVE project
    if (!project) {
        project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            },
            include: {
                rooms: {
                    include: {
                        productItems: true,
                        tasks: true
                    },
                    orderBy: { name: 'asc' }
                }
            }
        })
    }

    if (!project) {
        // Handle no project state
        redirect('/')
    }

    // 4. Transform Data for Client Component
    const roomsData = project.rooms.map(room => {
        // Calculate spent budget
        const spent = room.productItems.reduce((acc, item) => acc + (Number(item.paidAmount) || 0), 0)

        // Status mapping (DB Enum -> URL/Client string)
        // DB uses Enums, we map to our client strings if needed, or if they match, just cast/assign.
        // Our client expects: "not_started" | "in_progress" | "finished"
        // Our Schema Enum maps to: @map("not_started"), etc. so Prisma returns the Key (NOT_STARTED).
        // We need to map NOT_STARTED -> "not_started".

        const statusMap: Record<string, string> = {
            'NOT_STARTED': 'not_started',
            'IN_PROGRESS': 'in_progress',
            'FINISHED': 'finished'
        }

        const status = statusMap[room.status] || 'not_started'

        // Days ago logic (mocked for now as createdAt is missing on Room)
        const daysAgo = "2 dni temu" // Placeholder

        return {
            id: room.id,
            name: room.name,
            type: room.type, // Enum needs handling on client if needed, or cast to string
            status: status,
            area: room.area || 0,
            tasksCount: room.tasks.length,
            productsCount: room.productItems.length,
            budget: Number(room.budgetAllocated) || 0,
            spent: spent,
            img: room.coverImage || undefined,
            daysAgo: daysAgo
        }
    })

    return (
        <RoomsClient
            rooms={roomsData}
            projectId={project.id}
        />
    )
}
