'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Share2,
  Twitter,
  Facebook,
  MessageCircle,
  Mail,
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils'

interface SuccessPageProps {
  params: {
    slug: string
  }
}

// Demo campaign success data
const CAMPAIGN_DATA = {
  title: "Nike Women's Running Shoes in Extended Sizes",
  brand: {
    name: 'Nike',
    logo: '🔵',
  },
  slug: 'nike-womens-running-shoes-extended-sizes',
  caseStudySlug: 'nike-womens-running-shoes-extended-sizes',
  creator: {
    name: 'Sarah Mitchell',
    image: '👩‍💼',
    quote:
      "I posted this idea at 2am because I couldn't find running shoes in my size. I never expected 2,847 people to feel the same way.",
  },
  brandQuote:
    'The data from ProductLobby gave us the confidence to extend our size range. This is exactly the kind of consumer insight we need.',
  brandTeam: 'Nike Product Team',
  stats: {
    lobbyists: 2847,
    preorders: 523,
    days: 116,
    revenue: 62515,
    lobbiesRaised: 2847,
  },
  timeline: {
    started: '2025-10-15',
    first100: '2025-10-18',
    brandResponded: '2025-12-02',
    goalReached: '2026-02-08',
  },
}

// Confetti animation component
function ConfettiPiece({
  delay,
  duration,
  left,
}: {
  delay: number
  duration: number
  left: number
}) {
  return (
    <div
      className="fixed pointer-events-none animate-pulse"
      style={{
        left: `${left}%`,
        top: '-10px',
        animation: `fall ${duration}s linear ${delay}s infinite`,
        opacity: 0.8,
      }}
    >
      {Math.random() > 0.5 ? '●' : '■'}
    </div>
  )
}

const Confetti = () => {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 1,
    left: Math.random() * 100,
    color: ['text-violet-500', 'text-lime-500', 'text-green-500', 'text-blue-500'][
      Math.floor(Math.random() * 4)
    ],
  }))

  return (
    <>
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={cn('fixed text-2xl', piece.color)}
            style={{
              left: `${piece.left}%`,
              top: '-10px',
              animation: `fall ${piece.duration}s linear ${piece.delay}s forwards`,
              opacity: 0.8,
            }}
          >
            {Math.random() > 0.5 ? '●' : '■'}
          </div>
        ))}
      </div>
    </>
  )
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const [animateIn, setAnimateIn] = useState(false)

  useEffect(() => {
    setAnimateIn(true)
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />
      <Confetti />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-white border-b border-gray-200 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                'text-center space-y-4 transition-all duration-1000',
                animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              )}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-violet-600 tracking-tight">
                WE DID IT!
              </h1>
              <p className="text-2xl sm:text-3xl font-display font-bold text-gray-900">
                {CAMPAIGN_DATA.title}
              </p>
              <p className="text-lg text-gray-600">{CAMPAIGN_DATA.brand.name} is making this happen!</p>
            </div>
          </div>
        </section>

        {/* Key Stats Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="text-center bg-white">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-violet-600 mb-2">
                  {formatNumber(CAMPAIGN_DATA.stats.lobbyists)}
                </div>
                <p className="text-sm text-gray-600">Lobbyists United</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-lime-600 mb-2">
                  {formatNumber(CAMPAIGN_DATA.stats.preorders)}
                </div>
                <p className="text-sm text-gray-600">Pre-orders</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {CAMPAIGN_DATA.stats.days}
                </div>
                <p className="text-sm text-gray-600">Days to Success</p>
              </CardContent>
            </Card>
            <Card className="text-center bg-white">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatCurrency(CAMPAIGN_DATA.stats.revenue, 'GBP')}
                </div>
                <p className="text-sm text-gray-600">Revenue Generated</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Journey Summary */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">The Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-violet-100">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Campaign Started</p>
                    <p className="text-sm text-gray-600">{formatDate(CAMPAIGN_DATA.timeline.started)}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-lime-100">
                      <Users className="w-5 h-5 text-lime-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">First 100 Lobbies Reached</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(CAMPAIGN_DATA.timeline.first100)} (3 days)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Brand Responded</p>
                    <p className="text-sm text-gray-600">{formatDate(CAMPAIGN_DATA.timeline.brandResponded)}</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Goal Reached & Product Approved</p>
                    <p className="text-sm text-gray-600">{formatDate(CAMPAIGN_DATA.timeline.goalReached)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Creator Quote */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-8">
              <div className="flex gap-4 mb-4">
                <div className="text-4xl">{CAMPAIGN_DATA.creator.image}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Campaign Creator</p>
                  <p className="text-sm text-gray-600">{CAMPAIGN_DATA.creator.name}</p>
                </div>
              </div>
              <blockquote className="text-lg italic text-gray-900 border-l-4 border-violet-600 pl-4">
                "{CAMPAIGN_DATA.creator.quote}"
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* Brand Quote */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-lime-50 border-lime-200">
            <CardContent className="p-8">
              <div className="flex gap-4 mb-4">
                <div className="text-4xl">{CAMPAIGN_DATA.brand.logo}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Brand Response</p>
                  <p className="text-sm text-gray-600">{CAMPAIGN_DATA.brandTeam}</p>
                </div>
              </div>
              <blockquote className="text-lg italic text-gray-900 border-l-4 border-lime-600 pl-4">
                "{CAMPAIGN_DATA.brandQuote}"
              </blockquote>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white">
            <CardContent className="p-8 text-center space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  Read the Full Story
                </h3>
                <p className="text-gray-600">See the complete timeline, stats, and insights from this campaign.</p>
              </div>
              <Link href={`/campaigns/${CAMPAIGN_DATA.caseStudySlug}/case-study`}>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white inline-flex items-center gap-2">
                  View Case Study
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Share Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="text-center">Share Your Victory!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Back Link */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Link href="/campaigns">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
              Back to Campaigns
            </Button>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
