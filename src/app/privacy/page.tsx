import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const sections = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly: your email address when creating an account, campaign content you create, pledges and buying intent data, and payment information processed through Stripe. We also collect usage data including pages visited, features used, and device/browser information through standard web analytics.' },
  { title: '2. How We Use Your Information', body: "We use your information to: operate and improve the Platform; process payments and refunds; calculate Signal Scores and campaign analytics; send notifications about campaigns you\'ve supported; communicate service updates; and prevent fraud. We aggregate anonymised demand data to provide insights to brands about consumer preferences." },
  { title: '3. Information Sharing', body: 'We share information with: Stripe for payment processing; verified brands (aggregated campaign statistics, not individual user data); and service providers who assist in operating the Platform. We do not sell your personal information to third parties. Aggregated, anonymised data about demand trends may be shared publicly.' },
  { title: '4. Data Security', body: 'We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication via magic links, and regular security audits. Payment data is handled entirely by Stripe and never stored on our servers.' },
  { title: '5. Cookies & Tracking', body: 'We use essential cookies for authentication and session management. We may use analytics cookies to understand how the Platform is used. You can control cookie preferences through your browser settings. The Platform functions without non-essential cookies.' },
  { title: '6. Your Rights', body: 'Under applicable data protection laws (including UK GDPR), you have the right to: access your personal data; correct inaccurate data; request deletion of your data; object to processing; request data portability; and withdraw consent. To exercise these rights, contact us at privacy@productlobby.com.' },
  { title: '7. Data Retention', body: 'We retain your account data for as long as your account is active. Campaign and pledge data is retained for analytical purposes in anonymised form. Payment records are retained as required by financial regulations. You may request account deletion at any time.' },
  { title: '8. International Transfers', body: "Your data may be processed in countries outside the UK. Where this occurs, we ensure appropriate safeguards are in place through standard contractual clauses or equivalent mechanisms approved by the UK Information Commissioner\'s Office." },
  { title: "9. Children\'s Privacy", body: 'The Platform is not intended for users under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.' },
  { title: '10. Contact', body: "For privacy-related enquiries, please contact our Data Protection Officer at privacy@productlobby.com. You also have the right to lodge a complaint with the UK Information Commissioner\'s Office (ICO)." },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary-600">ProductLobby</Link>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
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
          <Link href="/terms" className="hover:text-gray-900">Terms of Service</Link>
        </div>
      </footer>
    </div>
  )
}
