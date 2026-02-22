/**
 * Badge System
 * Defines all badges users can earn and provides computation logic
 */

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  earned: boolean
}

export interface UserStats {
  joinedAt: Date
  campaignsCreated: number
  campaignsSupported: number
  totalComments: number
  totalShares: number
  referralClicks: number
  totalPollVotes: number
  takeMyMoneyLobbies: number
}

export const BADGE_DEFINITIONS = {
  'early-adopter': {
    name: 'Early Adopter',
    description: 'Joined in the first 1000 users',
    icon: '🌟',
  },
  'first-lobby': {
    name: 'First Lobby',
    description: 'Lobbied at least 1 campaign',
    icon: '👋',
  },
  'vocal-supporter': {
    name: 'Vocal Supporter',
    description: 'Left 5+ comments',
    icon: '💬',
  },
  'passionate-backer': {
    name: 'Passionate Backer',
    description: 'Made 3+ "Take My Money" lobbies',
    icon: '🔥',
  },
  'trend-spotter': {
    name: 'Trend Spotter',
    description: 'Lobbied 10+ campaigns',
    icon: '🔮',
  },
  'poll-participant': {
    name: 'Poll Participant',
    description: 'Voted in 5+ creator polls',
    icon: '📊',
  },
  'referral-champion': {
    name: 'Referral Champion',
    description: '5+ referral clicks',
    icon: '🔗',
  },
  'campaign-creator': {
    name: 'Campaign Creator',
    description: 'Created at least 1 campaign',
    icon: '🚀',
  },
  'community-builder': {
    name: 'Community Builder',
    description: '20+ comments and 10+ shares',
    icon: '🏗️',
  },
  'power-lobbyist': {
    name: 'Power Lobbyist',
    description: 'Lobbied 25+ campaigns',
    icon: '⚡',
  },
} as const

export type BadgeId = keyof typeof BADGE_DEFINITIONS

/**
 * Compute which badges a user has earned based on their stats
 */
export function computeBadges(stats: UserStats): Badge[] {
  const badges: Badge[] = []
  const badgeIds = Object.keys(BADGE_DEFINITIONS) as BadgeId[]

  // Calculate user ID rank (for early adopter badge)
  // In a real app, you'd need to fetch the user's creation rank from the database
  // For now, we'll use a placeholder approach
  const userIdRank = 5000 // This would be calculated from actual user count at join time

  for (const badgeId of badgeIds) {
    const definition = BADGE_DEFINITIONS[badgeId]
    let earned = false

    switch (badgeId) {
      case 'early-adopter':
        // Check if user joined in first 1000 users
        // This would require tracking user count at signup time
        earned = userIdRank <= 1000
        break

      case 'first-lobby':
        earned = stats.campaignsSupported >= 1
        break

      case 'vocal-supporter':
        earned = stats.totalComments >= 5
        break

      case 'passionate-backer':
        earned = stats.takeMyMoneyLobbies >= 3
        break

      case 'trend-spotter':
        earned = stats.campaignsSupported >= 10
        break

      case 'poll-participant':
        earned = stats.totalPollVotes >= 5
        break

      case 'referral-champion':
        earned = stats.referralClicks >= 5
        break

      case 'campaign-creator':
        earned = stats.campaignsCreated >= 1
        break

      case 'community-builder':
        earned = stats.totalComments >= 20 && stats.totalShares >= 10
        break

      case 'power-lobbyist':
        earned = stats.campaignsSupported >= 25
        break
    }

    badges.push({
      id: badgeId,
      name: definition.name,
      description: definition.description,
      icon: definition.icon,
      condition: definition.description,
      earned,
    })
  }

  return badges
}

/**
 * Get badge display class based on earned status
 */
export function getBadgeDisplayClass(earned: boolean): string {
  if (earned) {
    return 'opacity-100'
  }
  return 'opacity-50 grayscale'
}
