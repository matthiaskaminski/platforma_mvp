import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getActiveProjectId } from '../actions/projects'
import { getCalendarDataWithTasks } from '../actions/calendar'
import { CalendarView } from "./components/CalendarView";

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
    const supabase = await createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
        redirect('/login')
    }

    // Get Profile
    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    })

    if (!profile) {
        redirect('/login')
    }

    // Get Active Project
    let project = null
    const activeProjectId = await getActiveProjectId()

    if (activeProjectId) {
        project = await prisma.project.findFirst({
            where: {
                id: activeProjectId,
                designerId: profile.id
            }
        })
    }

    // Fallback to first active project
    if (!project) {
        project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            }
        })
    }

    if (!project) {
        redirect('/onboarding')
    }

    // Get calendar data (events + tasks with deadlines)
    const calendarData = await getCalendarDataWithTasks(project.id)

    return (
        <div className="flex flex-col h-full bg-[#0E0E0E]">
            <CalendarView
                events={calendarData.all}
                projectId={project.id}
            />
        </div>
    );
}
