import React from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const columns = [
    {
      title: '',
      items: [],
      showLogo: true,
    },
    {
      title: 'Platform',
      items: [
        { label: 'Browse Campaigns', href: '/campaigns' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Success Stories', href: '/success-stories' },
        { label: 'Brand Leaderboard', href: '/leaderboard' },
      ],
    },
    {
      title: 'Create',
      items: [
        { label: 'Start a Campaign', href: '/campaigns/create' },
        { label: 'Creator Dashboard', href: '/dashboard' },
        { label: 'Brand Portal', href: '/brand' },
        { label: 'Lobbying Toolkit', href: '/toolkit' },
      ],
    },
    {
      title: 'Company',
      items: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Press', href: '/press' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ]

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Logo & Tagline */}
          <div>
            <div className="mb-2">
              <Logo size="md" />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Your ideas, their products.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Platform
            </h3>
            <nav className="space-y-3">
              {columns[1].items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 text-sm hover:text-violet-600 transition-colors duration-200 block"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Create */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Create
            </h3>
            <nav className="space-y-3">
              {columns[2].items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 text-sm hover:text-violet-600 transition-colors duration-200 block"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
              Company
            </h3>
            <nav className="space-y-3">
              {columns[3].items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 text-sm hover:text-violet-600 transition-colors duration-200 block"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} ProductLobby · All rights reserved
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-gray-600 text-sm hover:text-violet-600 transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 text-sm hover:text-violet-600 transition-colors duration-200"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="text-gray-600 text-sm hover:text-violet-600 transition-colors duration-200"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
