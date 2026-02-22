'use client'

import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Section 1 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing and using ProductLobby ("Platform"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to abide by the above, please do not use this service. We reserve the right to modify these Terms at any time, and your continued use of the Platform indicates your acceptance of any changes.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. User Accounts
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access certain features of the Platform, you may be required to create an account ("Account"). You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain the confidentiality of your password and account credentials</li>
                  <li>Accept responsibility for all activities that occur under your Account</li>
                  <li>Notify us immediately of any unauthorized use of your Account</li>
                  <li>Be at least 13 years of age to use this Platform</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your Account if you violate these Terms or engage in unlawful conduct.
                </p>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Campaign Submissions
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Users may submit product ideas and campaigns ("Submissions") on the Platform. By submitting content, you warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>You own or have the right to submit the content</li>
                  <li>Your Submission does not infringe on third-party intellectual property rights</li>
                  <li>Your Submission complies with all applicable laws and regulations</li>
                  <li>Your Submission is not defamatory, obscene, or offensive</li>
                  <li>Your Submission accurately represents your views and ideas</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to remove, edit, or refuse any Submission that violates these Terms or that we deem inappropriate for any reason.
                </p>
                <p className="text-gray-700 leading-relaxed font-semibold">
                  Campaign Moderation: All campaigns are subject to moderation before publication. We aim to review submissions within 48 hours.
                </p>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Intellectual Property
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Platform and its contents, including but not limited to text, graphics, logos, images, audio clips, and software ("Content"), are the property of ProductLobby or our content providers and are protected by international copyright laws.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are granted a limited, non-exclusive, non-transferable license to access and use the Platform for personal, non-commercial purposes. You may not reproduce, distribute, or transmit any Content without our prior written permission.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>User-Generated Content:</strong> By submitting content to the Platform, you grant ProductLobby a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of operating and improving the Platform. You retain all rights to your original content.
                </p>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Brand Interactions
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ProductLobby connects users with brands and organizations. We facilitate these interactions but are not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>The accuracy or authenticity of brand responses or communications</li>
                  <li>Any agreements or contracts between users and brands</li>
                  <li>The delivery or implementation of products or features</li>
                  <li>Any disputes between users and brands</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Users acknowledge that brand participation is voluntary, and ProductLobby does not guarantee that brands will respond to or implement any campaign ideas.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Prohibited Conduct
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree not to use the Platform to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Harass, abuse, threaten, or defame any person or entity</li>
                  <li>Create multiple accounts or impersonate another user or organization</li>
                  <li>Attempt to gain unauthorized access to the Platform or user accounts</li>
                  <li>Post spam, malware, or any content that disrupts the Platform</li>
                  <li>Engage in illegal activities or violate applicable laws</li>
                  <li>Discriminate against or demean individuals based on protected characteristics</li>
                  <li>Manipulate voting systems or artificially inflate campaign numbers</li>
                  <li>Violate third-party intellectual property, privacy, or other rights</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Disclaimers
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The Platform is provided on an "AS IS" and "AS AVAILABLE" basis. ProductLobby makes no warranties, express or implied, regarding:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>The accuracy, completeness, or reliability of any content on the Platform</li>
                  <li>The uninterrupted or error-free operation of the Platform</li>
                  <li>The security or protection of user data</li>
                  <li>Any third-party services or links provided through the Platform</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  We disclaim all liability for any damages arising from the use or inability to use the Platform or its contents.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In no event shall ProductLobby, its directors, officers, employees, or agents be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of or inability to use the Platform, even if we have been advised of the possibility of such damages.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our total liability to you for any claims arising from these Terms or the Platform shall not exceed £100.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Termination
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ProductLobby reserves the right to terminate or suspend your Account and access to the Platform at any time, with or without cause, and with or without notice. Upon termination, your right to use the Platform will immediately cease.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Indemnification
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify, defend, and hold harmless ProductLobby and its directors, officers, employees, and agents from any claims, damages, or costs arising from your violation of these Terms, your use of the Platform, or your infringement of third-party rights.
                </p>
              </CardContent>
            </Card>

            {/* Section 11 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  11. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms are governed by and construed in accordance with the laws of the United Kingdom, without regard to its conflict of laws principles.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  You irrevocably consent to the exclusive jurisdiction of the courts located in England to resolve any disputes arising from these Terms or the Platform.
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
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">ProductLobby</p>
                  <p className="text-gray-700">Email: legal@productlobby.com</p>
                  <p className="text-gray-700">Website: www.productlobby.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Acknowledgement */}
            <Card className="bg-violet-50 border-2 border-violet-300">
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed">
                  By using ProductLobby, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
