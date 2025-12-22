"use server";

import prisma from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";
import { ProductStatus, ProductPlanningStatus } from "@prisma/client";

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

// Helper to extract price from text - improved version
function extractPrice(text: string): number | null {
    if (!text) return null;

    // Clean up the text
    let cleaned = text.trim();

    // Handle Polish format: "1 234,56 zł" or "1234,56"
    // Handle European format: "1.234,56 €"
    // Handle US format: "$1,234.56" or "1,234.56"

    // Remove currency symbols and text
    cleaned = cleaned.replace(/[złPLNEUR€$£\s]/gi, '');

    // Check if it's European format (comma as decimal separator)
    // Pattern: digits with optional thousand separators (spaces or dots), comma, decimals
    const europeanMatch = cleaned.match(/(\d[\d\s.]*),(\d{1,2})$/);
    if (europeanMatch) {
        const integerPart = europeanMatch[1].replace(/[\s.]/g, '');
        const decimalPart = europeanMatch[2];
        return parseFloat(`${integerPart}.${decimalPart}`);
    }

    // Check if it's US format (dot as decimal separator)
    // Pattern: digits with optional thousand separators (commas), dot, decimals
    const usMatch = cleaned.match(/(\d[\d,]*).(\d{1,2})$/);
    if (usMatch) {
        const integerPart = usMatch[1].replace(/,/g, '');
        const decimalPart = usMatch[2];
        return parseFloat(`${integerPart}.${decimalPart}`);
    }

    // Just extract any number (whole number without decimals)
    const wholeNumberMatch = cleaned.replace(/[\s.,]/g, '').match(/(\d+)/);
    if (wholeNumberMatch) {
        return parseFloat(wholeNumberMatch[1]);
    }

    return null;
}

// Try to extract price from JSON-LD structured data
function extractPriceFromJsonLd($: cheerio.CheerioAPI): number | null {
    try {
        const scripts = $('script[type="application/ld+json"]');
        for (let i = 0; i < scripts.length; i++) {
            const content = $(scripts[i]).html();
            if (!content) continue;

            try {
                const data = JSON.parse(content);

                // Handle array of schemas
                const schemas = Array.isArray(data) ? data : [data];

                for (const schema of schemas) {
                    // Direct Product schema
                    if (schema['@type'] === 'Product' && schema.offers) {
                        const offers = Array.isArray(schema.offers) ? schema.offers[0] : schema.offers;
                        if (offers.price) {
                            return parseFloat(offers.price);
                        }
                        if (offers.lowPrice) {
                            return parseFloat(offers.lowPrice);
                        }
                    }

                    // Nested in @graph
                    if (schema['@graph']) {
                        for (const item of schema['@graph']) {
                            if (item['@type'] === 'Product' && item.offers) {
                                const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
                                if (offers.price) {
                                    return parseFloat(offers.price);
                                }
                            }
                        }
                    }
                }
            } catch {
                // Invalid JSON, continue
            }
        }
    } catch {
        // Error parsing JSON-LD
    }
    return null;
}

