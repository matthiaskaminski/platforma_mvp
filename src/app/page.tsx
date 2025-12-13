
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

import { resetOnboarding } from './onboarding/actions'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  // 2. Get Profile
  let profile = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { email: user.email }
    })
  } catch (error) {
    console.error("DB Error in Dashboard Page:", error);
    throw error;
  }

  // 2.1 Check if any project exists to determine onboarding status
  const projectExistsCheck = profile ? await prisma.project.findFirst({
    where: { designerId: profile.id }
  }) : null

  // Redirect to Onboarding if no project exists
  if (!projectExistsCheck) {
    redirect('/onboarding')
  }

  // 3. Get Active Project (Specific for Dashboard)
  let project = null

  if (profile) {
    project = await prisma.project.findFirst({
      where: {
        designerId: profile.id,
        status: 'ACTIVE' // Only fetch active project for display
      },
      include: {
        tasks: {
          where: { status: { not: 'DONE' } }
        },
        rooms: {
          include: {
            productItems: true
          }
        },
        calendarEvents: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Reuse the `projectExistsCheck` result if no active project found? 
  // No, if they have a project but it's not ACTIVE (e.g. COMPLETED), the dashboard might be empty or prompt to select.
  // But for MVP, let's assume if 1 project exists, it's the active one or we show empty dashboard.
  // If project is null here but projectExistsCheck is true, it means they have projects but none ACTIVE. 
  // We can handle that gracefully in UI (empty state) instead of redirecting to onboarding.

  // 4. Calculate Stats (Only if project exists)
  let stats = {
    budget: {
      spent: 0, planned: 0, total: 0, remaining: 0,
      breakdown: { materials: 0, furniture: 0, labor: 0 }
    },
    daysConfig: { start: new Date(), end: new Date() },
    activeTasks: 0,
    counts: { products: 0, doneTasks: 0, floors: 0, rooms: 0 },
    interactions: { surveys: 0, moodboards: 0, messages: 0 }
  }

  // Initialize lists
  let recentTasks: any[] = []
  let recentProducts: any[] = []
  let visualizations: any[] = []
  let calendarEvents: any[] = []

  if (project) {
    calendarEvents = project.calendarEvents || []
    // Calculate Stats & Counts
    const totalBudget = Number(project.budgetGoal) || 0
    let spent = 0
    let planned = 0
    let materials = 0
    let furniture = 0
    let labor = 0
    let productsCount = 0

    project.rooms.forEach(room => {
      room.productItems.forEach(item => {
        const cost = Number(item.price) * item.quantity
        const paid = Number(item.paidAmount)

        spent += paid
        planned += cost
        productsCount++

        // Logic for categories (simple string match)
        const cat = item.category?.toLowerCase() || ''
        if (cat.includes('materiał') || cat.includes('budowlan')) materials += cost
        else if (cat.includes('mebl') || cat.includes('dekorac')) furniture += cost
        else if (cat.includes('robociz')) labor += cost
        else furniture += cost // Default fallback
      })
    })

    // Parallelize all data fetching dependent on project
    const [
      statsCounts,
      recentTasksData,
      interactionsData,
      recentProductsData,
      visualizationsData
    ] = await Promise.all([
      // 1. Stats Counts
      Promise.all([
        prisma.task.count({ where: { projectId: project.id } }),
        prisma.task.count({ where: { projectId: project.id, status: 'DONE' } })
      ]),
      // 2. Recent Tasks
      prisma.task.findMany({
        where: { projectId: project.id, status: { not: 'DONE' } },
        orderBy: { dueDate: 'asc' },
        take: 3,
        include: { room: true }
      }),
      // 3. Interactions Counts
      Promise.all([
        prisma.survey.count({ where: { projectId: project.id } }),
        prisma.moodboard.count({ where: { projectId: project.id } }),
        prisma.message.count({ where: { conversation: { projectId: project.id } } })
      ]),
      // 4. Recent Products
      prisma.productItem.findMany({
        where: { room: { projectId: project.id } },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { room: true }
      }),
      // 5. Visualizations
      prisma.galleryImage.findMany({
        where: { room: { projectId: project.id } },
        orderBy: { createdAt: 'desc' },
        take: 4
      })
    ])

    const [tasksCount, doneTasks] = statsCounts;
    const [surveyCount, moodboardCount, messagesCount] = interactionsData;

    recentTasks = recentTasksData;
    recentProducts = recentProductsData;
    visualizations = visualizationsData;

    const floorsCount = project.floorsCount || 0
    const roomsCount = project.rooms.length

    stats = {
      budget: {
        spent,
        planned,
        total: totalBudget,
        remaining: totalBudget - spent,
        breakdown: { materials, furniture, labor }
      },
      daysConfig: {
        start: project.startDate || new Date(),
        end: project.deadline || new Date()
      },
      activeTasks: tasksCount - doneTasks,
      counts: { products: productsCount, doneTasks, floors: floorsCount, rooms: roomsCount },
      interactions: {
        surveys: surveyCount,
        moodboards: moodboardCount,
        messages: messagesCount
      }
    }
  }

  // 6. Serializable Data
  const serializedProject = project ? {
    ...project,
    budgetGoal: Number(project.budgetGoal),
    startDate: project.startDate,
    deadline: project.deadline,
    rooms: project.rooms.map(r => ({
      ...r,
      budgetAllocated: Number(r.budgetAllocated)
    }))
  } : null

  // Serialize relations
  const serializedProducts = recentProducts.map(p => ({
    ...p,
    price: Number(p.price),
    paidAmount: Number(p.paidAmount)
  }))

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* Temporary Debug Button */}
      <div className="absolute top-4 right-4 z-50">
        <form action={async () => {
          'use server'
          await resetOnboarding()
        }}>
          <button type="submit" className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600">
            Reset Onboarding (Debug)
          </button>
        </form>
      </div>

      {/* Header Section */}
      <DashboardClient
        user={profile}
        project={serializedProject}
        stats={stats}
        recentProducts={serializedProducts}
        visualizations={visualizations}
        recentTasks={recentTasks}
        calendarEvents={calendarEvents}
      />
    </div>
  )
}
