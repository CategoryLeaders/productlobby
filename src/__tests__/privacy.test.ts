/**
 * Privacy Layer Tests
 * Verifies that brand API endpoints never expose individual user data
 */

import {
  aggregateLobbies,
  aggregatePledges,
  sanitizeForBrand,
  isBrandUser,
  isBrandOwner,
} from '@/lib/privacy'

// ============================================================================
// TEST DATA
// ============================================================================

const mockLobbies = [
  { id: 'lobby-1', intensity: 'NEAT_IDEA', status: 'PENDING', createdAt: new Date('2026-02-20') },
  { id: 'lobby-2', intensity: 'PROBABLY_BUY', status: 'VERIFIED', createdAt: new Date('2026-02-20') },
  { id: 'lobby-3', intensity: 'TAKE_MY_MONEY', status: 'VERIFIED', createdAt: new Date('2026-02-21') },
  { id: 'lobby-4', intensity: 'PROBABLY_BUY', status: 'PENDING', createdAt: new Date('2026-02-21') },
  { id: 'lobby-5', intensity: 'NEAT_IDEA', status: 'VERIFIED', createdAt: new Date('2026-02-22') },
]

const mockPledges = [
  { id: 'pledge-1', pledgeType: 'SUPPORT', priceCeiling: 15.0, timeframeDays: 30, createdAt: new Date('2026-02-20') },
  { id: 'pledge-2', pledgeType: 'INTENT', priceCeiling: 20.0, timeframeDays: 30, createdAt: new Date('2026-02-20') },
  { id: 'pledge-3', pledgeType: 'INTENT', priceCeiling: 25.0, timeframeDays: 30, createdAt: new Date('2026-02-21') },
  { id: 'pledge-4', pledgeType: 'INTENT', priceCeiling: 30.0, timeframeDays: 30, createdAt: new Date('2026-02-21') },
  { id: 'pledge-5', pledgeType: 'INTENT', priceCeiling: 35.0, timeframeDays: 90, createdAt: new Date('2026-02-22') },
]

// ============================================================================
// AGGREGATION TESTS
// ============================================================================

describe('aggregateLobbies', () => {
  it('should count lobbies by intensity', () => {
    const result = aggregateLobbies(mockLobbies)

    expect(result.byIntensity.NEAT_IDEA).toBe(2)
    expect(result.byIntensity.PROBABLY_BUY).toBe(2)
    expect(result.byIntensity.TAKE_MY_MONEY).toBe(1)
    expect(result.total).toBe(5)
  })

  it('should calculate verified percentage', () => {
    const result = aggregateLobbies(mockLobbies)
    // 3 out of 5 are verified = 60%
    expect(result.verifiedPercentage).toBe(60)
  })

  it('should generate daily trend', () => {
    const result = aggregateLobbies(mockLobbies)

    expect(result.trend.length).toBe(3)
    expect(result.trend[0]).toEqual({ date: '2026-02-20', count: 2 })
    expect(result.trend[1]).toEqual({ date: '2026-02-21', count: 2 })
    expect(result.trend[2]).toEqual({ date: '2026-02-22', count: 1 })
  })

  it('should never include user IDs', () => {
    const result = aggregateLobbies(mockLobbies)
    const json = JSON.stringify(result)

    expect(json).not.toContain('userId')
    expect(json).not.toContain('user_id')
    expect(json).not.toContain('lobby-1')
  })

  it('should not include individual records', () => {
    const result = aggregateLobbies(mockLobbies)

    expect(result).not.toHaveProperty('lobbies')
    expect(result).not.toHaveProperty('items')
    expect(result).not.toHaveProperty('records')
  })
})

