'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Mail, Check } from 'lucide-react'

export default function UnsubscribePage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'general'
  const token = searchParams.get('token')
  
  const [unsubscribed, setUnsubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const typeLabels: Record<string, string> = {
    general: 'General Notifications',
    campaigns: 'Campaign Updates',
    brands: 'Brand Responses',
    marketing: 'Marketing Emails',
    digest: 'Weekly Digest',
    newsletters: 'Newsletters',
  }

  const typeDescription: Record<string, string> = {
    general: 'all email notifications',
    campaigns: 'campaign update emails',
    brands: 'brand response emails',
    marketing: 'marketing and promotional emails',
    digest: 'weekly digest emails',
    newsletters: 'newsletter emails',
  }

  const displayType = typeLabels[type] || 'Emails'
  const displayDescription = typeDescription[type] || 'these emails'

  const handleUnsubscribe = async () => {
    try {
      setLoading(true)
      // In a real implementation, this would send the token to an API
      // For now, we'll just show the success state after a brief delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setUnsubscribed(true)
    } catch (error) {
      console.error('Error unsubscribing:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {!unsubscribed ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-violet-100 rounded-full">
                <Mail className="w-6 h-6 text-violet-600" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Unsubscribe from Emails
            </h1>

            {/* Description */}
            <p className="text-center text-gray-600 mb-8">
              You're about to unsubscribe from{' '}
              <span className="font-semibold">{displayDescription}</span>.
            </p>

            {/* Type Badge */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-600 mb-1">Email Type:</p>
              <p className="text-lg font-semibold text-gray-900">{displayType}</p>
            </div>

            {/* Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-amber-800">
                You can manage all your notification preferences at any time in your account settings.
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
              >
                {loading ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
              
              <Link
                href="/settings/notifications"
                className="block text-center px-4 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
              >
                Manage All Preferences
              </Link>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-500 mt-6">
              Questions? <Link href="/" className="text-violet-600 hover:text-violet-700">Contact Support</Link>
            </p>
          </div>
        ) : (
          /* Success State */
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Unsubscribed Successfully
            </h1>

            {/* Confirmation */}
            <p className="text-center text-gray-600 mb-8">
              You have been unsubscribed from{' '}
              <span className="font-semibold">{displayDescription}</span>.
            </p>

            {/* Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <p className="text-sm text-green-800">
                You won't receive these emails going forward. Your other notification preferences remain unchanged.
              </p>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <Link
                href="/settings/notifications"
                className="block text-center px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Manage Notification Preferences
              </Link>
              
              <Link
                href="/"
                className="block text-center px-4 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
              >
                Return to ProductLobby
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