// Try to extract image from JSON-LD structured data
function extractImageFromJsonLd($: cheerio.CheerioAPI): string | null {
    try {
        const scripts = $('script[type="application/ld+json"]');
        for (let i = 0; i < scripts.length; i++) {
            const content = $(scripts[i]).html();
            if (!content) continue;

            try {
                const data = JSON.parse(content);
                const schemas = Array.isArray(data) ? data : [data];

                for (const schema of schemas) {
                    if (schema['@type'] === 'Product' && schema.image) {
                        const image = Array.isArray(schema.image) ? schema.image[0] : schema.image;
                        if (typeof image === 'string') return image;
                        if (image.url) return image.url;
                    }

                    if (schema['@graph']) {
                        for (const item of schema['@graph']) {
                            if (item['@type'] === 'Product' && item.image) {
                                const image = Array.isArray(item.image) ? item.image[0] : item.image;
                                if (typeof image === 'string') return image;
                                if (image.url) return image.url;
                            }
                        }
                    }
                }
            } catch {
                // Invalid JSON
            }
        }
    } catch {
        // Error
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

        // Fetch the page with better headers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            },
            redirect: 'follow',
        });

        if (!response.ok) {
            return { success: false, error: `Failed to fetch URL: ${response.status}` };
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // ============ EXTRACT TITLE ============
        let title: string | null = null;
        const titleSelectors = [
            // Schema.org / Microdata
            'h1[itemprop="name"]',
            '[itemprop="name"]',
            // Common product page selectors
            'h1.product-title',
            'h1.product-name',
            'h1.product__title',
            'h1.pdp-title',
            '.product-title h1',
            '.product-name h1',
            '.product-info h1',
            '.product-details h1',
            // E-commerce specific
            '#productTitle',                    // Amazon
            '.pip-header-section h1',           // IKEA
            '[data-testid="product-title"]',
            '[data-testid="product-name"]',
            '[data-test="product-title"]',
            '.product-header h1',
            '.item-title h1',
            // Polish stores
            '.product-name__name',              // Allegro
            '.product__name',
            '.detailName',
            // Fallbacks
            'h1',
            'meta[property="og:title"]',
            'meta[name="twitter:title"]',
            'title',
        ];

        for (const selector of titleSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const text = selector.startsWith('meta')
                    ? element.attr('content')?.trim()
                    : element.text().trim();
                if (text && text.length > 0 && text.length < 500) {
                    title = text;
                    break;
                }
            }
        }

        // ============ EXTRACT PRICE ============
        let price: number | null = null;

        // First try JSON-LD (most reliable)
        price = extractPriceFromJsonLd($);

        // If no JSON-LD price, try meta tags
        if (!price) {
            const metaPriceSelectors = [
                'meta[property="product:price:amount"]',
                'meta[property="og:price:amount"]',
                'meta[name="product:price:amount"]',
                'meta[itemprop="price"]',
            ];
            for (const selector of metaPriceSelectors) {
                const content = $(selector).attr('content');
                if (content) {
                    price = extractPrice(content);
                    if (price && price > 0) break;
                }
            }
        }

        // Try HTML selectors
        if (!price) {
            const priceSelectors = [
                // Schema.org
                '[itemprop="price"]',
                '[itemprop="lowPrice"]',
                // Common selectors
                '.product-price',
                '.price',
                '.current-price',
                '.sale-price',
                '.final-price',
                '.actual-price',
                '.regular-price',
                // Specific stores
                '#priceblock_ourprice',                 // Amazon
                '#priceblock_dealprice',               // Amazon
                '.a-price .a-offscreen',               // Amazon
                '.pip-temp-price__integer',            // IKEA
                '.pip-price__integer',                 // IKEA
                '[data-testid="product-price"]',
                '[data-testid="price"]',
                '[data-test="product-price"]',
                '.price-box .price',
                '.product-price-value',
                '.price-value',
                '.price__value',
                // Polish stores
                '.price-normal',
                '.price--large',
                '.mp0_tt',                             // Allegro
                '[data-price]',
                '.product-price__value',
                '.product__price',
                '.detail-price',
                '.price-new',
                '.special-price .price',
                // Generic price patterns
                '[class*="price"]',
                '[class*="Price"]',
            ];

            for (const selector of priceSelectors) {
                const elements = $(selector);
                for (let i = 0; i < Math.min(elements.length, 3); i++) {
                    const element = $(elements[i]);
                    // Try content attribute first, then text
                    const priceText = element.attr('content') || element.text();
                    const extractedPrice = extractPrice(priceText);
                    if (extractedPrice && extractedPrice > 0 && extractedPrice < 10000000) {
                        price = extractedPrice;
                        break;
                    }
                }
                if (price) break;
            }
        }

        // ============ EXTRACT IMAGE ============
        let imageUrl: string | null = null;

        // First try JSON-LD
        const jsonLdImage = extractImageFromJsonLd($);
        if (jsonLdImage) {
            imageUrl = getAbsoluteUrl(jsonLdImage, url);
        }

        // Try meta tags (very reliable)
        if (!imageUrl) {
            const metaImageSelectors = [
                'meta[property="og:image"]',
                'meta[property="og:image:url"]',
                'meta[name="twitter:image"]',
                'meta[name="twitter:image:src"]',
                'meta[itemprop="image"]',
            ];
            for (const selector of metaImageSelectors) {
                const content = $(selector).attr('content');
                if (content) {
                    imageUrl = getAbsoluteUrl(content, url);
                    if (imageUrl) break;
                }
            }
        }

        // Try HTML image selectors
        if (!imageUrl) {
            const imageSelectors = [
                // Schema.org
                '[itemprop="image"]',
                'img[itemprop="image"]',
                // Common product image selectors
                '.product-image img',
                '.product-gallery img',
                '.product-photo img',
                '.product-media img',
                '.product__image img',
                '.gallery-image img',
                '.main-image img',
                '.primary-image img',
                // Specific stores
                '#landingImage',                       // Amazon
                '#imgBlkFront',                        // Amazon
                '.pip-media-grid__grid img',           // IKEA
                '.pip-image img',                      // IKEA
                '[data-testid="product-image"] img',
                '[data-testid="gallery-image"] img',
                '[data-test="product-image"] img',
                // Polish stores
                '.gallery__image img',
                '.photo-container img',
                '.product-gallery__image img',
                // Generic
                '.swiper-slide img',
                '.carousel-item img',
                '.slider img',
                'figure img',
                '.image-container img',
                // Very generic fallbacks (be careful)
                'img[src*="product"]',
                'img[src*="Product"]',
                'img[data-src*="product"]',
            ];

            for (const selector of imageSelectors) {
                const element = $(selector).first();
                if (element.length) {
                    // Try multiple attributes
                    const imgSrc = element.attr('src')
                        || element.attr('data-src')
                        || element.attr('data-lazy-src')
                        || element.attr('data-original')
                        || element.attr('data-zoom-image')
                        || element.attr('data-large')
                        || element.attr('srcset')?.split(',')[0]?.split(' ')[0];

                    const absoluteUrl = getAbsoluteUrl(imgSrc, url);
                    // Validate it's a proper image URL
                    if (absoluteUrl && !absoluteUrl.includes('placeholder') && !absoluteUrl.includes('loading')) {
                        imageUrl = absoluteUrl;
                        break;
                    }
                }
            }
        }

        // ============ EXTRACT BRAND/SUPPLIER ============
        let supplier: string | null = null;

        // Try JSON-LD brand
        try {
            const scripts = $('script[type="application/ld+json"]');
            for (let i = 0; i < scripts.length; i++) {
                const content = $(scripts[i]).html();
                if (!content) continue;
                try {
                    const data = JSON.parse(content);
                    const schemas = Array.isArray(data) ? data : [data];
                    for (const schema of schemas) {
                        if (schema['@type'] === 'Product' && schema.brand) {
                            const brand = typeof schema.brand === 'string'
                                ? schema.brand
                                : schema.brand.name;
                            if (brand) {
                                supplier = brand;
                                break;
                            }
                        }
                    }
                    if (supplier) break;
                } catch {}
            }
        } catch {}

        // Try HTML selectors for brand
        if (!supplier) {
            const brandSelectors = [
                '[itemprop="brand"]',
                '.product-brand',
                '.brand',
                '.manufacturer',
                '[data-testid="product-brand"]',
                '.product__brand',
            ];
            for (const selector of brandSelectors) {
                const text = $(selector).first().text().trim();
                if (text && text.length > 0 && text.length < 100) {
                    supplier = text;
                    break;
                }
            }
        }

        // Fallback to domain name
        if (!supplier) {
            supplier = extractDomain(url);
        }

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
        // Determine planning status based on destination
        const planningStatus = data.wishlistId
            ? ProductPlanningStatus.LIKED
            : ProductPlanningStatus.VARIANT; // Default to variant when added directly to room

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
                planningStatus,
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
        planningStatus: ProductPlanningStatus;
        status: ProductStatus;
        notes: string;
        wishlistId: string | null;
        roomId: string | null;
        isInCart: boolean;
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

