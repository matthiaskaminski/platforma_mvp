"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";
import { ProductStatus } from "@prisma/client";

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

export interface ScrapedProductData {
    title: string | null;
    price: number | null;
    imageUrl: string | null;
    supplier: string | null;
    description: string | null;
    url: string;
}

export interface CreateProductData {
    name: string;
    price?: number;
    imageUrl?: string;
    supplier?: string;
    url?: string;
    category?: string;
    quantity?: number;
    wishlistId?: string;
    roomId?: string;
}

// Helper to extract price from text
function extractPrice(text: string): number | null {
    if (!text) return null;

    // Remove currency symbols and spaces, normalize decimal separator
    const cleaned = text
        .replace(/[^\d,.\s]/g, '')
        .replace(/\s/g, '')
        .replace(',', '.');

    // Find number pattern
    const match = cleaned.match(/(\d+(?:\.\d{1,2})?)/);
    if (match) {
        return parseFloat(match[1]);
    }
    return null;
}

// Helper to get absolute URL
function getAbsoluteUrl(url: string | undefined, baseUrl: string): string | null {
    if (!url) return null;

    try {
        if (url.startsWith('http')) return url;
        if (url.startsWith('//')) return `https:${url}`;
        if (url.startsWith('/')) {
            const base = new URL(baseUrl);
            return `${base.origin}${url}`;
        }
        return new URL(url, baseUrl).href;
    } catch {
        return null;
    }
}

// Helper to extract domain name for supplier
function extractDomain(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        // Remove www. prefix if present
        const domain = hostname.replace(/^www\./, '');
        // Get the main domain name (e.g., "ikea" from "ikea.com")
        const parts = domain.split('.');
        if (parts.length >= 2) {
            return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
        }
        return domain;
    } catch {
        return null;
    }
}

export async function scrapeProductFromUrl(url: string): Promise<{ success: boolean; data?: ScrapedProductData; error?: string }> {
    try {
        // Validate URL
        new URL(url);

        // Fetch the page
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
            },
        });

        if (!response.ok) {
            return { success: false, error: `Failed to fetch URL: ${response.status}` };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Extract title - try multiple selectors
        let title: string | null = null;
        const titleSelectors = [
            'h1[itemprop="name"]',
            'h1.product-title',
            'h1.product-name',
            'h1[data-testid="product-title"]',
            '[data-testid="product-name"]',
            '.product-title h1',
            '.product-name h1',
            '#productTitle',
            'h1',
            'meta[property="og:title"]',
            'title',
        ];

        for (const selector of titleSelectors) {
            const element = $(selector).first();
            if (element.length) {
                title = selector.startsWith('meta')
                    ? element.attr('content')?.trim() || null
                    : element.text().trim() || null;
                if (title && title.length > 0 && title.length < 300) break;
            }
        }

        // Extract price - try multiple selectors
        let price: number | null = null;
        const priceSelectors = [
            '[itemprop="price"]',
            '.product-price',
            '.price',
            '[data-testid="product-price"]',
            '[data-testid="price"]',
            '.current-price',
            '.sale-price',
            '#priceblock_ourprice',
            '#priceblock_dealprice',
            '.pip-temp-price__integer',
            'meta[property="product:price:amount"]',
            'meta[property="og:price:amount"]',
        ];

        for (const selector of priceSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const priceText = selector.startsWith('meta')
                    ? element.attr('content') || ''
                    : element.text() || element.attr('content') || '';
                price = extractPrice(priceText);
                if (price && price > 0) break;
            }
        }

        // Extract image - try multiple selectors
        let imageUrl: string | null = null;
        const imageSelectors = [
            '[itemprop="image"]',
            '.product-image img',
            '.product-gallery img',
            '[data-testid="product-image"] img',
            '.pip-media-grid__grid img',
            '#imgBlkFront',
            '#landingImage',
            'meta[property="og:image"]',
            '.main-image img',
            '.product-img img',
        ];

        for (const selector of imageSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const imgSrc = selector.startsWith('meta')
                    ? element.attr('content')
                    : element.attr('src') || element.attr('data-src') || element.attr('data-lazy-src');
                imageUrl = getAbsoluteUrl(imgSrc, url);
                if (imageUrl) break;
            }
        }

        // Extract supplier/brand
        const supplier = extractDomain(url);

        const scrapedData: ScrapedProductData = {
            title,
            price,
            imageUrl,
            supplier,
            description: null,
            url,
        };

        return { success: true, data: scrapedData };
    } catch (error) {
        console.error("Error scraping product:", error);
        return { success: false, error: "Failed to scrape product data" };
    }
}

