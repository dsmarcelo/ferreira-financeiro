import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/auth/confirm',
    '/error',
    // Static and API routes are already handled by the matcher config
  ]

  // Define admin routes that require special handling
  const adminRoutes = [
    '/admin',
  ]

  const { pathname } = request.nextUrl

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.redirect() or similar, make sure
  // to use supabaseResponse.headers.getAll() or similar to copy the set-cookie headers.

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute && !isAdminRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Preserve the original URL as a redirect parameter
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Admin routes have their own authentication logic (password protection)
  // so we allow them to pass through even without user authentication

  return supabaseResponse
}
