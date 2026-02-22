/**
 * API response helpers
 * Provides standardized response formats and cache headers
 */

import { NextResponse } from 'next/server'

/**
 * Standard JSON response
 * Used for successful data responses
 */
export function jsonResponse(
  data: any,
  status: number = 200,
  headers?: Record<string, string>
) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

/**
 * JSON response with cache headers
 * maxAge in seconds
 */
export function cachedJsonResponse(
  data: any,
  maxAge: number = 60,
  status: number = 200,
  headers?: Record<string, string>
) {
  const cacheControl = `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`

  return NextResponse.json(data, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...headers,
    },
  })
}

/**
 * Paginated response format
 * Standardizes pagination across API endpoints
 */
export interface PaginatedData<T> {
  success: boolean
  data: {
    items: T[]
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export function paginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<PaginatedData<T>> {
  const totalPages = Math.ceil(total / limit)
  const hasMore = page < totalPages

  const data: PaginatedData<T> = {
    success: true,
    data: {
      items,
      page,
      limit,
      total,
      totalPages,
      hasMore,
    },
  }

  return jsonResponse(data, status, headers)
}

/**
 * Error response format
 * Standardizes error responses across API endpoints
 */
export interface ErrorResponse {
  success: boolean
  error: {
    message: string
    code?: string
    details?: any
  }
}

export function errorResponse(
  message: string,
  status: number = 400,
  code?: string,
  details?: any
): NextResponse<ErrorResponse> {
  const data: ErrorResponse = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details }),
    },
  }

  return jsonResponse(data, status)
}

/**
 * Validate request method
 * Helper to ensure correct HTTP method is used
 */
export function validateMethod(
  method: string,
  allowedMethods: string[]
): NextResponse<ErrorResponse> | null {
  if (!allowedMethods.includes(method)) {
    return errorResponse(`Method ${method} not allowed`, 405, 'METHOD_NOT_ALLOWED')
  }
  return null
}

/**
 * Parse and validate JSON body
 * Helper for parsing request body with error handling
 */
export async function parseJsonBody(request: Request): Promise<any> {
  try {
    return await request.json()
  } catch {
    throw new Error('Invalid JSON in request body')
  }
}

/**
 * Not found response
 */
export function notFoundResponse(
  resource: string = 'Resource'
): NextResponse<ErrorResponse> {
  return errorResponse(`${resource} not found`, 404, 'NOT_FOUND')
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse<ErrorResponse> {
  return errorResponse(message, 401, 'UNAUTHORIZED')
}

/**
 * Forbidden response
 */
export function forbiddenResponse(
  message: string = 'Forbidden'
): NextResponse<ErrorResponse> {
  return errorResponse(message, 403, 'FORBIDDEN')
}

/**
 * Rate limit response
 */
export function rateLimitResponse(retryAfter?: number): NextResponse<ErrorResponse> {
  const response = errorResponse(
    'Too many requests',
    429,
    'RATE_LIMIT_EXCEEDED'
  )

  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter))
  }

  return response
}

/**
 * Server error response
 */
export function serverErrorResponse(
  message: string = 'Internal server error',
  details?: any
): NextResponse<ErrorResponse> {
  return errorResponse(message, 500, 'INTERNAL_SERVER_ERROR', details)
}

/**
 * Success response with custom data
 */
export interface SuccessResponse<T> {
  success: boolean
  data: T
}

export function successResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<SuccessResponse<T>> {
  return jsonResponse({ success: true, data }, status, headers)
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  message: string,
  errors?: Record<string, string[]>
): NextResponse<ErrorResponse> {
  return errorResponse(message, 422, 'VALIDATION_ERROR', { errors })
}