export async function createProduct(data: CreateProductData) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Verify wishlist ownership if provided
    if (data.wishlistId) {
        const wishlist = await prisma.wishlist.findFirst({
            where: {
                id: data.wishlistId,
                designerId: user.id,
            },
        });
        if (!wishlist) {
            return { success: false, error: "Wishlist not found" };
        }
    }

    // Verify room access if provided (through project ownership)
    if (data.roomId) {
        const room = await prisma.room.findFirst({
            where: {
                id: data.roomId,
                project: {
                    designerId: user.id,
                },
            },
        });
        if (!room) {
            return { success: false, error: "Room not found" };
        }
    }

    try {
        const product = await prisma.productItem.create({
            data: {
                name: data.name,
                price: data.price || 0,
                imageUrl: data.imageUrl,
                supplier: data.supplier,
                url: data.url,
                category: data.category,
                quantity: data.quantity || 1,
                wishlistId: data.wishlistId,
                roomId: data.roomId,
                status: ProductStatus.TO_ORDER,
            },
        });

        if (data.wishlistId) {
            revalidatePath(`/wishlists/${data.wishlistId}`);
        }
        if (data.roomId) {
            revalidatePath("/rooms");
        }
        revalidatePath("/wishlists");

        return { success: true, data: product };
    } catch (error) {
        console.error("Error creating product:", error);
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProduct(
    productId: string,
    data: Partial<{
        name: string;
        price: number;
        imageUrl: string;
        supplier: string;
        url: string;
        category: string;
        quantity: number;
        status: ProductStatus;
        wishlistId: string | null;
        roomId: string | null;
    }>
) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get the product with its relations
        const existingProduct = await prisma.productItem.findFirst({
            where: { id: productId },
            include: {
                wishlist: true,
                room: { include: { project: true } },
            },
        });

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        // Check ownership
        const isOwner =
            (existingProduct.wishlist && existingProduct.wishlist.designerId === user.id) ||
            (existingProduct.room && existingProduct.room.project.designerId === user.id);

        if (!isOwner) {
            return { success: false, error: "Unauthorized" };
        }

        const product = await prisma.productItem.update({
            where: { id: productId },
            data,
        });

        if (existingProduct.wishlistId) {
            revalidatePath(`/wishlists/${existingProduct.wishlistId}`);
        }
        if (existingProduct.roomId) {
            revalidatePath("/rooms");
        }
        revalidatePath("/wishlists");

        return { success: true, data: product };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, error: "Failed to update product" };
    }
}

export async function deleteProduct(productId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get the product with its relations
        const existingProduct = await prisma.productItem.findFirst({
            where: { id: productId },
            include: {
                wishlist: true,
                room: { include: { project: true } },
            },
        });

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        // Check ownership
        const isOwner =
            (existingProduct.wishlist && existingProduct.wishlist.designerId === user.id) ||
            (existingProduct.room && existingProduct.room.project.designerId === user.id);

        if (!isOwner) {
            return { success: false, error: "Unauthorized" };
        }

        await prisma.productItem.delete({
            where: { id: productId },
        });

        if (existingProduct.wishlistId) {
            revalidatePath(`/wishlists/${existingProduct.wishlistId}`);
        }
        if (existingProduct.roomId) {
            revalidatePath("/rooms");
        }
        revalidatePath("/wishlists");

        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, error: "Failed to delete product" };
    }
}

export async function moveProductToRoom(productId: string, roomId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    // Verify room access
    const room = await prisma.room.findFirst({
        where: {
            id: roomId,
            project: {
                designerId: user.id,
            },
        },
    });

    if (!room) {
        return { success: false, error: "Room not found" };
    }

    try {
        const product = await prisma.productItem.update({
            where: { id: productId },
            data: {
                roomId,
                wishlistId: null, // Remove from wishlist when moving to room
            },
        });

        revalidatePath("/wishlists");
        revalidatePath("/rooms");

        return { success: true, data: product };
    } catch (error) {
        console.error("Error moving product:", error);
        return { success: false, error: "Failed to move product" };
    }
}
