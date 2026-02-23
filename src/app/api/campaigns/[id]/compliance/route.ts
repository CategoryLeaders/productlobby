import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface ComplianceRule {
  id: string
  name: string
  description: string
  passed: boolean
  suggestion?: string
}

interface ComplianceCheckResponse {
  campaignId: string
  campaignTitle: string
  overallCompliance: boolean
  complianceScore: number
  rules: ComplianceRule[]
  timestamp: string
}

// GET /api/campaigns/[id]/compliance - Check campaign compliance
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Support both UUID and slug-based lookup
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const campaign = await prisma.campaign.findUnique({
      where: isUuid ? { id } : { slug: id },
      include: {
        media: true,
        targetedBrand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Define compliance rules
    const rules: ComplianceRule[] = []

    // Rule 1: Title must be at least 10 characters
    const titlePassed = campaign.title && campaign.title.trim().length >= 10
    rules.push({
      id: 'title-length',
      name: 'Title Length',
      description: 'Campaign title must be at least 10 characters',
      passed: titlePassed,
      suggestion: titlePassed
        ? undefined
        : 'Expand your campaign title to be more descriptive (minimum 10 characters)',
    })

    // Rule 2: Description must be at least 50 characters
    const descriptionPassed = campaign.description && campaign.description.trim().length >= 50
    rules.push({
      id: 'description-length',
      name: 'Description Quality',
      description: 'Campaign description must be at least 50 characters',
      passed: descriptionPassed,
      suggestion: descriptionPassed
        ? undefined
        : 'Provide a more detailed description of your campaign (minimum 50 characters)',
    })

    // Rule 3: Category must be specified
    const categoryPassed = !!campaign.category
    rules.push({
      id: 'category',
      name: 'Category Selection',
      description: 'Campaign must have a category assigned',
      passed: categoryPassed,
      suggestion: categoryPassed
        ? undefined
        : 'Select a relevant category for your campaign',
    })

    // Rule 4: Must have at least one media item OR description with minimum length
    const hasMedia = campaign.media && campaign.media.length > 0
    const hasRichDescription = campaign.description && campaign.description.trim().length >= 100
    const mediaPassed = hasMedia || hasRichDescription
    rules.push({
      id: 'visual-content',
      name: 'Visual Content',
      description: 'Campaign must have at least one image or a detailed description',
      passed: mediaPassed,
      suggestion: mediaPassed
        ? undefined
        : 'Add images to your campaign or expand your description with more details',
    })

    // Rule 5: Targeted brand should be specified (recommended)
    const brandPassed = !!campaign.targetedBrandId
    rules.push({
      id: 'targeted-brand',
      name: 'Targeted Brand',
      description: 'Campaign should specify which brand is being targeted',
      passed: brandPassed,
      suggestion: brandPassed
        ? undefined
        : 'Select the brand you want to target with this campaign',
    })

    // Calculate compliance score (5 rules, each worth 20%)
    const passedRules = rules.filter((r) => r.passed).length
    const complianceScore = (passedRules / rules.length) * 100

    // Overall compliance requires all critical rules to pass (first 4 rules)
    // Rule 5 is recommended but not critical
    const criticalRules = rules.slice(0, 4)
    const overallCompliance = criticalRules.every((r) => r.passed)

    const response: ComplianceCheckResponse = {
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      overallCompliance,
      complianceScore: Math.round(complianceScore),
      rules,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/compliance]', error)
    return NextResponse.json(
      { error: 'Failed to check campaign compliance' },
      { status: 500 }
    )
  }
}
