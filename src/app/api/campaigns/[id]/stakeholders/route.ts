export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = params;

    // Fetch stakeholder records from ContributionEvent
    const stakeholderEvents = await prisma.contributionEvent.findMany({
      where: {
        campaignId,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          path: ['action'],
          equals: 'stakeholder',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform events to stakeholder objects
    const stakeholders = stakeholderEvents.map((event) => ({
      id: event.id,
      name: event.metadata?.name || 'Unknown',
      role: event.metadata?.role || '',
      organization: event.metadata?.organization || '',
      category: event.metadata?.category || 'external',
      influence: event.metadata?.influence || 3,
      interest: event.metadata?.interest || 3,
      engagement: event.metadata?.engagement || 'unknown',
      notes: event.metadata?.notes || '',
    }));

    return NextResponse.json(stakeholders);
  } catch (error) {
    console.error('Error fetching stakeholders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = params;
    const body = await request.json();

    // Verify campaign exists and user is creator
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorId: true },
    });

    if (!campaign || campaign.creatorId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Create stakeholder event
    const event = await prisma.contributionEvent.create({
      data: {
        campaignId,
        userId: user.id,
        eventType: 'SOCIAL_SHARE',
        metadata: {
          action: 'stakeholder',
          name: body.name,
          role: body.role,
          organization: body.organization,
          category: body.category,
          influence: body.influence,
          interest: body.interest,
          engagement: body.engagement,
          notes: body.notes,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(
      {
        id: event.id,
        name: body.name,
        role: body.role,
        organization: body.organization,
        category: body.category,
        influence: body.influence,
        interest: body.interest,
        engagement: body.engagement,
        notes: body.notes,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating stakeholder:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
