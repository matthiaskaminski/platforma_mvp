import { getActiveProjectId } from '@/app/actions/projects';
import { getProjectSprints, getProjectTasks } from '@/app/actions/sprints';
import { redirect } from 'next/navigation';
import TasksClient from './TasksClient';
import prisma from '@/lib/prisma';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
    // Get active project
    const activeProjectId = await getActiveProjectId();

    if (!activeProjectId) {
        redirect('/');
    }

    // Get project details
    const project = await prisma.project.findUnique({
        where: { id: activeProjectId },
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

    if (!project) {
        redirect('/');
    }

    // Fetch sprints and tasks
    const [sprints, tasks] = await Promise.all([
        getProjectSprints(activeProjectId),
        getProjectTasks(activeProjectId)
    ]);

    return (
        <TasksClient
            project={project}
            sprints={sprints}
            tasks={tasks}
        />
    );
}
