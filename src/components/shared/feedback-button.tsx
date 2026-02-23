'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, X } from 'lucide-react'

/**
 * Floating feedback button component
 * Small floating button in bottom-right corner that links to feedback page
 * Can be placed anywhere in the app
 */
export function FeedbackButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          Send us feedback
          <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}

      {/* Button */}
      <Link href="/feedback">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-violet-600 opacity-75 animate-pulse"></div>

          {/* Notification dot */}
          <div className="absolute top-1 right-1 w-3 h-3 bg-lime-400 rounded-full shadow-md"></div>
        </button>
      </Link>

      {/* Mobile hint */}
      <div className="sm:hidden absolute bottom-full right-0 mb-2 text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
        Tap for feedback
      </div>
    </div>
  )
}

export default FeedbackButton
