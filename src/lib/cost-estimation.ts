/**
 * Cost Estimation Library
 *
 * Calculates margins and ROI based on production and operating costs.
 * Used to show brands their profitability scenarios.
 */

export interface CostEstimationParams {
  grossRevenue: number
  productionCostPerUnit: number
  unitsSold: number
  shippingCostPerUnit?: number
  marketingBudget?: number
  platformFee?: number // e.g., 0.05 for 5%
}

export interface CostEstimationResult {
  grossRevenue: number
  totalProductionCost: number
  totalShippingCost: number
  totalMarketingCost: number
  totalPlatformFee: number
  totalCosts: number
  netProfit: number
  profitMargin: number // percentage
  roi: number // percentage
  breakdownByCategory: {
    production: number
    shipping: number
    marketing: number
    platformFee: number
  }
}

/**
 * Estimate costs and profitability
 */
export function estimateCosts(params: CostEstimationParams): CostEstimationResult {
  const {
    grossRevenue,
    productionCostPerUnit,
    unitsSold,
    shippingCostPerUnit = 0,
    marketingBudget = 0,
    platformFee = 0.05, // Default 5%
  } = params

  // Calculate individual cost categories
  const totalProductionCost = productionCostPerUnit * unitsSold
  const totalShippingCost = shippingCostPerUnit * unitsSold
  const platformFeeAmount = Math.round(grossRevenue * platformFee * 100) / 100
  const totalMarketingCost = marketingBudget

  // Total costs
  const totalCosts =
    totalProductionCost + totalShippingCost + platformFeeAmount + totalMarketingCost

  // Net profit
  const netProfit = Math.round((grossRevenue - totalCosts) * 100) / 100

  // Profit margin (%)
  const profitMargin =
    grossRevenue > 0 ? Math.round(((netProfit / grossRevenue) * 100) * 100) / 100 : 0

  // ROI (% return on invested costs)
  const roi =
    totalCosts > 0 ? Math.round(((netProfit / totalCosts) * 100) * 100) / 100 : 0

  return {
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    totalProductionCost: Math.round(totalProductionCost * 100) / 100,
    totalShippingCost: Math.round(totalShippingCost * 100) / 100,
    totalMarketingCost: Math.round(totalMarketingCost * 100) / 100,
    totalPlatformFee: Math.round(platformFeeAmount * 100) / 100,
    totalCosts: Math.round(totalCosts * 100) / 100,
    netProfit,
    profitMargin,
    roi,
    breakdownByCategory: {
      production: Math.round((totalProductionCost / totalCosts) * 100),
      shipping: Math.round((totalShippingCost / totalCosts) * 100),
      marketing: Math.round((totalMarketingCost / totalCosts) * 100),
      platformFee: Math.round((platformFeeAmount / totalCosts) * 100),
    },
  }
}

/**
 * Quick margin calculator (useful for simple scenarios)
 */
export function calculateMargin(
  grossRevenue: number,
  totalCosts: number
): number {
  if (grossRevenue === 0) return 0
  return Math.round(((grossRevenue - totalCosts) / grossRevenue) * 100 * 100) / 100
}

/**
 * Calculate break-even units needed
 */
export function calculateBreakEvenUnits(
  pricePerUnit: number,
  costPerUnit: number,
  fixedCosts: number = 0
): number {
  const contributionMargin = pricePerUnit - costPerUnit
  if (contributionMargin <= 0) {
    return Infinity // Cannot break even if cost >= price
  }
  return Math.ceil(fixedCosts / contributionMargin)
}

/**
 * Project profitability at different price points
 */
export function projectProfitability(
  baseCostPerUnit: number,
  priceRange: { min: number; max: number },
  expectedUnitsSold: number,
  fixedCosts: number = 0
): Array<{ price: number; margin: number; profit: number }> {
  const step = (priceRange.max - priceRange.min) / 10 // 10 price points
  const projections = []

  for (let i = 0; i <= 10; i++) {
    const price = priceRange.min + step * i
    const revenue = price * expectedUnitsSold
    const totalCost = baseCostPerUnit * expectedUnitsSold + fixedCosts
    const profit = revenue - totalCost
    const margin = revenue > 0 ? ((profit / revenue) * 100) : 0

    projections.push({
      price: Math.round(price * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      profit: Math.round(profit * 100) / 100,
    })
  }

  return projections
}
