'use client'

import React, { useState, useEffect } from 'react'
import { Target, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface SuccessCriterion {
  type: 'min_lobbies' | 'target_date' | 'min_pledge_value'
  target: number
  current: number
  percentage: number
  status: 'met' | 'close' | 'far'
}

interface SuccessCriteriaProps {
  campaignId: string
}

const getCriterionLabel = (type: string): string => {
  switch (type) {
    case 'min_lobbies':
      return 'Minimum Lobbies'
    case 'target_date':
      return 'Target Date'
    case 'min_pledge_value':
      return 'Minimum Pledge Value'
    default:
      return 'Unknown'
  }
}

const getCriterionIcon = (type: string) => {
  switch (type) {
    case 'min_lobbies':
      return <Zap className="w-4 h-4" />
    case 'target_date':
      return <Clock className="w-4 h-4" />
    case 'min_pledge_value':
      return <Target className="w-4 h-4" />
    default:
      return <AlertCircle className="w-4 h-4" />
  }
}

const getStatusColor = (
  status: 'met' | 'close' | 'far'
): { bg: string; bar: string; text: string; badge: string } => {
  switch (status) {
    case 'met':
      return {
        bg: 'bg-green-50',
        bar: 'bg-green-500',
        text: 'text-green-900',
        badge: 'bg-green-600',
      }
    case 'close':
      return {
        bg: 'bg-yellow-50',
        bar: 'bg-yellow-500',
        text: 'text-yellow-900',
        badge: 'bg-yellow-600',
      }
    case 'far':
      return {
        bg: 'bg-gray-50',
        bar: 'bg-gray-400',
        text: 'text-gray-700',
        badge: 'bg-gray-500',
      }
  }
}

const getStatusLabel = (status: 'met' | 'close' | 'far'): string => {
  switch (status) {
    case 'met':
      return 'Criterion Met'
    case 'close':
      return 'Close to Target'
    case 'far':
      return 'In Progress'
  }
}

const ProgressBar = ({
  percentage,
  status,
}: {
  percentage: number
  status: 'met' | 'close' | 'far'
}) => {
  const colors = getStatusColor(status)
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-500', colors.bar)}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}

const CriterionCard = ({ criterion }: { criterion: SuccessCriterion }) => {
  const colors = getStatusColor(criterion.status)
  const displayValue = criterion.type === 'min_pledge_value'
    ? `$${criterion.current.toFixed(0)} / $${criterion.target.toFixed(0)}`
    : `${criterion.current} / ${criterion.target}`

  return (
    <div className={cn('p-4 rounded-lg border', colors.bg)}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-gray-600">{getCriterionIcon(criterion.type)}</div>
          <div>
            <p className="font-semibold text-gray-900">
              {getCriterionLabel(criterion.type)}
            </p>
            <p className={cn('text-sm', colors.text)}>{displayValue}</p>
          </div>
        </div>
        <Badge className={cn('text-white', colors.badge)}>
          {criterion.percentage}%
        </Badge>
      </div>

      <ProgressBar percentage={criterion.percentage} status={criterion.status} />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-600">
          {getStatusLabel(criterion.status)}
        </p>
        {criterion.status === 'met' && (
          <CheckCircle className="w-4 h-4 text-green-600" />
        )}
      </div>
    </div>
  )
}

export function SuccessCriteria({ campaignId }: SuccessCriteriaProps) {
  const [criteria, setCriteria] = useState<SuccessCriterion[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCriteria = async () => {
      try {
        const response = await fetch(
          `/api/campaigns/${campaignId}/success-criteria`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch success criteria')
        }
        const data = await response.json()
        setCriteria(data.data?.criteria || null)
      } catch (err) {
        console.error('Error fetching success criteria:', err)
        setError('Unable to load success criteria')
      } finally {
        setLoading(false)
      }
    }

    fetchCriteria()
  }, [campaignId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Success Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!criteria || criteria.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Target className="w-5 h-5" />
            Success Criteria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            No success criteria set yet. The campaign creator can define criteria
            to track progress.
          </p>
        </CardContent>
      </Card>
    )
  }

  const allMet = criteria.every(c => c.status === 'met')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Success Criteria
            {allMet && <Badge className="bg-green-600">All Met</Badge>}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {criteria.map((criterion) => (
            <CriterionCard key={criterion.type} criterion={criterion} />
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Pro tip:</strong> Success criteria help track campaign
            momentum and keep the community aligned on targets.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
