'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { TrendingUp, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Decimal } from '@prisma/client/runtime/library'

interface RevenueData {
  totalEarnings: string
  referralBonus: string
  campaignSuccessFees: string
  tipJarEarnings: string
  totalPaid: string
  totalPending: string
  availableForPayout: string
}

interface CampaignBreakdown {
  campaignId: string
  campaignTitle: string
  amount: string
  source: string
  createdAt: string
}

interface PayoutRequest {
  id: string
  amount: string
  status: string
  requestedAt: string
  processedAt?: string
  completedAt?: string
}

interface RevenueStats {
  lastMonthEarnings: string
  lastQuarterEarnings: string
  trendPercentage: number
}

const MIN_PAYOUT = 10

export default function CreatorRevenuePage() {
  const [revenue, setRevenue] = useState<RevenueData | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignBreakdown[]>([])
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequest[]>([])
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    sortCode: '',
    ibanCode: '',
  })
  const [processingPayout, setProcessingPayout] = useState(false)

  useEffect(() => {
    fetchRevenueData()
  }, [])

  const fetchRevenueData = async () => {
    setLoading(true)
    try {
      const [revenueRes, statsRes] = await Promise.all([
        fetch('/api/creator/revenue'),
        fetch('/api/creator/revenue?stats=true'),
      ])

      if (revenueRes.ok) {
        const data = await revenueRes.json()
        setRevenue(data.earnings)
        setCampaigns(data.breakdown)
        setPayoutHistory(data.payoutHistory)
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching revenue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    if (!payoutAmount || isNaN(parseFloat(payoutAmount))) {
      alert('Please enter a valid amount')
      return
    }

    const amount = parseFloat(payoutAmount)
    if (amount < MIN_PAYOUT) {
      alert(`Minimum payout is £${MIN_PAYOUT}`)
      return
    }

    if (!revenue || parseFloat(revenue.availableForPayout) < amount) {
      alert('Insufficient balance for this payout')
      return
    }

    setProcessingPayout(true)
    try {
      const response = await fetch('/api/creator/revenue/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          bankDetails: Object.values(bankDetails).some((v) => v) ? bankDetails : undefined,
        }),
      })

      if (!response.ok) throw new Error('Payout request failed')

      alert('Payout request submitted successfully!')
      setShowPayoutDialog(false)
      setPayoutAmount('')
      setBankDetails({ bankName: '', accountHolder: '', accountNumber: '', sortCode: '', ibanCode: '' })
      fetchRevenueData()
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setProcessingPayout(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    )
  }

  if (!revenue) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-800">Failed to load revenue data</p>
        </CardContent>
      </Card>
    )
  }

  const availableForPayout = parseFloat(revenue.availableForPayout)
  const canRequestPayout = availableForPayout >= MIN_PAYOUT

  const chartData = [
    { month: 'Jan', earnings: 145, paid: 100 },
    { month: 'Feb', earnings: 280, paid: 200 },
    { month: 'Mar', earnings: 350, paid: 300 },
    { month: 'Apr', earnings: 420, paid: 400 },
    { month: 'May', earnings: 550, paid: 500 },
    { month: 'Jun', earnings: 680, paid: 600 },
  ]

  return (
    <div className="space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your earnings and manage payouts</p>
        </div>
        <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
          <DialogTrigger asChild>
            <Button
              disabled={!canRequestPayout}
              className="bg-lime-500 hover:bg-lime-600 text-white"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Request Payout</DialogTitle>
              <DialogDescription>
                Available balance: £{availableForPayout.toFixed(2)}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Payout Amount (£)</label>
                <Input
                  type="number"
                  min={MIN_PAYOUT}
                  max={availableForPayout}
                  step={0.01}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder={`Minimum £${MIN_PAYOUT}`}
                  className="border-violet-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: £{MIN_PAYOUT}, Maximum: £{availableForPayout.toFixed(2)}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Bank Details (Optional)</h4>
                <Input
                  placeholder="Bank Name"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  className="border-violet-200"
                />
                <Input
                  placeholder="Account Holder Name"
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  className="border-violet-200"
                />
                <Input
                  placeholder="Account Number"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="border-violet-200"
                />
                <Input
                  placeholder="Sort Code (UK)"
                  value={bankDetails.sortCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, sortCode: e.target.value })}
                  className="border-violet-200"
                />
                <Input
                  placeholder="IBAN Code (International)"
                  value={bankDetails.ibanCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ibanCode: e.target.value })}
                  className="border-violet-200"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPayoutDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestPayout}
                  disabled={processingPayout || !payoutAmount}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-white"
                >
                  {processingPayout ? 'Processing...' : 'Request Payout'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-600">£{parseFloat(revenue.totalEarnings).toFixed(2)}</div>
            {stats && (
              <div className="flex items-center gap-1 mt-2 text-sm text-violet-600">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.trendPercentage > 0 ? '+' : ''}{stats.trendPercentage.toFixed(1)}% this month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-lime-200 bg-gradient-to-br from-lime-50 to-lime-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-lime-600">£{parseFloat(revenue.availableForPayout).toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-2">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Already Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">£{parseFloat(revenue.totalPaid).toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-2">Completed payouts</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">£{parseFloat(revenue.totalPending).toFixed(2)}</div>
            <p className="text-xs text-gray-600 mt-2">Pending payouts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="col-span-2 border-violet-200">
          <CardHeader>
            <CardTitle>Earnings Over Time</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="#7C3AED"
                  strokeWidth={2}
                  name="Total Earned"
                />
                <Line
                  type="monotone"
                  dataKey="paid"
                  stroke="#84CC16"
                  strokeWidth={2}
                  name="Paid Out"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-violet-200">
          <CardHeader>
            <CardTitle>Earnings Breakdown</CardTitle>
            <CardDescription>By source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
              <span className="text-sm font-medium">Referral Bonus</span>
              <span className="font-bold text-violet-600">£{parseFloat(revenue.referralBonus).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-lime-50 rounded-lg">
              <span className="text-sm font-medium">Campaign Success</span>
              <span className="font-bold text-lime-600">£{parseFloat(revenue.campaignSuccessFees).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cyan-50 rounded-lg">
              <span className="text-sm font-medium">Tip Jar</span>
              <span className="font-bold text-cyan-600">£{parseFloat(revenue.tipJarEarnings).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-violet-200">
        <CardHeader>
          <CardTitle>Revenue by Campaign</CardTitle>
          <CardDescription>Earnings from each campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-medium">Campaign</th>
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-right p-3 font-medium">Amount</th>
                  <th className="text-right p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">
                      No earnings yet
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.campaignId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-medium text-gray-900">{campaign.campaignTitle}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs font-medium rounded">
                          {campaign.source}
                        </span>
                      </td>
                      <td className="p-3 text-right font-bold text-violet-600">£{parseFloat(campaign.amount).toFixed(2)}</td>
                      <td className="p-3 text-right text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-200">
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Track your payouts and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payoutHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No payouts yet</p>
            ) : (
              payoutHistory.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">£{parseFloat(payout.amount).toFixed(2)}</span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payout.status === 'COMPLETED'
                            ? 'bg-lime-100 text-lime-700'
                            : payout.status === 'PROCESSING'
                              ? 'bg-amber-100 text-amber-700'
                              : payout.status === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-violet-100 text-violet-700'
                        }`}
                      >
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Requested: {new Date(payout.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {payout.status === 'COMPLETED' && (
                      <div className="flex items-center gap-1 text-lime-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Paid</span>
                      </div>
                    )}
                    {payout.status === 'PENDING' && (
                      <div className="flex items-center gap-1 text-violet-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Pending</span>
                      </div>
                    )}
                    {payout.status === 'PROCESSING' && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Processing</span>
                      </div>
                    )}
                    {payout.status === 'FAILED' && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Failed</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
