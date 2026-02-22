'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReferralBannerProps {
  campaignId: string
  campaignTitle: string
  campaignSlug: string
  userId?: string
}

export function ReferralBanner({
  campaignId,
  campaignTitle,
  campaignSlug,
  userId,
}: ReferralBannerProps) {
  const [referralUrl, setReferralUrl] = useState<string | null>(null)
  const [clickCount, setClickCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    // Generate referral URL and fetch click count
    const generateReferralData = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/share`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ platform: 'REFERRAL' }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.referralUrl) {
            setReferralUrl(data.referralUrl)
            // Extract code from URL to fetch stats
            const code = data.referralUrl.split('/').pop()
            if (code) {
              fetchReferralStats(code)
            }
          }
        }
      } catch (error) {
        console.error('Failed to generate referral URL:', error)
      } finally {
        setIsLoading(false)
      }
    }

    generateReferralData()
  }, [campaignId, userId])

  const fetchReferralStats = async (code: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/share/stats`)
      if (response.ok) {
        const data = await response.json()
        const platformStats = data.byPlatform || {}
        const referralCount = platformStats['REFERRAL'] || 0
        setClickCount(referralCount)
      }
    } catch (error) {
      console.error('Failed to fetch referral stats:', error)
    }
  }

  const handleCopyReferralLink = async () => {
    if (!referralUrl) return

    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  // Only show if user is authenticated
  if (!userId) {
    return null
  }

  return (
    <Card className="border-l-4 border-l-lime-500 bg-gradient-to-r from-lime-50 to-transparent">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">
              Share & Earn Influence
            </h3>
            <p className="text-sm text-gray-600">
              Share this campaign with your network and help it grow!
            </p>
          </div>

          {/* Referral Link */}
          {referralUrl && !isLoading ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">Your Referral Link</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralUrl}
                  readOnly
                  className={cn(
                    'flex-1 px-3 py-2 text-sm rounded-lg border bg-white',
                    'border-gray-300 text-gray-700 font-mono',
                    'truncate'
                  )}
                />
                <Button
                  size="sm"
                  variant={copied ? 'primary' : 'secondary'}
                  onClick={handleCopyReferralLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          )}

          {/* Click Stats */}
          {!isLoading && (
            <div className="pt-3 border-t border-lime-200 flex items-center gap-3">
              <div className="flex items-center gap-2 text-lime-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {clickCount} {clickCount === 1 ? 'click' : 'clicks'} on your link
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
