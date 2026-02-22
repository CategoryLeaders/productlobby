'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar, Footer } from '@/components/shared'
import { Spinner } from '@/components/ui'

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    const redirectToProfile = async () => {
      try {
        // Fetch current user
        const response = await fetch('/api/auth/me')

        if (response.ok) {
          const user = await response.json()

          if (user.handle) {
            // Redirect to user's profile
            router.push(`/profile/${user.handle}`)
          } else {
            // User doesn't have a handle, redirect to create one
            router.push('/settings/profile')
          }
        } else {
          // Not logged in, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Error redirecting to profile:', error)
        router.push('/login')
      }
    }

    redirectToProfile()
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="py-12 flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </main>
      <Footer />
    </div>
  )
}
