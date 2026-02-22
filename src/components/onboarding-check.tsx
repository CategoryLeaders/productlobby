'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

/**
 * Client component that checks if user needs to complete onboarding
 * Makes an API call to check the user's onboarding status
 */
export default function OnboardingCheck() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkOnboarding = async () => {
      // Skip check on onboarding page and exempted routes
      if (
        pathname === '/onboarding' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth')
      ) {
        return
      }

      try {
        const response = await fetch('/api/user/onboarding/status', {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          if (data.needsOnboarding && pathname !== '/onboarding') {
            router.push('/onboarding')
          }
        }
      } catch (error) {
        // Silently fail - let the app continue
      }
    }

    checkOnboarding()
  }, [pathname, router])

  return null
}
