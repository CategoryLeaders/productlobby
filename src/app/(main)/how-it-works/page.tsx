'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Share2,
  Heart,
  TrendingUp,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const CREATOR_STEPS = [
  {
    number: 1,
    title: 'Have an Idea',
    description: 'Describe your dream product',
    details:
      'Think of a product you wish existed or a way to improve an existing one. Be specific about what you want, who it\'s for, and why it matters. Include photos, links, or references to make your idea clear.',
  },
  {
    number: 2,
    title: 'Build Your Campaign',
    description: 'Guided wizard helps you create a compelling pitch',
    details:
      'Our step-by-step creator guides you through writing an engaging description, adding images, setting your brand target, and choosing your goal. Preview everything before publishing.',
  },
  {
    number: 3,
    title: 'Watch It Grow',
    description: 'Community rallies behind your idea',
    details:
      'Share your campaign and watch the lobby count grow. See real-time updates, read supporter comments, and understand what people love most about your idea.',
  },
  {
    number: 4,
    title: 'Brand Responds',
    description: 'Your idea becomes reality',
    details:
      'Brands see the demand signal and either commit to demand verification (Path A) or launch a pre-order campaign (Path B). You\'ll be notified instantly when a brand responds.',
  },
]

const SUPPORTER_STEPS = [
  {
    number: 1,
    title: 'Discover Campaigns',
    description: 'Browse ideas you love',
    details:
      'Browse curated campaigns organized by category. Use filters to find products in Fashion, Tech, Home, Food, and more. Save favorites to follow their progress.',
  },
  {
    number: 2,
    title: 'Lobby for This!',
    description: 'One click to support',
    details:
      'Support a campaign with a single click. Each lobby is a vote of confidence. Share your email to receive updates as the campaign grows.',
  },
  {
    number: 3,
    title: 'Shape the Product',
    description: 'Share preferences and wishlist',
    details:
      'Tell brands exactly what you want. Choose colors, features, materials. The aggregate data helps brands understand demand and guide their product decisions.',
  },
  {
    number: 4,
    title: 'Get the Product',
    description: 'Pre-order when brand responds',
    details:
      'If the brand chooses Path B, pre-order at a committed price. Your payment is only charged if the goal is met. Enjoy exclusive access to the new product.',
  },
]

const BRAND_STEPS = [
  {
    number: 1,
    title: 'Discover Demand',
    description: 'See what customers actually want',
    details:
      'Browse campaigns targeting your brand. See lobby counts and real customer demand. Find out what product ideas resonate most with your audience.',
  },
  {
    number: 2,
    title: 'Review the Data',
    description: 'Qualified demand with preferences',
    details:
      'Get detailed analytics: lobby trends, demographic data, feature preferences, and wishlist insights. Understand not just IF customers want something, but HOW they want it.',
  },
  {
    number: 3,
    title: 'Choose Your Path',
    description: 'Demand signal or pre-orders',
    details:
      'Select Path A (demand signal) to validate and iterate, or Path B (pre-order) to launch immediately with a committed audience. Both paths de-risk product development.',
  },
  {
    number: 4,
    title: 'Launch with Confidence',
    description: 'Audience is ready and waiting',
    details:
      'You already know demand is real. Your audience is ready to buy. Launch pre-orders or production with confidence backed by actual user data.',
  },
]

const FAQ_ITEMS = [
  {
    question: 'Is ProductLobby free?',
    answer:
      'ProductLobby is free for creators and supporters. We take a small percentage from successful Path B pre-orders to cover platform costs. Brands access demand insights and pre-order platforms for free.',
  },
  {
    question: 'How long does a campaign typically run?',
    answer:
      'Most campaigns run 30-90 days, though there\'s no fixed deadline. Campaigns stay active until a brand responds or you choose to close it. High-performing campaigns can stay open indefinitely.',
  },
  {
    question: 'What if my idea has many campaigners?',
    answer:
      'If multiple campaigns exist for similar products, we encourage merging them. Larger campaigns have more impact on brands. We can help you consolidate audiences.',
  },
  {
    question: 'How do brands find campaigns?',
    answer:
      'Brands use our discovery platform to search by category, see trending campaigns, and set up alerts for keywords relevant to their business. We also notify them directly when campaigns reach milestones.',
  },
  {
    question: 'Can I stay anonymous as a supporter?',
    answer:
      'Yes, you can lobby without sharing your email or name. However, to pre-order or receive updates, you\'ll need to provide contact information for fulfillment.',
  },
]

