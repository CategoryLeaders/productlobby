'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Zap,
  AlertCircle,
  Loader2,
  Check,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================================
// TYPES
// ============================================================================

interface PricingTier {
  id: string
  name: string
  description: string
  basePrice: number
  currentPrice: number
  currency: string
  discount: number
  features: string[]
  supporters: number
  capacity?: number
  isPopular: boolean
}

interface PricingData {
  tiers: PricingTier[]
  totalRevenue: number
  projectedRevenue: number
}

interface DynamicPricingProps {
  campaignId: string
  className?: string
}

interface PricingState {
  data: PricingData | null
  loading: boolean
  error: string | null
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DynamicPricing({ campaignId, className }: DynamicPricingProps) {
  const [state, setState] = useState<PricingState>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        const res = await fetch(
          `/api/campaigns/${campaignId}/dynamic-pricing`
        )
        if (!res.ok) throw new Error('Failed to fetch pricing data')
        const data = await res.json()
        setState({
          data: data.pricingData,
          loading: false,
          error: null,
        })
      } catch (err) {
        setState({
          data: null,
          loading: false,
          error:
            err instanceof Error ? err.message : 'Failed to fetch pricing data',
        })
      }
    }

    fetchPricingData()
  }, [campaignId])

  if (state.loading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          <h2 className="text-2xl font-bold">Dynamic Pricing</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
        </div>
      </div>
    )
  }

  if (!state.data) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          <h2 className="text-2xl font-bold">Dynamic Pricing</h2>
        </div>
        {state.error && (
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{state.error}</p>
          </div>
        )}
      </div>
    )
  }

  const { tiers, totalRevenue, projectedRevenue } = state.data

  return (
    <div className={cn('space-y-8', className)}>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-600" />
        <h2 className="text-2xl font-bold">Dynamic Pricing</h2>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg p-6 border border-violet-200">
          <p className="text-sm text-violet-700 font-medium mb-1">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-violet-900">
            £{totalRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-gradient-to-br from-lime-50 to-lime-100 rounded-lg p-6 border border-lime-200">
          <p className="text-sm text-lime-700 font-medium mb-1">
            Projected Revenue
          </p>
          <p className="text-3xl font-bold text-lime-900">
            £{projectedRevenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const discountPercent = Math.round(
            ((tier.basePrice - tier.currentPrice) / tier.basePrice) * 100
          )

          return (
            <div
              key={tier.id}
              className={cn(
                'rounded-lg border-2 p-6 relative transition-all',
                tier.isPopular
                  ? 'border-lime-400 bg-gradient-to-br from-lime-50 to-white shadow-lg'
                  : 'border-slate-200 bg-white'
              )}
            >
              {tier.isPopular && (
                <div className="absolute -top-3 right-4 flex items-center gap-1 bg-lime-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Star className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {tier.name}
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  {tier.description}
                </p>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">
                      £{tier.currentPrice.toFixed(2)}
                    </span>
                    {discountPercent > 0 && (
                      <>
                        <span className="text-lg text-slate-400 line-through">
                          £{tier.basePrice.toFixed(2)}
                        </span>
                        <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs font-semibold">
                          Save {discountPercent}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Capacity */}
              {tier.capacity && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium">Capacity</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-slate-900">
                      {tier.supporters} / {tier.capacity}
                    </span>
                    <div className="flex-1 ml-2 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-lime-500 h-2 rounded-full"
                        style={{
                          width: `${(tier.supporters / tier.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Supporters */}
              <div className="mb-6 p-3 bg-violet-50 rounded-lg">
                <p className="text-xs text-violet-700 font-medium">
                  Current Supporters
                </p>
                <p className="text-2xl font-bold text-violet-900 mt-1">
                  {tier.supporters.toLocaleString()}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-lime-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  'w-full font-semibold',
                  tier.isPopular
                    ? 'bg-lime-600 hover:bg-lime-700 text-white'
                    : 'bg-violet-600 hover:bg-violet-700 text-white'
                )}
              >
                <Zap className="w-4 h-4 mr-2" />
                Support at {tier.name}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
