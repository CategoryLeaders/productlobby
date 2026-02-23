import { Metadata } from "next";
import { Cookie, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cookie Policy | ProductLobby",
  description: "Learn about how ProductLobby uses cookies and how to manage your preferences.",
};

export default function CookiePolicyPage() {
  const cookieTypes = [
    {
      name: "Session ID",
      purpose: "Maintains user login sessions",
      duration: "Session",
      type: "Essential",
    },
    {
      name: "Preferences",
      purpose: "Stores user theme and interface preferences",
      duration: "1 year",
      type: "Preferences",
    },
    {
      name: "ga_id",
      purpose: "Tracks user interactions for analytics",
      duration: "2 years",
      type: "Analytics",
    },
    {
      name: "marketing_id",
      purpose: "Measures campaign effectiveness",
      duration: "1 year",
      type: "Marketing",
    },
    {
      name: "csrf_token",
      purpose: "Protects against CSRF attacks",
      duration: "Session",
      type: "Essential",
    },
    {
      name: "user_consent",
      purpose: "Records your cookie consent choices",
      duration: "1 year",
      type: "Essential",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-center">
            <div className="rounded-full bg-violet-100 p-4 dark:bg-violet-950">
              <Cookie className="h-12 w-12 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <h1 className="mb-4 text-center text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mx-auto text-center text-lg text-slate-600 dark:text-slate-300">
            Transparency about how we use cookies and how to manage your preferences.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Introduction */}
          <div className="mb-12 rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-start gap-3">
              <Info className="mt-1 h-6 w-6 flex-shrink-0 text-lime-500" />
              <div>
                <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  What Are Cookies?
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Cookies are small text files stored on your device that help websites remember information about you. They enhance your experience by allowing sites to recognize you and personalize content. At ProductLobby, we use cookies responsibly to improve functionality, security, and user experience.
                </p>
              </div>
            </div>
          </div>

          {/* How We Use Cookies */}
          <div className="mb-12">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <Shield className="h-8 w-8 text-violet-600 dark:text-violet-400" />
              How We Use Cookies
            </h2>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Security & Authentication
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  We use essential cookies to keep your account secure, maintain your login session, and prevent unauthorized access.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Personalization
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Preference cookies remember your choices about theme, language, and interface settings to provide a tailored experience.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Analytics & Improvement
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Analytics cookies help us understand how users interact with ProductLobby, enabling us to continuously improve our platform.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">
                  Marketing
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Marketing cookies allow us to measure the effectiveness of our campaigns and show you relevant content.
                </p>
              </div>
            </div>
          </div>

          {/* Types of Cookies */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              Types of Cookies
            </h2>
            
            {/* Essential Cookies */}
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="inline-block h-3 w-3 rounded-full bg-violet-600 dark:bg-violet-400"></span>
                Essential Cookies
              </h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                Required for basic site functionality and security. You cannot opt out of these cookies.
              </p>
            </div>

            {/* Analytics Cookies */}
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="inline-block h-3 w-3 rounded-full bg-lime-500"></span>
                Analytics Cookies
              </h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                Help us understand how you use ProductLobby. These are optional and can be disabled.
              </p>
            </div>

            {/* Preference Cookies */}
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="inline-block h-3 w-3 rounded-full bg-blue-500"></span>
                Preference Cookies
              </h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                Remember your choices about theme, language, and other preferences to enhance your experience.
              </p>
            </div>

            {/* Marketing Cookies */}
            <div className="mb-8">
              <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <span className="inline-block h-3 w-3 rounded-full bg-orange-500"></span>
                Marketing Cookies
              </h3>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                Used to track campaign effectiveness and show relevant advertising. These are optional.
              </p>
            </div>

            {/* Cookie Table */}
            <div className="mb-8 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Cookie Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {cookieTypes.map((cookie, index) => (
                    <tr key={index} className="bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {cookie.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {cookie.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                        {cookie.duration}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          cookie.type === "Essential"
                            ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200"
                            : cookie.type === "Analytics"
                            ? "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200"
                            : cookie.type === "Preferences"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                            : "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                        }`}>
                          {cookie.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Managing Cookies */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              Managing Your Cookies
            </h2>
            <div className="rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                You have the right to control cookies through several methods:
              </p>
              <ul className="mb-6 space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-lime-500"></span>
                  <span><strong>Cookie Settings:</strong> Use our cookie preference center to manage your choices.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-lime-500"></span>
                  <span><strong>Browser Settings:</strong> Most browsers allow you to refuse cookies or alert you when a cookie is being set.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-lime-500"></span>
                  <span><strong>Opt-Out:</strong> You can opt out of analytics and marketing cookies without affecting site functionality.</span>
                </li>
              </ul>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Note: Disabling essential cookies may affect site functionality and security features.
              </p>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              Third-Party Cookies
            </h2>
            <div className="rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                ProductLobby may partner with third-party services that set their own cookies. These include:
              </p>
              <ul className="space-y-3 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-600 dark:bg-violet-400"></span>
                  <span><strong>Analytics Providers:</strong> For tracking and performance measurement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-600 dark:bg-violet-400"></span>
                  <span><strong>Advertising Networks:</strong> For targeted marketing campaigns</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-violet-600 dark:bg-violet-400"></span>
                  <span><strong>Payment Processors:</strong> For secure transaction handling</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Updates to Policy */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              Updates to This Policy
            </h2>
            <div className="rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-slate-600 dark:text-slate-400">
                We may update this cookie policy to reflect changes in technology, regulations, or our practices. We will notify you of any material changes by updating the "Last Updated" date below. Your continued use of ProductLobby following such changes constitutes your acceptance of the updated policy.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              Questions About Cookies?
            </h2>
            <div className="rounded-lg border border-lime-200 bg-lime-50 p-8 dark:border-lime-900 dark:bg-lime-950">
              <p className="mb-6 text-slate-700 dark:text-slate-300">
                If you have questions about our cookie practices or how we use your data, we're here to help. Contact our privacy team:
              </p>
              <div className="space-y-2 text-slate-700 dark:text-slate-300">
                <p><strong>Email:</strong> privacy@productlobby.com</p>
                <p><strong>Support:</strong> Visit our help center for more information</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mb-16 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button 
              className="bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-700"
            >
              Manage Cookie Preferences
            </Button>
            <Button 
              variant="outline"
              className="border-slate-300 text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
            >
              View Privacy Policy
            </Button>
          </div>

          {/* Last Updated */}
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <p>Last updated: February 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
