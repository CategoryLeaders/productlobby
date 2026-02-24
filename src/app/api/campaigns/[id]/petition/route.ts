import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface PetitionRequest {
  action?: string
  title?: string
  description?: string
  demands?: string[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Return simulated petition data
    const petition = {
      id: `petition_${params.id}`,
      campaignId: params.id,
      title: `${campaign.name} - Petition for Change`,
      description: campaign.description || 'Join us in signing this petition to make a difference.',
      demands: [
        'Implement sustainable practices across all operations',
        'Increase transparency in decision-making processes',
        'Establish community advisory board for stakeholder input',
        'Commit to environmental and social responsibility goals',
      ],
      targetRecipient: 'Company Leadership & Board of Directors',
      signatureGoal: 5000,
      currentSignatures: 3847,
      status: 'active' as const,
      createdAt: new Date(campaign.createdAt).toISOString(),
      deliveryDate: undefined,
    }

    return NextResponse.json(petition)
  } catch (error) {
    console.error('Error fetching petition:', error)
    return NextResponse.json(
      { error: 'Failed to fetch petition' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: PetitionRequest = await request.json()

    if (body.action === 'petition_sign') {
      // Create a contribution event for the signature
      const event = await prisma.contributionEvent.create({
        data: {
          campaignId: params.id,
          userId: user.id,
          action: 'petition_sign',
          metadata: JSON.stringify({
            timestamp: new Date().toISOString(),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          }),
        },
      })

      // Return updated petition with incremented signature count
      const petition = {
        id: `petition_${params.id}`,
        campaignId: params.id,
        title: 'Campaign Petition - Petition for Change',
        description: 'Join us in signing this petition to make a difference.',
        demands: [
          'Implement sustainable practices across all operations',
          'Increase transparency in decision-making processes',
          'Establish community advisory board for stakeholder input',
          'Commit to environmental and social responsibility goals',
        ],
        targetRecipient: 'Company Leadership & Board of Directors',
        signatureGoal: 5000,
        currentSignatures: 3848,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      }

      return NextResponse.json(petition)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error signing petition:', error)
    return NextResponse.json(
      { error: 'Failed to sign petition' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: PetitionRequest = await request.json()

    // Update petition content (in real implementation, would store in database)
    const updatedPetition = {
      id: `petition_${params.id}`,
      campaignId: params.id,
      title: body.title || 'Campaign Petition - Petition for Change',
      description: body.description || 'Join us in signing this petition to make a difference.',
      demands: body.demands || [
        'Implement sustainable practices across all operations',
        'Increase transparency in decision-making processes',
        'Establish community advisory board for stakeholder input',
        'Commit to environmental and social responsibility goals',
      ],
      targetRecipient: 'Company Leadership & Board of Directors',
      signatureGoal: 5000,
      currentSignatures: 3847,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedPetition)
  } catch (error) {
    console.error('Error updating petition:', error)
    return NextResponse.json(
      { error: 'Failed to update petition' },
      { status: 500 }
    )
  }
}
