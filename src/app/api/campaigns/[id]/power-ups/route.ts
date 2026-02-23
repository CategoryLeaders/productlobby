import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Power-up definitions
const POWERUPS = {
  boost: {
    name: 'Boost',
    description: '2x lobby weight for 24 hours',
    cost: 50,
    duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
  spotlight: {
    name: 'Spotlight',
    description: 'Featured position for 48 hours',
    cost: 75,
    duration: 48 * 60 * 60 * 1000, // 48 hours
  },
  shield: {
    name: 'Shield',
    description: 'Prevent decay for 7 days',
    cost: 100,
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  megaphone: {
    name: 'Megaphone',
    description: 'Auto-share to social networks',
    cost: 60,
    duration: 24 * 60 * 60 * 1000, // 24 hours
  },
}

// GET /api/campaigns/[id]/power-ups - Get available power-ups and active ones for user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id

    // Get user's available points from contribution events
    const pointsResult = await prisma.contributionEvent.aggregate({
      where: {
        userId: user.id,
        campaignId: campaignId,
      },
      _sum: {
        points: true,
      },
    })

    const userPoints = pointsResult._sum.points || 0

    // Get user's active power-ups
    const activePowerUps = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter and format active power-ups
    const formattedActivePowerUps = activePowerUps
      .filter((event) => {
        const metadata = event.metadata as any
        if (!metadata?.action || metadata.action !== 'power_up') return false

        // Check if power-up is still active
        const powerUpId = metadata.powerUpId as keyof typeof POWERUPS
        const powerUp = POWERUPS[powerUpId]
        if (!powerUp) return false

        const expiryTime = new Date(event.createdAt).getTime() + powerUp.duration
        return expiryTime > Date.now()
      })
      .map((event) => {
        const metadata = event.metadata as any
        const powerUpId = metadata.powerUpId as keyof typeof POWERUPS
        const powerUp = POWERUPS[powerUpId]
        const expiryTime = new Date(event.createdAt).getTime() + powerUp.duration

        return {
          id: event.id,
          powerUpId: powerUpId,
          name: powerUp.name,
          expiresAt: new Date(expiryTime).toISOString(),
          icon: metadata.icon || 'zap',
        }
      })

    return NextResponse.json({
      userPoints,
      activePowerUps: formattedActivePowerUps,
      availablePowerUps: Object.entries(POWERUPS).map(([id, details]) => ({
        id,
        ...details,
      })),
    })
  } catch (error) {
    console.error('Error fetching power-ups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch power-ups' },
      { status: 500 }
    )
  }
}

// POST /api/campaigns/[id]/power-ups - Use a power-up
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaignId = params.id
    const body = await request.json()
    const { powerUpId } = body

    if (!powerUpId || !(powerUpId in POWERUPS)) {
      return NextResponse.json(
        { error: 'Invalid power-up ID' },
        { status: 400 }
      )
    }

    // Get user's current points
    const pointsResult = await prisma.contributionEvent.aggregate({
      where: {
        userId: user.id,
        campaignId: campaignId,
      },
      _sum: {
        points: true,
      },
    })

    const userPoints = pointsResult._sum.points || 0
    const powerUp = POWERUPS[powerUpId as keyof typeof POWERUPS]

    // Check if user has enough points
    if (userPoints < powerUp.cost) {
      return NextResponse.json(
        { error: `Insufficient points. Need ${powerUp.cost}, have ${userPoints}` },
        { status: 400 }
      )
    }

    // Check if user already has this power-up active
    const existingActivePowerUp = await prisma.contributionEvent.findFirst({
      where: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (
      existingActivePowerUp &&
      (existingActivePowerUp.metadata as any)?.action === 'power_up' &&
      (existingActivePowerUp.metadata as any)?.powerUpId === powerUpId
    ) {
      const expiryTime =
        new Date(existingActivePowerUp.createdAt).getTime() +
        powerUp.duration
      if (expiryTime > Date.now()) {
        return NextResponse.json(
          { error: 'This power-up is already active' },
          { status: 400 }
        )
      }
    }

    // Create a contribution event for using the power-up
    await prisma.contributionEvent.create({
      data: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
        points: -powerUp.cost, // Deduct points
        metadata: {
          action: 'power_up',
          powerUpId: powerUpId,
          icon: getIconForPowerUp(powerUpId as keyof typeof POWERUPS),
        },
      },
    })

    // Get updated points and active power-ups
    const updatedPointsResult = await prisma.contributionEvent.aggregate({
      where: {
        userId: user.id,
        campaignId: campaignId,
      },
      _sum: {
        points: true,
      },
    })

    const updatedUserPoints = updatedPointsResult._sum.points || 0

    const updatedActivePowerUps = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        campaignId: campaignId,
        eventType: 'SOCIAL_SHARE',
      },
      select: {
        id: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedActivePowerUps = updatedActivePowerUps
      .filter((event) => {
        const metadata = event.metadata as any
        if (!metadata?.action || metadata.action !== 'power_up') return false

        const pu = metadata.powerUpId as keyof typeof POWERUPS
        const puDef = POWERUPS[pu]
        if (!puDef) return false

        const expiryTime = new Date(event.createdAt).getTime() + puDef.duration
        return expiryTime > Date.now()
      })
      .map((event) => {
        const metadata = event.metadata as any
        const pu = metadata.powerUpId as keyof typeof POWERUPS
        const puDef = POWERUPS[pu]
        const expiryTime = new Date(event.createdAt).getTime() + puDef.duration

        return {
          id: event.id,
          powerUpId: pu,
          name: puDef.name,
          expiresAt: new Date(expiryTime).toISOString(),
          icon: metadata.icon || 'zap',
        }
      })

    return NextResponse.json({
      success: true,
      userPoints: updatedUserPoints,
      activePowerUps: formattedActivePowerUps,
    })
  } catch (error) {
    console.error('Error using power-up:', error)
    return NextResponse.json(
      { error: 'Failed to use power-up' },
      { status: 500 }
    )
  }
}

// Helper function to get icon for power-up
function getIconForPowerUp(powerUpId: keyof typeof POWERUPS): string {
  const iconMap: Record<string, string> = {
    boost: 'zap',
    spotlight: 'star',
    shield: 'shield',
    megaphone: 'megaphone',
  }
  return iconMap[powerUpId] || 'zap'
}
