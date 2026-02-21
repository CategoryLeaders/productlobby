import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/brand',
  '/campaigns/new',
  '/settings',
  '/profile',
  '/lobbies',
  '/notifications',
]

// Routes only accessible when NOT authenticated
const AUTH_ROUTES = ['/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get('session_token')?.value

  // Check if route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // Check if route is auth-only (login/signup)
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  )

  // No session + protected route → redirect to login
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Has session + auth route → redirect to campaigns
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/campaigns', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - static files
     * - images
     * - favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico|og-image.png|apple-touch-icon.png).*)',
  ],
}
