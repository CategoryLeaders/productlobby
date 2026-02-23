'use client'

import React, { useEffect, useState } from 'react'
import { Users, Share2, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialProof {
  peopleLobbied: number
  peopleWatching: number
  totalShares: number
}

interface SharerAvatar {
  userId: string
  displayName: string
  avatar: string | null
  handle: string | null
}

interface SocialProofBarProps {
  campaignId: string
  compact?: boolean
  className?: string
}

export const SocialProofBar: React.FC<SocialProofBarProps> = ({
  campaignId,
  compact = false,
  className
}) => {
  const [socialProof, setSocialProof] = useState<SocialProof | null>(null)
  const [recentSharers, setRecentSharers] = useState<SharerAvatar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchShareStats = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/share-stats`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setSocialProof(result.data.socialProof)
            setRecentSharers(result.data.recentSharers || [])
          }
        }
      } catch (error) {
        console.error('Failed to fetch share stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchShareStats()
  }, [campaignId])

  if (loading || !socialProof) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center gap-6 py-3 px-4 bg-white border border-gray-200 rounded-lg',
        compact && 'gap-4 py-2 px-3 text-sm',
        className
      )}
    >
      {/* Supporters with avatars */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {recentSharers.slice(0, 4).map((sharer) => (
              <div
                key={sharer.userId}
                className={cn(
                  'relative bg-gradient-to-br from-violet-400 to-violet-600 rounded-full border-2 border-white flex items-center justify-center text-white font-semibold',
                  compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
                )}
                title={sharer.displayName}
              >
                {sharer.avatar ? (
                  <img
                    src={sharer.avatar}
                    alt={sharer.displayName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{sharer.displayName[0]?.toUpperCase()}</span>
                )}
              </div>
            ))}
          </div>
          {recentSharers.length > 4 && (
            <div
              className={cn(
                'relative bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-700 font-semibold',
                compact ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'
              )}
              title={`+${recentSharers.length - 4} more`}
            >
              +{recentSharers.length - 4}
            </div>
          )}
        </div>
        <div className={cn('ml-2', compact && 'text-xs')}>
          <p className="font-semibold text-gray-900">
            {socialProof.peopleLobbied.toLocaleString()}
          </p>
          <p className="text-gray-600 leading-tight">
            {socialProof.peopleLobbied === 1 ? 'person' : 'people'} lobbied
          </p>
        </div>
      </div>

      {/* Shares count with platform icons */}
      <div className="flex items-center gap-2 border-l border-gray-300 pl-6">
        <Share2 size={compact ? 16 : 20} className="text-violet-600" />
        <div className={cn('', compact && 'text-xs')}>
          <p className="font-semibold text-gray-900">
            {socialProof.totalShares}
          </p>
          <p className="text-gray-600 leading-tight">
            {socialProof.totalShares === 1 ? 'share' : 'shares'}
          </p>
        </div>
      </div>

      {/* Watching indicator */}
      <div className="flex items-center gap-2 border-l border-gray-300 pl-6">
        <Eye size={compact ? 16 : 20} className="text-lime-600" />
        <div className={cn('', compact && 'text-xs')}>
          <p className="font-semibold text-gray-900">
            {socialProof.peopleWatching}
          </p>
          <p className="text-gray-600 leading-tight">
            {socialProof.peopleWatching === 1 ? 'watcher' : 'watchers'}
          </p>
        </div>
      </div>
    </div>
  )
}
