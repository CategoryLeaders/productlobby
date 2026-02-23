'use client'

import React, { useState, useEffect } from 'react'
import { Share2, Loader2, Twitter, Facebook, Linkedin, Mail, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatNumber } from '@/lib/utils'

interface ShareCounts {
  twitter: number
  facebook: number
  linkedin: number
  email: number
  copyLink: number
  total: number
}

interface ShareCounterProps {
  campaignId: string
  campaignUrl?: string
  className?: string
  compact?: boolean
}

// Animated number component
function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0)
      return
    }

    const increment = Math.ceil(value / 20)
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [value])

  return <span className="font-bold text-blue-600">{formatNumber(displayValue)}</span>
}

export function ShareCounter({
  campaignId,
  campaignUrl = typeof window !== 'undefined' ? window.location.href : '',
  className,
  compact = true,
}: ShareCounterProps) {
  const [shares, setShares] = useState<ShareCounts>({
    twitter: 0,
    facebook: 0,
    linkedin: 0,
    email: 0,
    copyLink: 0,
    total: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Fetch share counts
  useEffect(() => {
    const fetchShares = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/shares`)
        if (response.ok) {
          const data = await response.json()
          setShares({
            twitter: data.twitter || 0,
            facebook: data.facebook || 0,
            linkedin: data.linkedin || 0,
            email: data.email || 0,
            copyLink: data.copyLink || 0,
            total: data.total || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching shares:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShares()
  }, [campaignId])

  const handleShare = async (platform: string) => {
    const shareText = `Check out this campaign: ${campaignUrl}`
    
    try {
      switch (platform) {
        case 'twitter':
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(campaignUrl)}&text=${encodeURIComponent('Check out this campaign on ProductLobby!')}`,
            '_blank'
          )
          break
        case 'facebook':
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`,
            '_blank'
          )
          break
        case 'linkedin':
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`,
            '_blank'
          )
          break
        case 'email':
          window.location.href = `mailto:?subject=Check out this campaign&body=${encodeURIComponent(shareText)}`
          break
        case 'copyLink':
          await navigator.clipboard.writeText(campaignUrl)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
          break
      }

      // Record the share event
      await fetch(`/api/campaigns/${campaignId}/shares`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform }),
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      </div>
    )
  }

  const platforms = [
    { id: 'twitter', icon: Twitter, label: 'Twitter', count: shares.twitter },
    { id: 'facebook', icon: Facebook, label: 'Facebook', count: shares.facebook },
    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn', count: shares.linkedin },
    { id: 'email', icon: Mail, label: 'Email', count: shares.email },
    { id: 'copyLink', icon: Copy, label: 'Copy Link', count: shares.copyLink },
  ]

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Total Shares Display */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
        <Share2 className="h-4 w-4 text-blue-600" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-600 font-medium">Total Shares</span>
          <AnimatedNumber value={shares.total} />
        </div>
      </div>

      {/* Platform Share Buttons */}
      <div className="flex gap-2">
        {platforms.map(({ id, icon: Icon, label, count }) => (
          <Button
            key={id}
            variant="outline"
            size="sm"
            onClick={() => handleShare(id)}
            title={`${label} (${count})`}
            className={cn(
              'relative h-auto px-2 py-2 transition-all hover:bg-gray-100',
              copied && id === 'copyLink' && 'bg-green-50 border-green-300'
            )}
          >
            <div className="flex flex-col items-center gap-0.5">
              <Icon className="h-4 w-4" />
              {!compact && (
                <span className="text-xs font-medium">
                  {count > 0 && count}
                </span>
              )}
            </div>
            {compact && count > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {formatNumber(count)}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Copy feedback */}
      {copied && (
        <span className="text-xs text-green-600 font-medium animate-fade-out">
          Link copied!
        </span>
      )}
    </div>
  )
}
