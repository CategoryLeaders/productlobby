import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/[id]/export - Export campaign data as JSON or CSV
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
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // json or csv

    // Get campaign with creator check
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
        media: true,
        updates: {
          orderBy: { createdAt: 'desc' },
        },
        comments: {
          select: {
            id: true,
            text: true,
            createdAt: true,
            author: {
              select: {
                displayName: true,
                handle: true,
              },
            },
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - only campaign creator can export' },
        { status: 403 }
      )
    }

    // Get lobbies stats
    const [totalLobbies, comments, shares] = await Promise.all([
      prisma.lobby.count({
        where: { campaignId: id, status: 'VERIFIED' },
      }),
      prisma.comment.count({
        where: { campaignId: id },
      }),
      prisma.share.count({
        where: { campaignId: id },
      }),
    ])

    // Build export data
    const exportData = {
      campaign: {
        id: campaign.id,
        title: campaign.title,
        slug: campaign.slug,
        description: campaign.description,
        category: campaign.category,
        status: campaign.status,
        path: campaign.path,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        completenessScore: campaign.completenessScore,
      },
      creator: campaign.creator,
      stats: {
        totalLobbies,
        comments,
        shares,
        media: campaign.media.length,
        updates: campaign.updates.length,
      },
      milestones: campaign.milestones || [],
      media: campaign.media.map((m: any) => ({
        id: m.id,
        url: m.url,
        caption: m.caption,
        order: m.order,
      })),
      updates: campaign.updates.map((u: any) => ({
        id: u.id,
        title: u.title,
        content: u.content,
        createdAt: u.createdAt,
      })),
      comments: campaign.comments.map((c: any) => ({
        id: c.id,
        text: c.text,
        author: c.author.displayName,
        createdAt: c.createdAt,
      })),
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = generateCSV(exportData)
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv;charset=utf-8',
          'Content-Disposition': `attachment; filename="campaign-${campaign.slug}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Return JSON format
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="campaign-${campaign.slug}-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/export]', error)
    return NextResponse.json(
      { error: 'Failed to export campaign' },
      { status: 500 }
    )
  }
}

// Helper function to convert export data to CSV format
function generateCSV(data: any): string {
  const rows: string[] = []

  // Campaign section
  rows.push('CAMPAIGN EXPORT')
  rows.push(`Title,${escapeCSV(data.campaign.title)}`)
  rows.push(`Description,${escapeCSV(data.campaign.description)}`)
  rows.push(`Category,${data.campaign.category}`)
  rows.push(`Status,${data.campaign.status}`)
  rows.push(`Created,${data.campaign.createdAt}`)
  rows.push('')

  // Creator section
  rows.push('CREATOR')
  rows.push(`Name,${escapeCSV(data.creator.displayName)}`)
  rows.push(`Handle,${data.creator.handle || 'N/A'}`)
  rows.push('')

  // Stats section
  rows.push('STATISTICS')
  rows.push(`Total Lobbies,${data.stats.totalLobbies}`)
  rows.push(`Comments,${data.stats.comments}`)
  rows.push(`Shares,${data.stats.shares}`)
  rows.push(`Media Count,${data.stats.media}`)
  rows.push(`Updates,${data.stats.updates}`)
  rows.push('')

  // Milestones section
  if (data.milestones && data.milestones.length > 0) {
    rows.push('MILESTONES')
    rows.push('Title,Target,Current')
    data.milestones.forEach((m: any) => {
      rows.push(`${escapeCSV(m.title)},${m.target},${m.current}`)
    })
    rows.push('')
  }

  // Updates section
  if (data.updates && data.updates.length > 0) {
    rows.push('UPDATES')
    rows.push('Title,Date')
    data.updates.forEach((u: any) => {
      rows.push(`${escapeCSV(u.title)},${u.createdAt}`)
    })
    rows.push('')
  }

  // Comments section
  if (data.comments && data.comments.length > 0) {
    rows.push('COMMENTS')
    rows.push('Author,Text,Date')
    data.comments.slice(0, 50).forEach((c: any) => {
      rows.push(`${escapeCSV(c.author)},${escapeCSV(c.text.substring(0, 100))},${c.createdAt}`)
    })
  }

  return rows.join('\n')
}

// Helper to escape CSV values
function escapeCSV(value: string): string {
  if (!value) return ''
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
