"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

async function getUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.email) {
        return null;
    }

    const profile = await prisma.profile.findUnique({
        where: { email: user.email }
    });

    return profile;
}

export async function getWishlists() {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const wishlists = await prisma.wishlist.findMany({
            where: { designerId: user.id },
            include: {
                productItems: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const wishlistsWithStats = wishlists.map((w) => {
            const totalBudget = w.productItems.reduce(
                (sum, p) => sum + Number(p.price) * p.quantity,
                0
            );
            const totalSpent = w.productItems
                .filter((p) => p.status === "PAID" || p.status === "DELIVERED")
                .reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);

            return {
                id: w.id,
                name: w.name,
                createdAt: w.createdAt,
                productCount: w.productItems.length,
                totalBudget,
                totalSpent,
                coverImage: w.productItems[0]?.imageUrl || null,
            };
        });

        return { success: true, data: wishlistsWithStats };
    } catch (error) {
        console.error("Error fetching wishlists:", error);
        return { success: false, error: "Failed to fetch wishlists" };
    }
}

export async function getWishlistById(wishlistId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const wishlist = await prisma.wishlist.findFirst({
            where: {
                id: wishlistId,
                designerId: user.id,
            },
            include: {
                productItems: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        if (!wishlist) {
            return { success: false, error: "Wishlist not found" };
        }

        return { success: true, data: wishlist };
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return { success: false, error: "Failed to fetch wishlist" };
    }
}

export async function createWishlist(name: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const wishlist = await prisma.wishlist.create({
            data: {
                name,
                designerId: user.id,
            },
        });

        revalidatePath("/wishlists");
        return { success: true, data: wishlist };
    } catch (error) {
        console.error("Error creating wishlist:", error);
        return { success: false, error: "Failed to create wishlist" };
    }
}

export async function updateWishlist(wishlistId: string, data: { name: string }) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const wishlist = await prisma.wishlist.updateMany({
            where: {
                id: wishlistId,
                designerId: user.id,
            },
            data: {
                name: data.name,
            },
        });

        if (wishlist.count === 0) {
            return { success: false, error: "Wishlist not found" };
        }

        revalidatePath("/wishlists");
        revalidatePath(`/wishlists/${wishlistId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating wishlist:", error);
        return { success: false, error: "Failed to update wishlist" };
    }
}

export async function deleteWishlist(wishlistId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // First delete all product items in this wishlist
        await prisma.productItem.deleteMany({
            where: { wishlistId },
        });

        const result = await prisma.wishlist.deleteMany({
            where: {
                id: wishlistId,
                designerId: user.id,
            },
        });

        if (result.count === 0) {
            return { success: false, error: "Wishlist not found" };
        }

        revalidatePath("/wishlists");
        return { success: true };
    } catch (error) {
        console.error("Error deleting wishlist:", error);
        return { success: false, error: "Failed to delete wishlist" };
    }
}
