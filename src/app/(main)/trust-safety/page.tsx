import Link from 'next/link'
import { ArrowLeft, Shield, Lock, CreditCard, Gavel, AlertCircle, CheckCircle2, Award } from 'lucide-react'
import { Logo } from '@/components/ui/logo'

const sections = [
  {
    id: 'commitment',
    title: 'Our Commitment',
    icon: Shield,
    content:
      'ProductLobby is committed to creating a trusted, transparent platform where brands and supporters can connect authentically. We implement industry-leading security measures and clear policies to protect all participants from fraud, abuse, and unsafe behavior.',
  },
  {
    id: 'data-protection',
    title: 'Data Protection & Privacy',
    icon: Lock,
    content:
      'We encrypt all data in transit and at rest using TLS 1.3 and AES-256 encryption. Personal information is never shared with third parties without explicit consent. We comply with GDPR, UK GDPR, and other data protection regulations. Regular security audits ensure our systems remain secure.',
    features: [
      'End-to-end encryption for sensitive data',
      'GDPR and UK GDPR compliant',
      'Regular third-party security audits',
      'Data minimization principles',
      'Secure password hashing with bcrypt',
    ],
  },
  {
    id: 'payment-safety',
    title: 'Payment Safety',
    icon: CreditCard,
    content:
      'All payments are processed securely through Stripe, a PCI-DSS Level 1 certified payment processor. We never store credit card information on our servers. Each transaction is verified with industry-standard fraud detection.',
    features: [
      'PCI-DSS Level 1 compliance via Stripe',
      'No credit card data stored locally',
      'Real-time fraud detection',
      '3D Secure verification available',
      'Automated refund processing',
    ],
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute Resolution',
    icon: Gavel,
    content:
      'We maintain a fair dispute resolution process for payment disputes, account issues, and campaign-related concerns. Our team investigates all reports within 48 hours and works to reach amicable solutions.',
    features: [
      '48-hour initial response guarantee',
      'Transparent investigation process',
      'Fair refund policies',
      'Mediation for campaign disputes',
      'Appeal process for all decisions',
    ],
  },
  {
    id: 'report-abuse',
    title: 'Report Abuse & Violations',
    icon: AlertCircle,
    content:
      'We take all reports seriously. Users can report fraudulent campaigns, harmful content, or policy violations directly through our platform. Reports are reviewed by our trust and safety team within 24 hours.',
    features: [
      'Easy in-app reporting tools',
      '24-hour initial review',
      'Confidential investigation process',
      'Zero-tolerance for fraud',
      'Account suspension for violations',
    ],
  },
]

const badges = [
  {
    name: 'ISO/IEC 27001',
    description: 'Information Security Management',
  },
  {
    name: 'GDPR Compliant',
    description: 'European Data Protection',
  },
  {
    name: 'PCI-DSS',
    description: 'Payment Card Security',
  },
  {
    name: 'SOC 2 Type II',
    description: 'Security & Availability',
  },
]

export default function TrustSafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Trust & Safety Center</h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Your safety and trust are our highest priorities
          </p>
          <p className="text-gray-600">
            Learn how ProductLobby protects you and maintains platform integrity
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Security Certifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div key={badge.name} className="border-2 border-blue-100 rounded-lg p-4 text-center">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 text-sm">{badge.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Sections */}
        <div className="space-y-12">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <section key={section.id} className="scroll-mt-20" id={section.id}>
                <div className="flex items-start gap-4 mb-4">
                  <Icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">{section.content}</p>

                {section.features && (
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Key Features
                    </h3>
                    <ul className="space-y-3">
                      {section.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {/* Safety Tips Section */}
        <section className="mt-16 pt-12 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Stay Safe on ProductLobby</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                For Campaign Supporters
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Verify campaign details before pledging</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Use strong, unique passwords for your account</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Enable two-factor authentication when available</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Report suspicious activity immediately</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                For Campaign Creators
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Maintain transparent campaign communication</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Verify your identity to build trust</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Provide regular updates to supporters</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Report any suspicious supporter behavior</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mt-16 pt-12 border-t bg-blue-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-700 mb-6">
            If you have any trust and safety concerns, please contact our team immediately.
          </p>
          <div className="space-y-3">
            <p className="flex items-center gap-2 text-gray-900">
              <span className="font-semibold">Email:</span>
              <a href="mailto:trust@productlobby.com" className="text-blue-600 hover:underline">
                trust@productlobby.com
              </a>
            </p>
            <p className="flex items-center gap-2 text-gray-900">
              <span className="font-semibold">Security:</span>
              <a href="mailto:security@productlobby.com" className="text-blue-600 hover:underline">
                security@productlobby.com
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-sm gap-4">
          <span>&copy; 2026 ProductLobby. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
