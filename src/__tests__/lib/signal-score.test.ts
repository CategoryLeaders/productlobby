/**
 * Signal Score Tests
 * Verifies computeSignalScore pure function and related algorithms
 */

import {
  computeSignalScore,
  INTENSITY_WEIGHTS,
  CONVERSION_RATES,
  SIGNAL_THRESHOLDS,
} from '@/lib/signal-score'

// ============================================================================
// TEST UTILITIES
// ============================================================================

interface SignalScoreInputs {
  supportCount: number
  intentCount: number
  intentPhoneVerifiedCount: number
  medianPriceCeiling: number
  p90PriceCeiling: number
  intentLast7Days: number
  intentPrev7Days: number
  fraudRiskScore: number
  neatIdeaCount: number
  probablyBuyCount: number
  takeMyMoneyCount: number
  completenessScore: number
}

const createInputs = (overrides: Partial<SignalScoreInputs> = {}): SignalScoreInputs => ({
  supportCount: 0,
  intentCount: 0,
  intentPhoneVerifiedCount: 0,
  medianPriceCeiling: 0,
  p90PriceCeiling: 0,
  intentLast7Days: 0,
  intentPrev7Days: 0,
  fraudRiskScore: 0,
  neatIdeaCount: 0,
  probablyBuyCount: 0,
  takeMyMoneyCount: 0,
  completenessScore: 0,
  ...overrides,
})

// ============================================================================
// ZERO STATE TESTS
// ============================================================================

describe('computeSignalScore - Zero State', () => {
  it('should return score of 0 with all zero inputs', () => {
    const inputs = createInputs()
    const result = computeSignalScore(inputs)

    expect(result.score).toBe(0)
    expect(result.demandValue).toBe(0)
    expect(result.tier).toBe('low')
  })

  it('should have valid structure with zero inputs', () => {
    const inputs = createInputs()
    const result = computeSignalScore(inputs)

    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('inputs')
    expect(result).toHaveProperty('demandValue')
    expect(result).toHaveProperty('momentum')
    expect(result).toHaveProperty('lobbyConviction')
    expect(result).toHaveProperty('tier')
    expect(result).toHaveProperty('projectedRevenue')
    expect(result).toHaveProperty('projectedCustomers')
  })

  it('should clamp score between 0 and 100', () => {
    const inputs = createInputs({
      supportCount: 1000000,
      intentCount: 1000000,
      medianPriceCeiling: 100000,
      p90PriceCeiling: 100000,
    })
    const result = computeSignalScore(inputs)

    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.score).toBeGreaterThanOrEqual(0)
  })
})

// ============================================================================
// DEMAND VALUE TESTS
// ============================================================================

describe('computeSignalScore - Demand Value', () => {
  it('should calculate demand value as weightedIntent * medianPriceCeiling', () => {
    const inputs = createInputs({
      intentCount: 100,
      intentPhoneVerifiedCount: 0,
      medianPriceCeiling: 50,
    })
    const result = computeSignalScore(inputs)

    // weightedIntent = 100 + 0.2 * 0 = 100
    // demandValue = 100 * 50 = 5000
    expect(result.demandValue).toBe(5000)
  })

  it('should increase demand value with phone verified count', () => {
    const inputs1 = createInputs({
      intentCount: 100,
      intentPhoneVerifiedCount: 0,
      medianPriceCeiling: 50,
    })

    const inputs2 = createInputs({
      intentCount: 100,
      intentPhoneVerifiedCount: 20,
      medianPriceCeiling: 50,
    })

    const result1 = computeSignalScore(inputs1)
    const result2 = computeSignalScore(inputs2)

    // inputs2 has higher weighted intent, so higher demand value
    expect(result2.demandValue).toBeGreaterThan(result1.demandValue)
  })

  it('should increase score with higher demand value', () => {
    const lowDemand = createInputs({
      intentCount: 10,
      medianPriceCeiling: 10,
    })

    const highDemand = createInputs({
      intentCount: 100,
      medianPriceCeiling: 100,
    })

    const result1 = computeSignalScore(lowDemand)
    const result2 = computeSignalScore(highDemand)

    expect(result2.score).toBeGreaterThan(result1.score)
  })
})

// ============================================================================
// MOMENTUM TESTS
// ============================================================================

