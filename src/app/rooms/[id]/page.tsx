import { getRoomById, getRoomProducts, getRoomTasks, getRoomBudget, getRoomGallery, getRoomNotes, getProjectSummary, getProjectDocuments, getProjectHistory } from '@/app/actions/rooms';
import { getSprintsForRoom, getProjectSprints } from '@/app/actions/sprints';
import { redirect } from 'next/navigation';
import RoomDetailsClient from './RoomDetailsClient';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';

export default async function RoomDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Await params in Next.js 15+
    const { id } = await params;

    // First get room to extract projectId
    const room = await getRoomById(id);

    if (!room) {
        redirect('/rooms');
    }

    // Then fetch all other data in parallel
    const [products, tasks, budgetItems, galleryImages, notes, documents, history, projectSummary, roomSprints, allProjectSprints] = await Promise.all([
        getRoomProducts(id),
        getRoomTasks(id),
        getRoomBudget(id),
        getRoomGallery(id),
        getRoomNotes(id),
        getProjectDocuments(room.project.id),
        getProjectHistory(room.project.id),
        getProjectSummary(room.project.id),
        getSprintsForRoom(id),
        getProjectSprints(room.project.id)
    ]);

    // Map status for client
    const statusMap: Record<string, string> = {
        'NOT_STARTED': 'not_started',
        'IN_PROGRESS': 'in_progress',
        'FINISHED': 'finished'
    };

    const roomData = {
        id: room.id,
        name: room.name,
        type: room.type,
        status: statusMap[room.status] || 'not_started',
        area: room.area,
        floorNumber: room.floorNumber,
        tasksCount: room._count.tasks,
        productsCount: room._count.productItems,
        coverImage: room.coverImage,
        projectId: room.project.id,
        projectCoverImage: room.project.coverImage,
    };

    return <RoomDetailsClient key={room.id} roomData={roomData} products={products} tasks={tasks} budgetItems={budgetItems} galleryImages={galleryImages} notes={notes} documents={documents} history={history} projectSummary={projectSummary} sprints={roomSprints} allProjectSprints={allProjectSprints} />;
}
