import Link from 'next/link'
import { ArrowLeft, Users, Shield, Zap, Heart } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/"><Logo size="md" /></Link>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-display">
            We&apos;re Giving Consumers a Voice
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ProductLobby is a demand aggregation platform that connects what consumers want
            with what brands create. We believe that when enough people speak up, brands listen.
          </p>
        </div>

        <div className="bg-violet-50 rounded-2xl p-8 sm:p-12 mb-16">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Every day, millions of people wish a product came in a different size, color, or configuration.
            They wish brands would add features they actually want. But these voices get lost in social media
            noise and customer surveys that go nowhere. ProductLobby changes that by turning individual wishes
            into collective, credible demand signals that brands can&apos;t ignore.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mb-16">
          <div className="p-6 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Consumer-First</h3>
            <p className="text-gray-600">Everything we build starts with what consumers need. Our signal score algorithm ensures the most genuine demand rises to the top.</p>
          </div>
          <div className="p-6 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Risk-Free for Buyers</h3>
            <p className="text-gray-600">Our all-or-nothing model means you only pay if enough people commit. If a campaign doesn&apos;t succeed, every pledge is fully refunded.</p>
          </div>
          <div className="p-6 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Data-Driven</h3>
            <p className="text-gray-600">Our Signal Score algorithm uses demand value, buying intent, momentum, and fraud detection to surface the campaigns brands should pay attention to.</p>
          </div>
          <div className="p-6 rounded-xl border border-gray-100">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Creator Rewards</h3>
            <p className="text-gray-600">Campaign creators earn a share of platform fees when their campaigns result in successful offers. Good ideas get rewarded.</p>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-8">How the Platform Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div>
              <div className="text-4xl font-bold text-violet-200 mb-2">01</div>
              <h3 className="font-semibold text-lg mb-2">Campaigns</h3>
              <p className="text-gray-600">Anyone can create a campaign requesting a product variant or feature from a specific brand. Support pledges are quick and viral. Intent pledges include price and timeframe.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-violet-200 mb-2">02</div>
              <h3 className="font-semibold text-lg mb-2">Signal Score</h3>
              <p className="text-gray-600">Our algorithm ranks campaigns by credibility. When a campaign crosses key thresholds, the targeted brand is notified and invited to respond.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-violet-200 mb-2">03</div>
              <h3 className="font-semibold text-lg mb-2">Binding Offers</h3>
              <p className="text-gray-600">Brands create all-or-nothing offers with a price and minimum quantity. Payments are held on-platform and only processed if the offer succeeds.</p>
            </div>
          </div>
        </div>

        <div className="text-center bg-gray-50 rounded-2xl p-12">
          <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
          <p className="text-gray-600 mb-6">Create your first campaign or explore what others are requesting.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/campaigns/new" className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition">Create a Campaign</Link>
            <Link href="/campaigns" className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition">Explore Campaigns</Link>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; 2026 ProductLobby. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