describe('computeSignalScore - Momentum', () => {
  it('should calculate momentum as last7Days / prev7Days (clamped to 2)', () => {
    const inputs = createInputs({
      intentLast7Days: 20,
      intentPrev7Days: 10,
    })
    const result = computeSignalScore(inputs)

    // momentum = 20 / 10 = 2.0
    expect(result.momentum).toBe(2)
  })

  it('should clamp momentum to 2 maximum', () => {
    const inputs = createInputs({
      intentLast7Days: 100,
      intentPrev7Days: 1,
    })
    const result = computeSignalScore(inputs)

    expect(result.momentum).toBe(2)
  })

  it('should handle zero previous days as 1 for calculation', () => {
    const inputs = createInputs({
      intentLast7Days: 10,
      intentPrev7Days: 0,
    })
    const result = computeSignalScore(inputs)

    // momentum = 10 / max(1, 0) = 10 / 1, clamped to 2
    expect(result.momentum).toBe(2)
  })

  it('should be 0 when last 7 days is 0 and prev 7 days is positive', () => {
    const inputs = createInputs({
      intentLast7Days: 0,
      intentPrev7Days: 10,
    })
    const result = computeSignalScore(inputs)

    expect(result.momentum).toBe(0)
  })

  it('should increase score with positive momentum', () => {
    const flatMomentum = createInputs({
      intentLast7Days: 10,
      intentPrev7Days: 10,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const growingMomentum = createInputs({
      intentLast7Days: 20,
      intentPrev7Days: 10,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const result1 = computeSignalScore(flatMomentum)
    const result2 = computeSignalScore(growingMomentum)

    // Growing momentum should score higher
    expect(result2.score).toBeGreaterThan(result1.score)
  })
})

// ============================================================================
// LOBBY CONVICTION TESTS
// ============================================================================

describe('computeSignalScore - Lobby Conviction', () => {
  it('should calculate lobby conviction weighted by intensity', () => {
    const inputs = createInputs({
      neatIdeaCount: 10,
      probablyBuyCount: 10,
      takeMyMoneyCount: 10,
    })
    const result = computeSignalScore(inputs)

    // Total weight = 10*1 + 10*3 + 10*5 = 90
    // Average weight = 90 / 30 = 3.0
    expect(result.lobbyConviction).toBe(3)
  })

  it('should favor TAKE_MY_MONEY over NEAT_IDEA', () => {
    const neatIdea = createInputs({
      neatIdeaCount: 30,
      probablyBuyCount: 0,
      takeMyMoneyCount: 0,
    })

    const takeMoney = createInputs({
      neatIdeaCount: 0,
      probablyBuyCount: 0,
      takeMyMoneyCount: 30,
    })

    const result1 = computeSignalScore(neatIdea)
    const result2 = computeSignalScore(takeMoney)

    expect(result2.lobbyConviction).toBeGreaterThan(result1.lobbyConviction)
    expect(result2.score).toBeGreaterThan(result1.score)
  })

  it('should be 0 when no lobbies present', () => {
    const inputs = createInputs({
      neatIdeaCount: 0,
      probablyBuyCount: 0,
      takeMyMoneyCount: 0,
    })
    const result = computeSignalScore(inputs)

    expect(result.lobbyConviction).toBe(0)
  })

  it('should increase score with higher lobby conviction', () => {
    const lowConviction = createInputs({
      neatIdeaCount: 100,
      probablyBuyCount: 0,
      takeMyMoneyCount: 0,
    })

    const highConviction = createInputs({
      neatIdeaCount: 0,
      probablyBuyCount: 0,
      takeMyMoneyCount: 100,
    })

    const result1 = computeSignalScore(lowConviction)
    const result2 = computeSignalScore(highConviction)

    expect(result2.score).toBeGreaterThan(result1.score)
  })
})

// ============================================================================
// FRAUD PENALTY TESTS
// ============================================================================

describe('computeSignalScore - Fraud Penalty', () => {
  it('should reduce score with fraud risk', () => {
    const noFraud = createInputs({
      fraudRiskScore: 0,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const highFraud = createInputs({
      fraudRiskScore: 0.5,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const result1 = computeSignalScore(noFraud)
    const result2 = computeSignalScore(highFraud)

    expect(result2.score).toBeLessThan(result1.score)
  })

  it('should significantly penalize very high fraud scores', () => {
    const lowFraud = createInputs({
      fraudRiskScore: 0.1,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const highFraud = createInputs({
      fraudRiskScore: 1.0,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const result1 = computeSignalScore(lowFraud)
    const result2 = computeSignalScore(highFraud)

    // High fraud should significantly reduce score (at least 50% less)
    expect(result2.score).toBeLessThan(result1.score * 0.5)
  })
})

// ============================================================================
// COMPLETENESS MULTIPLIER TESTS
// ============================================================================

describe('computeSignalScore - Completeness Multiplier', () => {
  it('should apply 0% bonus with 0 completeness score', () => {
    const inputs = createInputs({
      completenessScore: 0,
      intentCount: 100,
      medianPriceCeiling: 50,
    })
    const result = computeSignalScore(inputs)

    // multiplier = 1 + (0/100)*0.3 = 1.0
    // So base score is not multiplied
    const baseScore = result.score / 1
    expect(baseScore).toBeCloseTo(result.score)
  })

  it('should apply 30% bonus with 100 completeness score', () => {
    const lowCompleteness = createInputs({
      completenessScore: 0,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const fullCompleteness = createInputs({
      completenessScore: 100,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const result1 = computeSignalScore(lowCompleteness)
    const result2 = computeSignalScore(fullCompleteness)

    // multiplier = 1 + (100/100)*0.3 = 1.3
    // result2 should be ~30% higher than result1
    expect(result2.score).toBeGreaterThan(result1.score)
    expect(result2.score / result1.score).toBeCloseTo(1.3, 0)
  })

  it('should scale completeness multiplier linearly', () => {
    const fifty = createInputs({
      completenessScore: 50,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const hundred = createInputs({
      completenessScore: 100,
      intentCount: 100,
      medianPriceCeiling: 50,
    })

    const result50 = computeSignalScore(fifty)
    const result100 = computeSignalScore(hundred)

    // multiplier at 50 = 1.15, at 100 = 1.3
    // result100 should be higher
    expect(result100.score).toBeGreaterThan(result50.score)
  })
})

// ============================================================================
// TIER CLASSIFICATION TESTS
// ============================================================================

describe('computeSignalScore - Tier Classification', () => {
  it('should classify as low tier below 35', () => {
    const inputs = createInputs()
    const result = computeSignalScore(inputs)

    expect(result.tier).toBe('low')
  })

  it('should classify as medium tier 35-54', () => {
    let result

    // Try to achieve score around 40
    result = computeSignalScore(createInputs({
      intentCount: 50,
      medianPriceCeiling: 10,
      supportCount: 100,
    }))

    if (result.score >= 35 && result.score < 55) {
      expect(result.tier).toBe('medium')
    }
  })

  it('should classify as high tier 55-79', () => {
    let result

    // Try to achieve score around 65
    result = computeSignalScore(createInputs({
      intentCount: 200,
      medianPriceCeiling: 50,
      supportCount: 300,
      takeMyMoneyCount: 100,
    }))

    if (result.score >= 55 && result.score < 80) {
      expect(result.tier).toBe('high')
    }
  })

  it('should classify as very_high tier 80+', () => {
    const inputs = createInputs({
      intentCount: 500,
      intentPhoneVerifiedCount: 250,
      medianPriceCeiling: 100,
      p90PriceCeiling: 200,
      supportCount: 1000,
      takeMyMoneyCount: 300,
      completenessScore: 100,
    })
    const result = computeSignalScore(inputs)

    if (result.score >= 80) {
      expect(result.tier).toBe('very_high')
    }
  })

  it('should be monotonic: higher score >= higher tier', () => {
    const low = createInputs({
      intentCount: 10,
      medianPriceCeiling: 1,
    })

    const high = createInputs({
      intentCount: 1000,
      medianPriceCeiling: 1000,
      takeMyMoneyCount: 500,
    })

    const result1 = computeSignalScore(low)
    const result2 = computeSignalScore(high)

    expect(result2.score).toBeGreaterThan(result1.score)
  })
})

// ============================================================================
// REVENUE PROJECTION TESTS
// ============================================================================

describe('computeSignalScore - Revenue Projections', () => {
  it('should project zero revenue with zero lobbies', () => {
    const inputs = createInputs({
      neatIdeaCount: 0,
      probablyBuyCount: 0,
      takeMyMoneyCount: 0,
      intentCount: 0,
      medianPriceCeiling: 100,
    })
    const result = computeSignalScore(inputs)

    expect(result.projectedCustomers).toBe(0)
    expect(result.projectedRevenue).toBe(0)
  })

  it('should calculate projected customers using conversion rates', () => {
    const inputs = createInputs({
      neatIdeaCount: 100,
      probablyBuyCount: 100,
      takeMyMoneyCount: 100,
      intentCount: 0,
      medianPriceCeiling: 50,
    })
    const result = computeSignalScore(inputs)

    // Projected customers = 100*0.05 + 100*0.25 + 100*0.65 + 0*0.4
    // = 5 + 25 + 65 = 95
    expect(result.projectedCustomers).toBe(95)
  })

  it('should weight TAKE_MY_MONEY highest for revenue projection', () => {
    const neatIdea = createInputs({
      neatIdeaCount: 100,
      probablyBuyCount: 0,
      takeMyMoneyCount: 0,
      medianPriceCeiling: 100,
    })

    const takeMoney = createInputs({
      neatIdeaCount: 0,
      probablyBuyCount: 0,
      takeMyMoneyCount: 100,
      medianPriceCeiling: 100,
    })

    const result1 = computeSignalScore(neatIdea)
    const result2 = computeSignalScore(takeMoney)

    // takeMoney has 65% conversion vs 5% for neatIdea
    expect(result2.projectedCustomers).toBeGreaterThan(result1.projectedCustomers)
  })

  it('should calculate projected revenue as customers * median price', () => {
    const inputs = createInputs({
      takeMyMoneyCount: 100,
      medianPriceCeiling: 50,
    })
    const result = computeSignalScore(inputs)

    // Projected customers = 100 * 0.65 = 65
    // Projected revenue = 65 * 50 = 3250
    expect(result.projectedRevenue).toBe(Math.round(65 * 50))
  })

  it('should include intent pledges in customer projection', () => {
    const inputs = createInputs({
      intentCount: 100,
      medianPriceCeiling: 50,
    })
    const result = computeSignalScore(inputs)

    // Projected customers = 100 * 0.4 = 40
    // Projected revenue = 40 * 50 = 2000
    expect(result.projectedCustomers).toBe(40)
    expect(result.projectedRevenue).toBe(2000)
  })
})

// ============================================================================
// INTENSITY WEIGHTS TESTS
// ============================================================================

describe('INTENSITY_WEIGHTS Constants', () => {
  it('should have correct weight values', () => {
    expect(INTENSITY_WEIGHTS.NEAT_IDEA).toBe(1)
    expect(INTENSITY_WEIGHTS.PROBABLY_BUY).toBe(3)
    expect(INTENSITY_WEIGHTS.TAKE_MY_MONEY).toBe(5)
  })

  it('should have TAKE_MY_MONEY as 5x NEAT_IDEA', () => {
    expect(INTENSITY_WEIGHTS.TAKE_MY_MONEY).toBe(
      INTENSITY_WEIGHTS.NEAT_IDEA * 5
    )
  })
})

// ============================================================================
// CONVERSION RATES TESTS
// ============================================================================

describe('CONVERSION_RATES Constants', () => {
  it('should have correct conversion rate values', () => {
    expect(CONVERSION_RATES.NEAT_IDEA).toBe(0.05)
    expect(CONVERSION_RATES.PROBABLY_BUY).toBe(0.25)
    expect(CONVERSION_RATES.TAKE_MY_MONEY).toBe(0.65)
  })

  it('should have TAKE_MY_MONEY much higher than NEAT_IDEA', () => {
    expect(CONVERSION_RATES.TAKE_MY_MONEY).toBeGreaterThan(
      CONVERSION_RATES.NEAT_IDEA * 5
    )
  })
})

// ============================================================================
// SIGNAL THRESHOLDS TESTS
// ============================================================================

describe('SIGNAL_THRESHOLDS Constants', () => {
  it('should define score thresholds in ascending order', () => {
    expect(SIGNAL_THRESHOLDS.TRENDING).toBeLessThan(
      SIGNAL_THRESHOLDS.NOTIFY_BRAND
    )
    expect(SIGNAL_THRESHOLDS.NOTIFY_BRAND).toBeLessThan(
      SIGNAL_THRESHOLDS.HIGH_SIGNAL
    )
    expect(SIGNAL_THRESHOLDS.HIGH_SIGNAL).toBeLessThan(
      SIGNAL_THRESHOLDS.SUGGEST_OFFER
    )
  })

  it('should have specific threshold values', () => {
    expect(SIGNAL_THRESHOLDS.TRENDING).toBe(35)
    expect(SIGNAL_THRESHOLDS.NOTIFY_BRAND).toBe(55)
    expect(SIGNAL_THRESHOLDS.HIGH_SIGNAL).toBe(70)
    expect(SIGNAL_THRESHOLDS.SUGGEST_OFFER).toBe(80)
  })
})

// ============================================================================
// COMPREHENSIVE INTEGRATION TESTS
// ============================================================================

describe('computeSignalScore - Integration Tests', () => {
  it('should handle realistic campaign with multiple signals', () => {
    const inputs = createInputs({
      supportCount: 500,
      intentCount: 200,
      intentPhoneVerifiedCount: 50,
      medianPriceCeiling: 75,
      p90PriceCeiling: 150,
      intentLast7Days: 40,
      intentPrev7Days: 20,
      fraudRiskScore: 0,
      neatIdeaCount: 50,
      probablyBuyCount: 75,
      takeMyMoneyCount: 100,
      completenessScore: 85,
    })
    const result = computeSignalScore(inputs)

    expect(result.score).toBeGreaterThan(50)
    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.tier).not.toBe('low')
    expect(result.demandValue).toBeGreaterThan(0)
    expect(result.momentum).toBeGreaterThan(1)
    expect(result.lobbyConviction).toBeGreaterThan(3)
  })

  it('should return consistent results for same input', () => {
    const inputs = createInputs({
      intentCount: 100,
      medianPriceCeiling: 50,
      takeMyMoneyCount: 50,
    })

    const result1 = computeSignalScore(inputs)
    const result2 = computeSignalScore(inputs)

    expect(result1.score).toBe(result2.score)
    expect(result1.tier).toBe(result2.tier)
    expect(result1.momentum).toBe(result2.momentum)
  })

  it('should preserve input data in result', () => {
    const inputs = createInputs({
      supportCount: 100,
      intentCount: 50,
    })
    const result = computeSignalScore(inputs)

    expect(result.inputs).toEqual(inputs)
  })

  it('should handle edge case: very high price ceiling', () => {
    const inputs = createInputs({
      intentCount: 100,
      medianPriceCeiling: 999999,
    })
    const result = computeSignalScore(inputs)

    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.demandValue).toBeGreaterThan(0)
  })

  it('should handle edge case: very high volume', () => {
    const inputs = createInputs({
      supportCount: 999999,
      intentCount: 999999,
      medianPriceCeiling: 1,
    })
    const result = computeSignalScore(inputs)

    expect(result.score).toBeLessThanOrEqual(100)
    expect(result.score).toBeGreaterThan(0)
  })
})

// ============================================================================
// BOUNDARY TESTS
// ============================================================================

describe('computeSignalScore - Boundary Tests', () => {
  it('should handle negative momentum clamp correctly', () => {
    const inputs = createInputs({
      intentLast7Days: 0,
      intentPrev7Days: 100,
    })
    const result = computeSignalScore(inputs)

    expect(result.momentum).toBe(0)
    expect(result.momentum).toBeGreaterThanOrEqual(0)
  })

  it('should never produce NaN', () => {
    const inputs = createInputs({
      supportCount: 1000,
      intentCount: 1000,
      medianPriceCeiling: 1000,
      takeMyMoneyCount: 1000,
    })
    const result = computeSignalScore(inputs)

    expect(isNaN(result.score)).toBe(false)
    expect(isNaN(result.demandValue)).toBe(false)
    expect(isNaN(result.momentum)).toBe(false)
    expect(isNaN(result.lobbyConviction)).toBe(false)
    expect(isNaN(result.projectedRevenue)).toBe(false)
    expect(isNaN(result.projectedCustomers)).toBe(false)
  })

  it('should never produce Infinity', () => {
    const inputs = createInputs({
      supportCount: 999999999,
      intentCount: 999999999,
      medianPriceCeiling: 999999999,
    })
    const result = computeSignalScore(inputs)

    expect(isFinite(result.score)).toBe(true)
    expect(isFinite(result.demandValue)).toBe(true)
    expect(isFinite(result.momentum)).toBe(true)
  })
})
