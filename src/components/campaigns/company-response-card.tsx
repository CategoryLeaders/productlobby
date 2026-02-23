'use client'

import React, { useEffect, useState } from 'react'
import { ExternalLink, Calendar, User } from 'lucide-react'
import { CompanyResponseBadge } from './company-response-badge'
import { cn } from '@/lib/utils'

interface Response {
  id: string
  content: string
  responseType: 'STATUS_UPDATE' | 'COMMENT' | 'ANNOUNCEMENT'
  createdAt: string
  brand?: {
    id: string
    name: string
    logo?: string
  }
  author?: {
    id: string
    displayName: string
    avatar?: string
  }
}

interface CompanyResponseCardProps {
  campaignId: string
  className?: string
}

// Map BrandResponseType to response type
const responseTypeMap: Record<string, 'committed' | 'investigating' | 'acknowledged' | 'declined' | 'no_response'> = {
  'STATUS_UPDATE': 'acknowledged',
  'COMMENT': 'declined',
  'ANNOUNCEMENT': 'committed',
}

export function CompanyResponseCard({ campaignId, className }: CompanyResponseCardProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/company-response`)
        if (!response.ok) {
          throw new Error('Failed to fetch responses')
        }
        const result = await response.json()
        setData(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load responses')
      } finally {
        setLoading(false)
      }
    }

    fetchResponses()
  }, [campaignId])

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-red-50 border border-red-200 rounded-lg', className)}>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (!data?.responses || data.responses.length === 0) {
    return (
      <div className={cn('p-6 bg-gray-50 border border-gray-200 rounded-lg text-center', className)}>
        <p className="text-gray-600 text-sm">No company response yet</p>
        <p className="text-gray-500 text-xs mt-1">Check back for updates</p>
      </div>
    )
  }

  const latestResponse = data.latestResponse
  const responseType = responseTypeMap[latestResponse.responseType] || 'no_response'

  return (
    <div className={cn('space-y-4', className)}>
      {/* Latest Response Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 bg-gradient-to-r from-violet-50 to-lime-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Latest Company Response</h3>
            <CompanyResponseBadge responseType={responseType} size="sm" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Response Content */}
          <p className="text-gray-700 text-sm leading-relaxed">{latestResponse.content}</p>

          {/* Response Metadata */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100">
            {/* Date */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-600" />
              <span>
                {new Date(latestResponse.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Company */}
            {latestResponse.brand && (
              <div className="flex items-center gap-1.5">
                {latestResponse.brand.logo && (
                  <img
                    src={latestResponse.brand.logo}
                    alt={latestResponse.brand.name}
                    className="w-3.5 h-3.5 rounded"
                  />
                )}
                <span className="font-medium text-gray-900">
                  {latestResponse.brand.name}
                </span>
              </div>
            )}

            {/* Author */}
            {latestResponse.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>{latestResponse.author.displayName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline of Previous Responses */}
      {data.responses.length > 1 && (
        <details className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
          <summary className="px-4 py-3 cursor-pointer font-medium text-sm text-gray-700 hover:bg-gray-100 transition-colors">
            Response History ({data.responses.length})
          </summary>

          <div className="divide-y divide-gray-200">
            {data.responses.slice(1).map((response: Response, idx: number) => {
              const type = responseTypeMap[response.responseType] || 'no_response'
              return (
                <div key={response.id} className="px-4 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1.5">
                      <p className="text-gray-700">{response.content}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(response.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CompanyResponseBadge responseType={type} size="sm" showLabel={false} />
                  </div>
                </div>
              )
            })}
          </div>
        </details>
      )}
    </div>
  )
}
