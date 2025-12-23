
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getActiveProjectId } from './actions/projects'

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

  // 3. Get Active Project from cookie or first ACTIVE project
  let project = null

  if (profile) {
    const activeProjectId = await getActiveProjectId()

    if (activeProjectId) {
      // Get project by ID from cookie
      project = await prisma.project.findFirst({
        where: {
          id: activeProjectId,
          designerId: profile.id
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
        }
      })
    }

    // Fallback: if no project found by cookie, get first ACTIVE project
    if (!project) {
      project = await prisma.project.findFirst({
        where: {
          designerId: profile.id,
          status: 'ACTIVE'
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
      breakdown: { materials: 0, furniture: 0, labor: 0 },
      roomBreakdown: [] as { id: string; name: string; spent: number }[],
      services: { materialPlanned: 0, materialApproved: 0, laborPlanned: 0, laborApproved: 0 }
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

    // Helper to categorize and sum product costs
    const processProduct = (item: any) => {
      const cost = Number(item.price) * item.quantity
      const paid = Number(item.paidAmount) || 0

      // Only count as spent if paid/delivered
      if (item.status === 'PAID' || item.status === 'DELIVERED') {
        spent += cost
      }
      planned += cost
      productsCount++

      // Logic for categories (simple string match)
      const cat = item.category?.toLowerCase() || ''
      if (cat.includes('materiał') || cat.includes('budowlan')) materials += cost
      else if (cat.includes('mebl') || cat.includes('dekorac')) furniture += cost
      else if (cat.includes('robociz')) labor += cost
      else furniture += cost // Default fallback
    }

    // Process products from rooms and calculate room breakdown
    const roomBreakdownMap = new Map<string, { id: string; name: string; spent: number }>();

    project.rooms.forEach(room => {
      let roomSpent = 0;
      room.productItems.forEach(item => {
        processProduct(item);
        // Calculate room-specific spent (price * quantity for MAIN products)
        if (item.planningStatus === 'MAIN') {
          roomSpent += Number(item.price) * item.quantity;
        }
      });

      if (roomSpent > 0) {
        roomBreakdownMap.set(room.id, {
          id: room.id,
          name: room.name,
          spent: roomSpent
        });
      }
    });

    const roomBreakdown = Array.from(roomBreakdownMap.values())
      .sort((a, b) => b.spent - a.spent); // Sortuj od największych wydatków

    // Get wishlist products for budget calculation
    const wishlistProducts = await prisma.productItem.findMany({
      where: { wishlist: { designerId: profile!.id } }
    })

    // Process wishlist products
    wishlistProducts.forEach(processProduct)

    // Parallelize all data fetching dependent on project
    const [
      statsCounts,
      recentTasksData,
      interactionsData,
      roomProductsData,
      wishlistProductsData,
      visualizationsData,
      servicesData
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
      // 4. Recent Products from Rooms
      prisma.productItem.findMany({
        where: { room: { projectId: project.id } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { room: true }
      }),
      // 5. Recent Products from Wishlists (same designer)
      prisma.productItem.findMany({
        where: { wishlist: { designerId: profile!.id } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { wishlist: true }
      }),
      // 6. Visualizations - Get rooms with cover images
      prisma.room.findMany({
        where: {
          projectId: project.id,
          coverImage: { not: null }
        },
        select: {
          id: true,
          name: true,
          coverImage: true
        },
        take: 4
      }),
      // 7. Services - for budget calculation
      prisma.serviceItem.findMany({
        where: { projectId: project.id },
        select: {
          category: true,
          planningStatus: true,
          price: true
        }
      })
    ])

    const [tasksCount, doneTasks] = statsCounts;
    const [surveyCount, moodboardCount, messagesCount] = interactionsData;

    // Calculate services budget
    let materialPlanned = 0;
    let materialApproved = 0;
    let laborPlanned = 0;
    let laborApproved = 0;

    servicesData.forEach(service => {
      const price = Number(service.price) || 0;
      if (service.category === 'MATERIAL') {
        if (service.planningStatus === 'PLANNED') materialPlanned += price;
        if (service.planningStatus === 'APPROVED') materialApproved += price;
      } else if (service.category === 'LABOR') {
        if (service.planningStatus === 'PLANNED') laborPlanned += price;
        if (service.planningStatus === 'APPROVED') laborApproved += price;
      }
    });

    // Add approved services to spent budget
    const servicesApprovedTotal = materialApproved + laborApproved;
    const servicesPlannedTotal = materialPlanned + laborPlanned;

    recentTasks = recentTasksData;

    // Combine room products and wishlist products, sort by createdAt, take 5 most recent
    const allProducts = [...roomProductsData, ...wishlistProductsData]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    recentProducts = allProducts;

    visualizations = visualizationsData;

    const floorsCount = project.floorsCount || 0
    const roomsCount = project.rooms.length

    // Include services in total budget calculations
    const totalSpent = spent + servicesApprovedTotal;
    const totalPlanned = planned + servicesPlannedTotal + servicesApprovedTotal;

    stats = {
      budget: {
        spent: totalSpent,
        planned: totalPlanned,
        total: totalBudget,
        remaining: totalBudget - totalSpent,
        breakdown: { materials, furniture, labor },
        roomBreakdown,
        services: { materialPlanned, materialApproved, laborPlanned, laborApproved }
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
