'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SupporterDistribution {
  region: string
  count: number
  percentage: number
}

interface SupporterMapProps {
  campaignId: string
}

const REGION_FLAGS: Record<string, string> = {
  'United States': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Japan': '🇯🇵',
  'India': '🇮🇳',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'South Korea': '🇰🇷',
  'China': '🇨🇳',
  'Singapore': '🇸🇬',
  'UAE': '🇦🇪',
  'Other': '🌍',
}

export const SupporterMap: React.FC<SupporterMapProps> = ({ campaignId }) => {
  const [data, setData] = useState<SupporterDistribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/campaigns/${campaignId}/supporter-distribution`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch supporter distribution')
        }

        const result = await response.json()
        setData(result.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [campaignId])

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Supporter Distribution by Region</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold">Supporter Distribution by Region</h3>
        <p className="text-sm text-destructive mt-2">{error}</p>
      </Card>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-6">Supporter Distribution by Region</h3>
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No supporter data available</p>
        ) : (
          data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100
            const flag = REGION_FLAGS[item.region] || '🌍'

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{flag}</span>
                    <span className="font-medium text-sm">{item.region}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-300',
                      'bg-gradient-to-r from-blue-500 to-purple-500'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
