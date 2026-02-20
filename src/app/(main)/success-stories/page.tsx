'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function SuccessStoriesPage() {

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Page Header */}
        <PageHeader
          title="Success Stories"
          subtitle="See what happens when people lobby"
        />

        {/* Coming Soon Section */}
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Card className="bg-white border border-gray-200 overflow-hidden">
            <CardContent className="p-12 text-center">
              {/* Sparkle Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-lime-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-600" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
                Success Stories Coming Soon
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Success stories will appear here as brands respond to campaigns and products get made. Be part of the movement.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/campaigns">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3">
                    Browse Campaigns
                  </Button>
                </Link>
                <Link href="/campaigns/new">
                  <Button variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50 px-6 py-3">
                    Start a Campaign
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Create</h3>
                <p className="text-sm text-gray-700">Start a campaign for the product you want to see made</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-lime-50 to-lime-100 border-lime-200">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">📢</div>
                <h3 className="font-semibold text-gray-900 mb-2">Lobby</h3>
                <p className="text-sm text-gray-700">Rally supporters and build momentum for your idea</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-semibold text-gray-900 mb-2">Succeed</h3>
                <p className="text-sm text-gray-700">Watch your ideas become real products and stories</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
