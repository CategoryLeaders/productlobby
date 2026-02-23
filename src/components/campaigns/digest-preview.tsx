'use client'

import React, { useState } from 'react'
import { Mail, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DigestPreviewProps {
  campaignId: string
  campaignTitle: string
  period?: 'daily' | 'weekly'
  onSend?: () => void | Promise<void>
}

export const DigestPreview: React.FC<DigestPreviewProps> = ({
  campaignId,
  campaignTitle,
  period = 'weekly',
  onSend,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [htmlContent, setHtmlContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [digestData, setDigestData] = useState<any>(null)

  const loadDigest = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/digest?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to load digest')
      }

      const data = await response.json()
      setDigestData(data.data)
      setHtmlContent(data.data.html)
      setShowPreview(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load digest')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendDigest = async () => {
    try {
      setIsLoading(true)

      if (onSend) {
        await onSend()
      } else {
        // Default action: simulate sending
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setShowPreview(false)
      setHtmlContent(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send digest')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Card Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
              <Mail className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Campaign Digest</h3>
              <p className="text-sm text-slate-500">
                {period === 'daily' ? 'Daily' : 'Weekly'} email digest for {campaignTitle}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!showPreview && (
          <button
            onClick={loadDigest}
            disabled={isLoading}
            className={cn(
              'mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium',
              'bg-violet-600 text-white hover:bg-violet-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Preview Digest
              </>
            )}
          </button>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && htmlContent && digestData && (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h4 className="font-semibold text-slate-900">Digest Preview</h4>
              <p className="text-xs text-slate-500">
                This is how your {period} digest will look
              </p>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {/* Preview Content */}
          <div className="mb-6 max-h-96 overflow-y-auto rounded-lg bg-slate-50 p-4">
            <iframe
              srcDoc={htmlContent}
              className="w-full"
              style={{ height: '500px', border: 'none' }}
              title="Digest Preview"
            />
          </div>

          {/* Stats Summary */}
          <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-violet-600">
                {digestData.stats.lobbyCount}
              </div>
              <div className="text-xs text-slate-600">Lobbies</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">
                {digestData.stats.newComments}
              </div>
              <div className="text-xs text-slate-600">Comments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">
                {digestData.stats.totalShares}
              </div>
              <div className="text-xs text-slate-600">Shares</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-violet-600">
                {digestData.stats.updates}
              </div>
              <div className="text-xs text-slate-600">Updates</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSendDigest}
              disabled={isLoading}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium',
                'bg-violet-600 text-white hover:bg-violet-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Digest
                </>
              )}
            </button>
            <button
              onClick={() => setShowPreview(false)}
              disabled={isLoading}
              className={cn(
                'flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium',
                'border border-slate-300 text-slate-700 hover:bg-slate-50',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
