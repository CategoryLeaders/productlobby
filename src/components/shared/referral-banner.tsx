'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Share2, X, ArrowRight } from 'lucide-react'

export function ReferralBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed this banner before
    const wasDismissed = localStorage.getItem('referral-banner-dismissed')
    if (wasDismissed) {
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    setIsVisible(false)
    localStorage.setItem('referral-banner-dismissed', 'true')
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className={cn(
      'bg-gradient-to-r from-violet-600 to-lime-500 text-white overflow-hidden',
      dismissed && 'hidden'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Share2 className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Invite friends, earn points!</p>
              <p className="text-xs opacity-90 mt-0.5">
                Share your referral link and get 10 points per signup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/referrals"
              className="px-4 py-2 bg-white text-violet-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
