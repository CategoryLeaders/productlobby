'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Users, TrendingUp, TrendingDown, BarChart3, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RetentionData {
  name: string
  retained: number
  retentionRate: number
  supportersAtStart: number
}

interface RetentionResponse {
  totalSupporters: number
  overallRetention: number
  periods: RetentionData[]
  platformAverageRetention: number
  message?: string
}

export function CampaignRetentionTracker({ campaignId }: { campaignId: string }) {
  const [data, setData] = useState<RetentionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRetentionData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/retention`)
        if (response.ok) {
          const retentionData = await response.json()
          setData(retentionData.data)
        } else {
          setError('Failed to load retention data')
        }
      } catch (err) {
        console.error('Failed to fetch retention data:', err)
        setError('Failed to fetch retention data')
      } finally {
        setLoading(false)
      }
    }

    fetchRetentionData()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>{error || 'No retention data available'}</p>
      </div>
    )
  }

  if (data.totalSupporters === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <Users className="h-12 w-12 mb-2 opacity-40" />
        <p className="text-sm font-medium">No supporters yet</p>
        <p className="text-xs text-gray-400">Retention metrics will appear as supporters join</p>
      </div>
    )
  }

  const isAboveAverage = data.overallRetention >= data.platformAverageRetention

  return (
    <div className="space-y-6">
      {/* Overall Retention Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Overall Retention Rate</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                'text-4xl font-bold',
                isAboveAverage ? 'text-green-600' : 'text-red-600'
              )}>
                {data.overallRetention}%
              </span>
              <span className="text-sm text-slate-600">
                of {data.totalSupporters} supporters
              </span>
            </div>
          </div>
          <div className={cn(
            'rounded-lg p-3',
            isAboveAverage ? 'bg-green-100' : 'bg-red-100'
          )}>
            {isAboveAverage ? (
              <TrendingUp className={cn('h-6 w-6', isAboveAverage ? 'text-green-600' : 'text-red-600')} />
            ) : (
              <TrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
        </div>

        {/* Platform Average */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Platform Average:</span>
            <span className="font-medium text-slate-900">{data.platformAverageRetention}%</span>
          </div>
          <div className="mt-1 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-slate-400 rounded-full"
              style={{ width: `${data.platformAverageRetention}%` }}
            />
          </div>
          {isAboveAverage ? (
            <p className="text-xs text-green-600 mt-2 font-medium">
              Your campaign is performing above average!
            </p>
          ) : (
            <p className="text-xs text-red-600 mt-2 font-medium">
              Keep engaging supporters to improve retention
            </p>
          )}
        </div>
      </div>

      {/* Retention Curve Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">Retention Curve</h3>
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          {data.periods.map((period, index) => {
            const percentage = period.retentionRate
            const isGood = percentage >= data.platformAverageRetention
            const color = percentage >= data.platformAverageRetention ? 'bg-green-500' : 'bg-red-500'

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{period.name}</span>
                  <span className={cn(
                    'text-sm font-semibold',
                    isGood ? 'text-green-600' : 'text-red-600'
                  )}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-300', color)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500">
                  {period.retained} of {period.supportersAtStart} supporters
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Total Supporters</p>
          <p className="text-2xl font-bold text-slate-900">{data.totalSupporters}</p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">Best Period</p>
          <p className="text-2xl font-bold text-green-600">
            {Math.max(...data.periods.map(p => p.retentionRate))}%
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 font-medium mb-1">vs Platform</p>
          <p className={cn(
            'text-2xl font-bold',
            isAboveAverage ? 'text-green-600' : 'text-red-600'
          )}>
            {isAboveAverage ? '+' : ''}{data.overallRetention - data.platformAverageRetention}%
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">Tips to Improve Retention:</p>
        <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
          <li>Send regular updates to keep supporters engaged</li>
          <li>Respond to supporter comments and questions</li>
          <li>Celebrate milestones to maintain momentum</li>
          <li>Create exclusive content for your supporters</li>
        </ul>
      </div>
    </div>
  )
}
