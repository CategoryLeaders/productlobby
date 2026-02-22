import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/campaigns/[id]/bookmark-status - Check if user has bookmarked a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { bookmarked: false },
        { status: 200 }
      )
    }

    const campaignId = params.id

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId,
        },
      },
    })

    return NextResponse.json(
      { bookmarked: !!bookmark },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking bookmark status:', error)
    return NextResponse.json(
      { error: 'Failed to check bookmark status', bookmarked: false },
      { status: 500 }
    )
  }
}
