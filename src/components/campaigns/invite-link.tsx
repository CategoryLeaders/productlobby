'use client'

import { useState, useEffect } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InviteLinkProps {
  campaignId: string
  campaignTitle?: string
}

interface InviteLinkData {
  inviteLink: string
  trackingCode: string | null
  totalInvitesSent: number
  referralStats: {
    clickCount: number
    signupCount: number
    conversionRate: string
  } | null
}

export function InviteLink({ campaignId, campaignTitle = 'Campaign' }: InviteLinkProps) {
  const [data, setData] = useState<InviteLinkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    fetchInviteLink()
  }, [campaignId])

  const fetchInviteLink = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/invite-link`)
      if (!response.ok) {
        throw new Error('Failed to fetch invite link')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!data?.inviteLink) return
    try {
      await navigator.clipboard.writeText(data.inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy link')
    }
  }

  const handleRegenerate = async () => {
    try {
      setRegenerating(true)
      setError(null)
      const response = await fetch(`/api/campaigns/${campaignId}/invite-link`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to regenerate invite link')
      }
      const result = await response.json()
      setData({
        inviteLink: result.inviteLink,
        trackingCode: result.trackingCode,
        totalInvitesSent: 0,
        referralStats: null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-500">Loading invite link...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Share Campaign</h3>
        <p className="text-sm text-gray-600">Invite others to support {campaignTitle}</p>
      </div>

      {/* Invite Link Section */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Your Invite Link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={data?.inviteLink || ''}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono text-gray-700"
          />
          <button
            onClick={handleCopy}
            className={cn(
              'px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors',
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
            )}
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Tracking Code */}
      {data?.trackingCode && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Tracking Code</label>
          <div className="px-3 py-2 bg-gray-50 rounded-lg font-mono text-sm text-gray-700">
            {data.trackingCode}
          </div>
        </div>
      )}

      {/* Referral Stats */}
      {data?.referralStats && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-foreground">Referral Stats</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-bold text-foreground">
                {data.referralStats.clickCount}
              </p>
              <p className="text-xs text-gray-600 mt-1">Clicks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {data.referralStats.signupCount}
              </p>
              <p className="text-xs text-gray-600 mt-1">Signups</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {data.referralStats.conversionRate}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Conversion</p>
            </div>
          </div>
        </div>
      )}

      {/* Total Invites */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900">
          Total Invites Sent: <span className="font-bold">{data?.totalInvitesSent || 0}</span>
        </p>
      </div>

      {/* Regenerate Button */}
      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        className={cn(
          'w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium text-sm transition-colors',
          regenerating
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
        )}
      >
        <RefreshCw size={16} />
        {regenerating ? 'Generating...' : 'Generate New Link'}
      </button>
    </div>
  )
}
