import { getActiveProjectId } from '@/app/actions/projects';
import { getProjectSprints, getProjectTasks } from '@/app/actions/sprints';
import { redirect } from 'next/navigation';
import TasksClient from './TasksClient';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        redirect('/login');
    }

    // 2. Get Profile
    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    });

    if (!profile) {
        redirect('/login');
    }

    // 3. Get Active Project from cookie
    const activeProjectId = await getActiveProjectId();

    let project = null;

    if (activeProjectId) {
        project = await prisma.project.findFirst({
            where: {
                id: activeProjectId,
                designerId: profile.id
            },
            select: {
                id: true,
                name: true,
                rooms: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        });
    }

    // Fallback: get first ACTIVE project
    if (!project) {
        project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            },
            select: {
                id: true,
                name: true,
                rooms: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        });
    }

    if (!project) {
        // No projects at all - redirect to home
        redirect('/');
    }

    // Fetch sprints and tasks
    const [sprints, tasks] = await Promise.all([
        getProjectSprints(project.id),
        getProjectTasks(project.id)
    ]);

    return (
        <TasksClient
            project={project}
            sprints={sprints}
            tasks={tasks}
        />
    );
}
