'use client'

import React, { useEffect, useState } from 'react'
import { Globe, MapPin, Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RegionData {
  name: string
  count: number
  percentage: number
}

interface CountryData {
  name: string
  count: number
}

interface GeoHeatmapResponse {
  regions: RegionData[]
  topCountries: CountryData[]
  total: number
}

interface GeoHeatmapProps {
  campaignId: string
  className?: string
}

const REGIONS = [
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Africa',
  'Oceania'
]

const getRegionColor = (percentage: number): string => {
  if (percentage === 0) return 'bg-gray-50'
  if (percentage < 10) return 'bg-blue-100'
  if (percentage < 20) return 'bg-blue-200'
  if (percentage < 30) return 'bg-blue-400'
  if (percentage < 50) return 'bg-blue-600'
  return 'bg-blue-800'
}

const getRegionTextColor = (percentage: number): string => {
  if (percentage >= 50) return 'text-white'
  return 'text-gray-900'
}

export const GeoHeatmap: React.FC<GeoHeatmapProps> = ({
  campaignId,
  className
}) => {
  const [data, setData] = useState<GeoHeatmapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/campaigns/${campaignId}/geo`)
        if (!response.ok) {
          throw new Error('Failed to fetch geographic data')
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchGeoData()
  }, [campaignId])

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <p className="text-sm text-red-600">Failed to load geographic data: {error}</p>
      </div>
    )
  }

  if (!data || data.total === 0) {
    return (
      <div className={cn('p-6 bg-gray-50 border border-gray-200 rounded-lg text-center', className)}>
        <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">No supporter location data available yet</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="font-semibold text-lg">Campaign Geographic Heat Map</h3>
          <p className="text-sm text-gray-600">Worldwide supporter distribution</p>
        </div>
      </div>

      {/* Total Supporters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-gray-600">Total Supporters Worldwide</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">{data.total.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Most Active Region</p>
          <p className="text-2xl font-bold text-gray-900">
            {data.regions.length > 0 && data.regions[0]?.name ? data.regions[0].name : 'N/A'}
          </p>
          {data.regions.length > 0 && data.regions[0] && (
            <p className="text-sm text-gray-600 mt-1">
              {data.regions[0].count} supporters ({data.regions[0].percentage.toFixed(1)}%)
            </p>
          )}
        </div>
      </div>

      {/* Regional Grid */}
      <div>
        <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Supporters by Region
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REGIONS.map((region) => {
            const regionData = data.regions.find(r => r.name === region)
            const count = regionData?.count ?? 0
            const percentage = regionData?.percentage ?? 0
            
            return (
              <div
                key={region}
                className={cn(
                  'p-4 rounded-lg border transition-all duration-200 hover:shadow-md',
                  getRegionColor(percentage),
                  percentage > 0 ? 'border-blue-300' : 'border-gray-200'
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className={cn('font-medium', getRegionTextColor(percentage))}>
                    {region}
                  </h5>
                  <span className={cn('text-sm font-semibold', getRegionTextColor(percentage))}>
                    {count}
                  </span>
                </div>
                
                {/* Percentage Bar */}
                <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                
                <p className={cn('text-xs mt-2 font-medium', getRegionTextColor(percentage))}>
                  {percentage.toFixed(1)}% of supporters
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top Countries */}
      {data.topCountries.length > 0 && (
        <div>
          <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Top 5 Countries
          </h4>
          <div className="space-y-2">
            {data.topCountries.map((country, index) => (
              <div
                key={country.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-blue-600 w-6 text-center">
                    #{index + 1}
                  </span>
                  <span className="text-gray-900 font-medium">{country.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{country.count}</p>
                  <p className="text-xs text-gray-600">
                    {((country.count / data.total) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="font-semibold text-sm mb-3">Color Intensity Guide</h5>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-50 border border-gray-300" />
            <span className="text-xs text-gray-600">No Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-100" />
            <span className="text-xs text-gray-600">&lt; 10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-200" />
            <span className="text-xs text-gray-600">10-20%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-400" />
            <span className="text-xs text-gray-600">20-30%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600" />
            <span className="text-xs text-gray-600">&gt; 30%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GeoHeatmap
