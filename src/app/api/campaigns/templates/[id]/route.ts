import { NextRequest, NextResponse } from 'next/server'
import { getTemplateById } from '@/lib/campaign-templates'

export const dynamic = 'force-dynamic'

// GET /api/campaigns/templates/[id] - Get a single template by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const template = getTemplateById(id)

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: 'Template not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: template,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch template',
      },
      { status: 500 }
    )
  }
}
