'use client'

import { useEffect, useState } from 'react'
import { Loader2, Globe, MapPin, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RegionData {
  name: string
  country: string
  supporters: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

interface GeographicData {
  totalCountries: number
  totalCities: number
  topRegions: RegionData[]
  reachScore: number
}

interface GeographicReachProps {
  campaignId: string
}

export function GeographicReach({ campaignId }: GeographicReachProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<GeographicData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGeographicData()
  }, [campaignId])

  const fetchGeographicData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/geographic-reach`)
      if (!response.ok) throw new Error('Failed to fetch geographic data')
      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {error || 'Failed to load geographic data'}
      </div>
    )
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-lime-500" />
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />
      case 'stable':
        return <div className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-violet-500" />
            Geographic Reach
          </h2>
          <p className="text-sm text-gray-600 mt-1">Campaign reach across regions and countries</p>
        </div>
        <Button
          onClick={fetchGeographicData}
          variant="outline"
          size="sm"
          className="text-violet-600 border-violet-200 hover:bg-violet-50"
        >
          Refresh
        </Button>
      </div>

      {/* Reach Score Gauge */}
      <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Reach Score</h3>
          <div className="text-3xl font-bold text-violet-600">{data.reachScore}%</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-violet-500 to-lime-500 h-2 rounded-full transition-all"
            style={{ width: `${data.reachScore}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-600">Total Countries</span>
          </div>
          <div className="text-2xl font-bold text-violet-600">{data.totalCountries}</div>
        </div>
        <div className="rounded-lg border border-lime-200 bg-lime-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-lime-600" />
            <span className="text-sm font-medium text-gray-600">Total Cities</span>
          </div>
          <div className="text-2xl font-bold text-lime-600">{data.totalCities}</div>
        </div>
      </div>

      {/* Top Regions List */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-500" />
          Top Regions
        </h3>
        <div className="space-y-4">
          {data.topRegions.map((region) => (
            <div key={`${region.country}-${region.name}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{region.name}</div>
                  <div className="text-xs text-gray-500">{region.country}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{region.supporters.toLocaleString()}</span>
                  {getTrendIcon(region.trend)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all',
                      region.trend === 'up' && 'bg-gradient-to-r from-violet-500 to-lime-500',
                      region.trend === 'down' && 'bg-gradient-to-r from-red-500 to-orange-500',
                      region.trend === 'stable' && 'bg-gray-400'
                    )}
                    style={{ width: `${region.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-600 whitespace-nowrap">{region.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
