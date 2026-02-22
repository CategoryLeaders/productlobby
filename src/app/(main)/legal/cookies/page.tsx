'use client'

import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Cookie Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Section 1 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. What Are Cookies?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They contain information about your browsing activity and are used to remember preferences, improve user experience, and track usage patterns. ProductLobby uses cookies and similar technologies to enhance the functionality of our Platform.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Types of Cookies We Use
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                  Essential Cookies (Strictly Necessary)
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These cookies are essential for the Platform to function properly. They allow you to navigate the website, access secure areas, and use core features. Without these cookies, the Platform may not work as intended.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm text-gray-700"><strong>session_token:</strong> Maintains your login session and authentication</p>
                  <p className="text-sm text-gray-700"><strong>csrf_token:</strong> Protects against cross-site request forgery attacks</p>
                  <p className="text-sm text-gray-700"><strong>preferences:</strong> Remembers your language and accessibility settings</p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Consent:</strong> These cookies do not require your explicit consent as they are necessary for the Platform to function.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Analytics Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use analytics cookies to understand how visitors use the Platform. This helps us improve user experience, identify technical issues, and optimize content. These cookies collect anonymized data about:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Pages visited and time spent on each page</li>
                  <li>Navigation patterns and user flow</li>
                  <li>Device information (browser, OS, screen resolution)</li>
                  <li>Geographic location (at country/region level)</li>
                  <li>Referral source and exit pages</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm text-gray-700"><strong>_ga:</strong> Google Analytics - tracks unique visitors</p>
                  <p className="text-sm text-gray-700"><strong>_gid:</strong> Google Analytics - identifies sessions</p>
                  <p className="text-sm text-gray-700"><strong>_gat:</strong> Google Analytics - throttles request rate</p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Consent:</strong> We obtain your consent before placing analytics cookies. You can withdraw consent at any time.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Preference Cookies (Functionality)
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These cookies remember your preferences and choices to provide a personalized experience. They may store:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Theme preference (light/dark mode)</li>
                  <li>Notification settings and frequency</li>
                  <li>Sidebar state (expanded/collapsed)</li>
                  <li>Viewed campaigns and search history</li>
                  <li>Filter and sorting preferences</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <p className="text-sm text-gray-700"><strong>theme:</strong> Your preferred color theme</p>
                  <p className="text-sm text-gray-700"><strong>notifications_opt_in:</strong> Your notification preferences</p>
                  <p className="text-sm text-gray-700"><strong>recent_searches:</strong> Your recent search history</p>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Consent:</strong> We obtain your consent before placing preference cookies. These are optional, but disabling them may reduce the functionality and personalization of the Platform.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Marketing and Social Media Cookies
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may use cookies to track your interactions with social media platforms and third-party advertising services. These cookies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Allow you to share content on social networks</li>
                  <li>Track campaign performance and conversions</li>
                  <li>Enable retargeting advertisements</li>
                  <li>Measure the effectiveness of marketing efforts</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>Consent:</strong> We obtain your explicit consent before placing marketing cookies. You can manage your preferences in your account settings.
                </p>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Third-Party Cookies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Some cookies on the Platform are set by third-party services we partner with:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li><strong>Google Analytics:</strong> Provides analytics and usage insights</li>
                  <li><strong>Stripe:</strong> Processes payments securely</li>
                  <li><strong>Social Media Platforms:</strong> Enable sharing and integration features</li>
                  <li><strong>Email Service Providers:</strong> Track email campaign engagement</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  These third parties have their own privacy policies governing their use of cookies. We encourage you to review their policies to understand how they process your data.
                </p>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Similar Technologies
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  In addition to cookies, we may use other similar technologies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li><strong>Local Storage:</strong> Stores data locally on your device for offline access</li>
                  <li><strong>Web Beacons:</strong> Small invisible images that track page visits and email opens</li>
                  <li><strong>Pixels:</strong> Used to track conversions and user behavior across websites</li>
                  <li><strong>Session Storage:</strong> Stores temporary data during your browsing session</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Managing Your Cookie Preferences
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Browser Settings
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>View cookies stored on your device</li>
                  <li>Block all cookies or specific types of cookies</li>
                  <li>Delete cookies automatically when you close your browser</li>
                  <li>Disable third-party cookies</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Please note that blocking or deleting cookies may limit your ability to use certain features of the Platform.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Opt-Out Services
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can opt out of certain tracking services using:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li><strong>Google Analytics Opt-Out:</strong> Install the Google Analytics Opt-Out Browser Add-on</li>
                  <li><strong>Network Advertising Initiative (NAI):</strong> Visit optout.networkadvertising.org</li>
                  <li><strong>Digital Advertising Alliance (DAA):</strong> Visit optout.aboutads.info</li>
                  <li><strong>Your Online Choices (UK):</strong> Visit www.youronlinechoices.com</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Account Settings
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  If you have a ProductLobby account, you can manage your cookie preferences in your account settings under "Privacy & Cookies." You can enable or disable analytics cookies and marketing cookies at any time.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Cookie Duration
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies have different expiration periods:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 1-2 years)</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can clear cookies manually through your browser settings at any time.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Do Not Track (DNT)
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Some browsers include a "Do Not Track" feature. Currently, there is no industry standard for recognizing DNT signals. We do not respond to DNT browser signals, but we respect your privacy preferences as outlined in this Cookie Policy and our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Data Protection and Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookie data is treated with the same level of security as other personal data. We:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                  <li>Encrypt cookies containing sensitive information</li>
                  <li>Use secure, HttpOnly flags to prevent unauthorized access</li>
                  <li>Regularly audit our cookie practices for security compliance</li>
                  <li>Comply with data protection regulations including UK GDPR</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Contact and Support
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about our use of cookies or wish to exercise your rights, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">ProductLobby</p>
                  <p className="text-gray-700 mb-1">Email: privacy@productlobby.com</p>
                  <p className="text-gray-700">Website: www.productlobby.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Changes to This Cookie Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. We will notify you of material changes by updating the "Last updated" date and posting the revised policy on the Platform. Your continued use of the Platform indicates your acceptance of the updated Cookie Policy.
                </p>
              </CardContent>
            </Card>

            {/* Acknowledgement */}
            <Card className="bg-violet-50 border-2 border-violet-300">
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed">
                  By continuing to use ProductLobby, you acknowledge that you have read and understood this Cookie Policy and agree to our use of cookies and similar technologies as described herein.
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
