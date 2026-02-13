import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// Check if user is admin (simplified - in production, use proper role system)
async function isAdmin(userId: string): Promise<boolean> {
  // For now, check if user has any brand team membership with OWNER role
  // In production, implement proper admin table
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) return false

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })

  return user?.email === adminEmail
}

// GET /api/admin/reports - List reports
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const isUserAdmin = await isAdmin(user.id)
    if (!isUserAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || 'OPEN'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { status: status as any },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      }),
      prisma.report.count({ where: { status: status as any } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: reports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List reports error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
