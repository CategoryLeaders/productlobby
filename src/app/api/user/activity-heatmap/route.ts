import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/user/activity-heatmap
// ============================================================================
// Return daily contribution counts for the last 52 weeks
// Requires authentication

interface ActivityData {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

interface HeatmapResponse {
  weeks: Array<{
    week: number
    days: ActivityData[]
  }>
  stats: {
    totalContributions: number
    maxDayContributions: number
    currentStreak: number
    longestStreak: number
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all contribution events for the current user from the last 52 weeks
    const weeksAgo = new Date()
    weeksAgo.setDate(weeksAgo.getDate() - 365)

    const contributions = await prisma.contributionEvent.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: weeksAgo,
        },
      },
      select: {
        createdAt: true,
        points: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Build a map of date -> count
    const contributionMap = new Map<string, number>()

    for (const contribution of contributions) {
      const dateStr = contribution.createdAt.toISOString().split('T')[0]
      const current = contributionMap.get(dateStr) || 0
      contributionMap.set(dateStr, current + contribution.points)
    }

    // Generate heatmap data for 52 weeks starting from today
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weeks: Array<{
      week: number
      days: ActivityData[]
    }> = []

    // Find the start date (52 weeks ago, aligned to Sunday)
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)
    const dayOfWeek = startDate.getDay()
    startDate.setDate(startDate.getDate() - dayOfWeek)

    // Build weeks
    let currentDate = new Date(startDate)
    let weekCount = 0

    while (currentDate <= today) {
      const weekDays: ActivityData[] = []

      // Get 7 days for this week (Sunday to Saturday)
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const count = contributionMap.get(dateStr) || 0

        // Determine activity level (0-4)
        const level = getActivityLevel(count)

        weekDays.push({
          date: dateStr,
          count,
          level,
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }

      weeks.push({
        week: weekCount,
        days: weekDays,
      })

      weekCount++
    }

    // Calculate statistics
    const allCounts = Array.from(contributionMap.values())
    const totalContributions = allCounts.reduce((sum, count) => sum + count, 0)
    const maxDayContributions = allCounts.length > 0 ? Math.max(...allCounts) : 0

    // Calculate current streak
    let currentStreak = 0
    let checkDate = new Date(today)
    while (checkDate >= weeksAgo) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (contributionMap.has(dateStr)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let currentStreakLength = 0
    const allDates = getAllDatesInRange(weeksAgo, today)

    for (const date of allDates) {
      const dateStr = date.toISOString().split('T')[0]
      if (contributionMap.has(dateStr)) {
        currentStreakLength++
        longestStreak = Math.max(longestStreak, currentStreakLength)
      } else {
        currentStreakLength = 0
      }
    }

    const response: HeatmapResponse = {
      weeks,
      stats: {
        totalContributions,
        maxDayContributions,
        currentStreak,
        longestStreak,
      },
    }

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error('[GET /api/user/activity-heatmap]', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity heatmap' },
      { status: 500 }
    )
  }
}

function getActivityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  if (count <= 15) return 3
  return 4
}

function getAllDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = []
  const current = new Date(start)

  while (current <= end) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return dates
}
