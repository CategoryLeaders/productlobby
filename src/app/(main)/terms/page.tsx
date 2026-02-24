import { Metadata } from 'next'
import { FileText, Shield, AlertTriangle, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Read our Terms of Service to understand the rules and agreements governing your use of ProductLobby.',
}

export default function TermsPage() {
  const lastUpdated = new Date(2026, 1, 24).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const sections = [
    {
      number: 1,
      title: 'Acceptance of Terms',
      content:
        'By accessing and using ProductLobby ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use this Platform. We reserve the right to modify these terms at any time. Your continued use of the Platform following the posting of revised terms means that you accept and agree to the changes.',
    },
    {
      number: 2,
      title: 'Definitions',
      content:
        'In these Terms: "User" means any individual or entity accessing the Platform; "Campaign" means a project or initiative launched on the Platform; "Supporter" means a user who provides support to a Campaign; "Content" means any material, data, text, images, or other information uploaded to the Platform.',
    },
    {
      number: 3,
      title: 'User Accounts',
      content:
        'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to provide accurate, current, and complete information during registration. You are solely responsible for any activities or actions under your account, whether authorized or unauthorized.',
    },
    {
      number: 4,
      title: 'Acceptable Use',
      content:
        'You agree not to use the Platform to: (a) violate any applicable laws or regulations; (b) upload or distribute illegal, defamatory, or infringing content; (c) engage in harassment, abuse, or discrimination; (d) attempt to gain unauthorized access to the Platform; (e) disrupt the normal functioning of the Platform; (f) engage in any fraudulent or deceptive practices.',
    },
    {
      number: 5,
      title: 'Intellectual Property Rights',
      content:
        'All content, features, and functionality of the Platform, including but not limited to text, graphics, logos, and code, are owned by ProductLobby or its licensors. You may not reproduce, distribute, or transmit any content without prior written permission. User-generated content remains your property, but you grant ProductLobby a license to use, display, and promote such content.',
    },
    {
      number: 6,
      title: 'Payments and Refunds',
      content:
        'All payments for Campaign support are processed securely. Prices are quoted in GBP unless otherwise stated. Refunds are subject to our Refund Policy, which applies based on the type of campaign support and timing of the request. All transactions are final unless a refund is explicitly authorized.',
    },
    {
      number: 7,
      title: 'Privacy and Data Protection',
      content:
        'Your use of the Platform is also governed by our Privacy Policy. We collect and process personal data in accordance with applicable data protection laws. Please review our Privacy Policy to understand our data handling practices and your rights.',
    },
    {
      number: 8,
      title: 'Disclaimers',
      content:
        'The Platform is provided "as is" without warranties of any kind, express or implied. We make no representations regarding the accuracy, reliability, or completeness of any content. We disclaim all warranties, including those of merchantability and fitness for a particular purpose.',
    },
    {
      number: 9,
      title: 'Limitation of Liability',
      content:
        'To the fullest extent permitted by law, ProductLobby shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid to ProductLobby in the past 12 months.',
    },
    {
      number: 10,
      title: 'Termination',
      content:
        'We may suspend or terminate your account at any time for violations of these Terms or other reasons at our discretion. Upon termination, your right to use the Platform ceases immediately. We are not liable for any damages resulting from termination of your account.',
    },
    {
      number: 11,
      title: 'Changes to Terms',
      content:
        'We reserve the right to update or modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Platform following any changes constitutes your acceptance of the new Terms.',
    },
    {
      number: 12,
      title: 'Contact Information',
      content:
        'If you have questions about these Terms or need to report a violation, please contact our legal team at legal@productlobby.com.',
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-lime-500 text-white py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-10 h-10" />
            <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-lg text-white/90">
            Please read these terms carefully before using ProductLobby
          </p>
        </div>
      </div>

      {/* Last Updated */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Last Updated:</span> {lastUpdated}
          </p>
        </div>
      </div>

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.number} className="scroll-mt-8">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-violet-100 text-violet-700 font-bold text-lg">
                    {section.number}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {section.title}
                  </h2>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {section.content}
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Warning Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-4 p-6 bg-amber-50 border-2 border-amber-200 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Important Notice</h3>
            <p className="text-sm text-amber-800">
              These Terms of Service constitute a legally binding agreement between you and ProductLobby. Please review them carefully. If you do not understand any part of these terms or disagree with any provision, please do not use the Platform.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-violet-50 to-lime-50 py-12 md:py-16 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Questions About Our Terms?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Our legal team is here to help. Get in touch with us for clarification or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:legal@productlobby.com">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
                <Mail className="w-4 h-4 mr-2" />
                Contact Legal Team
              </Button>
            </a>
            <a href="/privacy">
              <Button variant="outline" className="w-full sm:w-auto">
                View Privacy Policy
              </Button>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
