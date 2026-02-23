import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: {
    id: string
  }
}

interface VersionChange {
  field: string
  oldValue: string
  newValue: string
}

interface VersionMetadata {
  action?: string
  changes?: VersionChange[]
  summary?: string
  [key: string]: any
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)

    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch version history events (SOCIAL_SHARE with version_update action)
    const versionEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            displayName: true,
            handle: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Filter for version update events and transform them
    const versions = versionEvents
      .filter((event) => {
        const metadata = event.metadata as VersionMetadata | null
        return metadata?.action === 'version_update'
      })
      .map((event, index) => {
        const metadata = event.metadata as VersionMetadata
        const versionNumber = index + 1 + offset

        return {
          id: event.id,
          versionNumber,
          createdAt: event.createdAt.toISOString(),
          editor: {
            id: event.user.id,
            displayName: event.user.displayName,
            avatar: event.user.avatar || null,
          },
          metadata: {
            action: metadata.action,
            changes: metadata.changes || [],
            summary: metadata.summary || null,
          },
        }
      })

    // Get total count for pagination info
    const totalVersionEvents = await prisma.contributionEvent.count({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
    })

    // Count version updates specifically
    const allVersionEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        metadata: true,
      },
    })

    const totalVersions = allVersionEvents.filter((event) => {
      const metadata = event.metadata as VersionMetadata | null
      return metadata?.action === 'version_update'
    }).length

    return NextResponse.json({
      success: true,
      versions,
      pagination: {
        total: totalVersions,
        limit,
        offset,
        hasMore: offset + limit < totalVersions,
      },
    })
  } catch (error) {
    console.error('Error fetching campaign versions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign versions' },
      { status: 500 }
    )
  }
}
