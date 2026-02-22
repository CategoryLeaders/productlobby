'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

export default function UpdatesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Updates page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <PageHeader
          title="Campaign Updates"
          description="Latest news and developments from the brand"
        />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading the updates. Please try again.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={reset} className="gap-2">
                Try Again
              </Button>
              <Link href="/campaigns" className="flex-1 sm:flex-auto">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
