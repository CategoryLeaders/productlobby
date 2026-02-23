import { prisma } from './db'

// Notification types
export type NotificationType =
  | 'campaign_update'
  | 'brand_response'
  | 'new_poll'
  | 'poll_closed'
  | 'comment_reply'
  | 'milestone'
  | 'new_follower'
  | 'lobby_upgrade'
  | 'new_lobby'
  | 'new_comment'
  | 'question_answered'
  | 'collaboration_invite'

export interface CreateNotificationOptions {
  userId: string
  type: NotificationType
  title: string
  message: string
  linkUrl?: string
}

/**
 * Create a single notification for a user
 */
export async function createNotification(
  options: CreateNotificationOptions
): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        linkUrl: options.linkUrl || null,
        read: false,
      },
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

/**
 * Notify all followers of a campaign
 * @param campaignId Campaign ID
 * @param type Notification type
 * @param title Notification title
 * @param message Notification message
 * @param linkUrl URL to navigate to when clicked
 * @param excludeUserId Optional user ID to exclude (usually the person who triggered it)
 */
export async function notifyCampaignFollowers(
  campaignId: string,
  type: NotificationType,
  title: string,
  message: string,
  linkUrl: string,
  excludeUserId?: string
): Promise<void> {
  try {
    // Get all followers of the campaign
    const followers = await prisma.follow.findMany({
      where: {
        campaignId,
        ...(excludeUserId && { userId: { not: excludeUserId } }),
      },
      select: { userId: true },
    })

    if (followers.length === 0) {
      return
    }

    // Create notifications for all followers
    await prisma.notification.createMany({
      data: followers.map((follow) => ({
        userId: follow.userId,
        type,
        title,
        message,
        linkUrl,
        read: false,
      })),
    })
  } catch (error) {
    console.error('Failed to notify campaign followers:', error)
  }
}

/**
 * Notify campaign creator
 * @param campaignId Campaign ID
 * @param type Notification type
 * @param title Notification title
 * @param message Notification message
 * @param linkUrl URL to navigate to when clicked
 */
export async function notifyCampaignCreator(
  campaignId: string,
  type: NotificationType,
  title: string,
  message: string,
  linkUrl: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { creatorUserId: true },
    })

    if (!campaign) {
      return
    }

    await createNotification({
      userId: campaign.creatorUserId,
      type,
      title,
      message,
      linkUrl,
    })
  } catch (error) {
    console.error('Failed to notify campaign creator:', error)
  }
}

/**
 * Notify followers of a new campaign update
 * @param campaignId Campaign ID
 * @param updateTitle Title of the update
 */
export async function notifyNewUpdate(
  campaignId: string,
  updateTitle: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true },
    })

    if (!campaign) {
      return
    }

    await notifyCampaignFollowers(
      campaignId,
      'campaign_update',
      'New campaign update',
      `"${campaign.title}" has a new update: ${updateTitle}`,
      `/campaigns/${campaign.slug}#updates`
    )
  } catch (error) {
    console.error('Failed to notify new update:', error)
  }
}

/**
 * Notify followers of a new creator poll
 * @param campaignId Campaign ID
 * @param pollQuestion Poll question
 */
export async function notifyNewPoll(
  campaignId: string,
  pollQuestion: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true },
    })

    if (!campaign) {
      return
    }

    await notifyCampaignFollowers(
      campaignId,
      'new_poll',
      'Creator poll',
      `Creator of "${campaign.title}" asks: ${pollQuestion}`,
      `/campaigns/${campaign.slug}#polls`
    )
  } catch (error) {
    console.error('Failed to notify new poll:', error)
  }
}

/**
 * Notify followers when a creator poll closes
 * @param campaignId Campaign ID
 * @param pollQuestion Poll question
 */
export async function notifyPollClosed(
  campaignId: string,
  pollQuestion: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true },
    })

    if (!campaign) {
      return
    }

    await notifyCampaignFollowers(
      campaignId,
      'poll_closed',
      'Poll closed',
      `The poll "${pollQuestion}" for "${campaign.title}" is now closed`,
      `/campaigns/${campaign.slug}#polls`
    )
  } catch (error) {
    console.error('Failed to notify poll closed:', error)
  }
}

/**
 * Notify followers of a brand response
 * @param campaignId Campaign ID
 * @param brandName Brand name
 */
