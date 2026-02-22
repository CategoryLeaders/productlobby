import { prisma } from '@/lib/db'

/**
 * Brand Notification System
 * Sends notifications to brand team members when relevant events occur
 */

/**
 * Notify all brand team members of a new campaign targeting their brand
 * @param brandId Brand ID
 * @param campaignTitle Campaign title
 * @param campaignSlug Campaign slug
 * @param campaignCreatorName Creator's display name
 */
export async function notifyBrandNewCampaign(
  brandId: string,
  campaignTitle: string,
  campaignSlug: string,
  campaignCreatorName: string
): Promise<void> {
  try {
    // Get all team members for this brand
    const teamMembers = await prisma.brandTeam.findMany({
      where: { brandId },
      select: { userId: true },
    })

    if (teamMembers.length === 0) {
      return
    }

    // Create notifications for all team members
    await prisma.notification.createMany({
      data: teamMembers.map((member) => ({
        userId: member.userId,
        type: 'brand_new_campaign',
        title: `New campaign: ${campaignTitle}`,
        message: `${campaignCreatorName} launched a campaign requesting your brand's response`,
        linkUrl: `/campaigns/${campaignSlug}`,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify brand of new campaign:', error)
  }
}

/**
 * Notify brand team members when a campaign reaches a milestone
 * @param brandId Brand ID
 * @param campaignTitle Campaign title
 * @param campaignSlug Campaign slug
 * @param milestone Milestone description (e.g., "100 lobbies", "Signal score 75")
 */
export async function notifyBrandMilestone(
  brandId: string,
  campaignTitle: string,
  campaignSlug: string,
  milestone: string
): Promise<void> {
  try {
    const teamMembers = await prisma.brandTeam.findMany({
      where: { brandId },
      select: { userId: true },
    })

    if (teamMembers.length === 0) {
      return
    }

    await prisma.notification.createMany({
      data: teamMembers.map((member) => ({
        userId: member.userId,
        type: 'brand_milestone',
        title: `Campaign milestone: ${campaignTitle}`,
        message: `"${campaignTitle}" has reached ${milestone}`,
        linkUrl: `/campaigns/${campaignSlug}`,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify brand milestone:', error)
  }
}

/**
 * Notify brand team members when supporters are requesting brand response
 * @param brandId Brand ID
 * @param campaignTitle Campaign title
 * @param campaignSlug Campaign slug
 * @param responseRequestCount Number of new response requests
 */
export async function notifyBrandResponseNeeded(
  brandId: string,
  campaignTitle: string,
  campaignSlug: string,
  responseRequestCount: number = 1
): Promise<void> {
  try {
    const teamMembers = await prisma.brandTeam.findMany({
      where: { brandId },
      select: { userId: true },
    })

    if (teamMembers.length === 0) {
      return
    }

    const message =
      responseRequestCount === 1
        ? 'Supporters are requesting your response'
        : `${responseRequestCount} new requests for your response`

    await prisma.notification.createMany({
      data: teamMembers.map((member) => ({
        userId: member.userId,
        type: 'brand_response_requested',
        title: `Response needed: ${campaignTitle}`,
        message,
        linkUrl: `/brand/campaigns/${campaignSlug}`,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify brand response needed:', error)
  }
}

/**
 * Notify brand team members when campaign signal score crosses a threshold
 * @param brandId Brand ID
 * @param campaignTitle Campaign title
 * @param campaignSlug Campaign slug
 * @param score Signal score that was reached (50, 75, 90, etc.)
 */
export async function notifyBrandSignalScore(
  brandId: string,
  campaignTitle: string,
  campaignSlug: string,
  score: number
): Promise<void> {
  try {
    const teamMembers = await prisma.brandTeam.findMany({
      where: { brandId },
      select: { userId: true },
    })

    if (teamMembers.length === 0) {
      return
    }

    let tier = ''
    if (score >= 90) {
      tier = 'Exceptional'
    } else if (score >= 75) {
      tier = 'Strong'
    } else if (score >= 50) {
      tier = 'Moderate'
    }

    await prisma.notification.createMany({
      data: teamMembers.map((member) => ({
        userId: member.userId,
        type: 'brand_signal_threshold',
        title: `Signal score milestone: ${campaignTitle}`,
        message: `"${campaignTitle}" reached ${tier} signal score (${score})`,
        linkUrl: `/campaigns/${campaignSlug}`,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify brand signal score:', error)
  }
}

/**
 * Notify brand team members of a new brand response to one of their campaigns
 * @param brandId Brand ID
 * @param campaignTitle Campaign title
 * @param campaignSlug Campaign slug
 * @param responderName Name of the person who responded
 */
export async function notifyBrandResponsePosted(
  brandId: string,
  campaignTitle: string,
  campaignSlug: string,
  responderName: string
): Promise<void> {
  try {
    const teamMembers = await prisma.brandTeam.findMany({
      where: { brandId },
      select: { userId: true },
    })

    if (teamMembers.length === 0) {
      return
    }

    await prisma.notification.createMany({
      data: teamMembers.map((member) => ({
        userId: member.userId,
        type: 'brand_response_posted',
        title: `Response posted: ${campaignTitle}`,
        message: `${responderName} posted a response to "${campaignTitle}"`,
        linkUrl: `/campaigns/${campaignSlug}#responses`,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify brand response posted:', error)
  }
}

/**
 * Notify brand team members when their campaign reaches a supporter milestone
 * @param brandId Brand ID
 * @param campaignTitle Campaign title
 * @param campaignSlug Campaign slug
 * @param supporterCount Total number of supporters
 */
export async function notifyBrandSupporterMilestone(
  brandId: string,
  campaignTitle: string,
  campaignSlug: string,
  supporterCount: number
): Promise<void> {
  try {
    const teamMembers = await prisma.brandTeam.findMany({
      where: { brandId },
      select: { userId: true },
    })

    if (teamMembers.length === 0) {
      return
    }

    await prisma.notification.createMany({
      data: teamMembers.map((member) => ({
        userId: member.userId,
        type: 'brand_supporter_milestone',
        title: `Supporter milestone: ${campaignTitle}`,
        message: `"${campaignTitle}" now has ${supporterCount} supporters`,
        linkUrl: `/campaigns/${campaignSlug}`,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify brand supporter milestone:', error)
  }
}
