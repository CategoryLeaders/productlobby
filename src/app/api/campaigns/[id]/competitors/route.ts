import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch campaign to ensure it exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Fetch all competitor examples for this campaign
    const competitors = await prisma.competitorExample.findMany({
      where: { campaignId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch competitors' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

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
        { error: 'Only the campaign creator can add competitors' },
        { status: 403 }
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
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
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

    // Get the highest order value and add 1
    const lastCompetitor = await prisma.competitorExample.findFirst({
      where: { campaignId: id },
      orderBy: { order: 'desc' },
    });
    const nextOrder = (lastCompetitor?.order ?? -1) + 1;

    // Create competitor example
    const competitor = await prisma.competitorExample.create({
      data: {
        campaignId: id,
        name: name.trim(),
        brand: brand ? brand.trim() : null,
        url: url ? url.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        price: price !== undefined && price !== null ? parseFloat(price) : null,
        currency: currency || 'GBP',
        pros: pros ? pros.trim() : null,
        cons: cons ? cons.trim() : null,
        whyNotEnough: whyNotEnough ? whyNotEnough.trim() : null,
        order: nextOrder,
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error('Error creating competitor:', error);
    return NextResponse.json(
      { error: 'Failed to create competitor' },
      { status: 500 }
    );
  }
}
