import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { digestEmailTemplate } from '@/lib/email-templates'

/**
 * POST /api/cron/email-digest
 * Generates and sends email digests to users
 * Intended to be called by Vercel Cron or similar service
 *
 * Requires header: x-cron-secret matching env CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all users with email digests enabled (excluding NEVER)
    const prefsWithDigests = await prisma.notificationPreference.findMany({
      where: {
        NOT: {
          emailDigestFrequency: 'NEVER',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    })

    let digestsSent = 0
    let digestsFailed = 0

    for (const prefs of prefsWithDigests) {
      try {
        const user = prefs.user

        // Determine time window based on frequency
        let hoursBack = 24
        if (prefs.emailDigestFrequency === 'WEEKLY') {
          hoursBack = 168 // 7 days
        }

        const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

        // Get unread notifications since last digest
        const [notifications, campaignUpdates] = await Promise.all([
          prisma.notification.findMany({
            where: {
              userId: user.id,
              createdAt: { gte: cutoffTime },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          }),
          prisma.campaignUpdate.findMany({
            where: {
              createdAt: { gte: cutoffTime },
              campaign: {
                follows: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            },
            include: {
              campaign: {
                select: {
                  title: true,
                  slug: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          }),
        ])

        // Skip if no content to digest
        if (notifications.length === 0 && campaignUpdates.length === 0) {
          continue
        }

        // Get user stats
        const [followCount, newLobbies] = await Promise.all([
          prisma.follow.count({
            where: { userId: user.id },
          }),
          prisma.lobby.count({
            where: {
              userId: user.id,
              createdAt: { gte: cutoffTime },
            },
          }),
        ])

        // Count new followers
        const newFollowers = 0 // This would need a Follower model for user followers

        const period =
          prefs.emailDigestFrequency === 'WEEKLY' ? 'Weekly' : 'Daily'

        // Generate HTML
        const html = digestEmailTemplate({
          userName: user.displayName,
          period,
          notifications: notifications.map((n) => ({
            title: n.title,
            message: n.message,
            linkUrl: n.linkUrl || '',
          })),
          campaignUpdates: campaignUpdates.map((u) => ({
            campaignTitle: u.campaign.title,
            updateTitle: u.title,
            slug: u.campaign.slug,
          })),
          stats: {
            newLobbies,
            newFollowers,
            campaignsFollowed: followCount,
          },
        })

        // Send email
        const result = await sendEmail({
          to: user.email,
          subject: `Your ${period} ProductLobby Digest`,
          html,
        })

        if (result.success) {
          // Update last digest sent time
          await prisma.notificationPreference.update({
            where: { userId: user.id },
            data: {
              lastDigestSentAt: new Date(),
            },
          })
          digestsSent++
        } else {
          digestsFailed++
          console.error(`Failed to send digest to ${user.email}:`, result.error)
        }
      } catch (error) {
        digestsFailed++
        console.error(`Error processing digest for user:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      digestsSent,
      digestsFailed,
      totalProcessed: prefsWithDigests.length,
    })
  } catch (error) {
    console.error('[POST /api/cron/email-digest]', error)
    return NextResponse.json(
      { error: 'Failed to generate email digests' },
      { status: 500 }
    )
  }
}
