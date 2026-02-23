import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Announcement {
  id: string
  text: string
  type: 'info' | 'warning' | 'success'
  link?: string
  linkText?: string
}

// GET /api/announcements - Get current active announcement
export async function GET(request: NextRequest) {
  try {
    // Hardcoded announcement examples - replace with database query if needed
    const announcements: Announcement[] = [
      {
        id: 'annc-001',
        text: 'Check out our new campaign features! Create A/B tests and gather testimonials to improve your campaign.',
        type: 'info',
        link: '/campaigns/new',
        linkText: 'Create Campaign',
      },
      // Add more announcements as needed
      // Database version would look like:
      // const announcements = await prisma.announcement.findMany({
      //   where: {
      //     isActive: true,
      //     startDate: { lte: new Date() },
      //     OR: [{ endDate: null }, { endDate: { gte: new Date() } }]
      //   },
      //   orderBy: { priority: 'desc' }
      // })
    ]

    // Return the first active announcement
    const activeAnnouncement = announcements.length > 0 ? announcements[0] : null

    return NextResponse.json({
      success: true,
      data: activeAnnouncement,
    })
  } catch (error) {
    console.error('Get announcement error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
