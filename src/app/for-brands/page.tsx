import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { ArrowLeft, BarChart3, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function BrandsPage() {
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
          <span className="inline-block bg-violet-100 text-violet-700 px-4 py-1 rounded-full text-sm font-medium mb-4">For Brands</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 font-display">
            Turn Consumer Demand Into <span className="text-violet-600">Guaranteed Revenue</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ProductLobby aggregates real consumer demand with binding purchase commitments.
            See exactly what your customers want before you invest in production.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Validated Demand</h3>
            <p className="text-gray-600">Our Signal Score algorithm separates noise from genuine buying intent. Only credible demand reaches your dashboard.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Zero Risk</h3>
            <p className="text-gray-600">Set your own price and minimum quantity. Payments are only processed when your target is met.</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Direct Connection</h3>
            <p className="text-gray-600">Engage directly with your most passionate potential customers. Run polls, share updates, and build relationships.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8 sm:p-12 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">How It Works for Brands</h2>
          <div className="space-y-8">
            {[
              { num: 1, title: 'Claim Your Brand', desc: 'Verify ownership via your company email domain or DNS TXT record. Takes under 5 minutes.' },
              { num: 2, title: 'Review Demand Signals', desc: 'See campaigns targeting your brand, ranked by Signal Score. Understand what your customers actually want.' },
              { num: 3, title: 'Create Binding Offers', desc: 'Set your price, minimum quantity, and deadline. Only commit to production when enough customers have paid.' },
              { num: 4, title: 'Deliver & Earn', desc: 'Funds are released to you when the offer succeeds. You receive the full amount minus a small platform fee (3%).' },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold shrink-0">{step.num}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">What You Get</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Brand dashboard with demand analytics',
              'Real-time notifications for high-signal campaigns',
              'Poll & survey tools to engage with your audience',
              'All-or-nothing payment model — no risk',
              'Verified brand badge for credibility',
              'Customer data from successful campaigns',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success-500 shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center bg-violet-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to See What Your Customers Want?</h2>
          <p className="text-violet-100 mb-8 max-w-2xl mx-auto">Claim your brand on ProductLobby and start turning consumer demand into revenue.</p>
          <Link href="/login" className="bg-white text-violet-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-violet-50 transition inline-flex items-center gap-2">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">&copy; 2026 ProductLobby. All rights reserved.</div>
      </footer>
    </div>
  )
}
