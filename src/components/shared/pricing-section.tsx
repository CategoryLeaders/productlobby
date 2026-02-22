'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Edit2, Check, X } from 'lucide-react'

interface PricingSectionProps {
  campaignId: string
  isCreator: boolean
  suggestedPrice?: number | null
  priceRangeMin?: number | null
  priceRangeMax?: number | null
  pricingModel?: string | null
}

export function PricingSection({
  campaignId,
  isCreator,
  suggestedPrice,
  priceRangeMin,
  priceRangeMax,
  pricingModel,
}: PricingSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    suggestedPrice: suggestedPrice?.toString() || '',
    priceRangeMin: priceRangeMin?.toString() || '',
    priceRangeMax: priceRangeMax?.toString() || '',
    pricingModel: pricingModel || 'ONE_TIME',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')
    setSaving(true)

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/pricing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestedPrice: formData.suggestedPrice ? parseFloat(formData.suggestedPrice) : null,
          priceRangeMin: formData.priceRangeMin ? parseFloat(formData.priceRangeMin) : null,
          priceRangeMax: formData.priceRangeMax ? parseFloat(formData.priceRangeMax) : null,
          pricingModel: formData.pricingModel || null,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to save pricing')
        return
      }

      setIsEditing(false)
      window.location.reload()
    } catch (err) {
      setError('Failed to save pricing')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const getPricingModelLabel = (model: string) => {
    const labels: Record<string, string> = {
      ONE_TIME: 'One-Time Purchase',
      SUBSCRIPTION: 'Subscription',
      FREEMIUM: 'Freemium',
      PAY_WHAT_YOU_WANT: 'Pay What You Want',
    }
    return labels[model] || model
  }

  const hasPricing = suggestedPrice || priceRangeMin || priceRangeMax || pricingModel

  return (
    <Card className="p-6 bg-gradient-to-br from-violet-50 to-lime-50 border-violet-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pricing Expectations</h2>
        {isCreator && !isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            size="sm"
            className="border-violet-300"
          >
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Suggested Price (GBP)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 29.99"
              value={formData.suggestedPrice}
              onChange={(e) =>
                setFormData({ ...formData, suggestedPrice: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Range Min (GBP)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 19.99"
                value={formData.priceRangeMin}
                onChange={(e) =>
                  setFormData({ ...formData, priceRangeMin: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Range Max (GBP)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 49.99"
                value={formData.priceRangeMax}
                onChange={(e) =>
                  setFormData({ ...formData, priceRangeMax: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Pricing Model
            </label>
            <Select
              value={formData.pricingModel}
              onValueChange={(value) =>
                setFormData({ ...formData, pricingModel: value })
              }
            >
              <option value="ONE_TIME">One-Time Purchase</option>
              <option value="SUBSCRIPTION">Subscription</option>
              <option value="FREEMIUM">Freemium</option>
              <option value="PAY_WHAT_YOU_WANT">Pay What You Want</option>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              <Check className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : hasPricing ? (
        <div className="space-y-4">
          {suggestedPrice && (
            <div className="bg-white rounded-lg p-4 border border-violet-100">
              <p className="text-sm text-gray-600 mb-1">Suggested Price</p>
              <p className="text-3xl font-bold text-violet-600">
                £{parseFloat(suggestedPrice.toString()).toFixed(2)}
              </p>
            </div>
          )}

          {(priceRangeMin || priceRangeMax) && (
            <div className="bg-white rounded-lg p-4 border border-lime-100">
              <p className="text-sm text-gray-600 mb-3">Price Range</p>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Min</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {priceRangeMin ? `£${parseFloat(priceRangeMin.toString()).toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="flex-1 h-2 bg-gradient-to-r from-violet-200 to-lime-200 rounded-full" />
                <div>
                  <p className="text-xs text-gray-500">Max</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {priceRangeMax ? `£${parseFloat(priceRangeMax.toString()).toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {pricingModel && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Pricing Model:</span>
              <Badge className="bg-lime-100 text-lime-800">
                {getPricingModelLabel(pricingModel)}
              </Badge>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-600 mb-4">
            What would you like to charge for this product?
          </p>
          {isCreator && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Set Pricing
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
