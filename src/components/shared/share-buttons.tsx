'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Link2,
  Mail,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  campaignId?: string
}

// Inline SVG icons for platforms
const TwitterIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
  </svg>
)

const FacebookIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z" />
  </svg>
)

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export function ShareButtons({
  url,
  title,
  description = '',
  campaignId,
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const trackShare = async (platform: string) => {
    if (!campaignId) return

    try {
      await fetch(`/api/campaigns/${campaignId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform }),
      })
    } catch (error) {
      console.error('Failed to track share:', error)
    }
  }

  const handleCopyLink = async () => {
    try {
      setIsLoading(true)
      await trackShare('copy_link')
      await navigator.clipboard.writeText(url)
      setCopied(true)

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTwitterShare = async () => {
    try {
      setIsLoading(true)
      await trackShare('twitter')
      
      const text = encodeURIComponent(`Check out "${title}"`)
      const urlParam = encodeURIComponent(url)
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${urlParam}`, '_blank')
    } catch (error) {
      console.error('Failed to share on Twitter:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFacebookShare = async () => {
    try {
      setIsLoading(true)
      await trackShare('facebook')
      
      const urlParam = encodeURIComponent(url)
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${urlParam}`, '_blank')
    } catch (error) {
      console.error('Failed to share on Facebook:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkedInShare = async () => {
    try {
      setIsLoading(true)
      await trackShare('linkedin')
      
      const urlParam = encodeURIComponent(url)
      const titleParam = encodeURIComponent(title)
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${urlParam}&title=${titleParam}`, '_blank')
    } catch (error) {
      console.error('Failed to share on LinkedIn:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailShare = async () => {
    try {
      setIsLoading(true)
      await trackShare('email')
      
      const subject = encodeURIComponent(`Check out: ${title}`)
      const body = encodeURIComponent(
        `${description || title}\n\n${url}`
      )
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    } catch (error) {
      console.error('Failed to share via email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const ShareButton = ({
    icon: Icon,
    label,
    onClick,
    bgHoverColor = 'hover:bg-gray-100',
  }: {
    icon: React.ReactNode | React.ComponentType<any>
    label: string
    onClick: () => void
    bgHoverColor?: string
  }) => (
    <button
      onClick={onClick}
      disabled={isLoading}
      title={label}
      className={cn(
        'p-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        bgHoverColor
      )}
      aria-label={label}
    >
      {typeof Icon === 'function' ? <Icon /> : Icon}
    </button>
  )

  return (
    <div className="flex items-center gap-2">
      <ShareButton
        icon={copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
        label={copied ? 'Copied!' : 'Copy Link'}
        onClick={handleCopyLink}
        bgHoverColor="hover:bg-blue-50"
      />
      
      <ShareButton
        icon={<TwitterIcon />}
        label="Share on Twitter"
        onClick={handleTwitterShare}
        bgHoverColor="hover:bg-blue-50"
      />
      
      <ShareButton
        icon={<FacebookIcon />}
        label="Share on Facebook"
        onClick={handleFacebookShare}
        bgHoverColor="hover:bg-blue-50"
      />
      
      <ShareButton
        icon={<LinkedInIcon />}
        label="Share on LinkedIn"
        onClick={handleLinkedInShare}
        bgHoverColor="hover:bg-blue-50"
      />
      
      <ShareButton
        icon={<Mail className="w-4 h-4" />}
        label="Share via Email"
        onClick={handleEmailShare}
        bgHoverColor="hover:bg-red-50"
      />
    </div>
  )
}
