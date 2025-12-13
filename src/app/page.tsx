
import { createClient } from '@/utils/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

import { resetOnboarding } from './onboarding/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  // ... existing code ...

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
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
      const {data: {user} } = await supabase.auth.getUser()

      if (!user || !user.email) {
        redirect('/login')
      }

  // 1. Get Profile
      let profile = null;
      try {
    if (user.email) {
        profile = await prisma.profile.findUnique({
          where: { email: user.email }
        })
      }
  } catch (error) {
        console.error("DB Error in Dashboard Page:", error);
      // Fallback or rethrow depending on strategy. For now, let's log and maybe render empty state?
      // But we need to check onboarding. If DB fails, we can't check onboarding.
      // Rethrowing will cause 500 but log will be preserved.
      throw error;
  }

      // Redirect to Onboarding if not completed
      if (!profile?.onboardingCompleted) {
        redirect('/onboarding')
      }

  // If no profile exists yet (should be created on registration, but fallback for now)
      // Ideally, we'd redirect to an onboarding flow. For MVP, we skip or show empty.

      // 2. Get Active Project (For Studio, get the first active project of the logged in Designer)
      // For simplicity MVP: we fetch the first project where user is the designer
      let project = null
      let stats = {
        budget: {spent: 0, planned: 0, total: 0, remaining: 0 },
      daysConfig: {start: new Date(), end: new Date() },
      activeTasks: 0
  }

      if (profile) {
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
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      }

      if (project) {
    // Calculate Stats
    const totalBudget = Number(project.budgetGoal) || 0

      // Calculate Spent/Planned from ProductItems
      // This logic depends on how we define "Spent" vs "Planned". 
      // Assumption: 
      // Planned = Sum of price * quantity for all items
      // Spent = Sum of paidAmount for all items

      let spent = 0
      let planned = 0

    project.rooms.forEach(room => {
        room.productItems.forEach(item => {
          spent += Number(item.paidAmount)
          planned += Number(item.price) * item.quantity
        })
      })

      stats = {
        budget: {
        spent,
        planned,
        total: totalBudget,
      remaining: totalBudget - spent // Or Total - Planned? Usually Budget - Spent is "Remaining Cash", but Budget - Planned is "Remaining Budget Space".
        // Let's stick to Cash logic: Remaining = Goal - Spent.
      },
      daysConfig: {
        start: project.startDate || new Date(),
      end: project.deadline || new Date()
      },
      activeTasks: project.tasks.length
    }
  }

      // Serializable Data (Dates to Strings/ISO if needed, or pass Date if supported by SC->CC)
      // Next.js passes dates fine if not using 'use client' boundary directly on objects? 
      // Actually, passing Date objects from Server to Client component warns. Better convert to string.

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

      return <DashboardClient user={user} project={serializedProject} stats={stats} />
}
