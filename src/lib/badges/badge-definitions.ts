export interface BadgeDefinition {
  id: string
  name: string
  description: string
  icon: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  category: 'campaigning' | 'lobbying' | 'community' | 'special'
  criteria: {
    type: string
    threshold: number
  }
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Campaigning badges
  {
    id: 'first_campaign',
    name: 'First Campaign',
    description: 'Created your first campaign',
    icon: '🚀',
    tier: 'bronze',
    category: 'campaigning',
    criteria: { type: 'campaigns_created', threshold: 1 }
  },
  {
    id: 'campaign_veteran',
    name: 'Campaign Veteran',
    description: 'Created 5 campaigns',
    icon: '⭐',
    tier: 'silver',
    category: 'campaigning',
    criteria: { type: 'campaigns_created', threshold: 5 }
  },
  {
    id: 'campaign_legend',
    name: 'Campaign Legend',
    description: 'Created 20 campaigns',
    icon: '👑',
    tier: 'gold',
    category: 'campaigning',
    criteria: { type: 'campaigns_created', threshold: 20 }
  },

  // Lobbying badges
  {
    id: 'first_lobby',
    name: 'First Lobby',
    description: 'Made your first lobby',
    icon: '🎯',
    tier: 'bronze',
    category: 'lobbying',
    criteria: { type: 'lobbies_made', threshold: 1 }
  },
  {
    id: 'active_lobbyist',
    name: 'Active Lobbyist',
    description: 'Made 10 lobbies',
    icon: '💪',
    tier: 'silver',
    category: 'lobbying',
    criteria: { type: 'lobbies_made', threshold: 10 }
  },
  {
    id: 'super_lobbyist',
    name: 'Super Lobbyist',
    description: 'Made 50 lobbies',
    icon: '🔥',
    tier: 'gold',
    category: 'lobbying',
    criteria: { type: 'lobbies_made', threshold: 50 }
  },
  {
    id: 'lobby_master',
    name: 'Lobby Master',
    description: 'Made 100 lobbies',
    icon: '🏆',
    tier: 'platinum',
    category: 'lobbying',
    criteria: { type: 'lobbies_made', threshold: 100 }
  },

  // Community badges
  {
    id: 'first_comment',
    name: 'First Comment',
    description: 'Made your first comment',
    icon: '💬',
    tier: 'bronze',
    category: 'community',
    criteria: { type: 'comments_made', threshold: 1 }
  },
  {
    id: 'conversation_starter',
    name: 'Conversation Starter',
    description: 'Made 10 comments',
    icon: '🗣️',
    tier: 'silver',
    category: 'community',
    criteria: { type: 'comments_made', threshold: 10 }
  },
  {
    id: 'community_voice',
    name: 'Community Voice',
    description: 'Made 50 comments',
    icon: '📣',
    tier: 'gold',
    category: 'community',
    criteria: { type: 'comments_made', threshold: 50 }
  },
  {
    id: 'first_follow',
    name: 'First Follow',
    description: 'Followed your first user',
    icon: '👁️',
    tier: 'bronze',
    category: 'community',
    criteria: { type: 'users_followed', threshold: 1 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Followed 20 users',
    icon: '🦋',
    tier: 'silver',
    category: 'community',
    criteria: { type: 'users_followed', threshold: 20 }
  },

  // Special badges
  {
    id: 'brand_whisperer',
    name: 'Brand Whisperer',
    description: 'Received a brand response',
    icon: '🎤',
    tier: 'gold',
    category: 'special',
    criteria: { type: 'brand_responses', threshold: 1 }
  },
  {
    id: 'trendsetter',
    name: 'Trendsetter',
    description: 'Created a campaign with 25+ lobbies',
    icon: '📈',
    tier: 'gold',
    category: 'special',
    criteria: { type: 'campaign_lobbies', threshold: 25 }
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Created account before July 2026',
    icon: '🌅',
    tier: 'platinum',
    category: 'special',
    criteria: { type: 'early_adopter', threshold: 1 }
  }
]
