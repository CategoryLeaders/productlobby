import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; competitorId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, competitorId } = params;

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify user is the campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can edit competitors' },
        { status: 403 }
      );
    }

    // Fetch competitor
    const competitor = await prisma.competitorExample.findUnique({
      where: { id: competitorId },
    });

    if (!competitor || competitor.campaignId !== id) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      name,
      brand,
      url,
      imageUrl,
      price,
      currency,
      pros,
      cons,
      whyNotEnough,
      order,
    } = body;

    // Validate name if provided
    if (name !== undefined) {
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Product name cannot be empty' },
          { status: 400 }
        );
      }
    }

    // Validate price if provided
    if (price !== undefined && price !== null) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (brand !== undefined) updateData.brand = brand ? brand.trim() : null;
    if (url !== undefined) updateData.url = url ? url.trim() : null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl ? imageUrl.trim() : null;
    if (price !== undefined) updateData.price = price !== null ? parseFloat(price) : null;
    if (currency !== undefined) updateData.currency = currency || 'GBP';
    if (pros !== undefined) updateData.pros = pros ? pros.trim() : null;
    if (cons !== undefined) updateData.cons = cons ? cons.trim() : null;
    if (whyNotEnough !== undefined) updateData.whyNotEnough = whyNotEnough ? whyNotEnough.trim() : null;
    if (order !== undefined) updateData.order = order;

    // Update competitor
    const updatedCompetitor = await prisma.competitorExample.update({
      where: { id: competitorId },
      data: updateData,
    });

    return NextResponse.json(updatedCompetitor);
  } catch (error) {
    console.error('Error updating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to update competitor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; competitorId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, competitorId } = params;

    // Fetch campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Verify user is the campaign creator
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { error: 'Only the campaign creator can delete competitors' },
        { status: 403 }
      );
    }

    // Fetch competitor
    const competitor = await prisma.competitorExample.findUnique({
      where: { id: competitorId },
    });

    if (!competitor || competitor.campaignId !== id) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Delete competitor
    await prisma.competitorExample.delete({
      where: { id: competitorId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting competitor:', error);
    return NextResponse.json(
      { error: 'Failed to delete competitor' },
      { status: 500 }
    );
  }
}
