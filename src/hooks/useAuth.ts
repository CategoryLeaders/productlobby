'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  displayName: string
  handle?: string
  emailVerified: boolean
  phoneVerified: boolean
}

export function useAuth() {
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        if (res.status === 401) return null
        throw new Error('Failed to fetch user')
      }
      const data = await res.json()
      return data.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to logout')
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null)
      router.push('/')
    },
  })

  const requestMagicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send magic link')
      }
    },
  })

  const sendPhoneCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      const res = await fetch('/api/auth/phone/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send SMS')
      }
    },
  })

  const verifyPhoneCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Verification failed')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    requestMagicLink: requestMagicLinkMutation.mutate,
    isRequestingMagicLink: requestMagicLinkMutation.isPending,
    sendPhoneCode: sendPhoneCodeMutation.mutate,
    isSendingPhoneCode: sendPhoneCodeMutation.isPending,
    verifyPhoneCode: verifyPhoneCodeMutation.mutate,
    isVerifyingPhoneCode: verifyPhoneCodeMutation.isPending,
  }
}