// Refresh product data by re-scraping from URL
export async function refreshProduct(productId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        // Get the product
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

        // Check if product has a URL
        if (!existingProduct.url) {
            return { success: false, error: "Produkt nie ma przypisanego URL" };
        }

        // Re-scrape the product data
        const scrapeResult = await scrapeProductFromUrl(existingProduct.url);
        if (!scrapeResult.success || !scrapeResult.data) {
            return { success: false, error: "Nie udało się pobrać danych ze strony" };
        }

        const scrapedData = scrapeResult.data;

        // Update product with new data (keep notes and status)
        const product = await prisma.productItem.update({
            where: { id: productId },
            data: {
                name: scrapedData.title || existingProduct.name,
                price: scrapedData.price || existingProduct.price,
                imageUrl: scrapedData.imageUrl || existingProduct.imageUrl,
                supplier: scrapedData.supplier || existingProduct.supplier,
            },
        });

        if (existingProduct.wishlistId) {
            revalidatePath(`/wishlists/${existingProduct.wishlistId}`);
        }
        if (existingProduct.roomId) {
            revalidatePath("/rooms");
        }
        revalidatePath("/wishlists");
        revalidatePath("/");

        return { success: true, data: product };
    } catch (error) {
        console.error("Error refreshing product:", error);
        return { success: false, error: "Nie udało się odświeżyć produktu" };
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
                planningStatus: ProductPlanningStatus.VARIANT, // Default to variant when moved to room
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

// Approve product (client approval) - moves to real budget
export async function approveProduct(productId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const existingProduct = await prisma.productItem.findFirst({
            where: { id: productId },
            include: {
                room: { include: { project: true } },
            },
        });

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        if (!existingProduct.room || existingProduct.room.project.designerId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const product = await prisma.productItem.update({
            where: { id: productId },
            data: {
                planningStatus: ProductPlanningStatus.APPROVED,
                isInCart: true, // Add to cart when approved
            },
        });

        revalidatePath("/rooms");
        revalidatePath("/cart");

        return { success: true, data: product };
    } catch (error) {
        console.error("Error approving product:", error);
        return { success: false, error: "Failed to approve product" };
    }
}

// Reject product (client rejection)
export async function rejectProduct(productId: string) {
    const user = await getUser();
    if (!user) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const existingProduct = await prisma.productItem.findFirst({
            where: { id: productId },
            include: {
                room: { include: { project: true } },
            },
        });

        if (!existingProduct) {
            return { success: false, error: "Product not found" };
        }

        if (!existingProduct.room || existingProduct.room.project.designerId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        const product = await prisma.productItem.update({
            where: { id: productId },
            data: {
                planningStatus: ProductPlanningStatus.REJECTED,
                isInCart: false,
            },
        });

        revalidatePath("/rooms");
        revalidatePath("/cart");

        return { success: true, data: product };
    } catch (error) {
        console.error("Error rejecting product:", error);
        return { success: false, error: "Failed to reject product" };
    }
}
