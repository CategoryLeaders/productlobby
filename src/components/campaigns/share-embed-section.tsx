'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Copy, Check, ChevronDown, ChevronUp, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShareButtons } from '@/components/shared/share-buttons'
import { cn } from '@/lib/utils'

interface ShareEmbedSectionProps {
  campaignId: string
  campaignSlug: string
  campaignTitle: string
  campaignDescription?: string
}

export function ShareEmbedSection({
  campaignId,
  campaignSlug,
  campaignTitle,
  campaignDescription = '',
}: ShareEmbedSectionProps) {
  const [isEmbedExpanded, setIsEmbedExpanded] = useState(false)
  const [embedCode, setEmbedCode] = useState<string | null>(null)
  const [iframeCode, setIframeCode] = useState<string | null>(null)
  const [copiedCodeType, setCopiedCodeType] = useState<'embed' | 'iframe' | null>(null)
  const [isLoadingEmbed, setIsLoadingEmbed] = useState(false)
  const embedTextRef = useRef<HTMLTextAreaElement>(null)
  const iframeTextRef = useRef<HTMLTextAreaElement>(null)

  const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.productlobby.com'}/campaigns/${campaignSlug}`

  // Fetch embed code when expanded
  useEffect(() => {
    if (isEmbedExpanded && !embedCode) {
      fetchEmbedCode()
    }
  }, [isEmbedExpanded])

  const fetchEmbedCode = async () => {
    try {
      setIsLoadingEmbed(true)
      const response = await fetch(`/api/campaigns/${campaignId}/embed`)
      if (response.ok) {
        const data = await response.json()
        setEmbedCode(data.embedCode)
        setIframeCode(data.iframeCode)
      }
    } catch (error) {
      console.error('Failed to fetch embed code:', error)
    } finally {
      setIsLoadingEmbed(false)
    }
  }

  const handleCopyCode = async (type: 'embed' | 'iframe') => {
    try {
      const code = type === 'embed' ? embedCode : iframeCode
      if (!code) return

      await navigator.clipboard.writeText(code)
      setCopiedCodeType(type)

      setTimeout(() => {
        setCopiedCodeType(null)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const selectAllCode = (ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.select()
    }
  }

  return (
    <div className="space-y-6">
      {/* Share Buttons Section */}
      <div className="border rounded-lg p-6 bg-white">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this campaign</h3>
        <ShareButtons
          url={campaignUrl}
          title={campaignTitle}
          description={campaignDescription}
        />
      </div>

      {/* Embed Section */}
      <div className="border rounded-lg bg-white overflow-hidden">
        <button
          onClick={() => setIsEmbedExpanded(!isEmbedExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Code className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Embed this campaign</h3>
          </div>
          {isEmbedExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {isEmbedExpanded && (
          <div className="border-t bg-gray-50 p-6 space-y-6">
            {isLoadingEmbed ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
              </div>
            ) : (
              <>
                {/* Iframe Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Simple Embed (Recommended)
                  </label>
                  <div className="relative">
                    <textarea
                      ref={iframeTextRef}
                      value={iframeCode || ''}
                      readOnly
                      onClick={() => selectAllCode(iframeTextRef)}
                      className="w-full h-24 p-3 font-mono text-sm border border-gray-300 rounded bg-white text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => handleCopyCode('iframe')}
                      className="absolute top-2 right-2 p-2 rounded bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                      title="Copy code"
                    >
                      {copiedCodeType === 'iframe' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Copy and paste this code into your website HTML
                  </p>
                </div>

                {/* Advanced Embed Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Advanced Embed (with auto-resize)
                  </label>
                  <div className="relative">
                    <textarea
                      ref={embedTextRef}
                      value={embedCode || ''}
                      readOnly
                      onClick={() => selectAllCode(embedTextRef)}
                      className="w-full h-40 p-3 font-mono text-sm border border-gray-300 rounded bg-white text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => handleCopyCode('embed')}
                      className="absolute top-2 right-2 p-2 rounded bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                      title="Copy code"
                    >
                      {copiedCodeType === 'embed' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Includes auto-resize script for dynamic height adjustment
                  </p>
                </div>

                {/* Preview Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded p-4 bg-white">
                    <p className="text-sm text-gray-600 text-center py-4">
                      Embed preview would appear here (when viewed on external site)
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    Your campaign will be displayed as a card with title, description, lobby count, and CTA button
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
