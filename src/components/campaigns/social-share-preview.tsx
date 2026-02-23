'use client'

import React, { useState } from 'react'
import { Share2, Copy, Check, Twitter, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SocialSharePreviewProps {
  title: string
  description: string
  slug: string
  imageUrl?: string
}

type SocialPlatform = 'twitter' | 'facebook' | 'linkedin'

export function SocialSharePreview({
  title,
  description,
  slug,
  imageUrl = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
}: SocialSharePreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('twitter')
  const [copied, setCopied] = useState(false)

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.productlobby.com'}/campaigns/${slug}`
  const truncatedDescription = description.length > 160 ? description.substring(0, 160) + '...' : description

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const getPlatformIcon = (platform: SocialPlatform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />
      case 'facebook':
        return <div className="w-4 h-4 bg-blue-600 rounded-sm" />
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6 bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b">
        <Share2 className="w-5 h-5 text-violet-600" />
        <h3 className="text-lg font-semibold text-gray-900">Social Media Preview</h3>
      </div>

      {/* Platform Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPlatform('twitter')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
            selectedPlatform === 'twitter'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          )}
        >
          <Twitter className="w-4 h-4" />
          <span className="font-medium">Twitter</span>
        </button>

        <button
          onClick={() => setSelectedPlatform('facebook')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
            selectedPlatform === 'facebook'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          )}
        >
          <div className="w-4 h-4 bg-blue-600 rounded-sm" />
          <span className="font-medium">Facebook</span>
        </button>

        <button
          onClick={() => setSelectedPlatform('linkedin')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
            selectedPlatform === 'linkedin'
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
          )}
        >
          <Linkedin className="w-4 h-4" />
          <span className="font-medium">LinkedIn</span>
        </button>
      </div>

      {/* Preview Cards */}
      <div className="flex justify-center py-6">
        {selectedPlatform === 'twitter' && (
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Tweet-style preview */}
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900">Product Lobby Campaign</div>
                  <div className="text-gray-500 text-sm">@productlobby</div>
                </div>
              </div>

              {/* Tweet Text */}
              <div className="text-gray-900 text-sm leading-normal break-words">
                {description}
              </div>

              {/* Card Preview */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3 space-y-1">
                  <div className="text-xs text-gray-500 uppercase">productlobby.com</div>
                  <div className="font-bold text-gray-900 text-sm line-clamp-2">{title}</div>
                  <div className="text-xs text-gray-600 line-clamp-1">{truncatedDescription}</div>
                </div>
              </div>

              {/* Engagement Row */}
              <div className="flex justify-between text-gray-500 text-sm pt-2 border-t border-gray-100">
                <span>💬 245</span>
                <span>🔄 1.2K</span>
                <span>❤️ 5.3K</span>
                <span>📤</span>
              </div>
            </div>
          </div>
        )}

        {selectedPlatform === 'facebook' && (
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* Facebook-style preview */}
            <div className="space-y-3">
              {/* Header */}
              <div className="p-3 space-y-2 border-b border-gray-200">
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">Product Lobby Campaign</div>
                    <div className="text-gray-500 text-xs">2 hours ago</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-3 text-gray-900 text-sm break-words">
                {description}
              </div>

              {/* Card Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mx-3">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3 bg-gray-50 space-y-2">
                  <div className="text-xs text-gray-500 uppercase">productlobby.com</div>
                  <div className="font-bold text-gray-900">{title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{truncatedDescription}</div>
                </div>
              </div>

              {/* Engagement */}
              <div className="px-3 py-2 border-t border-gray-200 text-gray-500 text-sm flex justify-between">
                <span>👍 1.2K</span>
                <span>💬 245 | 🔄 89</span>
              </div>
            </div>
          </div>
        )}

        {selectedPlatform === 'linkedin' && (
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            {/* LinkedIn-style preview */}
            <div className="space-y-3">
              {/* Header */}
              <div className="p-4 space-y-2 border-b border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm">Product Lobby Campaign</div>
                    <div className="text-gray-500 text-xs">Company • 2 hours ago</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="px-4 text-gray-900 text-sm leading-relaxed break-words">
                {description}
              </div>

              {/* Card Preview */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mx-4 bg-gray-50">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-4 space-y-2">
                  <div className="font-bold text-gray-900">{title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2">{truncatedDescription}</div>
                  <div className="text-xs text-gray-500 pt-1">productlobby.com</div>
                </div>
              </div>

              {/* Engagement */}
              <div className="px-4 py-3 border-t border-gray-200 text-gray-500 text-sm flex gap-4">
                <span>👍 486</span>
                <span>💬 78</span>
                <span>↗️ 23</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={handleCopyUrl}
          variant="outline"
          className="flex-1 gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Share URL
            </>
          )}
        </Button>

        <Button
          variant="primary"
          className="gap-2"
          onClick={() => {
            const text = `Check out "${title}" on Product Lobby: ${shareUrl}`
            window.open(
              selectedPlatform === 'twitter'
                ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
                : selectedPlatform === 'facebook'
                  ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                  : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
              '_blank'
            )
          }}
        >
          <Share2 className="w-4 h-4" />
          Share Now
        </Button>
      </div>

      {/* URL Display */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="text-xs text-gray-600 mb-1">Share URL</div>
        <div className="font-mono text-sm text-gray-700 break-all">{shareUrl}</div>
      </div>
    </div>
  )
}
