'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>(
    token ? 'loading' : 'no-token'
  )
  const [message, setMessage] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    // Auto-verify when token is present
    verifyEmail(token)
  }, [token])

  async function verifyEmail(verificationToken: string) {
    try {
      setStatus('loading')
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setUserEmail(data.user?.email || '')
        setMessage(data.message)

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(data.error || 'Failed to verify email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An error occurred. Please try again.')
      console.error('Verification error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {status === 'loading' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-violet-600"></div>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying your email</h1>
            <p className="text-slate-600">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Email verified!</h1>
            <p className="text-slate-600 mb-6">
              Congratulations! Your email has been verified. You now have access to all ProductLobby features.
            </p>
            {userEmail && (
              <p className="text-sm text-slate-500 mb-6">
                Verified email: <span className="font-medium text-slate-700">{userEmail}</span>
              </p>
            )}
            <p className="text-sm text-slate-600 mb-6">
              Redirecting to your dashboard in 3 seconds...
            </p>
            <Link href="/dashboard">
              <Button className="w-full bg-violet-600 hover:bg-violet-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification failed</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link href="/auth/send-verification">
                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  Request new verification email
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'no-token' && (
          <div className="p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
            <p className="text-slate-600 mb-6">
              We've sent a verification link to your email address. Click the link in the email to verify your account.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
              <p className="font-medium mb-2">Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1 text-left">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Wait a few minutes before requesting another email</li>
              </ul>
            </div>
            <div className="space-y-3">
              <Link href="/auth/send-verification">
                <Button className="w-full bg-violet-600 hover:bg-violet-700">
                  Send verification email
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Back to home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
