import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/error',
    '/api/auth',
    // Static assets
    '/_next',
    '/favicon.ico',
  ]

  // Define admin routes that require special handling
  const adminRoutes = ['/admin']

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => nextUrl.pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => nextUrl.pathname.startsWith(route))

  // Allow public routes and API routes
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected route
  if (!isLoggedIn && !isAdminRoute) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('redirectTo', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user is authenticated and trying to access login page, redirect to home
  if (isLoggedIn && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl.origin))
  }

  // Admin routes have their own authentication logic (password protection)
  // so we allow them to pass through even without user authentication

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (Auth.js API routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}