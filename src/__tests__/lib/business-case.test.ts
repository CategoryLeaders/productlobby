import { calculateBusinessCase, calculateMargin } from '@/lib/business-case'
import { estimateCosts, calculateBreakEvenUnits, projectProfitability } from '@/lib/cost-estimation'

describe('Business Case Calculator', () => {
  describe('calculateBusinessCase', () => {
    it('should calculate business case with valid campaign data', () => {
      const result = calculateBusinessCase({
        neatIdeaCount: 50,
        probablyBuyCount: 30,
        takeMyMoneyCount: 20,
        supportCount: 10,
        intentCount: 15,
        intentVerifiedCount: 8,
        priceCeilings: [
          25, 30, 35, 40, 45, 50, 50, 55, 60, 60, 65, 70, 75, 80, 90,
        ],
        signalScore: 65,
        completenessScore: 75,
      })

      expect(result).toHaveProperty('totalDemandSignals')
      expect(result).toHaveProperty('weightedDemand')
      expect(result).toHaveProperty('conservative')
      expect(result).toHaveProperty('moderate')
      expect(result).toHaveProperty('optimistic')
      expect(result).toHaveProperty('conversionRates')
      expect(result).toHaveProperty('confidenceLevel')
      expect(result).toHaveProperty('confidenceScore')

      // Verify scenarios increase in customers
      expect(result.optimistic.customers).toBeGreaterThan(result.moderate.customers)
      expect(result.moderate.customers).toBeGreaterThan(result.conservative.customers)

      // Verify revenue scales with customers
      expect(result.moderate.revenue).toBeGreaterThan(0)
    })

    it('should return low confidence with minimal data', () => {
      const result = calculateBusinessCase({
        neatIdeaCount: 5,
        probablyBuyCount: 2,
        takeMyMoneyCount: 1,
        supportCount: 0,
        intentCount: 2,
        intentVerifiedCount: 0,
        priceCeilings: [],
        signalScore: 20,
        completenessScore: 30,
      })

      expect(result.confidenceLevel).toBe('low')
      expect(result.confidenceScore).toBeLessThan(40)
    })

    it('should return high confidence with abundant data', () => {
      const priceCeilings = Array.from({ length: 100 }, (_, i) => 30 + (i % 50))

      const result = calculateBusinessCase({
        neatIdeaCount: 200,
        probablyBuyCount: 150,
        takeMyMoneyCount: 100,
        supportCount: 50,
        intentCount: 200,
        intentVerifiedCount: 100,
        priceCeilings,
        signalScore: 85,
        completenessScore: 95,
      })

      expect(result.confidenceLevel).toBe('very_high')
      expect(result.confidenceScore).toBeGreaterThan(70)
    })

    it('should calculate correct market sizing', () => {
      const result = calculateBusinessCase({
        neatIdeaCount: 40,
        probablyBuyCount: 30,
        takeMyMoneyCount: 20,
        supportCount: 10,
        intentCount: 10,
        intentVerifiedCount: 5,
        priceCeilings: [50, 50, 50],
        signalScore: 50,
        completenessScore: 50,
      })

      expect(result.totalDemandSignals).toBe(40 + 30 + 20 + 10 + 10) // 110
      expect(result.weightedDemand).toBe(
        40 * 1 + // NEAT_IDEA = 1x
        30 * 3 + // PROBABLY_BUY = 3x
        20 * 5 // TAKE_MY_MONEY = 5x
      ) // 190
    })

    it('should suggest price point as 85% of median', () => {
      const result = calculateBusinessCase({
        neatIdeaCount: 10,
        probablyBuyCount: 10,
        takeMyMoneyCount: 10,
        supportCount: 5,
        intentCount: 5,
        intentVerifiedCount: 2,
        priceCeilings: [100], // Median = 100
        signalScore: 50,
        completenessScore: 50,
      })

      expect(result.suggestedPricePoint).toBe(85) // 100 * 0.85 = 85
    })

    it('should handle empty price ceiling data', () => {
      const result = calculateBusinessCase({
        neatIdeaCount: 10,
        probablyBuyCount: 10,
        takeMyMoneyCount: 10,
        supportCount: 5,
        intentCount: 5,
        intentVerifiedCount: 2,
        priceCeilings: [],
        signalScore: 50,
        completenessScore: 50,
      })

      expect(result.avgPriceCeiling).toBe(0)
      expect(result.medianPriceCeiling).toBe(0)
      expect(result.suggestedPricePoint).toBe(0)
    })

    it('should apply correct conversion rates by scenario', () => {
      const data = {
        neatIdeaCount: 100,
        probablyBuyCount: 100,
        takeMyMoneyCount: 100,
        supportCount: 0,
        intentCount: 0,
        intentVerifiedCount: 0,
        priceCeilings: [50, 50, 50],
        signalScore: 50,
        completenessScore: 50,
      }

      const result = calculateBusinessCase(data)

      // Conservative: 2% + 15% + 45% = 62 customers
      expect(result.conservative.customers).toBe(
        Math.round(100 * 0.02 + 100 * 0.15 + 100 * 0.45)
      )

      // Moderate: 5% + 25% + 65% = 95 customers
      expect(result.moderate.customers).toBe(
        Math.round(100 * 0.05 + 100 * 0.25 + 100 * 0.65)
      )

      // Optimistic: 10% + 40% + 80% = 130 customers
      expect(result.optimistic.customers).toBe(
        Math.round(100 * 0.1 + 100 * 0.4 + 100 * 0.8)
      )
    })
  })

  describe('calculateMargin', () => {
    it('should calculate profit margin correctly', () => {
      const margin = calculateMargin(1000, 35, 20)
      expect(margin).toBeGreaterThan(0)
    })

    it('should return 0 for zero revenue', () => {
      const margin = calculateMargin(0, 35, 20)
      expect(margin).toBe(0)
    })
  })
})

