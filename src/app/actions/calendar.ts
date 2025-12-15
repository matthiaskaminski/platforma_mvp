'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Event type colors mapping (internal use only)
const EVENT_TYPE_COLORS: Record<string, string> = {
    MEETING: '#536AC8',
    DELIVERY: '#E8B491',
    INSPECTION: '#91E8A8',
    DEADLINE: '#E89191',
    PAYMENT: '#C8A853',
    INSTALLATION: '#A891E8',
};

// Create calendar event
export async function createCalendarEvent(data: {
    projectId: string;
    title: string;
    date: Date;
    description?: string;
    type?: string;
}) {
    try {
        const event = await prisma.calendarEvent.create({
            data: {
                projectId: data.projectId,
                title: data.title,
                date: data.date,
                description: data.description,
                type: data.type || 'MEETING'
            }
        });

        revalidatePath('/calendar');
        revalidatePath('/');
        revalidatePath(`/projects/${data.projectId}`);

        return { success: true, event };
    } catch (error) {
        console.error('Error creating calendar event:', error);
        return { success: false, error: 'Failed to create calendar event' };
    }
}

// Update calendar event
export async function updateCalendarEvent(eventId: string, data: {
    title?: string;
    date?: Date;
    description?: string;
    type?: string;
}) {
    try {
        const event = await prisma.calendarEvent.update({
            where: { id: eventId },
            data
        });

        revalidatePath('/calendar');
        revalidatePath('/');

        return { success: true, event };
    } catch (error) {
        console.error('Error updating calendar event:', error);
        return { success: false, error: 'Failed to update calendar event' };
    }
}

// Delete calendar event
export async function deleteCalendarEvent(eventId: string) {
    try {
        await prisma.calendarEvent.delete({
            where: { id: eventId }
        });

        revalidatePath('/calendar');
        revalidatePath('/');

        return { success: true };
    } catch (error) {
        console.error('Error deleting calendar event:', error);
        return { success: false, error: 'Failed to delete calendar event' };
    }
}

// Get calendar events for a project
export async function getProjectCalendarEvents(projectId: string) {
    try {
        const events = await prisma.calendarEvent.findMany({
            where: { projectId },
            orderBy: { date: 'asc' }
        });

        return events;
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return [];
    }
}

// Get all calendar data (events + tasks with deadlines)
export async function getCalendarDataWithTasks(projectId: string) {
    try {
        // Get calendar events
        const events = await prisma.calendarEvent.findMany({
            where: { projectId },
            orderBy: { date: 'asc' }
        });

        // Get tasks with deadlines
        const tasksWithDeadlines = await prisma.task.findMany({
            where: {
                projectId,
                dueDate: { not: null }
            },
            include: {
                room: {
                    select: { id: true, name: true }
                },
                sprint: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { dueDate: 'asc' }
        });

        // Format events for calendar display
        const calendarEvents = events.map(event => ({
            id: event.id,
            title: event.title,
            date: event.date.toISOString(),
            description: event.description,
            type: event.type,
            isTask: false,
            color: EVENT_TYPE_COLORS[event.type] || '#536AC8'
        }));

        // Format tasks as calendar items
        const taskEvents = tasksWithDeadlines.map(task => ({
            id: task.id,
            title: task.title,
            date: task.dueDate!.toISOString(),
            description: task.description,
            type: 'TASK',
            isTask: true,
            status: task.status,
            roomName: task.room?.name,
            sprintName: task.sprint?.name,
            color: '#6E9EE8' // Light blue for tasks
        }));

        return {
            events: calendarEvents,
            tasks: taskEvents,
            all: [...calendarEvents, ...taskEvents].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )
        };
    } catch (error) {
        console.error('Error fetching calendar data:', error);
        return { events: [], tasks: [], all: [] };
    }
}
