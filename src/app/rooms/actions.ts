"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRoom(projectId: string, data: {
    name: string;
    type: string;
    area: number;
    budgetAllocated: number;
}) {
    if (!projectId) {
        throw new Error("Project ID is required");
    }

    try {
        const room = await prisma.room.create({
            data: {
                projectId,
                name: data.name,
                type: data.type as any, // Enum casting if necessary
                area: data.area,
                budgetAllocated: data.budgetAllocated
            }
        });

        revalidatePath("/rooms");
        return { success: true, room };
    } catch (error) {
        console.error("Failed to create room:", error);
        return { success: false, error };
    }
}
