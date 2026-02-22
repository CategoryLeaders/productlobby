import { prisma } from '@/lib/db'
import crypto from 'crypto'

const API_KEY_LIVE_PREFIX = 'pl_live_'
const API_KEY_TEST_PREFIX = 'pl_test_'
const RATE_LIMIT_REQUESTS_PER_HOUR = 1000

interface ApiKeyData {
  id: string
  key: string
  hashedKey: string
  brandId: string
  environment: 'live' | 'test'
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
}

interface ApiKeyUsageStats {
  requests: number
  lastReset: Date
  remaining: number
  resetTime: Date
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString('hex').substring(0, length)
}

export async function generateApiKey(
  brandId: string,
  environment: 'live' | 'test' = 'live'
): Promise<{ key: string; id: string }> {
  const prefix = environment === 'live' ? API_KEY_LIVE_PREFIX : API_KEY_TEST_PREFIX
  const randomPart = generateRandomString(32)
  const key = `${prefix}${randomPart}`
  const hashedKey = hashApiKey(key)

  const apiKey = await prisma.apiKey.create({
    data: {
      hashedKey,
      brandId,
      environment,
    },
  })

  return {
    key,
    id: apiKey.id,
  }
}

export async function validateApiKey(key: string): Promise<{ valid: boolean; brandId?: string; keyId?: string; environment?: string }> {
  if (!key || (!key.startsWith(API_KEY_LIVE_PREFIX) && !key.startsWith(API_KEY_TEST_PREFIX))) {
    return { valid: false }
  }

  const hashedKey = hashApiKey(key)

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
    select: {
      id: true,
      brandId: true,
      revokedAt: true,
      environment: true,
    },
  })

  if (!apiKey || apiKey.revokedAt) {
    return { valid: false }
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    valid: true,
    brandId: apiKey.brandId,
    keyId: apiKey.id,
    environment: apiKey.environment,
  }
}

export async function revokeApiKey(keyId: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.update({
    where: { id: keyId },
    data: { revokedAt: new Date() },
  })

  return !!apiKey
}

export async function getKeyUsage(keyId: string): Promise<ApiKeyUsageStats | null> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
    include: {
      usageLogs: {
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000),
          },
        },
      },
    },
  })

  if (!apiKey) {
    return null
  }

  const requests = apiKey.usageLogs.length
  const resetTime = new Date(Date.now() - 60 * 60 * 1000)
  resetTime.setHours(resetTime.getHours() + 1)

  return {
    requests,
    lastReset: new Date(Date.now() - 60 * 60 * 1000),
    remaining: Math.max(0, RATE_LIMIT_REQUESTS_PER_HOUR - requests),
    resetTime,
  }
}

export async function checkRateLimit(keyId: string): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
  const usage = await getKeyUsage(keyId)

  if (!usage) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: new Date(),
    }
  }

  return {
    allowed: usage.remaining > 0,
    remaining: usage.remaining,
    resetTime: usage.resetTime,
  }
}

export async function logApiKeyUsage(keyId: string, endpoint: string, statusCode: number): Promise<void> {
  await prisma.apiKeyUsageLog.create({
    data: {
      keyId,
      endpoint,
      statusCode,
    },
  })
}

export async function getApiKeysByBrand(brandId: string): Promise<any[]> {
  const keys = await prisma.apiKey.findMany({
    where: { brandId },
    select: {
      id: true,
      environment: true,
      createdAt: true,
      lastUsedAt: true,
      revokedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return keys
}

export async function deleteApiKey(keyId: string): Promise<boolean> {
  try {
    await prisma.apiKey.delete({
      where: { id: keyId },
    })
    return true
  } catch {
    return false
  }
}