const RoleTab = ({
  title,
  description,
  steps,
}: {
  title: string
  description: string
  steps: typeof CREATOR_STEPS
}) => (
  <div className="space-y-6">
    <div className="mb-8">
      <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>

    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.number} className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-violet-100 border-2 border-violet-600">
              <span className="text-lg font-bold text-violet-600">{step.number}</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h4>
            <p className="text-sm text-gray-600 mb-2">{step.description}</p>
            <p className="text-gray-700">{step.details}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default function HowItWorksPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0)
  const [activeTab, setActiveTab] = useState('creators')

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-4">
              How ProductLobby Works
            </h1>
            <p className="text-xl text-gray-600">
              Turn ideas into products. Make brands listen. Change the way products get made.
            </p>
          </div>
        </section>

        {/* Role Tabs */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-12 overflow-x-auto">
            {[
              { id: 'creators', label: 'For Creators', icon: '💡' },
              { id: 'supporters', label: 'For Supporters', icon: '❤️' },
              { id: 'brands', label: 'For Brands', icon: '🎯' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2',
                  activeTab === tab.id
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                )}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            {activeTab === 'creators' && (
              <RoleTab
                title="Creators: From Idea to Reality"
                description="You have a vision for a product. ProductLobby helps you find if others want it too, then makes brands listen."
                steps={CREATOR_STEPS}
              />
            )}
            {activeTab === 'supporters' && (
              <RoleTab
                title="Supporters: Shape the Products You Want"
                description="Discover amazing product ideas and help make them real. Vote with your voice and your pre-order."
                steps={SUPPORTER_STEPS}
              />
            )}
            {activeTab === 'brands' && (
              <RoleTab
                title="Brands: Unlock Customer Insights"
                description="Understand real customer demand before investing in product development. Get qualified leads ready to buy."
                steps={BRAND_STEPS}
              />
            )}
          </div>
        </section>

        {/* The Two Paths */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">The Two Paths</h2>
            <p className="text-gray-600">
              Brands choose how to respond to validated demand
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Path A */}
            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <CardHeader>
                <div className="inline-block mb-2">
                  <span className="text-3xl">📊</span>
                </div>
                <CardTitle className="text-2xl">Path A: Demand Signal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Brand uses the demand data to validate, iterate, and plan product development.
                </p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <span className="text-gray-900">Audience size & demographics</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <span className="text-gray-900">Preference data & insights</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <span className="text-gray-900">Competitor analysis</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    <span className="text-gray-900">Direct feedback & comments</span>
                  </div>
                </div>
                <div className="bg-white rounded p-4 text-sm text-gray-700 mt-4">
                  <p className="font-semibold text-gray-900 mb-2">Timeline:</p>
                  Brand has time to develop the product properly. Product ships 6-18 months after validation.
                </div>
              </CardContent>
            </Card>

            {/* Path B */}
            <Card className="bg-gradient-to-br from-lime-50 to-lime-100 border-lime-200">
              <CardHeader>
                <div className="inline-block mb-2">
                  <span className="text-3xl">🛒</span>
                </div>
                <CardTitle className="text-2xl">Path B: Pre-order Launch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Brand commits to making the product and opens pre-orders immediately with the audience.
                </p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-lime-600 flex-shrink-0" />
                    <span className="text-gray-900">Locked-in price</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-lime-600 flex-shrink-0" />
                    <span className="text-gray-900">Refund guarantee if goal not met</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-lime-600 flex-shrink-0" />
                    <span className="text-gray-900">Direct customer feedback</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-lime-600 flex-shrink-0" />
                    <span className="text-gray-900">Risk reduction via pre-commitment</span>
                  </div>
                </div>
                <div className="bg-white rounded p-4 text-sm text-gray-700 mt-4">
                  <p className="font-semibold text-gray-900 mb-2">Timeline:</p>
                  Pre-order runs 2-4 weeks. Product ships 4-6 months after campaign closes.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about ProductLobby
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="bg-gradient-to-r from-violet-50 to-lime-50 border-violet-200">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl font-display font-bold text-gray-900">Ready to Start?</h2>
              <p className="text-lg text-gray-600">
                Whether you have an idea or want to support one, ProductLobby is ready for you.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/campaigns/new">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-base">
                    Create a Campaign
                  </Button>
                </Link>
                <Link href="/campaigns">
                  <Button
                    variant="outline"
                    className="border-gray-400 text-gray-900 px-8 py-3 text-base hover:bg-gray-50"
                  >
                    Browse Campaigns
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  )
}
