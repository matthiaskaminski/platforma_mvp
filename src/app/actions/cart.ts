"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { ProductStatus, MaterialStatus, LaborStatus } from "@prisma/client";

// Get all approved items for the cart (products + services)
export async function getCartItems() {
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

        // Get approved products
        const products = await prisma.productItem.findMany({
            where: {
                room: {
                    projectId: project.id
                },
                planningStatus: 'APPROVED'
            },
            include: {
                room: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get approved services
        const services = await prisma.serviceItem.findMany({
            where: {
                projectId: project.id,
                planningStatus: 'APPROVED'
            },
            include: {
                room: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map products to cart items
        const productItems = products.map(p => ({
            id: p.id,
            type: 'product' as const,
            name: p.name,
            room: p.room?.name || null,
            roomId: p.roomId,
            category: 'Produkt',
            quantity: p.quantity,
            unitPrice: Number(p.price),
            totalPrice: Number(p.price) * p.quantity,
            status: p.status,
            imageUrl: p.imageUrl,
            url: p.url,
            supplier: p.supplier,
            createdAt: p.createdAt
        }));

        // Map services to cart items
        const serviceItems = services.map(s => ({
            id: s.id,
            type: 'service' as const,
            name: s.category === 'MATERIAL' ? s.name : s.subcontractor,
            room: s.room?.name || null,
            roomId: s.roomId,
            category: s.category === 'MATERIAL' ? 'Materiał' : 'Robocizna',
            quantity: s.quantity || 1,
            unitPrice: Number(s.price),
            totalPrice: Number(s.price) * (s.quantity || 1),
            status: s.category === 'MATERIAL' ? s.materialStatus : s.laborStatus,
            imageUrl: s.imageUrl,
            url: s.url,
            supplier: s.category === 'MATERIAL' ? s.materialType : s.scope,
            createdAt: s.createdAt
        }));

        return {
            success: true,
            data: [...productItems, ...serviceItems].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        };
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return { success: false, error: "Failed to fetch cart items" };
    }
}

// Update product status
export async function updateProductStatus(id: string, status: ProductStatus) {
    try {
        await prisma.productItem.update({
            where: { id },
            data: { status }
        });

        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        console.error("Error updating product status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// Update material service status
export async function updateMaterialStatus(id: string, status: MaterialStatus) {
    try {
        await prisma.serviceItem.update({
            where: { id },
            data: { materialStatus: status }
        });

        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        console.error("Error updating material status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// Update labor service status
export async function updateLaborStatus(id: string, status: LaborStatus) {
    try {
        await prisma.serviceItem.update({
            where: { id },
            data: { laborStatus: status }
        });

        revalidatePath('/cart');
        return { success: true };
    } catch (error) {
        console.error("Error updating labor status:", error);
        return { success: false, error: "Failed to update status" };
    }
}

// Export cart items to CSV/Excel format
export async function exportCartItems() {
    const result = await getCartItems();

    if (!result.success || !result.data) {
        return { success: false, error: "Failed to get cart items" };
    }

    const items = result.data;

    // Create CSV content
    const headers = ['Lp.', 'Nazwa', 'Pomieszczenie', 'Typ', 'Ilość', 'Cena jednostkowa', 'Cena łączna', 'Status'];
    const rows = items.map((item, index) => [
        index + 1,
        item.name || '',
        item.room || '',
        item.category,
        item.quantity,
        item.unitPrice.toFixed(2),
        item.totalPrice.toFixed(2),
        getStatusLabel(item.type, item.status)
    ]);

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const paidAmount = items
        .filter(item => item.status === 'PAID' || item.status === 'DELIVERED' || item.status === 'COMPLETED')
        .reduce((sum, item) => sum + item.totalPrice, 0);

    rows.push([]);
    rows.push(['', '', '', '', '', 'SUMA:', totalAmount.toFixed(2), '']);
    rows.push(['', '', '', '', '', 'Opłacono:', paidAmount.toFixed(2), '']);
    rows.push(['', '', '', '', '', 'Do zapłaty:', (totalAmount - paidAmount).toFixed(2), '']);

    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.join(';'))
    ].join('\n');

    return {
        success: true,
        data: csvContent,
        filename: `koszyk_${new Date().toISOString().split('T')[0]}.csv`
    };
}

function getStatusLabel(type: 'product' | 'service', status: string | null): string {
    if (!status) return 'Do zamówienia';

    const productLabels: Record<string, string> = {
        'TO_ORDER': 'Do zamówienia',
        'ORDERED': 'Zamówione',
        'PAID': 'Opłacone',
        'DELIVERED': 'Dostarczone',
        'RETURNED': 'Zwrócone'
    };

    const serviceLabels: Record<string, string> = {
        'TO_ORDER': 'Do zamówienia',
        'ORDERED': 'Zamówione/Zlecone',
        'TO_PAY': 'Do zapłaty',
        'PAID': 'Opłacone',
        'ADVANCE_PAID': 'Zaliczka',
        'RECEIVED': 'Odebrane',
        'IN_PROGRESS': 'W trakcie',
        'COMPLETED': 'Zakończone'
    };

    if (type === 'product') {
        return productLabels[status] || status;
    }
    return serviceLabels[status] || status;
}
