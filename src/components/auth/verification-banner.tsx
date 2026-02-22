'use client'

import { useState, useEffect } from 'react'
import { getCurrentUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and not verified
    checkVerificationStatus()
  }, [])

  async function checkVerificationStatus() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        if (data.user && !data.user.emailVerified) {
          // Check if user dismissed the banner in this session
          const wasDismissed = sessionStorage.getItem('verification-banner-dismissed')
          if (!wasDismissed) {
            setIsVisible(true)
          }
        }
      }
    } catch {
      // Silently fail if auth check fails
    }
  }

  async function handleResendEmail() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to verification page
        router.push('/auth/verify-email')
      } else {
        alert(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleDismiss() {
    setIsDismissed(true)
    // Store dismissal in session storage so it persists during this session
    sessionStorage.setItem('verification-banner-dismissed', 'true')
  }

  if (!isVisible || isDismissed) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-b-2 border-amber-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <svg
              className="w-5 h-5 text-amber-600 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-900">
                Verify your email to unlock all features
              </p>
              <p className="text-xs text-amber-800 mt-1">
                You'll be able to create campaigns, make pledges, and access exclusive rewards.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
              size="sm"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>
            <button
              onClick={handleDismiss}
              className="text-amber-700 hover:text-amber-900 p-1 rounded hover:bg-amber-200 transition-colors"
              aria-label="Dismiss"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
