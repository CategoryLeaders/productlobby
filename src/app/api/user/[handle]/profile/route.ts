import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { computeBadges } from '@/lib/badges'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const currentUser = await getCurrentUser()

    if (!handle) {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      )
    }

    // Fetch user by handle
    const user = await prisma.user.findUnique({
      where: { handle },
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatar: true,
        bio: true,
        contributionScore: true,
        createdAt: true,
        emailVerified: true,
        twitterHandle: true,
        instagramHandle: true,
        tiktokHandle: true,
        linkedinHandle: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isOwnProfile = currentUser?.id === user.id

    // Fetch campaigns created by this user
    const campaignsCreated = await prisma.campaign.count({
      where: { creatorUserId: user.id },
    })

    // Fetch campaigns supported (lobbied) by this user
    const campaignsSupported = await prisma.lobby.findMany({
      where: { userId: user.id },
      select: { campaignId: true },
      distinct: ['campaignId'],
    })

    // Fetch total comments by this user
    const totalComments = await prisma.comment.count({
      where: { userId: user.id },
    })

    // Fetch total shares by this user
    const totalShares = await prisma.share.count({
      where: { userId: user.id },
    })

    // Fetch total referral clicks from all referral links
    const referralLinks = await prisma.referralLink.findMany({
      where: { userId: user.id },
      select: { clickCount: true },
    })
    const referralClicks = referralLinks.reduce((total, link) => total + link.clickCount, 0)

    // Fetch total poll votes (both poll votes and creator poll votes)
    const pollVotes = await prisma.pollVote.count({
      where: { userId: user.id },
    })
    const creatorPollVotes = await prisma.creatorPollVote.count({
      where: { userId: user.id },
    })
    const totalPollVotes = pollVotes + creatorPollVotes

    // Fetch "Take My Money" lobbies
    const takeMyMoneyLobbies = await prisma.lobby.count({
      where: {
        userId: user.id,
        intensity: 'TAKE_MY_MONEY',
      },
    })

    // Compute badges
    const badges = computeBadges({
      joinedAt: user.createdAt,
      campaignsCreated,
      campaignsSupported: campaignsSupported.length,
      totalComments,
      totalShares,
      referralClicks,
      totalPollVotes,
      takeMyMoneyLobbies,
    })

    // Fetch recent campaigns created (last 5)
    const recentCampaignsCreated = await prisma.campaign.findMany({
      where: { creatorUserId: user.id },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Fetch recent campaigns lobbied (last 5)
    const recentCampaignsLobbied = await prisma.lobby.findMany({
      where: { userId: user.id },
      select: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const profile = {
      id: user.id,
      displayName: user.displayName,
      handle: user.handle,
      avatar: user.avatar,
      bio: user.bio,
      contributionScore: user.contributionScore,
      createdAt: user.createdAt,
      isOwnProfile,
      twitterHandle: user.twitterHandle,
      instagramHandle: user.instagramHandle,
      tiktokHandle: user.tiktokHandle,
      linkedinHandle: user.linkedinHandle,
      stats: {
        campaignsCreated,
        campaignsSupported: campaignsSupported.length,
        totalComments,
        totalShares,
      },
      badges,
      recentCampaignsCreated,
      recentCampaignsLobbied: recentCampaignsLobbied.map((item) => item.campaign),
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
