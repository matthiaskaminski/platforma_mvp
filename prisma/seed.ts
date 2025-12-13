
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
            firstName: 'Sonya',
            lastName: 'Design',
            userType: 'STUDIO',
            studioName: 'Liru Studio'
        },
    })

    // 2. Create Clients
    const client1 = await prisma.client.create({
        data: {
            designerId: me.id,
            name: 'Jan Kowalski (Inwestor)',
            type: 'PRIVATE',
            email: 'jan@example.com'
        }
    })

    // 3. Create Project
    const project = await prisma.project.create({
        data: {
            clientId: client1.id,
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

    // 4. Create Rooms
    const salon = await prisma.room.create({
        data: {
            projectId: project.id,
            name: 'Salon - Modern',
            type: 'LIVING_ROOM',
            area: 35.5,
            budgetAllocated: 120000
        }
    })

    const kuchnia = await prisma.room.create({
        data: {
            projectId: project.id,
            name: 'Kuchnia',
            type: 'KITCHEN',
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
    await prisma.calendarEvent.create({
        data: {
            projectId: project.id,
            title: 'Spotkanie na budowie - Odbiory',
            startTime: new Date(),
            type: 'Spotkanie'
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
