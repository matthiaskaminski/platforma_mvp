
import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import RoomsClient from '@/components/rooms/RoomsClient'

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

    // 3. Get Active Project
    const project = await prisma.project.findFirst({
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
                orderBy: { name: 'asc' } // or createdAt desc
            }
        }
    })

    if (!project) {
        // Handle no project state - maybe redirect to create project or dashboard
        redirect('/')
    }

    // 4. Transform Data for Client Component
    const roomsData = project.rooms.map(room => {
        // Calculate spent budget
        const spent = room.productItems.reduce((acc, item) => acc + (Number(item.paidAmount) || 0), 0)

        // Calculate status based on tasks or manual field? 
        // For now, let's derive it or use simple logic. 
        // We'll use 'in_progress' if there are tasks/products, 'not_started' if empty.
        // Or better, if we add 'status' to Room model later. For now let's guess.
        let status = "not_started"
        if (room.productItems.length > 0 || room.tasks.length > 0) status = "in_progress"
        // Check if all tasks done? (Need status on tasks)
        const allTasksDone = room.tasks.length > 0 && room.tasks.every(t => t.status === 'DONE')
        if (allTasksDone && room.tasks.length > 0) status = "finished"

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
            img: null, // No image yet on room directly (unless we fetch one from gallery)
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
