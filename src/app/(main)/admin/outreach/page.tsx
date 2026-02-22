'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

interface OutreachOpportunity {
  campaignId: string
  campaignTitle: string
  tier: string
  lobbyCount: number
  signalScore: number
  targetedBrandId?: string
  suggestedBrands: Array<{
    id: string
    name: string
    email: string
    category: string
  }>
}

interface OutreachQueueItem {
  id: string
  campaignId: string
  brandEmail: string
  brandName: string
  subject: string
  status: string
  sentAt: string | null
  openedAt: string | null
  respondedAt: string | null
  createdAt: string
  campaign: {
    title: string
    slug: string
  }
}

interface OutreachStats {
  total: number
  pending: number
  sent: number
  opened: number
  responded: number
  failed: number
}

interface OutreachData {
  opportunities: OutreachOpportunity[]
  queue: OutreachQueueItem[]
  stats: OutreachStats
}

export default function OutreachPage() {
  const [data, setData] = useState<OutreachData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sendingOutreach, setSendingOutreach] = useState<string | null>(null)

  useEffect(() => {
    async function checkAdmin() {
      const user = await getCurrentUser()
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
      if (user?.email === adminEmail) {
        setIsAdmin(true)
        fetchData()
      } else {
        setError('You do not have permission to access this page')
        setLoading(false)
      }
    }

    checkAdmin()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/outreach')
      if (!response.ok) {
        throw new Error('Failed to fetch outreach data')
      }
      const result = await response.json()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function sendOutreach(
    campaignId: string,
    brandEmail: string,
    brandName: string
  ) {
    try {
      setSendingOutreach(campaignId)
      const response = await fetch('/api/admin/outreach/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, brandEmail, brandName }),
      })

      if (!response.ok) {
        throw new Error('Failed to send outreach')
      }

      fetchData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSendingOutreach(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="text-violet-600 hover:text-violet-700 font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading outreach data...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-violet-600 hover:text-violet-700 font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-amber-50 border-amber-200 text-amber-900'
      case 'SILVER':
        return 'bg-slate-50 border-slate-200 text-slate-900'
      case 'GOLD':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'PLATINUM':
        return 'bg-purple-50 border-purple-200 text-purple-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-amber-100 text-amber-800'
      case 'SILVER':
        return 'bg-slate-100 text-slate-800'
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800'
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SENT':
        return 'bg-blue-100 text-blue-800'
      case 'OPENED':
        return 'bg-green-100 text-green-800'
      case 'RESPONDED':
        return 'bg-lime-100 text-lime-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-violet-600 hover:text-violet-700 text-sm font-semibold mb-4 inline-block"
          >
            ← Back to Admin
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Brand Outreach Automation</h1>
          <p className="text-gray-600">
            Manage automated brand outreach campaigns and track engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total Queue" value={data.stats.total} color="bg-gray-100" />
          <StatCard label="Pending" value={data.stats.pending} color="bg-yellow-100" />
          <StatCard label="Sent" value={data.stats.sent} color="bg-blue-100" />
          <StatCard label="Opened" value={data.stats.opened} color="bg-green-100" />
          <StatCard label="Responded" value={data.stats.responded} color="bg-lime-100" />
          <StatCard label="Failed" value={data.stats.failed} color="bg-red-100" />
        </div>

        {/* Opportunities */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Campaigns Approaching Thresholds</h2>
            <p className="text-sm text-gray-600 mt-1">
              {data.opportunities.length} campaigns ready for brand outreach
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {data.opportunities.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-600">
                No campaigns approaching thresholds yet
              </div>
            ) : (
              data.opportunities.map((opp) => (
                <div key={opp.campaignId} className={`px-6 py-4 border-l-4 ${getTierColor(opp.tier)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{opp.campaignTitle}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {opp.lobbyCount} supporters • Signal: {opp.signalScore.toFixed(1)}/100
                      </p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getTierBadgeColor(opp.tier)}`}>
                      {opp.tier}
                    </span>
                  </div>

                  {opp.suggestedBrands.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        Suggested Brands:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {opp.suggestedBrands.map((brand) => (
                          <div
                            key={brand.id}
                            className="flex items-center justify-between bg-white p-2 rounded border border-gray-300"
                          >
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{brand.name}</p>
                              <p className="text-xs text-gray-600">{brand.email}</p>
                            </div>
                            <button
                              onClick={() =>
                                sendOutreach(opp.campaignId, brand.email, brand.name)
                              }
                              disabled={sendingOutreach === opp.campaignId}
                              className="ml-2 px-3 py-1 bg-violet-600 text-white text-xs font-semibold rounded hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                              {sendingOutreach === opp.campaignId ? 'Sending...' : 'Send'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Outreach Queue</h2>
            <p className="text-sm text-gray-600 mt-1">Latest {data.queue.length} outreach emails</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.queue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      <Link
                        href={`/campaigns/${item.campaign.slug}`}
                        className="text-violet-600 hover:text-violet-700"
                      >
                        {item.campaign.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.brandName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {item.brandEmail}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.queue.length === 0 && (
            <div className="px-6 py-12 text-center text-gray-600">No outreach scheduled yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  color: string
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 text-center`}>
      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
