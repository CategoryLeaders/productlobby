import { Metadata } from "next";
import { Map, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sitemap | ProductLobby",
  description: "Navigate the entire ProductLobby platform with our comprehensive sitemap.",
};

interface SitemapSection {
  title: string;
  pages: Array<{
    label: string;
    href: string;
  }>;
}

const sitemapSections: SitemapSection[] = [
  {
    title: "Main",
    pages: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Campaigns",
    pages: [
      { label: "Browse", href: "/campaigns" },
      { label: "Trending", href: "/campaigns/trending" },
      { label: "Categories", href: "/campaigns/categories" },
      { label: "Search", href: "/campaigns/search" },
    ],
  },
  {
    title: "Dashboard",
    pages: [
      { label: "Supporter Dashboard", href: "/dashboard/supporter" },
      { label: "Creator Dashboard", href: "/dashboard/creator" },
      { label: "Brand Dashboard", href: "/dashboard/brand" },
    ],
  },
  {
    title: "Account",
    pages: [
      { label: "Settings", href: "/account/settings" },
      { label: "Profile", href: "/account/profile" },
      { label: "Notifications", href: "/account/notifications" },
      { label: "Data Export", href: "/account/data-export" },
    ],
  },
  {
    title: "Legal",
    pages: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Cookies", href: "/legal/cookies" },
      { label: "Accessibility", href: "/legal/accessibility" },
    ],
  },
  {
    title: "Community",
    pages: [
      { label: "Changelog", href: "/community/changelog" },
      { label: "Roadmap", href: "/community/roadmap" },
      { label: "Open Source", href: "/community/open-source" },
      { label: "Help", href: "/community/help" },
      { label: "Referrals", href: "/community/referrals" },
    ],
  },
];

export default function SitemapBrowserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-violet-100 dark:bg-violet-900 rounded-lg">
              <Map className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Site Map
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore the complete ProductLobby platform structure and navigate to any page
          </p>
        </div>
      </section>

      {/* Sitemap Sections */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sitemapSections.map((section) => (
              <div
                key={section.title}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Section Header */}
                <div className="bg-gradient-to-r from-violet-600 to-lime-500 px-6 py-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ChevronRight className="w-5 h-5" />
                    {section.title}
                  </h2>
                </div>

                {/* Section Links */}
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {section.pages.map((page) => (
                    <a
                      key={page.href}
                      href={page.href}
                      className="flex items-center justify-between px-6 py-4 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors group"
                    >
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 font-medium transition-colors">
                        {page.label}
                      </span>
                      <ExternalLink className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-lime-500 transition-colors opacity-0 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-violet-50 to-lime-50 dark:from-violet-950 dark:to-lime-950 rounded-lg p-8 border border-violet-200 dark:border-violet-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              About This Sitemap
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This sitemap provides a comprehensive overview of all publicly accessible pages on the ProductLobby platform. Whether you're a supporter, creator, or brand partner, you can quickly navigate to the sections and features relevant to your needs.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  For Supporters
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Browse campaigns, manage your profile, and track your support activity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  For Creators
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Launch campaigns, view analytics, and connect with your audience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