export async function notifyBrandResponse(
  campaignId: string,
  brandName: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true },
    })

    if (!campaign) {
      return
    }

    await notifyCampaignFollowers(
      campaignId,
      'brand_response',
      `Response from ${brandName}`,
      `${brandName} responded to "${campaign.title}"`,
      `/campaigns/${campaign.slug}#responses`
    )
  } catch (error) {
    console.error('Failed to notify brand response:', error)
  }
}

/**
 * Notify a user when someone replies to their comment
 * @param commentUserId User ID of the comment author
 * @param replierName Name of the person replying
 * @param campaignSlug Campaign slug
 */
export async function notifyCommentReply(
  commentUserId: string,
  replierName: string,
  campaignSlug: string
): Promise<void> {
  try {
    await createNotification({
      userId: commentUserId,
      type: 'comment_reply',
      title: 'New reply to your comment',
      message: `${replierName} replied to your comment`,
      linkUrl: `/campaigns/${campaignSlug}#comments`,
    })
  } catch (error) {
    console.error('Failed to notify comment reply:', error)
  }
}

/**
 * Notify followers of a milestone achievement
 * @param campaignId Campaign ID
 * @param milestone Milestone description (e.g., "100 lobbies!", "Signal score hit 80!")
 */
export async function notifyMilestone(
  campaignId: string,
  milestone: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true },
    })

    if (!campaign) {
      return
    }

    await notifyCampaignFollowers(
      campaignId,
      'milestone',
      'Campaign milestone reached!',
      `"${campaign.title}" has reached ${milestone}`,
      `/campaigns/${campaign.slug}`
    )
  } catch (error) {
    console.error('Failed to notify milestone:', error)
  }
}

/**
 * Notify campaign creator of a new follower
 * @param campaignCreatorId User ID of the campaign creator
 * @param followerName Name of the new follower
 * @param campaignTitle Title of the campaign
 */
export async function notifyNewFollower(
  campaignCreatorId: string,
  followerName: string,
  campaignTitle: string
): Promise<void> {
  try {
    await createNotification({
      userId: campaignCreatorId,
      type: 'new_follower',
      title: 'New follower',
      message: `${followerName} is now following "${campaignTitle}"`,
      linkUrl: '/dashboard', // Or wherever the creator views followers
    })
  } catch (error) {
    console.error('Failed to notify new follower:', error)
  }
}

/**
 * Notify campaign creator when someone lobbies their campaign
 */
export async function notifyNewLobby(
  campaignId: string,
  lobbyerName: string,
  intensity: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true, creatorUserId: true },
    })

    if (!campaign) return

    const intensityLabel = intensity === 'TAKE_MY_MONEY' ? 'wants to take your money!' :
      intensity === 'PROBABLY_BUY' ? 'would probably buy' : 'thinks it\'s a neat idea'

    await createNotification({
      userId: campaign.creatorUserId,
      type: 'new_lobby',
      title: 'New lobby on your campaign',
      message: `${lobbyerName} ${intensityLabel} for "${campaign.title}"`,
      linkUrl: `/campaigns/${campaign.slug}`,
    })
  } catch (error) {
    console.error('Failed to notify new lobby:', error)
  }
}

/**
 * Notify campaign creator when someone comments on their campaign
 */
export async function notifyNewComment(
  campaignId: string,
  commenterName: string,
  commentSnippet: string
): Promise<void> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { title: true, slug: true, creatorUserId: true },
    })

    if (!campaign) return

    await createNotification({
      userId: campaign.creatorUserId,
      type: 'new_comment',
      title: 'New comment on your campaign',
      message: `${commenterName}: ${commentSnippet.substring(0, 100)}`,
      linkUrl: `/campaigns/${campaign.slug}#comments`,
    })
  } catch (error) {
    console.error('Failed to notify new comment:', error)
  }
}

/**
 * Notify question asker when their question is answered
 */
export async function notifyQuestionAnswered(
  questionAskerId: string,
  campaignSlug: string,
  campaignTitle: string,
  answerSnippet: string
): Promise<void> {
  try {
    await createNotification({
      userId: questionAskerId,
      type: 'question_answered',
      title: 'Your question was answered',
      message: `Your question on "${campaignTitle}" was answered: ${answerSnippet.substring(0, 100)}`,
      linkUrl: `/campaigns/${campaignSlug}#qa`,
    })
  } catch (error) {
    console.error('Failed to notify question answered:', error)
  }
}
