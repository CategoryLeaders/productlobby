'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, BarChart3, Beaker, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface VariantMetrics {
  name: string
  description: string
  impressions: number
  conversions: number
}

interface ABTest {
  id: string
  campaignId: string
  testName: string
  variantA: VariantMetrics
  variantB: VariantMetrics
  status: 'draft' | 'running' | 'completed'
  winner?: 'A' | 'B'
  confidence: number
  createdAt: string
  updatedAt: string
}

interface ABTestingFrameworkProps {
  campaignId: string
}

export function ABTestingFramework({ campaignId }: ABTestingFrameworkProps) {
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTestName, setNewTestName] = useState('')
  const [newVariantAName, setNewVariantAName] = useState('')
  const [newVariantADesc, setNewVariantADesc] = useState('')
  const [newVariantBName, setNewVariantBName] = useState('')
  const [newVariantBDesc, setNewVariantBDesc] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTests()
  }, [campaignId])

  const fetchTests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/ab-testing`)
      if (!response.ok) throw new Error('Failed to fetch tests')
      const data = await response.json()
      setTests(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createTest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTestName || !newVariantAName || !newVariantBName) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/campaigns/${campaignId}/ab-testing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: newTestName,
          variantA: {
            name: newVariantAName,
            description: newVariantADesc,
          },
          variantB: {
            name: newVariantBName,
            description: newVariantBDesc,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to create test')
      
      setNewTestName('')
      setNewVariantAName('')
      setNewVariantADesc('')
      setNewVariantBName('')
      setNewVariantBDesc('')
      setShowCreateForm(false)
      await fetchTests()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getConversionRate = (variant: VariantMetrics) => {
    return variant.impressions > 0 
      ? ((variant.conversions / variant.impressions) * 100).toFixed(2)
      : '0.00'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-violet-50 to-lime-50 rounded-lg border border-violet-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          <p className="text-gray-600">Loading A/B tests...</p>
        </div>
      </div>
    )
  }

  const totalTests = tests.length
  const activeTests = tests.filter(t => t.status === 'running').length
  const avgConfidence = totalTests > 0
    ? (tests.reduce((sum, t) => sum + t.confidence, 0) / totalTests).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-lime-500 rounded-lg">
            <Beaker className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Testing Framework</h2>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-gradient-to-r from-violet-600 to-lime-500 hover:from-violet-700 hover:to-lime-600 text-white"
        >
          <Beaker className="w-4 h-4 mr-2" />
          New Test
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 border border-violet-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-violet-900">{totalTests}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-violet-500 opacity-50" />
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-lime-50 to-lime-100 border border-lime-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Tests</p>
              <p className="text-2xl font-bold text-lime-900">{activeTests}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-lime-500 opacity-50" />
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Confidence</p>
              <p className="text-2xl font-bold text-amber-900">{avgConfidence}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-amber-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <form onSubmit={createTest} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Test Name</label>
            <input
              type="text"
              value={newTestName}
              onChange={(e) => setNewTestName(e.target.value)}
              placeholder="e.g., Button Color Test"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Variant A</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newVariantAName}
                    onChange={(e) => setNewVariantAName(e.target.value)}
                    placeholder="e.g., Blue Button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newVariantADesc}
                    onChange={(e) => setNewVariantADesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Variant B</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newVariantBName}
                    onChange={(e) => setNewVariantBName(e.target.value)}
                    placeholder="e.g., Green Button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newVariantBDesc}
                    onChange={(e) => setNewVariantBDesc(e.target.value)}
                    placeholder="Optional description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              onClick={() => setShowCreateForm(false)}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-lime-500 hover:from-violet-700 hover:to-lime-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Test
            </Button>
          </div>
        </form>
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
            <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No A/B tests yet. Create one to get started!</p>
          </div>
        ) : (
          tests.map((test) => {
            const rateA = getConversionRate(test.variantA)
            const rateB = getConversionRate(test.variantB)
            const rateANum = parseFloat(rateA)
            const rateBNum = parseFloat(rateB)
            const isABetter = rateANum > rateBNum

            return (
              <div
                key={test.id}
                className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
                    <p className="text-sm text-gray-600">
                      Status:{' '}
                      <span
                        className={cn(
                          'font-medium',
                          test.status === 'draft' && 'text-gray-600',
                          test.status === 'running' && 'text-lime-600',
                          test.status === 'completed' && 'text-violet-600'
                        )}
                      >
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-700">Confidence</p>
                    <p className="text-2xl font-bold text-violet-600">{test.confidence}%</p>
                  </div>
                </div>

                {/* Variants Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Variant A */}
                  <div
                    className={cn(
                      'p-4 border-2 rounded-lg transition-colors',
                      isABetter ? 'border-violet-300 bg-violet-50' : 'border-gray-300 bg-white'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Variant A</h4>
                        <p className="text-sm text-gray-600">{test.variantA.name}</p>
                      </div>
                      {test.winner === 'A' && (
                        <CheckCircle className="w-5 h-5 text-violet-600" />
                      )}
                    </div>
                    {test.variantA.description && (
                      <p className="text-xs text-gray-600 mb-3">{test.variantA.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impressions:</span>
                        <span className="font-semibold text-gray-900">
                          {test.variantA.impressions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversions:</span>
                        <span className="font-semibold text-gray-900">
                          {test.variantA.conversions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="text-gray-600">Conversion Rate:</span>
                        <span className="font-bold text-violet-600">{rateA}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Variant B */}
                  <div
                    className={cn(
                      'p-4 border-2 rounded-lg transition-colors',
                      !isABetter && rateANum !== rateBNum
                        ? 'border-lime-300 bg-lime-50'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">Variant B</h4>
                        <p className="text-sm text-gray-600">{test.variantB.name}</p>
                      </div>
                      {test.winner === 'B' && (
                        <CheckCircle className="w-5 h-5 text-lime-600" />
                      )}
                    </div>
                    {test.variantB.description && (
                      <p className="text-xs text-gray-600 mb-3">{test.variantB.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Impressions:</span>
                        <span className="font-semibold text-gray-900">
                          {test.variantB.impressions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conversions:</span>
                        <span className="font-semibold text-gray-900">
                          {test.variantB.conversions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-300">
                        <span className="text-gray-600">Conversion Rate:</span>
                        <span className="font-bold text-lime-600">{rateB}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                  {test.status === 'draft' && (
                    <Button className="flex-1 bg-gradient-to-r from-violet-600 to-lime-500 hover:from-violet-700 hover:to-lime-600 text-white">
                      Start Test
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
