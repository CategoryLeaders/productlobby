'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const LEGAL_LINKS = [
  { href: '/legal/terms', label: 'Terms of Service', icon: '📜' },
  { href: '/legal/privacy', label: 'Privacy Policy', icon: '🔒' },
  { href: '/legal/cookies', label: 'Cookie Policy', icon: '🍪' },
  { href: '/legal/acceptable-use', label: 'Acceptable Use', icon: '⚖️' },
]

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {children}

      {/* Footer Legal Links */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <Card
                  variant={pathname === link.href ? 'highlighted' : 'interactive'}
                  className={cn(
                    'p-4 h-full cursor-pointer transition-all duration-200',
                    pathname === link.href && 'bg-violet-100 border-violet-300'
                  )}
                >
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h3 className="font-semibold text-gray-900 text-sm">{link.label}</h3>
                </Card>
              </Link>
            ))}
          </div>

          {/* Additional Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              © {new Date().getFullYear()} ProductLobby. All rights reserved.
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              For questions about our legal documents, contact{' '}
              <a href="mailto:legal@productlobby.com" className="text-violet-600 hover:text-violet-700">
                legal@productlobby.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
