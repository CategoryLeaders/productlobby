'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import {
  Home,
  BarChart3,
  Trophy,
  Settings,
  Compass,
  Megaphone,
  Zap,
  Heart,
  Menu,
  X,
} from 'lucide-react'

type DashboardRole = 'creator' | 'brand' | 'supporter'

export interface SidebarProps {
  role: DashboardRole
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getNavItems = () => {
    switch (role) {
      case 'creator':
        return [
          { label: 'Dashboard', href: '/dashboard', icon: Home },
          { label: 'My Campaigns', href: '/dashboard/campaigns', icon: Megaphone },
          { label: 'Saved', href: '/dashboard/saved', icon: Heart },
          { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
          { label: 'Revenue', href: '/dashboard/revenue', icon: Zap },
          { label: 'Settings', href: '/dashboard/settings', icon: Settings },
        ]
      case 'brand':
        return [
          { label: 'Dashboard', href: '/brand/dashboard', icon: Home },
          { label: 'Campaigns', href: '/brand/dashboard/campaigns', icon: Megaphone },
          { label: 'Reports', href: '/brand/dashboard/reports', icon: BarChart3 },
          { label: 'Settings', href: '/brand/settings', icon: Settings },
        ]
      case 'supporter':
        return [
          { label: 'My Lobbies', href: '/lobbies', icon: Compass },
          { label: 'Saved', href: '/dashboard/saved', icon: Heart },
          { label: 'Achievements', href: '/dashboard/achievements', icon: Trophy },
          { label: 'Notifications', href: '/notifications', icon: Zap },
          { label: 'My Score', href: '/score', icon: Trophy },
          { label: 'Settings', href: '/settings', icon: Settings },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        {/* Logo */}
        <div className="px-6 py-8 border-b border-gray-200">
          <Link href="/">
            <Logo size="md" />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm',
                  active
                    ? 'bg-violet-100 text-violet-700 border-l-4 border-violet-700'
                    : 'text-foreground hover:bg-gray-50'
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Hamburger & Sidebar */}
      <div className="md:hidden">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-40 p-3 bg-violet-600 text-white rounded-full shadow-elevated hover:bg-violet-700 transition-colors duration-200"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Sidebar */}
        {isOpen && (
          <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)}>
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 shadow-elevated animate-slide-up">
              {/* Logo */}
              <div className="px-6 py-8 border-b border-gray-200">
                <Link href="/">
                  <Logo size="md" />
                </Link>
              </div>

              {/* Nav Items */}
              <nav className="px-4 py-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm',
                        active
                          ? 'bg-violet-100 text-violet-700 border-l-4 border-violet-700'
                          : 'text-foreground hover:bg-gray-50'
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
