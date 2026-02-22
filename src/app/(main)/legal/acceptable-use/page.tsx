'use client'

import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function AcceptableUsePolicyPage() {
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
              Acceptable Use Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Policy Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            {/* Section 1 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  1. Purpose
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  This Acceptable Use Policy ("Policy") sets out the standards for how users interact with the ProductLobby platform, including conducting campaigns and engaging with brands. ProductLobby is committed to maintaining a respectful, safe, and productive community where product ideas can be freely shared and discussed. This Policy ensures the Platform remains a positive space for all users.
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  2. Campaign Submission Standards
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When submitting campaigns, you agree to:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.1 Legality and Compliance
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Ensure your campaign complies with all applicable UK laws and international regulations</li>
                  <li>Not promote or request products that are illegal or restricted</li>
                  <li>Not submit campaigns that violate copyright, trademark, or other intellectual property rights</li>
                  <li>Not submit campaigns that violate data protection or privacy laws</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.2 Truthfulness and Accuracy
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Provide accurate and truthful descriptions of your product ideas</li>
                  <li>Not misrepresent facts, figures, or demand numbers</li>
                  <li>Not make false claims about product functionality or benefits</li>
                  <li>Not present opinions as facts without clear disclaimers</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.3 Respect for Brands and Companies
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Not harass, threaten, or defame any brand or company</li>
                  <li>Not target specific executives or employees with personal attacks</li>
                  <li>Not encourage harassment or boycotts based on personal characteristics</li>
                  <li>Present constructive feedback, not abusive content</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  2.4 Content Quality
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Write clear, coherent campaign descriptions and titles</li>
                  <li>Use appropriate language free of profanity, slurs, or offensive content</li>
                  <li>Not submit spam, duplicate campaigns, or repetitive content</li>
                  <li>Not submit campaigns primarily for commercial self-promotion</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  3. Brand Interaction Standards
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When interacting with brands and organizations, users must:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3.1 Respectful Communication
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Treat brand representatives with respect and professionalism</li>
                  <li>Not threaten, intimidate, or harass brand employees</li>
                  <li>Engage in constructive dialogue focused on product improvements</li>
                  <li>Acknowledge good-faith efforts by brands to engage with campaigns</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3.2 Reasonable Requests
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Make product requests that are practical and feasible</li>
                  <li>Understand that not all requests can or should be fulfilled</li>
                  <li>Not demand immediate responses or implement timelines that are unreasonable</li>
                  <li>Not request products or features that compromise brand values or ethics</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  3.3 Good Faith Engagement
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Not manipulate voting systems to artificially inflate campaign numbers</li>
                  <li>Not create fake supporter accounts or use bots</li>
                  <li>Not pressure brands through false information or exaggerated claims</li>
                  <li>Recognize that legitimate campaigns require genuine community support</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  4. Prohibited Conduct
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Users are strictly prohibited from:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.1 Harassment and Abuse
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Harassing, stalking, bullying, or threatening any individual or group</li>
                  <li>Making derogatory comments based on race, ethnicity, gender, sexual orientation, religion, or disability</li>
                  <li>Engaging in coordinated harassment campaigns or "doxxing"</li>
                  <li>Creating content designed to humiliate or shame specific individuals</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.2 Illegal and Dangerous Content
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Promoting, requesting, or glorifying illegal activities</li>
                  <li>Sharing content that promotes violence or self-harm</li>
                  <li>Requesting products or services designed to facilitate illegal conduct</li>
                  <li>Sharing dangerous, harmful, or exploitative content</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.3 Deception and Manipulation
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Impersonating other users, brands, or organizations</li>
                  <li>Using automated bots or scripts to manipulate voting or create false engagement</li>
                  <li>Spreading misinformation, disinformation, or conspiracy theories</li>
                  <li>Employing sock puppet accounts to artificially boost campaign support</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.4 Intellectual Property Infringement
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Infringing on copyrights, trademarks, or patents</li>
                  <li>Submitting campaigns based on others' intellectual property without permission</li>
                  <li>Plagiarizing content from other campaigns or sources</li>
                  <li>Using brand logos or trademarked materials without authorization</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.5 Data and Privacy Violations
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Sharing other users' personal data without consent</li>
                  <li>Collecting data through deceptive means or hacking</li>
                  <li>Violating others' privacy rights</li>
                  <li>Submitting campaigns that target or exploit minors</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.6 Commercial and Spam Violations
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Posting spam, advertisements, or promotional content unrelated to product requests</li>
                  <li>Submitting campaigns to promote personal businesses or services</li>
                  <li>Using the Platform to send unsolicited marketing messages</li>
                  <li>Flooding the Platform with repetitive or low-quality content</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  4.7 System Security and Integrity
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                  <li>Attempting to hack, breach, or circumvent Platform security</li>
                  <li>Introducing malware, viruses, or other malicious code</li>
                  <li>Disrupting Platform functionality or availability</li>
                  <li>Probing for security vulnerabilities (unless participating in authorized security research)</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  5. Enforcement and Consequences
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ProductLobby reserves the right to enforce this Policy through various mechanisms:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.1 Warning
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For minor violations, we may issue a warning requesting that the user cease the prohibited conduct.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.2 Content Removal
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may remove campaigns, comments, or other content that violates this Policy without prior notice.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.3 Account Suspension
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For serious or repeated violations, we may temporarily suspend your account, preventing access to the Platform.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.4 Account Termination
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For severe violations or repeated violations after warnings, we may permanently terminate your account and ban you from the Platform.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  5.5 Legal Action
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to pursue legal action against users who engage in illegal conduct or cause harm to ProductLobby or other users.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  6. Appeals and Disputes
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you believe your account has been suspended or terminated in error, or if you believe content has been removed unjustly, you may appeal by contacting:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 mb-1">Email: support@productlobby.com</p>
                  <p className="text-gray-700">Subject: Account Appeal</p>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Please provide a clear explanation of why you believe the action was taken in error. We will review your appeal within 7 business days.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  7. Reporting Violations
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We rely on our community to help maintain standards on the Platform. If you encounter content or behavior that violates this Policy:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
                  <li>Use the "Report" button on the campaign or comment</li>
                  <li>Provide a clear description of the violation</li>
                  <li>Email us directly at moderation@productlobby.com with details</li>
                </ol>
                <p className="text-gray-700 leading-relaxed">
                  All reports are reviewed promptly and handled with confidentiality. We do not tolerate false or malicious reports.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  8. Scope and Limitations
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This Policy applies to all user-generated content, campaigns, comments, and interactions on the ProductLobby Platform, including web, mobile apps, and any future formats.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  ProductLobby is not responsible for content generated by users. We do not endorse or agree with all campaigns or comments on the Platform. However, we reserve the right to moderate content that violates this Policy or applicable laws.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  9. Changes to This Policy
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Acceptable Use Policy at any time. Material changes will be communicated to users, and your continued use of the Platform indicates acceptance of the updated Policy. We encourage you to review this Policy periodically to stay informed of our standards.
                </p>
              </CardContent>
            </Card>

            {/* Section 10 */}
            <Card variant="highlighted" className="border-violet-200">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Questions about this Acceptable Use Policy or reports of violations should be directed to:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900 mb-2">ProductLobby Moderation Team</p>
                  <p className="text-gray-700 mb-1">Email: moderation@productlobby.com</p>
                  <p className="text-gray-700">Website: www.productlobby.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Acknowledgement */}
            <Card className="bg-violet-50 border-2 border-violet-300">
              <CardContent className="p-8">
                <p className="text-gray-700 leading-relaxed">
                  By using ProductLobby and submitting campaigns, you acknowledge that you have read, understood, and agree to comply with this Acceptable Use Policy. Violations of this Policy may result in account suspension or termination.
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
