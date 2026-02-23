'use client'

import React, { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/shared'
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Users,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const productCategories = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Toys & Games',
  'Beauty & Personal Care',
  'Books & Media',
  'Pet Supplies',
  'Health & Wellness',
  'Office & School Supplies',
  'Automotive',
  'Other',
]

interface CalculationResult {
  yourCost: number
  totalCommunityValue: number
  savingsVsRetail: number
  savingsPercentage: number
}

export default function CostCalculatorPage() {
  const [category, setCategory] = useState<string>('Electronics')
  const [retailPrice, setRetailPrice] = useState<string>('99.99')
  const [premiumPercentage, setPremiumPercentage] = useState<string>('15')
  const [quantity, setQuantity] = useState<string>('1')
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Calculate costs client-side
  const calculation = useMemo<CalculationResult>(() => {
    const retail = parseFloat(retailPrice) || 0
    const premium = parseFloat(premiumPercentage) || 0
    const qty = parseInt(quantity) || 1

    // Base calculation: your cost is retail minus the premium you'd pay
    const premiumAmount = (retail * premium) / 100
    const yourCost = retail - premiumAmount

    // Total community value: assume average community size based on category
    // This is a simple multiplier (in real app, could use actual campaign data)
    const avgCommunitySize = Math.ceil(qty * 50) // Rough estimate
    const totalCommunityValue = yourCost * avgCommunitySize

    // Savings vs retail
    const savingsVsRetail = premiumAmount * qty
    const savingsPercentage =
      retail > 0 ? ((premiumAmount / retail) * 100).toFixed(1) : '0'

    return {
      yourCost,
      totalCommunityValue,
      savingsVsRetail,
      savingsPercentage: parseFloat(savingsPercentage),
    }
  }, [retailPrice, premiumPercentage, quantity])

  const handleCopyResults = () => {
    const text = `Cost Calculator Results:
Your Estimated Cost: $${calculation.yourCost.toFixed(2)}
Total Community Demand Value: $${calculation.totalCommunityValue.toFixed(2)}
Your Savings vs Retail: $${calculation.savingsVsRetail.toFixed(2)} (${calculation.savingsPercentage}%)

See the full breakdown on ProductLobby`
    navigator.clipboard.writeText(text)
  }

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Calculator className="w-6 h-6 text-violet-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Product Cost Calculator
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Estimate what you'd pay for a product variant and see the community
            demand value
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  {productCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Retail Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Estimated Retail Price
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="99.99"
                  />
                </div>
              </div>

              {/* Premium Willingness */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Willingness to Pay Premium
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={premiumPercentage}
                    onChange={(e) => setPremiumPercentage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="15"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                    %
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  How much above retail would you pay (0-100%)
                </p>
              </div>

              {/* Quantity Interested */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Quantity Interested
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="1"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex-1 px-4 py-2 rounded-lg border border-violet-300 text-violet-700 font-semibold hover:bg-violet-50 transition-colors"
                >
                  {showBreakdown ? 'Hide Breakdown' : 'Show Breakdown'}
                </button>
                <button
                  onClick={handleCopyResults}
                  className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
                >
                  Share Results
                </button>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            {/* Your Estimated Cost */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border border-violet-200 p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-violet-700 font-semibold mb-1">
                    Your Estimated Cost
                  </p>
                  <p className="text-4xl font-bold text-violet-900">
                    ${calculation.yourCost.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-violet-200 rounded-lg">
                  <DollarSign className="w-6 h-6 text-violet-700" />
                </div>
              </div>
              <p className="text-xs text-violet-600">
                Per unit at {premiumPercentage}% premium
              </p>
            </div>

            {/* Savings vs Retail */}
            <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-xl border border-lime-200 p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-lime-700 font-semibold mb-1">
                    Your Savings vs Retail
                  </p>
                  <p className="text-3xl font-bold text-lime-900">
                    ${calculation.savingsVsRetail.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-lime-200 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-lime-700" />
                </div>
              </div>
              <p className="text-xs text-lime-600">
                {calculation.savingsPercentage}% below retail price
              </p>
            </div>

            {/* Total Community Value */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm text-blue-700 font-semibold mb-1">
                    Total Community Demand Value
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${calculation.totalCommunityValue.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <p className="text-xs text-blue-600">
                Estimated combined community value
              </p>
            </div>

            {/* Breakdown */}
            {showBreakdown && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  How This Works
                </h3>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex gap-2">
                    <span className="text-violet-600 font-bold">•</span>
                    <span>
                      <strong>Your Cost:</strong> Retail price minus your premium
                      willingness
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-600 font-bold">•</span>
                    <span>
                      <strong>Savings:</strong> The discount you'd receive vs. full
                      retail
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-600 font-bold">•</span>
                    <span>
                      <strong>Community Value:</strong> Your cost multiplied by estimated
                      community size
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-600 font-bold">•</span>
                    <span>
                      This helps creators understand total market demand and pricing
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
          <p className="text-sm text-blue-800">
            Use this calculator to estimate costs across different product variants.
            When you find a campaign you love, you can pledge your actual willingness
            to pay and help creators see real demand signals.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
