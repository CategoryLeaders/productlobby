export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Fetch brands with claimed profiles (users with brand-related roles)
    const brands = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { role: 'brand' },
              { role: 'brand-admin' },
            ],
          },
          search
            ? {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { handle: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
        ],
      },
      select: {
        id: true,
        name: true,
        handle: true,
        avatar: true,
        category: true,
        _count: {
          select: {
            campaigns: true,
          },
        },
      },
      take: 100,
    });

    // Format the response
    const brandDirectory = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      handle: brand.handle,
      avatar: brand.avatar,
      category: brand.category || 'General',
      campaignCount: brand._count.campaigns,
    }));

    return NextResponse.json(brandDirectory);
  } catch (error) {
    console.error('Error fetching brand directory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
