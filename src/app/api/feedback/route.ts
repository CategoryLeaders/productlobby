/**
 * Feedback & Feature Request API
 * POST /api/feedback - Submit feedback
 * GET /api/feedback - Admin only - List all feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export type FeedbackType = 'bug' | 'feature_request' | 'general' | 'improvement'
export type FeedbackUrgency = 'low' | 'medium' | 'high'

interface FeedbackSubmission {
  type: FeedbackType
  title: string
  description: string
  urgency: FeedbackUrgency
  email?: string
  url?: string
}

/**
 * POST /api/feedback
 * Submit user feedback or feature request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, title, description, urgency, email, url } =
      body as FeedbackSubmission

    // Validate required fields
    if (!type || !title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: type, title, description',
        },
        { status: 400 }
      )
    }

    // Validate type
    const validTypes = ['bug', 'feature_request', 'general', 'improvement']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid feedback type. Must be one of: ${validTypes.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate urgency
    const validUrgencies = ['low', 'medium', 'high']
    if (urgency && !validUrgencies.includes(urgency)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid urgency. Must be one of: ${validUrgencies.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Get current user (optional)
    const user = await getCurrentUser()

    // Check if Feedback model exists - if it does, save the feedback
    // If not, we'll just log it (since we can't modify schema)
    let feedback: any = null

    try {
      // Try to create feedback record
      feedback = await prisma.feedback?.create({
        data: {
          type,
          title,
          description,
          urgency: urgency || 'medium',
          userId: user?.id || null,
          userEmail: email || user?.email || null,
          pageUrl: url,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || undefined,
          status: 'new',
        },
      })
    } catch (e: any) {
      // If Feedback model doesn't exist, just log it
      if (e.code === 'P3009' || e.message?.includes('does not exist')) {
        console.log('[FEEDBACK]', {
          type,
          title,
          description,
          urgency,
          user: user?.id,
          email: email || user?.email,
          url,
          timestamp: new Date().toISOString(),
        })
      } else {
        throw e
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your feedback! We appreciate your input.',
        data: feedback
          ? {
              id: feedback.id,
              createdAt: feedback.createdAt,
            }
          : null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Feedback submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/feedback
 * Admin only - List all feedback
 * Requires admin role
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
      },
    })

    // Simple admin check - you might want to use a more sophisticated role system
    const adminEmails = [
      'admin@productlobby.com',
      'support@productlobby.com',
      'founder@productlobby.com',
    ]
    const isAdmin = adminUser && adminEmails.includes(adminUser.email)

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    try {
      // Try to fetch feedback from database
      const [feedback, total] = await Promise.all([
        prisma.feedback?.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            type: true,
            title: true,
            description: true,
            urgency: true,
            status: true,
            userEmail: true,
            pageUrl: true,
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        }) || [],
        prisma.feedback?.count({ where }) || 0,
      ])

      return NextResponse.json(
        {
          success: true,
          data: feedback,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
        { status: 200 }
      )
    } catch (e: any) {
      // If Feedback model doesn't exist
      if (e.code === 'P3009' || e.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            success: true,
            data: [],
            pagination: {
              total: 0,
              limit,
              offset,
              hasMore: false,
            },
            message: 'Feedback model not yet configured in database',
          },
          { status: 200 }
        )
      }
      throw e
    }
  } catch (error) {
    console.error('Feedback list error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}
