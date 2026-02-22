'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Twitter,
  Facebook,
  Linkedin,
  MessageCircle,
  Mail,
  Share2,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  campaignId: string
  campaignTitle: string
  campaignSlug: string
  showStats?: boolean
}

export function ShareButtons({
  campaignId,
  campaignTitle,
  campaignSlug,
  showStats = false,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [referralUrl, setReferralUrl] = useState<string | null>(null)
  const [shareStats, setShareStats] = useState<Record<string, number> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'}/campaigns/${campaignSlug}`

  useEffect(() => {
    if (showStats) {
      fetchShareStats()
    }
  }, [campaignId, showStats])

  const fetchShareStats = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/share/stats`)
      if (response.ok) {
        const data = await response.json()
        setShareStats(data.byPlatform || {})
      }
    } catch (error) {
      console.error('Failed to fetch share stats:', error)
    }
  }

  const trackShare = async (platform: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.referralUrl) {
          setReferralUrl(data.referralUrl)
        }
      }
    } catch (error) {
      console.error('Failed to track share:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await trackShare('COPY_LINK')
      const urlToCopy = referralUrl || campaignUrl
      await navigator.clipboard.writeText(urlToCopy)
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

  const handleTwitterShare = async () => {
    await trackShare('TWITTER')
    const text = encodeURIComponent(`Check out "${campaignTitle}" on ProductLobby!`)
    const url = encodeURIComponent(referralUrl || campaignUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
  }

  const handleFacebookShare = async () => {
    await trackShare('FACEBOOK')
    const url = encodeURIComponent(referralUrl || campaignUrl)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const handleLinkedInShare = async () => {
    await trackShare('LINKEDIN')
    const url = encodeURIComponent(referralUrl || campaignUrl)
    const title = encodeURIComponent(campaignTitle)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const handleWhatsAppShare = async () => {
    await trackShare('WHATSAPP')
    const text = encodeURIComponent(`Check out "${campaignTitle}" on ProductLobby! ${referralUrl || campaignUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleEmailShare = async () => {
    await trackShare('EMAIL')
    const subject = encodeURIComponent(`Check out this campaign: ${campaignTitle}`)
    const body = encodeURIComponent(
      `I found this great campaign on ProductLobby:\n\n${campaignTitle}\n\n${referralUrl || campaignUrl}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const ShareButton = ({
    icon: Icon,
    label,
    onClick,
    variant = 'secondary'
  }: {
    icon: any
    label: string
    onClick: () => void
    variant?: string
  }) => (
    <Button
      variant={variant as any}
      size="md"
      className={cn('w-full justify-center gap-2')}
      onClick={onClick}
      disabled={isLoading}
      title={label}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  )

  return (
    <div className="space-y-4">
      {/* Share buttons grid */}
      <div className="space-y-2">
        <ShareButton
          icon={Share2}
          label={copied ? 'Copied!' : 'Copy Link'}
          onClick={handleCopyLink}
          variant={copied ? 'primary' : 'secondary'}
        />
        <div className="grid grid-cols-2 gap-2">
          <ShareButton
            icon={Twitter}
            label="Twitter/X"
            onClick={handleTwitterShare}
          />
          <ShareButton
            icon={Facebook}
            label="Facebook"
            onClick={handleFacebookShare}
          />
          <ShareButton
            icon={Linkedin}
            label="LinkedIn"
            onClick={handleLinkedInShare}
          />
          <ShareButton
            icon={MessageCircle}
            label="WhatsApp"
            onClick={handleWhatsAppShare}
          />
        </div>
        <ShareButton
          icon={Mail}
          label="Email"
          onClick={handleEmailShare}
        />
      </div>

      {/* Share stats */}
      {showStats && shareStats && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-3 font-medium">Share Activity</p>
          <div className="space-y-2">
            {Object.entries(shareStats).map(([platform, count]) => (
              <div key={platform} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 capitalize">
                  {platform.toLowerCase().replace(/_/g, ' ')}
                </span>
                <span className="font-medium text-violet-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
