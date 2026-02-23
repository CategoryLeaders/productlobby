import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface BookmarkNote {
  note: string
  lastSaved: string
}

// GET /api/campaigns/[id]/bookmark-notes - Fetch user's bookmark note for this campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Check if the campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get or create the bookmark with note
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId,
        },
      },
      select: {
        note: true,
        updatedAt: true,
      },
    })

    const responseData: BookmarkNote = {
      note: bookmark?.note || '',
      lastSaved: bookmark?.updatedAt?.toISOString() || '',
    }

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookmark note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmark note' },
      { status: 500 }
    )
  }
}

// PUT /api/campaigns/[id]/bookmark-notes - Save or update a bookmark note
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id
    const body = await request.json()
    const { note } = body

    // Validate input
    if (typeof note !== 'string') {
      return NextResponse.json(
        { error: 'Note must be a string' },
        { status: 400 }
      )
    }

    if (note.length > 500) {
      return NextResponse.json(
        { error: 'Note exceeds maximum length of 500 characters' },
        { status: 400 }
      )
    }

    // Check if the campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Get or create the bookmark
    let bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId,
        },
      },
    })

    if (!bookmark) {
      // Create new bookmark with note
      bookmark = await prisma.bookmark.create({
        data: {
          userId: user.id,
          campaignId,
          note: note || null,
        },
      })

      // Record contribution event for bookmark creation
      await prisma.contributionEvent.create({
        data: {
          userId: user.id,
          campaignId,
          eventType: 'SOCIAL_SHARE',
          metadata: {
            action: 'bookmark_note',
            noteLength: note.length,
          },
        },
      })
    } else {
      // Update existing bookmark
      const wasEmpty = !bookmark.note || bookmark.note.length === 0
      const nowHasNote = note && note.length > 0

      bookmark = await prisma.bookmark.update({
        where: {
          userId_campaignId: {
            userId: user.id,
            campaignId,
          },
        },
        data: {
          note: note || null,
        },
      })

      // Record contribution event if transitioning from empty to filled
      if (wasEmpty && nowHasNote) {
        await prisma.contributionEvent.create({
          data: {
            userId: user.id,
            campaignId,
            eventType: 'SOCIAL_SHARE',
            metadata: {
              action: 'bookmark_note',
              noteLength: note.length,
            },
          },
        })
      }
    }

    const responseData: BookmarkNote = {
      note: bookmark.note || '',
      lastSaved: bookmark.updatedAt.toISOString(),
    }

    return NextResponse.json(responseData, { status: 200 })
  } catch (error) {
    console.error('Error saving bookmark note:', error)
    return NextResponse.json(
      { error: 'Failed to save bookmark note' },
      { status: 500 }
    )
  }
}
