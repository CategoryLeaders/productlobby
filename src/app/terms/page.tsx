import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

const sections = [
  { title: '1. Acceptance of Terms', body: 'By accessing or using ProductLobby ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. We reserve the right to update these terms at any time, and continued use of the Platform constitutes acceptance of any changes.' },
  { title: '2. Description of Service', body: 'ProductLobby is a demand aggregation platform that enables consumers to create campaigns requesting products or product features, gather support through pledges and buying intent, and connect with brands who may create binding offers in response to demonstrated demand.' },
  { title: '3. User Accounts', body: 'You must provide accurate information when creating an account. You are responsible for maintaining the security of your account and all activities that occur under it. You must be at least 18 years of age to use the Platform. One person may not maintain more than one account.' },
  { title: '4. Campaigns & Pledges', body: 'Campaign creators are responsible for ensuring their campaigns are truthful and not misleading. Support pledges are non-binding expressions of interest. Intent pledges indicate buying intent at a specified price ceiling within a timeframe but do not constitute a binding commitment until a formal offer is accepted and payment is processed.' },
  { title: '5. Payments & Refunds', body: 'All payments are processed through Stripe. When you accept an offer, your payment is held on-platform until the offer either succeeds (reaches its minimum quantity) or fails. If an offer fails to reach its minimum quantity by the deadline, all payments are automatically refunded in full. Orders may be cancelled up to 24 hours before the offer deadline.' },
  { title: '6. Platform Fees', body: 'ProductLobby charges a platform fee of 3% on successful offers. Campaign creators receive a share of 10% of the platform fee as a creator reward. These percentages may be adjusted with advance notice to users.' },
  { title: '7. Brand Verification', body: 'Brands may verify their ownership through domain email verification or DNS TXT records. Verified brands receive additional features and a verification badge. Fraudulent verification attempts will result in account termination.' },
  { title: '8. Prohibited Conduct', body: 'Users may not: create fraudulent campaigns or pledges; manipulate the Signal Score system; impersonate brands or other users; use the Platform for any illegal purpose; attempt to access other users\' accounts; or engage in any activity that disrupts the Platform\'s operation.' },
  { title: '9. Limitation of Liability', body: 'ProductLobby facilitates connections between consumers and brands but does not guarantee the quality, safety, or delivery of any products resulting from offers on the Platform. Our liability is limited to the amount of fees paid to the Platform in the preceding 12 months.' },
  { title: '10. Contact', body: 'For questions about these terms, please contact us at legal@productlobby.com.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/"><Logo size="md" /></Link>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: February 2026</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-gray-500 text-sm">
          <span>&copy; 2026 ProductLobby</span>
          <Link href="/privacy" className="hover:text-gray-900">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  )
}
