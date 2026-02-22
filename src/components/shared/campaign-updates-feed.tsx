'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { CampaignUpdateCard } from './campaign-update-card'
import { EmptyState } from './empty-state'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface UpdateImage {
  id: string
  url: string
  altText?: string
}

export interface UpdateData {
  id: string
  campaignId: string
  title: string
  content: string
  updateType:
    | 'ANNOUNCEMENT'
    | 'PROGRESS_UPDATE'
    | 'LAUNCH_DATE'
    | 'PROTOTYPE'
    | 'BEHIND_SCENES'
    | 'THANK_YOU'
  brandName: string
  brandLogo?: string
  brandVerified?: boolean
  images?: UpdateImage[]
  createdAt: Date
  likeCount?: number
  commentCount?: number
  userReaction?: 'thumbsUp' | 'heart' | 'celebrate'
}

export interface CampaignUpdatesFeedProps {
  updates: UpdateData[]
  campaignId: string
  onReact?: (updateId: string, reaction: string) => Promise<void>
  onShare?: (updateId: string) => Promise<void>
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  loading?: boolean
  empty?: boolean
  className?: string
}

const UpdateSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
    <div className="flex gap-2">
      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
      <div className="h-8 w-20 bg-gray-100 rounded animate-pulse" />
    </div>
  </div>
)

export const CampaignUpdatesFeed = React.forwardRef<
  HTMLDivElement,
  CampaignUpdatesFeedProps
>(
  (
    {
      updates,
      campaignId,
      onReact,
      onShare,
      onLoadMore,
      hasMore = false,
      loading = false,
      empty = false,
      className,
    },
    ref
  ) => {
    const [loadingMore, setLoadingMore] = useState(false)

    const handleLoadMore = async () => {
      if (!onLoadMore || loadingMore) return

      try {
        setLoadingMore(true)
        await onLoadMore()
      } finally {
        setLoadingMore(false)
      }
    }

    return (
      <div
        ref={ref}
        className={cn('space-y-6', className)}
      >
        {empty && !loading ? (
          <EmptyState
            icon="📢"
            title="No updates yet"
            description="Be the first to lobby! Once the brand shares updates, they'll appear here."
          />
        ) : (
          <>
            <div className="space-y-6">
              {updates.map((update, index) => (
                <div key={update.id} className="relative">
                  {index !== updates.length - 1 && (
                    <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-gradient-to-b from-violet-200 to-transparent" />
                  )}

                  <div className="relative flex gap-6">
                    <div className="absolute left-0 top-5 w-11 h-11 bg-white border-4 border-violet-200 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-violet-600 rounded-full" />
                    </div>

                    <div className="flex-1 ml-12">
                      <CampaignUpdateCard
                        {...update}
                        onReact={
                          onReact
                            ? async (reaction) =>
                                await onReact(update.id, reaction)
                            : undefined
                        }
                        onShare={
                          onShare
                            ? async () => await onShare(update.id)
                            : undefined
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {loading && (
              <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                  <UpdateSkeleton key={i} />
                ))}
              </div>
            )}

            {hasMore && !loading && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Updates'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
)

CampaignUpdatesFeed.displayName = 'CampaignUpdatesFeed'
