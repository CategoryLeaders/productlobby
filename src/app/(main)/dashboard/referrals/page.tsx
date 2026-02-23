'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/shared'
import { cn } from '@/lib/utils'
import {
  Share2,
  Copy,
  Check,
  Users,
  Gift,
  TrendingUp,
  Facebook,
  Twitter,
  Mail,
  Link as LinkIcon,
  Loader,
} from 'lucide-react'

interface ReferralLink {
  id: string
  code: string
  clickCount: number
  signupCount: number
  createdAt: string
}

interface ReferralData {
  totalClicks: number
  totalSignups: number
  pointsEarned: number
  primaryCode: string | null
  referralLinks: ReferralLink[]
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [generatingCode, setGeneratingCode] = useState(false)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/referral')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateNewCode = async () => {
    try {
      setGeneratingCode(true)
      const response = await fetch('/api/user/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const result = await response.json()

      if (result.success) {
        fetchReferralData()
      }
    } catch (error) {
      console.error('Failed to generate code:', error)
    } finally {
      setGeneratingCode(false)
    }
  }

  const copyToClipboard = (code: string) => {
    const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${code}`
    navigator.clipboard.writeText(referralUrl)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const shareVia = (platform: string, code: string) => {
    const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${code}`
    const text = 'Check out ProductLobby - where your voice shapes products!'

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
      email: `mailto:?subject=Join ProductLobby&body=${encodeURIComponent(`${text}\n\n${referralUrl}`)}`,
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  if (loading) {
    return (
      <DashboardLayout role="supporter">
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 text-violet-600 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  const primaryCode = data?.primaryCode

  return (
    <DashboardLayout role="supporter">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-8 h-8 text-violet-600" />
            <h1 className="text-3xl font-bold">Referral Program</h1>
          </div>
          <p className="text-gray-600">
            Invite friends and earn rewards
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Friends Invited</p>
                <p className="text-3xl font-bold text-violet-600 mt-2">
                  {data?.totalClicks || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-violet-200" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Successfully Joined</p>
                <p className="text-3xl font-bold text-lime-600 mt-2">
                  {data?.totalSignups || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-lime-200" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Points Earned</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {data?.pointsEarned || 0}
                </p>
              </div>
              <Gift className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        {primaryCode && (
          <div className="bg-gradient-to-r from-violet-50 to-lime-50 border border-violet-200 rounded-lg p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your Referral Link
            </h2>

            <div className="bg-white rounded-lg p-4 border border-violet-200 mb-6">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${primaryCode}`}
                  readOnly
                  className="flex-1 bg-transparent text-sm font-mono text-gray-700 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(primaryCode)}
                  className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded hover:bg-violet-700 transition-colors flex items-center gap-2"
                >
                  {copiedCode === primaryCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <h3 className="sm:hidden text-sm font-semibold text-gray-700 w-full">
                Share via:
              </h3>
              <button
                onClick={() => shareVia('twitter', primaryCode)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors font-medium"
              >
                <Twitter className="w-5 h-5" />
                <span className="hidden sm:inline">Twitter</span>
              </button>
              <button
                onClick={() => shareVia('facebook', primaryCode)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#4267B2] text-white rounded-lg hover:bg-[#365199] transition-colors font-medium"
              >
                <Facebook className="w-5 h-5" />
                <span className="hidden sm:inline">Facebook</span>
              </button>
              <button
                onClick={() => shareVia('email', primaryCode)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline">Email</span>
              </button>
            </div>
          </div>
        )}

        {/* Generate Code Button */}
        {!primaryCode && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Referral Code Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first referral code to start inviting friends
            </p>
            <button
              onClick={generateNewCode}
              disabled={generatingCode}
              className={cn(
                'px-6 py-2 bg-violet-600 text-white font-medium rounded hover:bg-violet-700 transition-colors',
                generatingCode && 'opacity-50 cursor-not-allowed'
              )}
            >
              {generatingCode ? (
                <>
                  <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Referral Code'
              )}
            </button>
          </div>
        )}

        {/* All Referral Links */}
        {data && data.referralLinks.length > 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Referral Codes</h2>
            <div className="space-y-3">
              {data.referralLinks.map((link) => (
                <div
                  key={link.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-mono font-semibold text-violet-600">
                        {link.code}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Created {new Date(link.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-xs text-gray-600">Clicks</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {link.clickCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Signups</p>
                        <p className="text-lg font-semibold text-lime-600">
                          {link.signupCount}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => copyToClipboard(link.code)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition-colors"
                    >
                      {copiedCode === link.code ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={generateNewCode}
              disabled={generatingCode}
              className={cn(
                'w-full px-4 py-2 border border-violet-600 text-violet-600 font-medium rounded hover:bg-violet-50 transition-colors',
                generatingCode && 'opacity-50 cursor-not-allowed'
              )}
            >
              {generatingCode ? (
                <>
                  <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Another Code'
              )}
            </button>
          </div>
        )}

        {/* How It Works */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-10 h-10 bg-violet-100 text-violet-600 rounded-full font-semibold mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-600">
                Share your unique referral link with friends and family
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-10 h-10 bg-violet-100 text-violet-600 rounded-full font-semibold mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">They Sign Up</h3>
              <p className="text-sm text-gray-600">
                Friends join ProductLobby using your referral link
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-10 h-10 bg-violet-100 text-violet-600 rounded-full font-semibold mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
              <p className="text-sm text-gray-600">
                Get 10 points for each successful referral signup
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