describe('Cost Estimation', () => {
  describe('estimateCosts', () => {
    it('should calculate costs and profitability', () => {
      const result = estimateCosts({
        grossRevenue: 10000,
        productionCostPerUnit: 10,
        unitsSold: 100,
        shippingCostPerUnit: 5,
        marketingBudget: 1000,
        platformFee: 0.05,
      })

      expect(result).toHaveProperty('grossRevenue', 10000)
      expect(result).toHaveProperty('totalProductionCost', 1000)
      expect(result).toHaveProperty('totalShippingCost', 500)
      expect(result).toHaveProperty('totalMarketingCost', 1000)
      expect(result).toHaveProperty('totalPlatformFee', 500)
      expect(result).toHaveProperty('netProfit')
      expect(result).toHaveProperty('profitMargin')
      expect(result).toHaveProperty('roi')
    })

    it('should default platform fee to 5%', () => {
      const result = estimateCosts({
        grossRevenue: 1000,
        productionCostPerUnit: 5,
        unitsSold: 100,
      })

      expect(result.totalPlatformFee).toBe(50) // 5% of 1000
    })

    it('should calculate breakdown by category', () => {
      const result = estimateCosts({
        grossRevenue: 10000,
        productionCostPerUnit: 10,
        unitsSold: 100,
        shippingCostPerUnit: 5,
        marketingBudget: 1000,
        platformFee: 0.05,
      })

      const total =
        result.breakdownByCategory.production +
        result.breakdownByCategory.shipping +
        result.breakdownByCategory.marketing +
        result.breakdownByCategory.platformFee

      expect(total).toBe(100) // percentages should sum to 100
    })
  })

  describe('calculateBreakEvenUnits', () => {
    it('should calculate break-even units', () => {
      const units = calculateBreakEvenUnits(50, 30, 1000)
      expect(units).toBe(50) // (1000 / (50-30)) = 50
    })

    it('should return Infinity when price <= cost', () => {
      const units = calculateBreakEvenUnits(20, 30, 1000)
      expect(units).toBe(Infinity)
    })

    it('should account for fixed costs', () => {
      const unitsWith1000Fixed = calculateBreakEvenUnits(50, 30, 1000)
      const unitsWithout = calculateBreakEvenUnits(50, 30, 0)

      expect(unitsWith1000Fixed).toBeGreaterThan(unitsWithout)
    })
  })

  describe('projectProfitability', () => {
    it('should generate profitability projections across price range', () => {
      const projections = projectProfitability(
        10, // cost per unit
        { min: 20, max: 100 }, // price range
        100 // units sold
      )

      expect(projections).toHaveLength(11) // 10 steps + base
      expect(projections[0].price).toBe(20)
      expect(projections[10].price).toBe(100)

      // Higher prices should have higher profit
      expect(projections[10].profit).toBeGreaterThan(projections[0].profit)
    })

    it('should calculate margins for each price point', () => {
      const projections = projectProfitability(
        10, // cost per unit
        { min: 20, max: 100 },
        100
      )

      projections.forEach(p => {
        expect(p).toHaveProperty('price')
        expect(p).toHaveProperty('margin')
        expect(p).toHaveProperty('profit')
      })
    })
  })
})
