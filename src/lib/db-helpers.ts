/**
 * Database query helpers with caching
 * Provides cached access to frequently queried data
 */

import { prisma } from '@/lib/db'
import {
  cacheGet,
  cacheSet,
  generateCacheKey,
  cacheInvalidatePrefix,
} from '@/lib/cache'

// Cache key prefixes
const CACHE_PREFIXES = {
  CAMPAIGN: 'campaign',
  CAMPAIGNS_LIST: 'campaigns_list',
  USER_PROFILE: 'user_profile',
  SIGNAL_SCORE: 'signal_score',
} as const

// Default TTLs in seconds
const CACHE_TTLS = {
  CAMPAIGN: 30, // 30 seconds
  CAMPAIGNS_LIST: 15, // 15 seconds
  USER_PROFILE: 60, // 60 seconds
  SIGNAL_SCORE: 120, // 2 minutes
} as const

/**
 * Get a single campaign with caching
 * Fetches by ID or slug and caches for 30 seconds
 */
export async function getCampaignWithCache(idOrSlug: string) {
  const cacheKey = generateCacheKey(CACHE_PREFIXES.CAMPAIGN, idOrSlug)

  // Check cache first
  const cached = cacheGet(cacheKey)
  if (cached) {
    return cached
  }

  // Query database
  const campaign = await prisma.campaign.findFirst({
    where: {
      OR: [
        { id: idOrSlug },
        { slug: idOrSlug },
      ],
    },
    include: {
      creator: {
        select: {
          id: true,
          displayName: true,
          handle: true,
          avatar: true,
        },
      },
      targetedBrand: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
      media: true,
      _count: {
        select: {
          lobbies: true,
          follows: true,
          comments: true,
          favourites: true,
        },
      },
    },
  })

  if (campaign) {
    cacheSet(cacheKey, campaign, CACHE_TTLS.CAMPAIGN)
  }

  return campaign
}

/**
 * Get campaigns list with caching
 * Fetches filtered campaign list and caches for 15 seconds
 */
export async function getCampaignsListCached(filters: {
  query?: string
  category?: string
  brandId?: string
  status?: string
  sort?: 'trending' | 'newest' | 'signal'
  page?: number
  limit?: number
}) {
  // Create a cache key from filter parameters
  const filterKey = JSON.stringify({
    ...filters,
    sort: filters.sort || 'trending',
    page: filters.page || 1,
    limit: filters.limit || 20,
  })
  const cacheKey = `${CACHE_PREFIXES.CAMPAIGNS_LIST}:${Buffer.from(filterKey).toString('base64').substring(0, 32)}`

  // Check cache first
  const cached = cacheGet(cacheKey)
  if (cached) {
    return cached
  }

  const {
    query,
    category,
    brandId,
    status = 'LIVE',
    sort = 'trending',
    page = 1,
    limit = 20,
  } = filters

  const where: any = {
    status: status,
  }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = category
  }

  if (brandId) {
    where.targetedBrandId = brandId
  }

  const orderBy: any =
    sort === 'newest'
      ? { createdAt: 'desc' }
      : sort === 'signal'
      ? { signalScore: 'desc' }
      : [{ signalScore: 'desc' }, { createdAt: 'desc' }]

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            handle: true,
          },
        },
        targetedBrand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        media: {
          take: 1,
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            lobbies: true,
            follows: true,
          },
        },
      },
    }),
    prisma.campaign.count({ where }),
  ])

  const result = {
    items: campaigns,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }

  cacheSet(cacheKey, result, CACHE_TTLS.CAMPAIGNS_LIST)
  return result
}

/**
 * Get user profile with caching
 * Fetches by handle and caches for 60 seconds
 */
export async function getUserProfileCached(handle: string) {
  const cacheKey = generateCacheKey(CACHE_PREFIXES.USER_PROFILE, handle)

  // Check cache first
  const cached = cacheGet(cacheKey)
  if (cached) {
    return cached
  }

  // Query database
  const user = await prisma.user.findUnique({
    where: { handle: handle || '' },
    include: {
      _count: {
        select: {
          campaigns: true,
          follows: true,
          lobbies: true,
          pledges: true,
        },
      },
    },
  })

  if (user) {
    cacheSet(cacheKey, user, CACHE_TTLS.USER_PROFILE)
  }

  return user
}

/**
 * Get signal score for a campaign with caching
 * Fetches signal score and caches for 120 seconds
 */
export async function getSignalScoreCached(campaignId: string) {
  const cacheKey = generateCacheKey(CACHE_PREFIXES.SIGNAL_SCORE, campaignId)

  // Check cache first
  const cached = cacheGet(cacheKey)
  if (cached !== null) {
    return cached
  }

  // Query database
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      signalScore: true,
      signalScoreUpdatedAt: true,
    },
  })

  const signalScore = campaign?.signalScore ?? 0

  cacheSet(cacheKey, signalScore, CACHE_TTLS.SIGNAL_SCORE)
  return signalScore
}

/**
 * Invalidate campaign cache
 * Call this when a campaign is created, updated, or deleted
 */
export function invalidateCampaignCache(campaignId: string): void {
  // Invalidate specific campaign cache
  cacheInvalidatePrefix(`${CACHE_PREFIXES.CAMPAIGN}:${campaignId}`)
  // Invalidate campaign list cache (all filters)
  cacheInvalidatePrefix(CACHE_PREFIXES.CAMPAIGNS_LIST)
  // Invalidate signal score cache
  cacheInvalidatePrefix(`${CACHE_PREFIXES.SIGNAL_SCORE}:${campaignId}`)
}

/**
 * Invalidate user profile cache
 * Call this when a user profile is updated
 */
export function invalidateUserProfileCache(handle: string): void {
  cacheInvalidatePrefix(`${CACHE_PREFIXES.USER_PROFILE}:${handle}`)
}

/**
 * Invalidate all list caches
 * Call this when filtering options or sorting might be affected
 */
export function invalidateAllListCaches(): void {
  cacheInvalidatePrefix(CACHE_PREFIXES.CAMPAIGNS_LIST)
}
