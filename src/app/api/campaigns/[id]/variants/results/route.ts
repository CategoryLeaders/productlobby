import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

type Params = Promise<{ id: string }>

// GET: Returns aggregated preference data for each variant
export async function GET(
  _request: NextRequest,
  props: { params: Params }
) {
  try {
    const { id } = await props.params

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Fetch all preference fields for the campaign
    const preferenceFields = await prisma.campaignPreferenceField.findMany({
      where: { campaignId: id },
      orderBy: { order: 'asc' },
      include: {
        lobbyPreferences: true,
      },
    })

    // Aggregate the preference data
    const results = preferenceFields.map((field) => {
      const preferences = field.lobbyPreferences

      // Count total unique respondents for this field
      const uniqueRespondents = new Set(preferences.map((p) => p.lobbyId)).size

      // For SELECT/MULTI_SELECT, calculate distribution
      let distribution: Record<string, { count: number; percentage: number }> = {}

      if (['SELECT', 'MULTI_SELECT'].includes(field.fieldType)) {
        const options = (field.options as string[]) || []

        // Count responses for each option
        const optionCounts: Record<string, number> = {}
        options.forEach((option) => {
          optionCounts[option] = 0
        })

        // Count preferences for each option
        preferences.forEach((pref) => {
          const value = pref.value
          if (optionCounts.hasOwnProperty(value)) {
            optionCounts[value]++
          }
        })

        // Calculate percentages
        const total = Object.values(optionCounts).reduce((a, b) => a + b, 0)
        options.forEach((option) => {
          const count = optionCounts[option]
          distribution[option] = {
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          }
        })
      }

      // Find most popular option
      let mostPopular: string | null = null
      let maxCount = 0
      Object.entries(distribution).forEach(([option, data]) => {
        if (data.count > maxCount) {
          maxCount = data.count
          mostPopular = option
        }
      })

      return {
        id: field.id,
        name: field.fieldName,
        fieldType: field.fieldType,
        totalResponses: uniqueRespondents,
        distribution,
        mostPopularOption: mostPopular,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        campaignId: id,
        results,
      },
    })
  } catch (error) {
    console.error('GET /api/campaigns/[id]/variants/results error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
