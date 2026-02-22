'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/logo'
import { NotificationBell } from './notification-bell'
import {
  Search,
  Menu,
  X,
  User,
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = [
    { label: 'Browse', href: '/campaigns' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ]

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 bg-white z-50 h-16 transition-shadow duration-200',
          scrolled ? 'shadow-elevated' : 'border-b border-gray-200'
        )}
      >
        <div className="h-full px-4 md:px-6 lg:px-8 max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center: Nav Links (hidden on mobile) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-foreground font-medium text-sm hover:text-violet-600 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth Actions */}
          <div className="flex items-center gap-4">
            {!isLoading && !user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="md"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/campaigns/new">
                  <Button
                    variant="primary"
                    size="md"
                  >
                    Start a Campaign
                  </Button>
                </Link>
              </div>
            ) : !isLoading && user ? (
              <div className="hidden md:flex items-center gap-4">
                {/* Search Icon */}
                <button className="p-2 text-foreground hover:bg-gray-100 rounded-lg transition-colors duration-200">
                  <Search size={20} />
                </button>

                {/* Notification Bell */}
                <NotificationBell />

                {/* User Menu */}
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <Avatar
                      src={undefined}
                      alt={user.displayName || user.email}
                      initials={(user.displayName || user.email).charAt(0).toUpperCase()}
                      size="sm"
                    />
                    <ChevronDown size={16} className="text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-elevated animate-fade-in z-50">
                      <div className="py-2">
                        <Link
                          href="/dashboard/campaigns"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span>My Campaigns</span>
                        </Link>
                        <Link
                          href="/lobbies"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span>My Lobbies</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-200 my-2"></div>
                        <button
                          onClick={() => {
                            logout()
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut size={16} />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-elevated z-40 animate-fade-in">
          <div className="p-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-foreground font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="space-y-2 border-t border-gray-200 pt-3 mt-3">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-foreground font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/campaigns/create"
                  className="block px-4 py-2 text-white bg-violet-600 font-medium rounded-lg hover:bg-violet-700 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start a Campaign
                </Link>
              </div>
            )}

            {user && (
              <div className="space-y-2 border-t border-gray-200 pt-3 mt-3">
                <Link
                  href="/dashboard/campaigns"
                  className="block px-4 py-2 text-foreground font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Campaigns
                </Link>
                <Link
                  href="/lobbies"
                  className="block px-4 py-2 text-foreground font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Lobbies
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-foreground font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-foreground font-medium rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setMobileMenuOpen(false)
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
