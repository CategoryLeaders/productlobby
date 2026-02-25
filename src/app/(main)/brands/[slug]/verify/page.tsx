'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  Shield,
} from 'lucide-react'

interface VerifyPageProps {
  params: {
    slug: string
  }
}

export default function BrandVerifyPage({ params }: VerifyPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const brandId = searchParams.get('brandId')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [brandName, setBrandName] = useState('')

  useEffect(() => {
    if (!token || !brandId) {
      setStatus('error')
      setMessage('Invalid verification link. Missing token or brand information.')
      return
    }

    verifyBrand()
  }, [token, brandId])

  const verifyBrand = async () => {
    try {
      const res = await fetch(`/api/brands/${brandId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Brand verified successfully!')
        setBrandName(data.data?.brandName || params.slug)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed. Please try again.')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {status === 'loading' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Loader2 className="w-16 h-16 text-violet-600 animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Verifying your brand...
              </h2>
              <p className="text-gray-600">
                Please wait while we confirm your brand ownership.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Brand Verified!
                </h2>
                <p className="text-green-50">
                  {brandName || 'Your brand'} has been successfully verified on ProductLobby.
                </p>
              </div>

              <div className="p-8 space-y-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-sm">
                      You are now the brand owner
                    </p>
                    <p className="text-green-700 text-sm mt-1">
                      You can view campaigns targeting your brand, invite team members, and engage with your community.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => router.push('/brand/dashboard')}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
                >
                  Go to Brand Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => router.push(`/brands/${params.slug}`)}
                  variant="outline"
                  className="w-full py-3"
                >
                  View Brand Page
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-center text-white">
                <XCircle className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">
                  Verification Failed
                </h2>
                <p className="text-red-50">{message}</p>
              </div>

              <div className="p-8 space-y-4">
                <p className="text-gray-600 text-sm text-center">
                  The verification link may have expired or already been used.
                  You can start a new claim from the brand page.
                </p>

                <Button
                  onClick={() => router.push(`/brands/${params.slug}`)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3"
                >
                  Return to Brand Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={() => router.push('/brand/claim')}
                  variant="outline"
                  className="w-full py-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
