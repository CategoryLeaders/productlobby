import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CATEGORY_DEFINITIONS } from '@/lib/category-definitions'

export const dynamic = 'force-dynamic'

interface CategoryNode {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  campaignCount: number
  subcategories?: CategoryNode[]
}

export async function GET() {
  try {
    // Build hierarchical category structure with campaign counts
    const categoryHierarchy: CategoryNode[] = []

    for (const categoryDef of CATEGORY_DEFINITIONS) {
      // Get campaign count for this category
      const campaignCount = await prisma.campaign.count({
        where: {
          category: categoryDef.slug,
          status: 'LIVE',
        },
      })

      const categoryNode: CategoryNode = {
        id: `category_${categoryDef.slug}`,
        slug: categoryDef.slug,
        name: categoryDef.name,
        description: categoryDef.description,
        icon: categoryDef.icon,
        campaignCount,
        subcategories: [],
      }

      categoryHierarchy.push(categoryNode)
    }

    // Sort by campaign count (descending) then by name
    categoryHierarchy.sort((a, b) => {
      if (b.campaignCount !== a.campaignCount) {
        return b.campaignCount - a.campaignCount
      }
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(
      {
        success: true,
        data: categoryHierarchy,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
