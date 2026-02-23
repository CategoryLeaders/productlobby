import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/tags
// ============================================================================
// Returns all tags sorted by usage count, with optional search/autocomplete
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')?.toLowerCase() || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

    // Get all tag events
    const tagEvents = await prisma.contributionEvent.findMany({
      where: {
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['type'],
          equals: 'tag',
        },
      },
      select: {
        metadata: true,
      },
    })

    // Extract and aggregate tags
    const tagMap = new Map<string, number>()

    for (const event of tagEvents) {
      if (event.metadata && typeof event.metadata === 'object') {
        const metadata = event.metadata as any
        const tagName = metadata.tagName as string

        if (tagName) {
          tagMap.set(tagName, (tagMap.get(tagName) || 0) + 1)
        }
      }
    }

    // Convert to array and sort by count (descending)
    let tags = Array.from(tagMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    // Filter by search query if provided
    if (query) {
      tags = tags.filter((tag) => tag.name.includes(query))
    }

    // Apply limit
    tags = tags.slice(0, limit)

    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    console.error('[GET /api/tags]', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
