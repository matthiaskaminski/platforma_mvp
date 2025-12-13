"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoom(projectId: string, data: {
    name: string;
    type: string;
    area: number;
    budgetAllocated: number;
    status: string; // "not_started" | "in_progress" | "finished"
    coverImage?: string;
}) {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    try {
        const room = await prisma.room.create({
            data: {
                projectId,
                name: data.name,
                type: data.type as any, // Enum casting
                status: data.status as any, // Enum casting
                area: data.area,
                budgetAllocated: data.budgetAllocated,
                coverImage: data.coverImage
            }
        });

        revalidatePath("/rooms");
        return { success: true, room };
    } catch (error) {
        console.error("Failed to create room:", error);
        return { success: false, error };
    }
}
