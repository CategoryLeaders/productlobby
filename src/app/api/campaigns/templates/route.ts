import { NextRequest, NextResponse } from 'next/server'
import { campaignTemplates, getTemplatesByCategory } from '@/lib/campaign-templates'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/templates - List all campaign templates with optional category filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')

    let templates = campaignTemplates

    // Filter by category if provided
    if (category) {
      templates = getTemplatesByCategory(category)
    }

    return NextResponse.json(
      {
        success: true,
        data: templates,
        total: templates.length,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch templates',
      },
      { status: 500 }
    )
  }
}
