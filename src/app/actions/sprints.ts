'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { SprintStatus, TaskStatus } from '@prisma/client';

// Sprint CRUD operations

export async function createSprint(data: {
    projectId: string;
    name: string;
    goal?: string;
    startDate?: Date;
    endDate?: Date;
}) {
    try {
        const sprint = await prisma.sprint.create({
            data: {
                projectId: data.projectId,
                name: data.name,
                goal: data.goal,
                startDate: data.startDate,
                endDate: data.endDate,
                status: 'PLANNED'
            }
        });

        revalidatePath('/tasks');
        revalidatePath(`/projects/${data.projectId}`);

        return { success: true, sprint };
    } catch (error) {
        console.error('Error creating sprint:', error);
        return { success: false, error: 'Failed to create sprint' };
    }
}

export async function updateSprint(sprintId: string, data: {
    name?: string;
    goal?: string;
    status?: SprintStatus;
    startDate?: Date;
    endDate?: Date;
}) {
    try {
        const sprint = await prisma.sprint.update({
            where: { id: sprintId },
            data
        });

        revalidatePath('/tasks');

        return { success: true, sprint };
    } catch (error) {
        console.error('Error updating sprint:', error);
        return { success: false, error: 'Failed to update sprint' };
    }
}

export async function deleteSprint(sprintId: string) {
    try {
        // Tasks will be set to null for sprintId due to onDelete: SetNull
        await prisma.sprint.delete({
            where: { id: sprintId }
        });

        revalidatePath('/tasks');

        return { success: true };
    } catch (error) {
        console.error('Error deleting sprint:', error);
        return { success: false, error: 'Failed to delete sprint' };
    }
}

export async function getProjectSprints(projectId: string) {
    try {
        const sprints = await prisma.sprint.findMany({
            where: { projectId },
            include: {
                tasks: {
                    include: {
                        room: {
                            select: {
                                id: true,
                                name: true,
                                type: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return sprints;
    } catch (error) {
        console.error('Error fetching sprints:', error);
        return [];
    }
}

export async function getSprintById(sprintId: string) {
    try {
        const sprint = await prisma.sprint.findUnique({
            where: { id: sprintId },
            include: {
                tasks: {
                    include: {
                        room: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return sprint;
    } catch (error) {
        console.error('Error fetching sprint:', error);
        return null;
    }
}

// Task CRUD operations

export async function createTask(data: {
    projectId: string;
    sprintId?: string;
    roomId?: string;
    title: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
}) {
    try {
        const task = await prisma.task.create({
            data: {
                projectId: data.projectId,
                sprintId: data.sprintId,
                roomId: data.roomId,
                title: data.title,
                description: data.description,
                assignedTo: data.assignedTo,
                dueDate: data.dueDate,
                status: 'TODO'
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                sprint: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        revalidatePath('/tasks');
        revalidatePath(`/projects/${data.projectId}`);
        if (data.roomId) {
            revalidatePath(`/rooms/${data.roomId}`);
        }

        return { success: true, task };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: 'Failed to create task' };
    }
}

export async function updateTask(taskId: string, data: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    sprintId?: string | null;
    roomId?: string | null;
    assignedTo?: string | null;
    dueDate?: Date | null;
}) {
    try {
        const task = await prisma.task.update({
            where: { id: taskId },
            data,
            include: {
                room: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                sprint: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        revalidatePath('/tasks');
        revalidatePath(`/projects/${task.projectId}`);
        if (task.roomId) {
            revalidatePath(`/rooms/${task.roomId}`);
        }

        return { success: true, task };
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error: 'Failed to update task' };
    }
}

export async function deleteTask(taskId: string) {
    try {
        const task = await prisma.task.delete({
            where: { id: taskId }
        });

        revalidatePath('/tasks');
        revalidatePath(`/projects/${task.projectId}`);
        if (task.roomId) {
            revalidatePath(`/rooms/${task.roomId}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting task:', error);
        return { success: false, error: 'Failed to delete task' };
    }
}

export async function getProjectTasks(projectId: string) {
    try {
        const tasks = await prisma.task.findMany({
            where: { projectId },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                },
                sprint: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

export async function getTasksByRoom(roomId: string) {
    try {
        const tasks = await prisma.task.findMany({
            where: { roomId },
            include: {
                sprint: {
                    select: {
                        id: true,
                        name: true,
                        status: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks by room:', error);
        return [];
    }
}

export async function getTasksBySprint(sprintId: string) {
    try {
        const tasks = await prisma.task.findMany({
            where: { sprintId },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return tasks;
    } catch (error) {
        console.error('Error fetching tasks by sprint:', error);
        return [];
    }
}

export async function getSprintsForRoom(roomId: string) {
    try {
        // Get the room to find projectId
        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { projectId: true }
        });

        if (!room) {
            return [];
        }

        // Get all sprints for the project that have tasks in this room
        const sprints = await prisma.sprint.findMany({
            where: {
                projectId: room.projectId,
                tasks: {
                    some: {
                        roomId: roomId
                    }
                }
            },
            include: {
                tasks: {
                    where: {
                        roomId: roomId
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        // Also get sprints without tasks (empty sprints) - they should also be available
        const emptyProjectSprints = await prisma.sprint.findMany({
            where: {
                projectId: room.projectId,
                tasks: {
                    none: {}
                }
            },
            include: {
                tasks: true,
                _count: {
                    select: {
                        tasks: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'desc' }
            ]
        });

        return [...sprints, ...emptyProjectSprints];
    } catch (error) {
        console.error('Error fetching sprints for room:', error);
        return [];
    }
}
