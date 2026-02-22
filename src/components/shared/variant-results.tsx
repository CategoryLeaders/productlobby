'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface OptionDistribution {
  count: number
  percentage: number
}

interface VariantResult {
  id: string
  name: string
  fieldType: string
  totalResponses: number
  distribution: Record<string, OptionDistribution>
  mostPopularOption: string | null
}

interface VariantResultsProps {
  campaignId: string
}

export function VariantResults({ campaignId }: VariantResultsProps) {
  const [results, setResults] = useState<VariantResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalRespondents, setTotalRespondents] = useState(0)

  useEffect(() => {
    fetchResults()
  }, [campaignId])

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/variants/results`
      )
      if (!response.ok) throw new Error('Failed to fetch results')

      const data = await response.json()
      const variantResults = data.data.results || []
      setResults(variantResults)

      // Calculate the maximum total respondents across all variants
      const maxRespondents = Math.max(
        0,
        ...variantResults.map((r: VariantResult) => r.totalResponses)
      )
      setTotalRespondents(maxRespondents)
    } catch (error) {
      console.error('Error fetching variant results:', error)
      toast.error('Failed to load variant results')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variant Preferences</CardTitle>
          <CardDescription>
            Aggregated supporter preferences for product variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">Loading results...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Variant Preferences</CardTitle>
          <CardDescription>
            Aggregated supporter preferences for product variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No variant data available yet. Supporters haven't provided preferences.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variant Preferences</CardTitle>
        <CardDescription>
          Aggregated supporter preferences for product variants
          {totalRespondents > 0 && (
            <span className="ml-2 text-xs font-semibold">
              ({totalRespondents} respondents)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {results.map((variant) => (
            <div key={variant.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">{variant.name}</h3>
                <span className="text-sm text-muted-foreground">
                  {variant.totalResponses} response{variant.totalResponses !== 1 ? 's' : ''}
                </span>
              </div>

              {['SELECT', 'MULTI_SELECT'].includes(variant.fieldType) ? (
                <div className="space-y-3">
                  {Object.entries(variant.distribution)
                    .sort(([, a], [, b]) => b.count - a.count)
                    .map(([option, data]) => {
                      const isPopular = option === variant.mostPopularOption
                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{option}</span>
                              {isPopular && (
                                <Badge
                                  className="bg-lime-500 text-white hover:bg-lime-600"
                                  variant="default"
                                >
                                  Most Popular
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {data.count} ({data.percentage}%)
                            </span>
                          </div>

                          {/* Bar Chart */}
                          <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isPopular
                                  ? 'bg-lime-500'
                                  : 'bg-violet-600'
                              }`}
                              style={{
                                width: `${data.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {variant.fieldType === 'TEXT'
                      ? 'Text responses are not displayed in aggregate view'
                      : variant.fieldType === 'NUMBER'
                        ? 'Numeric responses are not displayed in aggregate view'
                        : 'Range responses are not displayed in aggregate view'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
