import { prisma } from '@/lib/db'

/**
 * Check if user has completed onboarding
 * User is considered to have completed onboarding if their displayName is not null
 * and is not the default "Alex Johnson"
 */
export async function checkOnboardingComplete(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true },
    })

    if (!user || !user.displayName) {
      return false
    }

    // Check if it's the default name that should be replaced
    if (user.displayName === 'Alex Johnson') {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Check if user should be shown the onboarding flow
 * Returns true if displayName is null or "Alex Johnson"
 */
export async function shouldShowOnboarding(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true },
    })

    if (!user) {
      return false
    }

    // Show onboarding if no displayName or if it's the default
    return (
      !user.displayName ||
      user.displayName === 'Alex Johnson' ||
      user.displayName.includes('@') // Still has email-based name
    )
  } catch (error) {
    return false
  }
}

/**
 * Complete onboarding for a user
 * Saves their name and optionally creates their first campaign draft with a product idea
 */
export async function completeOnboarding(
  userId: string,
  name: string,
  productIdea?: string
): Promise<{
  success: boolean
  campaignDraftId?: string
  error?: string
}> {
  try {
    // Update user displayName
    await prisma.user.update({
      where: { id: userId },
      data: { displayName: name },
    })

    // If product idea provided, create a campaign draft
    let campaignDraftId: string | undefined

    if (productIdea && productIdea.trim()) {
      const draft = await prisma.campaignDraft.upsert({
        where: { userId },
        create: {
          userId,
          formData: {
            title: productIdea,
            description: productIdea,
            category: '',
            originStory: productIdea,
          },
        },
        update: {
          formData: {
            title: productIdea,
            description: productIdea,
            category: '',
            originStory: productIdea,
          },
        },
      })

      campaignDraftId = draft.id
    }

    return {
      success: true,
      campaignDraftId,
    }
  } catch (error) {
    console.error('[completeOnboarding] Error:', error)
    return {
      success: false,
      error: 'Failed to complete onboarding',
    }
  }
}