describe('aggregatePledges', () => {
  it('should count pledges by type', () => {
    const result = aggregatePledges(mockPledges)

    expect(result.totalSupport).toBe(1)
    expect(result.totalIntent).toBe(4)
  })

  it('should calculate price percentiles', () => {
    const result = aggregatePledges(mockPledges)

    // Intent pledges: 20, 25, 30, 35
    expect(result.medianPriceCeiling).toBe(27.5) // (25 + 30) / 2
    expect(result.p25PriceCeiling).toBeGreaterThanOrEqual(20)
    expect(result.p75PriceCeiling).toBeGreaterThanOrEqual(25)
    expect(result.p90PriceCeiling).toBeGreaterThanOrEqual(30)
  })

  it('should count pledges by timeframe', () => {
    const result = aggregatePledges(mockPledges)

    expect(result.byTimeframe['30d']).toBe(4) // All pledges are within 30 days
    expect(result.byTimeframe['90d']).toBe(4)
    expect(result.byTimeframe['180d']).toBe(4)
  })

  it('should generate intent trend', () => {
    const result = aggregatePledges(mockPledges)

    expect(result.intentTrend.length).toBe(3)
    expect(result.intentTrend[0]).toEqual({ date: '2026-02-20', count: 1 })
    expect(result.intentTrend[1]).toEqual({ date: '2026-02-21', count: 2 })
    expect(result.intentTrend[2]).toEqual({ date: '2026-02-22', count: 1 })
  })

  it('should never include user IDs', () => {
    const result = aggregatePledges(mockPledges)
    const json = JSON.stringify(result)

    expect(json).not.toContain('userId')
    expect(json).not.toContain('user_id')
    expect(json).not.toContain('pledge-1')
  })

  it('should not include individual prices', () => {
    const result = aggregatePledges(mockPledges)

    // Should not have an array of individual prices
    expect(result).not.toHaveProperty('prices')
    expect(result).not.toHaveProperty('pledges')
    expect(result).not.toHaveProperty('items')
  })

  it('should handle null price ceilings', () => {
    const pledgesWithNull = [
      { id: 'pledge-1', pledgeType: 'SUPPORT', priceCeiling: null, createdAt: new Date() },
      { id: 'pledge-2', pledgeType: 'INTENT', priceCeiling: 20.0, createdAt: new Date() },
    ]

    const result = aggregatePledges(pledgesWithNull)
    expect(result.medianPriceCeiling).toBe(20.0)
  })
})

// ============================================================================
// PRIVACY VIOLATION TESTS
// ============================================================================

describe('Privacy Violations', () => {
  it('aggregateLobbies should not include email addresses', () => {
    const result = aggregateLobbies(mockLobbies)
    const json = JSON.stringify(result)

    expect(json).not.toMatch(/@/)
  })

  it('aggregatePledges should not include email addresses', () => {
    const result = aggregatePledges(mockPledges)
    const json = JSON.stringify(result)

    expect(json).not.toMatch(/@/)
  })

  it('should not expose individual pledge amounts to calculate total revenue', () => {
    const result = aggregatePledges(mockPledges)

    // Should have percentiles, not individual amounts
    expect(result).toHaveProperty('medianPriceCeiling')
    expect(result).toHaveProperty('p25PriceCeiling')
    expect(result).toHaveProperty('p75PriceCeiling')
    expect(result).not.toHaveProperty('pledgeAmounts')
    expect(result).not.toHaveProperty('individualPrices')
  })

  it('should not include displayName in aggregated data', () => {
    const result = aggregateLobbies(mockLobbies)
    const json = JSON.stringify(result)

    expect(json).not.toContain('displayName')
    expect(json).not.toContain('display_name')
  })
})

// ============================================================================
// DECIMAL HANDLING
// ============================================================================

describe('Decimal Handling', () => {
  it('should handle Prisma Decimal objects', () => {
    const decimalPledges = [
      {
        id: 'pledge-1',
        pledgeType: 'INTENT',
        priceCeiling: { toString: () => '19.99' },
        createdAt: new Date(),
      },
      {
        id: 'pledge-2',
        pledgeType: 'INTENT',
        priceCeiling: { toString: () => '29.99' },
        createdAt: new Date(),
      },
    ]

    const result = aggregatePledges(decimalPledges)
    expect(result.medianPriceCeiling).toBeGreaterThan(19)
    expect(result.medianPriceCeiling).toBeLessThan(30)
  })
})

// ============================================================================
// EDGE CASES
// ============================================================================

describe('Edge Cases', () => {
  it('should handle empty lobbies array', () => {
    const result = aggregateLobbies([])

    expect(result.total).toBe(0)
    expect(result.byIntensity.NEAT_IDEA).toBe(0)
    expect(result.verifiedPercentage).toBe(0)
    expect(result.trend).toEqual([])
  })

  it('should handle empty pledges array', () => {
    const result = aggregatePledges([])

    expect(result.totalSupport).toBe(0)
    expect(result.totalIntent).toBe(0)
    expect(result.medianPriceCeiling).toBe(0)
    expect(result.intentTrend).toEqual([])
  })

  it('should handle single lobby', () => {
    const result = aggregateLobbies([mockLobbies[0]])

    expect(result.total).toBe(1)
    expect(result.byIntensity.NEAT_IDEA).toBe(1)
  })

  it('should handle single pledge', () => {
    const result = aggregatePledges([mockPledges[0]])

    expect(result.totalSupport).toBe(1)
  })
})
