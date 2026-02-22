/**
 * Example: Brand Campaign Dashboard with Business Case
 *
 * This example shows how to integrate the Business Case Calculator
 * into a brand campaign details page.
 *
 * This is a reference implementation - copy patterns to your actual pages.
 */

'use client'

import React from 'react'
import { BusinessCaseCard } from '@/components/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface BrandCampaignDetailPageProps {
  params: {
    id: string
  }
}

/**
 * Example: Brand Campaign Page with Business Case Section
 *
 * Shows:
 * 1. Campaign overview (existing)
 * 2. Business case analysis (new)
 * 3. Cost estimation tools (future)
 */
export default function BrandCampaignDetailPage({
  params,
}: BrandCampaignDetailPageProps) {
  const campaignId = params.id

  return (
    <div className="space-y-8">
      {/* Existing Campaign Header */}
      <div>
        <h1 className="text-3xl font-bold">Campaign Overview</h1>
        <p className="text-gray-600 mt-2">Smart Water Bottle Campaign</p>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="business-case" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business-case">Business Case</TabsTrigger>
          <TabsTrigger value="signals">Demand Signals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">Live</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">Smart Home</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="font-semibold">Feb 15, 2025</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Views</p>
                  <p className="font-semibold">2,847</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Case Tab */}
        <TabsContent value="business-case">
          <BusinessCaseCard campaignId={campaignId} />
        </TabsContent>

        {/* Demand Signals Tab */}
        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-600">105</div>
                  <p className="text-sm text-gray-600">Lobbies</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-lime-600">25</div>
                  <p className="text-sm text-gray-600">Pledges</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">68</div>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Alternative: Simpler Integration Pattern
 *
 * If you don't need tabs, just embed the component directly:
 */
export function SimpleBrandCampaignPage({ campaignId }: { campaignId: string }) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold">Campaign Dashboard</h1>

      {/* Direct integration */}
      <BusinessCaseCard campaignId={campaignId} />

      {/* Any other sections below */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <button className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
            Create Offer
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Run Survey
          </button>
          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Download Report
          </button>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Pattern: Using Business Case Data in Decision Logic
 *
 * Shows how to fetch and use business case data programmatically
 */
export function BrandDecisionHelper({ campaignId }: { campaignId: string }) {
  const [businessCaseData, setBusinessCaseData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchBusinessCase = async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/business-case`)
      const data = await response.json()
      setBusinessCaseData(data)
      setLoading(false)
    }

    fetchBusinessCase()
  }, [campaignId])

  if (loading) return <div>Loading...</div>

  const { confidenceScore, revenueProjections } = businessCaseData

  const shouldCreateOffer =
    confidenceScore > 70 && revenueProjections.moderate.revenue > 10000

  const recommendation = shouldCreateOffer
    ? 'Strong demand detected. Create an offer now.'
    : 'Gather more data before creating an offer.'

  return (
    <Card className="border-violet-200 bg-violet-50">
      <CardContent className="pt-6">
        <p className="font-semibold text-violet-900">{recommendation}</p>
        <p className="text-sm text-violet-800 mt-2">
          Confidence: {confidenceScore}/100 | Expected Revenue:{' '}
          {revenueProjections.moderate.revenue.toLocaleString('en-GB', {
            style: 'currency',
            currency: 'GBP',
          })}
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Pattern: Cost Estimation Integration
 *
 * Shows how to combine business case with cost estimation
 */
export async function CostScenarioAnalysis({
  campaignId,
}: {
  campaignId: string
}) {
  // In a real implementation, this would be a client component or server action
  // that fetches business case data and displays cost scenarios

  /*
  const response = await fetch(`/api/campaigns/${campaignId}/business-case`)
  const businessCase = await response.json()

  const scenarios = [
    {
      name: 'Conservative',
      revenue: businessCase.revenueProjections.conservative.revenue,
      costs: businessCase.revenueProjections.conservative.revenue * 0.6,
    },
    {
      name: 'Moderate',
      revenue: businessCase.revenueProjections.moderate.revenue,
      costs: businessCase.revenueProjections.moderate.revenue * 0.55,
    },
    {
      name: 'Optimistic',
      revenue: businessCase.revenueProjections.optimistic.revenue,
      costs: businessCase.revenueProjections.optimistic.revenue * 0.5,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {scenarios.map(scenario => (
        <Card key={scenario.name}>
          <CardHeader>
            <CardTitle>{scenario.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="font-bold">{scenario.revenue.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Costs</p>
                <p className="font-bold">{scenario.costs.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profit</p>
                <p className="font-bold text-lime-600">{(scenario.revenue - scenario.costs).toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
  */

  return null
}
