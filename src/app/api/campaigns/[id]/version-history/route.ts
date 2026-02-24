export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface Version {
  id: string
  version: string
  changes: string[]
  author: string
  createdAt: string
  type: 'major' | 'minor' | 'patch'
}

interface VersionHistoryResponse {
  success: boolean
  data?: Version[]
  error?: string
}

// Simulated version history data
const simulatedVersions: Version[] = [
  {
    id: 'v1',
    version: '2.1.0',
    changes: [
      'Added automated email campaigns',
      'Improved analytics dashboard',
      'Fixed supporter notification timing',
    ],
    author: 'Sarah Chen',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    type: 'minor',
  },
  {
    id: 'v2',
    version: '2.0.0',
    changes: [
      'Major redesign of campaign interface',
      'New real-time collaboration features',
      'Complete rewrite of backend API',
    ],
    author: 'Alex Thompson',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
    type: 'major',
  },
  {
    id: 'v3',
    version: '1.9.2',
    changes: ['Fixed critical security vulnerability', 'Improved page load performance', 'Updated dependencies'],
    author: 'Jordan Kim',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), // 14 days ago
    type: 'patch',
  },
  {
    id: 'v4',
    version: '1.9.1',
    changes: ['Fixed mobile responsiveness issue', 'Updated error messages for clarity'],
    author: 'Sarah Chen',
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(), // 21 days ago
    type: 'patch',
  },
  {
    id: 'v5',
    version: '1.9.0',
    changes: [
      'Added supporter export functionality',
      'Implemented new reporting features',
      'Enhanced filtering capabilities',
    ],
    author: 'Alex Thompson',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), // 30 days ago
    type: 'minor',
  },
  {
    id: 'v6',
    version: '1.0.0',
    changes: ['Initial product launch', 'Core features implemented', 'Launch documentation'],
    author: 'Product Team',
    createdAt: new Date(Date.now() - 365 * 86400000).toISOString(), // 1 year ago
    type: 'major',
  },
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<VersionHistoryResponse>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Verify campaign access
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 })
    }

    // Return simulated version history
    return NextResponse.json({
      success: true,
      data: simulatedVersions,
    })
  } catch (error) {
    console.error('Version history error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch version history' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<VersionHistoryResponse>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { versionId } = await request.json()

    // Verify campaign access
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 })
    }

    // Record the version restoration as a ContributionEvent
    await prisma.contributionEvent.create({
      data: {
        action: 'version_restore',
        campaignId: params.id,
        userId: user.id,
        metadata: {
          versionId,
          timestamp: new Date().toISOString(),
        },
      },
    })

    // Return updated version history
    return NextResponse.json({
      success: true,
      data: simulatedVersions,
    })
  } catch (error) {
    console.error('Version restore error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to restore version' },
      { status: 500 }
    )
  }
}
