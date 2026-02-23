'use client'

import { useState } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface DuplicateButtonProps {
  campaignId: string
  campaignTitle: string
  className?: string
}

export function DuplicateButton({
  campaignId,
  campaignTitle,
  className,
}: DuplicateButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  const handleDuplicate = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to duplicate campaign')
      }

      const data = await response.json()
      addToast('Campaign duplicated successfully', 'success')
      setShowConfirm(false)

      // Redirect to the edit page of the new campaign
      router.push(`/campaigns/${data.slug}/edit`)
    } catch (error) {
      console.error('Duplicate error:', error)
      addToast(
        error instanceof Error ? error.message : 'Failed to duplicate campaign',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className={cn('flex items-center gap-2', className)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        Duplicate Campaign
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Duplicate Campaign?</h2>
            <p className="mb-4 text-sm text-gray-600">
              This will create a copy of "{campaignTitle}" as a draft. Comments,
              lobbies, and shares won't be copied.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDuplicate}
                disabled={loading}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  'Create Copy'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
