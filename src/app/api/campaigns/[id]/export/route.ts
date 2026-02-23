import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface ExportRequest {
  format: 'csv' | 'json' | 'pdf'
  scope: 'all' | 'supporters' | 'activity' | 'analytics'
  fromDate?: string
  toDate?: string
  recurring?: boolean
  frequency?: 'daily' | 'weekly' | 'monthly'
}

interface ExportRecord {
  id: string
  format: string
  scope: string
  status: 'completed' | 'processing' | 'failed'
  fileName: string
  fileSize: number
  createdAt: string
  completedAt?: string
  error?: string
}

// GET /api/campaigns/[id]/export - Fetch export history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can view exports' },
        { status: 403 }
      )
    }

    // Fetch export history from ContributionEvent with metadata.action='data_export'
    const exportEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId: id,
        metadata: {
          path: ['action'],
          equals: 'data_export',
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    // Transform to export history format
    const history: ExportRecord[] = exportEvents.map((event) => {
      const metadata = (event.metadata as Record<string, any>) || {}
      return {
        id: event.id,
        format: metadata.format || 'unknown',
        scope: metadata.scope || 'all',
        status: metadata.status || 'processing',
        fileName: metadata.fileName || `export-${event.id}.file`,
        fileSize: metadata.fileSize || 0,
        createdAt: event.createdAt.toISOString(),
        completedAt: metadata.completedAt,
        error: metadata.error,
      }
    })

    return NextResponse.json(
      { history },
      { status: 200 }
    )
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/export]', error)
    return NextResponse.json(
      { error: 'Failed to fetch export history' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/export - Initiate new export
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id } = params
    const body: ExportRequest = await request.json()

    // Validate request
    if (!body.format || !body.scope) {
      return NextResponse.json(
        { error: 'Missing required fields: format, scope' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        creatorUserId: true,
        title: true,
        id: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can export' },
        { status: 403 }
      )
    }

    // Validate date range
    let fromDate: Date | null = null
    let toDate: Date | null = null

    if (body.fromDate) {
      fromDate = new Date(body.fromDate)
      if (isNaN(fromDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid fromDate format' },
          { status: 400 }
        )
      }
    }

    if (body.toDate) {
      toDate = new Date(body.toDate)
      if (isNaN(toDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid toDate format' },
          { status: 400 }
        )
      }
    }

    if (fromDate && toDate && fromDate > toDate) {
      return NextResponse.json(
        { error: 'fromDate must be before toDate' },
        { status: 400 }
      )
    }

    // Generate export ID and file name
    const exportId = crypto.randomUUID()
    const timestamp = new Date().toISOString().split('T')[0]
    const formatExt = {
      csv: 'csv',
      json: 'json',
      pdf: 'pdf',
    }[body.format]

    const fileName = `campaign-export-${body.scope}-${timestamp}.${formatExt}`

    // Create ContributionEvent record with export metadata
    const exportEvent = await prisma.contributionEvent.create({
      data: {
        id: exportId,
        userId: user.id,
        campaignId: id,
        eventType: 'PREFERENCE_SUBMITTED', // Using existing event type
        points: 0,
        metadata: {
          action: 'data_export',
          format: body.format,
          scope: body.scope,
          status: 'processing',
          fileName,
          fileSize: 0,
          fromDate: fromDate?.toISOString() || null,
          toDate: toDate?.toISOString() || null,
          recurring: body.recurring || false,
          frequency: body.frequency || null,
          createdAt: new Date().toISOString(),
        },
      },
    })

    // TODO: In production, queue this for async processing
    // For now, return the export record immediately with processing status
    // In a real implementation, you'd use a job queue (Bull, Inngest, etc.)
    
    const exportRecord: ExportRecord = {
      id: exportEvent.id,
      format: body.format,
      scope: body.scope,
      status: 'processing',
      fileName,
      fileSize: 0,
      createdAt: exportEvent.createdAt.toISOString(),
    }

    return NextResponse.json(
      { 
        message: 'Export initiated successfully',
        export: exportRecord 
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('[POST /api/campaigns/[id]/export]', error)
    return NextResponse.json(
      { error: 'Failed to initiate export' },
      { status: 500 }
    )
  }
}
