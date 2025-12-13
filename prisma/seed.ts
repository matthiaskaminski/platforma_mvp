
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // 1. Create a Designer Profile (Me)
    const me = await prisma.profile.upsert({
        where: { email: 'sonya@liru.app' },
        update: {},
        create: {
            email: 'sonya@liru.app',
            fullName: 'Sonya Design',
            role: 'DESIGNER',
            studioName: 'Liru Studio'
        },
    })

    // 2. Create Projects (and implicitly Clients for now? No, schema splits them)
    // Wait, Schema has Client linked to Project.
    // Let's create Project first, then Client?
    // Schema: Client has projectId.
    // Project has designerId.

    const project = await prisma.project.create({
        data: {
            designerId: me.id,
            name: 'Apartament Złota 44',
            status: 'ACTIVE',
            address: 'Warszawa, ul. Złota 44/12',
            budgetGoal: 380000,
            totalArea: 85,
            floorsCount: 1,
            roomsCount: 6,
            startDate: new Date(),
            deadline: new Date('2025-12-22T00:00:00Z'),
        }
    })

    // Create Client linked to Project
    const client1 = await prisma.client.create({
        data: {
            projectId: project.id, // Linked to project
            fullName: 'Jan Kowalski',
            email: 'jan@example.com'
        }
    })


    // 4. Create Rooms
    // Enum RoomType: LIVING, KITCHEN, BEDROOM, BATHROOM, KIDS, HALL, OFFICE, OTHER
    const salon = await prisma.room.create({
        data: {
            projectId: project.id,
            name: 'Salon - Modern',
            type: 'LIVING',
            status: 'IN_PROGRESS',
            area: 35.5,
            budgetAllocated: 120000
        }
    })

    const kuchnia = await prisma.room.create({
        data: {
            projectId: project.id,
            name: 'Kuchnia',
            type: 'KITCHEN',
            status: 'NOT_STARTED',
            area: 12.0,
            budgetAllocated: 85000
        }
    })

    // 5. Create Products
    await prisma.productItem.create({
        data: {
            roomId: salon.id,
            name: 'Sofa Cloud White',
            category: 'Meble',
            price: 15400,
            status: 'ORDERED',
            imageUrl: 'https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/Screenshot_119.png'
        }
    })

    await prisma.productItem.create({
        data: {
            roomId: salon.id,
            name: 'Stolik Kawowy Marmur',
            category: 'Meble',
            price: 4500,
            status: 'TO_ORDER',
            imageUrl: 'https://zotnacipqsjewlzofpga.supabase.co/storage/v1/object/public/Liru/509_0776c21ac3-tigr-bei-pp-1600.jpg'
        }
    })

    // 6. Create Calendar Events
    // Model CalendarEvent: date DateTime, type String @default("MEETING")
    await prisma.calendarEvent.create({
        data: {
            projectId: project.id,
            title: 'Spotkanie na budowie - Odbiory',
            date: new Date(),
            type: 'MEETING'
        }
    })

    // 7. Create Task
    await prisma.task.create({
        data: {
            projectId: project.id,
            roomId: salon.id,
            title: 'Zatwierdzić próbki tkanin',
            status: 'IN_PROGRESS',
            dueDate: new Date()
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
