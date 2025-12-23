"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ServiceCategory, ServicePlanningStatus, MaterialStatus, LaborStatus } from "@prisma/client";

// Get all services for the active project
export async function getServices() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { email: user.email }
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        // Get active project
        const project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            }
        });

        if (!project) {
            return { success: false, error: "No active project" };
        }

        const services = await prisma.serviceItem.findMany({
            where: { projectId: project.id },
            include: {
                room: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            data: services.map(s => ({
                ...s,
                price: Number(s.price)
            }))
        };
    } catch (error) {
        console.error("Error fetching services:", error);
        return { success: false, error: "Failed to fetch services" };
    }
}

// Create a new service (Material)
export async function createMaterialService(data: {
    name: string;
    unit?: string;
    quantity?: number;
    price: number;
    imageUrl?: string;
    url?: string;
    materialType?: string;
    planningStatus?: ServicePlanningStatus;
    roomId?: string;
    notes?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { email: user.email }
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        const project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            }
        });

        if (!project) {
            return { success: false, error: "No active project" };
        }

        const service = await prisma.serviceItem.create({
            data: {
                projectId: project.id,
                roomId: data.roomId || null,
                category: ServiceCategory.MATERIAL,
                planningStatus: data.planningStatus || ServicePlanningStatus.DRAFT,
                name: data.name,
                unit: data.unit,
                quantity: data.quantity,
                price: data.price,
                imageUrl: data.imageUrl,
                url: data.url,
                materialType: data.materialType,
                materialStatus: MaterialStatus.TO_ORDER,
                notes: data.notes
            }
        });

        revalidatePath('/services');
        return { success: true, data: service };
    } catch (error) {
        console.error("Error creating material service:", error);
        return { success: false, error: "Failed to create service" };
    }
}

// Create a new service (Labor)
export async function createLaborService(data: {
    subcontractor: string;
    scope?: string;
    price: number;
    imageUrl?: string;
    duration?: string;
    planningStatus?: ServicePlanningStatus;
    roomId?: string;
    notes?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { email: user.email }
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        const project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            }
        });

        if (!project) {
            return { success: false, error: "No active project" };
        }

        const service = await prisma.serviceItem.create({
            data: {
                projectId: project.id,
                roomId: data.roomId || null,
                category: ServiceCategory.LABOR,
                planningStatus: data.planningStatus || ServicePlanningStatus.DRAFT,
                subcontractor: data.subcontractor,
                scope: data.scope,
                price: data.price,
                imageUrl: data.imageUrl,
                duration: data.duration,
                laborStatus: LaborStatus.TO_ORDER,
                notes: data.notes
            }
        });

        revalidatePath('/services');
        return { success: true, data: service };
    } catch (error) {
        console.error("Error creating labor service:", error);
        return { success: false, error: "Failed to create service" };
    }
}

// Update a service
export async function updateService(id: string, data: {
    name?: string;
    unit?: string;
    quantity?: number;
    price?: number;
    imageUrl?: string;
    url?: string;
    materialType?: string;
    subcontractor?: string;
    scope?: string;
    duration?: string;
    planningStatus?: ServicePlanningStatus;
    materialStatus?: MaterialStatus;
    laborStatus?: LaborStatus;
    roomId?: string | null;
    notes?: string;
}) {
    try {
        const service = await prisma.serviceItem.update({
            where: { id },
            data
        });

        revalidatePath('/services');
        return { success: true, data: service };
    } catch (error) {
        console.error("Error updating service:", error);
        return { success: false, error: "Failed to update service" };
    }
}

// Delete a service
export async function deleteService(id: string) {
    try {
        await prisma.serviceItem.delete({
            where: { id }
        });

        revalidatePath('/services');
        return { success: true };
    } catch (error) {
        console.error("Error deleting service:", error);
        return { success: false, error: "Failed to delete service" };
    }
}

// Approve a service (manual approval by designer)
export async function approveService(id: string) {
    try {
        const service = await prisma.serviceItem.update({
            where: { id },
            data: {
                planningStatus: ServicePlanningStatus.APPROVED
            }
        });

        revalidatePath('/services');
        return { success: true, data: service };
    } catch (error) {
        console.error("Error approving service:", error);
        return { success: false, error: "Failed to approve service" };
    }
}

// Get services summary for budget calculation
export async function getServicesSummary(projectId: string) {
    try {
        const services = await prisma.serviceItem.findMany({
            where: { projectId },
            select: {
                category: true,
                planningStatus: true,
                price: true
            }
        });

        let materialPlanned = 0;
        let materialApproved = 0;
        let laborPlanned = 0;
        let laborApproved = 0;

        services.forEach(s => {
            const price = Number(s.price);
            if (s.category === 'MATERIAL') {
                if (s.planningStatus === 'PLANNED') materialPlanned += price;
                if (s.planningStatus === 'APPROVED') materialApproved += price;
            } else if (s.category === 'LABOR') {
                if (s.planningStatus === 'PLANNED') laborPlanned += price;
                if (s.planningStatus === 'APPROVED') laborApproved += price;
            }
        });

        return {
            success: true,
            data: {
                material: { planned: materialPlanned, approved: materialApproved },
                labor: { planned: laborPlanned, approved: laborApproved },
                totalPlanned: materialPlanned + laborPlanned,
                totalApproved: materialApproved + laborApproved,
                servicesEstimated: materialPlanned + laborPlanned,
                servicesReal: materialApproved + laborApproved
            }
        };
    } catch (error) {
        console.error("Error getting services summary:", error);
        return { success: false, error: "Failed to get services summary" };
    }
}

// Get rooms for dropdown
export async function getRoomsForProject() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { email: user.email }
        });

        if (!profile) {
            return { success: false, error: "Profile not found" };
        }

        const project = await prisma.project.findFirst({
            where: {
                designerId: profile.id,
                status: 'ACTIVE'
            },
            include: {
                rooms: {
                    select: { id: true, name: true, type: true }
                }
            }
        });

        if (!project) {
            return { success: false, error: "No active project" };
        }

        return { success: true, data: project.rooms };
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return { success: false, error: "Failed to fetch rooms" };
    }
}
