/**
 * Admin Reports API
 * GET /api/admin/reports
 *
 * Retrieve all reported campaigns with reporter info and campaign details.
 * Requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          reporter: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ])

    // Fetch campaign details for each report (filter by CAMPAIGN targetType)
    const campaignReports = await Promise.all(
      reports
        .filter(r => r.targetType === 'CAMPAIGN')
        .map(async (report) => {
          const campaign = await prisma.campaign.findUnique({
            where: { id: report.targetId },
            select: {
              id: true,
              title: true,
              slug: true,
              creator: {
                select: {
                  id: true,
                  displayName: true,
                  email: true,
                },
              },
            },
          })
          return { ...report, campaign }
        })
    )

    // Map reports back to include campaign data
    const enrichedReports = reports.map((report) => {
      const campaignData = campaignReports.find(cr => cr.id === report.id)
      return campaignData ? campaignData : report
    })

    return NextResponse.json({
      success: true,
      data: {
        items: enrichedReports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('List reports error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
