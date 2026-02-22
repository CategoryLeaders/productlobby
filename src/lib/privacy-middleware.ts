/**
 * Privacy Middleware for Brand API Routes
 * Enforces privacy controls and authorization checks
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isBrandUser, isBrandOwner } from '@/lib/privacy'

/**
 * Brand authorization middleware.
 * Verifies user is authenticated and has access to the specified brand.
 * Returns user if authorized, otherwise throws error.
 */
export async function requireBrandAuth(request: NextRequest, brandId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      ),
    }
  }

  const hasAccess = await isBrandUser(user.id, brandId)

  if (!hasAccess) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden - you do not have access to this brand' },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true,
    user,
  }
}

/**
 * Brand owner authorization middleware.
 * Verifies user is authenticated and is an OWNER of the specified brand.
 * Returns user if authorized, otherwise throws error.
 */
export async function requireBrandOwner(request: NextRequest, brandId: string) {
  const user = await getCurrentUser()

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized - authentication required' },
        { status: 401 }
      ),
    }
  }

  const isOwner = await isBrandOwner(user.id, brandId)

  if (!isOwner) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Forbidden - you must be a brand owner to perform this action' },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true,
    user,
  }
}

/**
 * Add privacy headers to API response.
 * Sets appropriate cache and privacy headers for brand-facing endpoints.
 */
export function addPrivacyHeaders(response: NextResponse, cacheSeconds: number = 300): NextResponse {
  // Indicate this response contains aggregated data
  response.headers.set('X-Privacy-Level', 'aggregated')

  // Cache privately (only in user's browser cache)
  response.headers.set('Cache-Control', `private, max-age=${cacheSeconds}`)

  // Prevent caching by proxies or CDNs
  response.headers.set('Pragma', 'no-cache')

  // Prevent sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff')

  return response
}

/**
 * Sanitize error messages for API responses.
 * Prevents leaking internal system details.
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Only return generic messages, never stack traces or internal details
    const message = error.message.toLowerCase()

    if (message.includes('not found')) return 'Resource not found'
    if (message.includes('unauthorized')) return 'Authentication required'
    if (message.includes('forbidden')) return 'Access denied'

    // Default generic message
    return 'Something went wrong'
  }

  return 'Something went wrong'
}
