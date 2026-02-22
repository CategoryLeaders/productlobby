// Creator Weekly Digest Email Sender
// Aggregates campaign performance data and sends digest emails

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { creatorDigestTemplate, type DigestStats, type TopCampaignHighlight } from './digest-template'

export interface CreatorDigestResult {
  creatorId: string
  creatorEmail: string
  creatorName: string
  digestSent: boolean
  reason?: string
}

export interface SendDigestResults {
  total: number
  sent: number
  failed: number
  results: CreatorDigestResult[]
  errors: string[]
}

/**
 * Get campaigns created by a user in the last 7 days
 */
async function getRecentLobbies(creatorId: string, daysBack: number = 7) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

  return prisma.lobby.count({
    where: {
      campaign: {
        creatorUserId: creatorId,
      },
      createdAt: {
        gte: cutoffDate,
      },
    },
  })
}

/**
 * Get comments on creator's campaigns in the last 7 days
 */
async function getRecentComments(creatorId: string, daysBack: number = 7) {
  const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)

  return prisma.comment.count({
    where: {
      campaign: {
        creatorUserId: creatorId,
      },
      createdAt: {
        gte: cutoffDate,
      },
    },
  })
}

/**
 * Get top performing campaign by lobby count
 */
async function getTopPerformingCampaign(
  creatorId: string
): Promise<TopCampaignHighlight | null> {
  const campaign = await prisma.campaign.findFirst({
    where: {
      creatorUserId: creatorId,
      status: { in: ['LIVE', 'PAUSED'] },
    },
    include: {
      lobbies: {
        select: { id: true },
      },
      comments: {
        select: { id: true },
      },
    },
    orderBy: {
      lobbies: {
        _count: 'desc',
      },
    },
  })

  if (!campaign) {
    return null
  }

  return {
    title: campaign.title,
    slug: campaign.slug,
    lobbyCount: campaign.lobbies.length,
    commentCount: campaign.comments.length,
    signalScore: campaign.signalScore ? parseFloat(campaign.signalScore.toString()) : null,
  }
}

/**
 * Get total campaign count for a creator
 */
async function getTotalCampaigns(creatorId: string) {
  return prisma.campaign.count({
    where: {
      creatorUserId: creatorId,
      status: { in: ['LIVE', 'PAUSED'] },
    },
  })
}

/**
 * Get total lobbies for a creator (all campaigns)
 */
async function getTotalLobbies(creatorId: string) {
  return prisma.lobby.count({
    where: {
      campaign: {
        creatorUserId: creatorId,
      },
    },
  })
}

/**
 * Send digest email to a creator
 */
async function sendCreatorDigestEmail(
  creator: { id: string; email: string; displayName: string },
  stats: DigestStats,
  topCampaign: TopCampaignHighlight | null
): Promise<CreatorDigestResult> {
  try {
    const html = creatorDigestTemplate({
      creatorName: creator.displayName,
      stats,
      topCampaign,
    })

    const result = await sendEmail({
      to: creator.email,
      subject: 'Your Weekly Campaign Summary - ProductLobby',
      html,
    })

    if (result.success) {
      // Update the last digest sent time
      await prisma.notificationPreference.update({
        where: { userId: creator.id },
        data: {
          lastDigestSentAt: new Date(),
        },
      }).catch(() => {
        // Preference might not exist, which is okay
      })

      return {
        creatorId: creator.id,
        creatorEmail: creator.email,
        creatorName: creator.displayName,
        digestSent: true,
      }
    } else {
      return {
        creatorId: creator.id,
        creatorEmail: creator.email,
        creatorName: creator.displayName,
        digestSent: false,
        reason: result.error || 'Failed to send email',
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      creatorId: creator.id,
      creatorEmail: creator.email,
      creatorName: creator.displayName,
      digestSent: false,
      reason: `Exception: ${errorMessage}`,
    }
  }
}

/**
 * Main function: Send weekly digest emails to all creators with active campaigns
 */
export async function sendWeeklyCreatorDigests(): Promise<SendDigestResults> {
  const results: CreatorDigestResult[] = []
  const errors: string[] = []

  try {
    // Find all creators who have at least one active campaign
    const creators = await prisma.user.findMany({
      where: {
        campaigns: {
          some: {
            status: { in: ['LIVE', 'PAUSED'] },
          },
        },
        notificationPreference: {
          emailCampaignUpdates: true,
        },
      },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    })

    if (creators.length === 0) {
      return {
        total: 0,
        sent: 0,
        failed: 0,
        results: [],
        errors: ['No creators with active campaigns found'],
      }
    }

    // Process each creator
    for (const creator of creators) {
      try {
        // Aggregate stats for the creator
        const [newLobbies, newComments, totalCampaigns, totalLobbies, topCampaign] =
          await Promise.all([
            getRecentLobbies(creator.id),
            getRecentComments(creator.id),
            getTotalCampaigns(creator.id),
            getTotalLobbies(creator.id),
            getTopPerformingCampaign(creator.id),
          ])

        const stats: DigestStats = {
          newLobbies,
          newComments,
          totalCampaigns,
          totalLobbies,
        }

        // Send the digest email
        const result = await sendCreatorDigestEmail(creator, stats, topCampaign)
        results.push(result)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Error processing creator ${creator.id}: ${errorMessage}`)
        results.push({
          creatorId: creator.id,
          creatorEmail: creator.email,
          creatorName: creator.displayName,
          digestSent: false,
          reason: `Processing error: ${errorMessage}`,
        })
      }
    }

    const sentCount = results.filter((r) => r.digestSent).length
    const failedCount = results.length - sentCount

    return {
      total: creators.length,
      sent: sentCount,
      failed: failedCount,
      results,
      errors,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Fatal error: ${errorMessage}`)
    return {
      total: 0,
      sent: 0,
      failed: 0,
      results: [],
      errors,
    }
  }
}

/**
 * Send digest to a specific creator (for testing or manual trigger)
 */
export async function sendDigestToCreator(creatorId: string): Promise<CreatorDigestResult> {
  try {
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    })

    if (!creator) {
      return {
        creatorId,
        creatorEmail: '',
        creatorName: '',
        digestSent: false,
        reason: 'Creator not found',
      }
    }

    const [newLobbies, newComments, totalCampaigns, totalLobbies, topCampaign] =
      await Promise.all([
        getRecentLobbies(creator.id),
        getRecentComments(creator.id),
        getTotalCampaigns(creator.id),
        getTotalLobbies(creator.id),
        getTopPerformingCampaign(creator.id),
      ])

    const stats: DigestStats = {
      newLobbies,
      newComments,
      totalCampaigns,
      totalLobbies,
    }

    return sendCreatorDigestEmail(creator, stats, topCampaign)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      creatorId,
      creatorEmail: '',
      creatorName: '',
      digestSent: false,
      reason: `Exception: ${errorMessage}`,
    }
  }
}
