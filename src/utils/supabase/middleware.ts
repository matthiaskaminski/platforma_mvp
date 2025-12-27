
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protect routes - if no user and trying to access protected route -> login
    // Public routes: /login, /auth, /schema, /client (for client surveys)
    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth') && !request.nextUrl.pathname.startsWith('/schema') && !request.nextUrl.pathname.startsWith('/client')) {
        // Allow static assets, images, etc.
        if (request.nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|ico|css|js)$/)) {
            return response
        }
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}
