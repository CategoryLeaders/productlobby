'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PledgeButtonProps {
  campaignId: string
  className?: string
  showCount?: boolean
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export function PledgeButton({
  campaignId,
  className,
  showCount = true,
  variant = 'primary',
  size = 'md',
}: PledgeButtonProps) {
  const [pledgeCount, setPledgeCount] = useState<number>(0)
  const [isPledged, setIsPledged] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch pledge count
  useEffect(() => {
    const fetchPledgeCount = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/pledge`)

        if (response.ok) {
          const data = await response.json()
          setPledgeCount(data.data.totalPledges || 0)
        }
      } catch (err) {
        console.error('Error fetching pledge count:', err)
      }
    }

    fetchPledgeCount()
  }, [campaignId])

  const handlePledge = async () => {
    if (isPledged) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/campaigns/${campaignId}/pledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: "I'd buy this!",
        }),
      })

      if (response.status === 401) {
        // Redirect to login
        window.location.href = '/login'
        return
      }

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create pledge')
      }

      // Update UI
      setPledgeCount((prev) => prev + 1)
      setIsPledged(true)
      setIsConfirmed(true)

      // Auto-hide confirmation after 2 seconds
      setTimeout(() => {
        setIsConfirmed(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pledge')
    } finally {
      setIsLoading(false)
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-3 text-base gap-2.5',
  }

  // Variant classes
  const variantClasses = {
    primary: isPledged
      ? 'bg-lime-100 text-lime-700 border border-lime-200'
      : 'bg-violet-600 hover:bg-violet-700 text-white border border-violet-600',
    secondary: isPledged
      ? 'bg-lime-50 text-lime-600 border border-lime-200'
      : 'bg-white hover:bg-gray-50 text-violet-600 border border-violet-200 hover:border-violet-300',
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePledge}
        disabled={isLoading || isPledged}
        className={cn(
          'inline-flex items-center font-medium rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Pledging...
          </>
        ) : isConfirmed ? (
          <>
            <Check className="w-4 h-4" />
            Pledged!
          </>
        ) : (
          <>
            <Heart className={cn('w-4 h-4', isPledged && 'fill-current')} />
            {isPledged ? "You've Pledged" : "I'd Buy This!"}
          </>
        )}
      </button>

      {/* Show count and confirmation message */}
      {showCount && (
        <div className="text-xs text-gray-600">
          {pledgeCount > 0 && (
            <>
              <p className="font-medium">
                {pledgeCount} {pledgeCount === 1 ? 'person' : 'people'} have pledged
              </p>
              {isConfirmed && (
                <p className="text-lime-600 font-medium mt-1">
                  ✓ Your pledge has been recorded!
                </p>
              )}
            </>
          )}
          {error && (
            <p className="text-red-600 font-medium mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
