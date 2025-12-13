import { getRoomById } from '@/app/actions/rooms';
import { redirect } from 'next/navigation';
import RoomDetailsClient from './RoomDetailsClient';

export default async function RoomDetailsPage({ params }: { params: { id: string } }) {
    const room = await getRoomById(params.id);

    if (!room) {
        redirect('/rooms');
    }

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
    };

    return <RoomDetailsClient roomData={roomData} />;
}
