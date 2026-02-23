'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link2, Copy, Check, BarChart3, Loader2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShortLink {
  id: string
  code: string
  clickCount: number
  createdAt: string | Date
}

interface LinkShortenerProps {
  campaignId: string
  className?: string
}

export const LinkShortener: React.FC<LinkShortenerProps> = ({
  campaignId,
  className,
}) => {
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchShortLinks()
  }, [campaignId])

  const fetchShortLinks = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/short-links`
      )
      if (!response.ok) throw new Error('Failed to fetch links')
      const data = await response.json()
      setShortLinks(data.links || [])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching links')
    } finally {
      setLoading(false)
    }
  }

  const generateNewLink = async () => {
    setGeneratingLink(true)
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/short-links`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      if (!response.ok) throw new Error('Failed to generate link')
      const data = await response.json()
      setShortLinks([...shortLinks, data.link])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error generating link')
    } finally {
      setGeneratingLink(false)
    }
  }

  const copyToClipboard = (code: string) => {
    const url = `https://productlobby.com/l/${code}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(code)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Campaign Link Shortener
          </h3>
          <Button
            onClick={generateNewLink}
            disabled={generatingLink}
            size="sm"
            className="gap-2"
          >
            {generatingLink ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Generate New Link
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : shortLinks.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Link2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              No short links yet. Create one to start tracking campaign shares.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {shortLinks.map((link) => (
              <div
                key={link.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-900 break-all">
                      productlobby.com/l/{link.code}
                    </code>
                  </div>
                  <p className="text-xs text-gray-500">
                    Created {formatDate(link.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded text-sm">
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {link.clickCount}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(link.code)}
                    className="gap-2"
                  >
                    {copiedId === link.code ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
