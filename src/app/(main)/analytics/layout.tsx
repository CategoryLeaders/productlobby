'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, TrendingUp, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Overview',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Campaigns',
    href: '/analytics/campaigns',
    icon: TrendingUp,
  },
]

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-2">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
                <p className="text-sm text-gray-600">Campaign performance & insights</p>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || (item.href !== '/analytics' && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-violet-100 text-violet-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="bg-violet-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-violet-600" />
                    <h3 className="font-semibold text-sm text-gray-900">Pro Tips</h3>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Track signal score trends over time</li>
                    <li>• Compare category performance</li>
                    <li>• Monitor conversion rates</li>
                    <li>• Analyze peak activity hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
