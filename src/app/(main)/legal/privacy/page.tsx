'use client'

import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link href="/legal">
            <Button
              variant="ghost"
              className="mb-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Legal
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold font-logo-accent text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Privacy Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Section 1 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  ProductLobby ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services (the "Platform").
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Data We Collect
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We collect personal data in the following categories:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Account Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Name and email address</li>
                  <li>Password and authentication credentials</li>
                  <li>Profile information (avatar, bio, location)</li>
                  <li>Account preferences and settings</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Campaign and Interaction Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Campaign submissions and content you create</li>
                  <li>Comments, votes, and interactions with campaigns</li>
                  <li>Your lobbying activity and engagement history</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Technical Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>IP address and device identifiers</li>
                  <li>Browser type, operating system, and user agent</li>
                  <li>Pages visited and time spent on the Platform</li>
                  <li>Referring URL and clickstream data</li>
                  <li>Device type and capabilities</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Cookie and Similar Technologies
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies and similar tracking technologies to collect information about your browsing behavior and preferences. See our Cookie Policy for more information.
                </p>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. How We Use Your Data
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the personal data we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li><strong>Service Provision:</strong> To provide, maintain, and improve the Platform and our services</li>
                  <li><strong>Account Management:</strong> To create and manage your account, verify identity, and authenticate access</li>
                  <li><strong>Communication:</strong> To send you service-related announcements, updates, and promotional materials (with your consent)</li>
                  <li><strong>Analytics:</strong> To analyze usage patterns and improve our user experience</li>
                  <li><strong>Legal Compliance:</strong> To comply with legal obligations and enforce our Terms of Service</li>
                  <li><strong>Fraud Prevention:</strong> To detect, prevent, and address fraud, security issues, and technical problems</li>
                  <li><strong>Aggregation:</strong> To create anonymized, aggregated data for research and development</li>
                  <li><strong>Marketing:</strong> To send you newsletters and marketing communications (only with your explicit consent)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Data Sharing and Disclosure
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We do not sell your personal data. However, we may share your information with:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Third-Party Service Providers
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We engage vendors and service providers (e.g., email providers, hosting services, payment processors) who process data on our behalf under strict data protection agreements.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Brand Partners
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  When you interact with brand responses or campaigns, we may share aggregated campaign data and demographics with brand partners. We will never share your personal contact information without your explicit consent.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Legal Requirements
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  We may disclose your information when required by law, court order, or legal process, or when we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Business Transfers
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change and any choices you may have.
                </p>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Cookies and Similar Technologies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to remember your preferences and understand how you use the Platform. For detailed information about how we use cookies, please see our Cookie Policy.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You may opt out of certain cookies through your browser settings. Note that disabling cookies may affect your ability to use certain features of the Platform.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Data Retention
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain personal data for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. The retention period varies depending on the type of data and the legal basis for processing:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li><strong>Account Data:</strong> Retained for the duration of your account and up to 2 years after closure</li>
                  <li><strong>Campaign Data:</strong> Retained for the lifetime of the campaign and 3 years thereafter</li>
                  <li><strong>Technical/Analytics Data:</strong> Retained for 12 months</li>
                  <li><strong>Marketing Communications:</strong> Retained until you unsubscribe</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  When data is no longer needed, we securely delete or anonymize it.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Your Rights Under UK GDPR
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Under the UK General Data Protection Regulation, you have the following rights:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Right of Access
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to request a copy of the personal data we hold about you in a commonly used, machine-readable format.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Right of Rectification
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to correct any inaccurate or incomplete personal data we hold about you.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Right of Erasure
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to request deletion of your personal data, subject to certain legal exceptions. This is often called the "right to be forgotten."
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Right to Restrict Processing
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to request that we restrict our processing of your data in certain circumstances.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Right to Data Portability
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to request that we transfer your personal data to another service provider in a structured, commonly used, machine-readable format.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Right to Object
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  You have the right to object to our processing of your personal data for marketing purposes and certain other purposes.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement comprehensive security measures to protect your personal data, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Encryption of data in transit using SSL/TLS protocols</li>
                  <li>Encryption of sensitive data at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Employee training on data protection best practices</li>
                  <li>Incident response procedures for data breaches</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no security measure is 100% effective. While we strive to protect your data, we cannot guarantee absolute security. You use the Platform at your own risk.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Third-Party Services
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The Platform may contain links to third-party websites and services. We are not responsible for the privacy practices of third parties. We encourage you to review the privacy policies of any third-party services before providing your personal information.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. International Data Transfers
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Your personal data is primarily processed and stored in the United Kingdom. If we transfer your data to countries outside the UK, we ensure that appropriate safeguards are in place, including Standard Contractual Clauses or adequacy decisions.
                </p>
              </CardContent>
            </Card>

            {/* Section 11 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Children's Privacy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  The Platform is not intended for children under the age of 13. We do not knowingly collect personal data from children under 13. If we become aware that we have collected data from a child under 13, we will take steps to delete such data immediately. If you believe we have collected information from a child under 13, please contact us at the details below.
                </p>
              </CardContent>
            </Card>

            {/* Section 12 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  12. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy, wish to exercise your rights, or have concerns about our privacy practices, please contact our Data Protection Officer:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">Data Protection Officer</p>
                  <p className="text-gray-700 mb-1">Email: <span className="font-semibold">amy@categoryleaders.co.uk</span></p>
                  <p className="text-gray-700 mb-1">Company: ProductLobby</p>
                  <p className="text-gray-700">Website: www.productlobby.com</p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  We will respond to your data subject requests within 30 days of receipt, or as otherwise required by law.
                </p>
              </CardContent>
            </Card>

            {/* Section 13 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  13. Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on the Platform and updating the "Last updated" date above. Your continued use of the Platform indicates your acceptance of the updated Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Acknowledgement */}
            <Card className="bg-violet-50 border-2 border-violet-300">
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed">
                  By using ProductLobby, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and disclosure of your personal data as described herein.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
