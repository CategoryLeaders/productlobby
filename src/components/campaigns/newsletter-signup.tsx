'use client'

import React, { useState, useEffect } from 'react'
import { Mail, Loader2, Check, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterSignupProps {
  campaignId: string
  className?: string
  variant?: 'minimal' | 'standard' | 'prominent'
}

export function NewsletterSignup({
  campaignId,
  className,
  variant = 'standard',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch subscriber count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/newsletter`)
        if (response.ok) {
          const data = await response.json()
          setSubscriberCount(data.data.subscriberCount || 0)
        }
      } catch (err) {
        console.error('Error fetching subscriber count:', err)
      }
    }

    fetchCount()
  }, [campaignId])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.status === 401) {
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to subscribe')
      }

      const data = await response.json()
      setSubscriberCount(data.data.subscriberCount)
      setIsSubscribed(true)
      setSuccess(true)
      setEmail('')

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe')
    } finally {
      setIsLoading(false)
    }
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={cn('', className)}>
        <form onSubmit={handleSubscribe} className="flex gap-2">
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            disabled={isLoading || isSubscribed}
          />
          <button
            type="submit"
            disabled={isLoading || isSubscribed}
            className="px-3 py-2 bg-violet-600 text-white text-sm rounded-lg hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Subscribe'}
          </button>
        </form>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    )
  }

  // Standard variant
  if (variant === 'standard') {
    return (
      <div
        className={cn(
          'border border-gray-200 rounded-lg p-4 bg-white',
          className
        )}
      >
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-violet-600" />
              Get Campaign Updates
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              Subscribe to stay updated on this campaign
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                disabled={isLoading || isSubscribed}
              />
              <button
                type="submit"
                disabled={isLoading || isSubscribed}
                className="px-4 py-2 bg-violet-600 text-white text-sm rounded-md hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Subscribing...</span>
                  </>
                ) : success ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}
            {success && (
              <p className="text-xs text-green-600 font-medium">
                Successfully subscribed to updates!
              </p>
            )}
          </form>

          {subscriberCount > 0 && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 text-xs text-gray-600">
              <Users className="w-3.5 h-3.5" />
              <span>
                {subscriberCount} {subscriberCount === 1 ? 'person' : 'people'} subscribed
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Prominent variant
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-violet-50 to-lime-50 border-2 border-violet-200 rounded-xl p-6',
        className
      )}
    >
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-violet-600" />
            Never Miss an Update
          </h2>
          <p className="text-sm text-gray-700 mt-1">
            Subscribe to get campaign news delivered to your inbox
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="space-y-3">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm border-2 border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent placeholder-gray-400"
            disabled={isLoading || isSubscribed}
          />

          <button
            type="submit"
            disabled={isLoading || isSubscribed}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-medium rounded-lg hover:from-violet-700 hover:to-violet-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subscribing...
              </>
            ) : success ? (
              <>
                <Check className="w-4 h-4" />
                Subscribed!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Subscribe Now
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-600 font-medium text-center">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600 font-medium text-center">
              Check your email for confirmation!
            </p>
          )}
        </form>

        {subscriberCount > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-violet-200">
            <Users className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-700">
              {subscriberCount} {subscriberCount === 1 ? 'subscriber' : 'subscribers'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
