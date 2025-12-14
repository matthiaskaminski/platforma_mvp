import { getRoomById, getRoomProducts, getRoomTasks, getRoomBudget, getRoomGallery, getRoomNotes, getProjectSummary, getProjectDocuments } from '@/app/actions/rooms';
import { redirect } from 'next/navigation';
import RoomDetailsClient from './RoomDetailsClient';

export default async function RoomDetailsPage({ params }: { params: { id: string } }) {
    // First get room to extract projectId
    const room = await getRoomById(params.id);

    if (!room) {
        redirect('/rooms');
    }

    // Then fetch all other data in parallel
    const [products, tasks, budgetItems, galleryImages, notes, documents, projectSummary] = await Promise.all([
        getRoomProducts(params.id),
        getRoomTasks(params.id),
        getRoomBudget(params.id),
        getRoomGallery(params.id),
        getRoomNotes(params.id),
        getProjectDocuments(room.project.id),
        getProjectSummary(room.project.id)
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

    return <RoomDetailsClient roomData={roomData} products={products} tasks={tasks} budgetItems={budgetItems} galleryImages={galleryImages} notes={notes} documents={documents} projectSummary={projectSummary} />;
}
