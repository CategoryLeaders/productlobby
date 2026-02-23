'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Copy, ExternalLink, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DuplicateMatch {
  id: string
  title: string
  lobbyCount: number
  similarity: number
}

interface DuplicateDetectorProps {
  campaignId: string
  campaignTitle: string
  onMergeRequest?: (duplicateId: string) => void
}

export const DuplicateDetector: React.FC<DuplicateDetectorProps> = ({
  campaignId,
  campaignTitle,
  onMergeRequest,
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDuplicates = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(
          `/api/campaigns/${campaignId}/duplicates`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch duplicates')
        }
        
        const data = await response.json()
        setDuplicates(data.duplicates || [])
      } catch (err) {
        console.error('Error fetching duplicates:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (!dismissed) {
      fetchDuplicates()
    }
  }, [campaignId, dismissed])

  if (dismissed || loading || duplicates.length === 0) {
    if (error) {
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <p>Unable to check for duplicates at this time.</p>
        </div>
      )
    }
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  const handleMergeRequest = (duplicateId: string) => {
    if (onMergeRequest) {
      onMergeRequest(duplicateId)
    }
  }

  const getMatchColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-red-600'
    if (similarity >= 0.6) return 'text-orange-600'
    return 'text-yellow-600'
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-3">
            Potential Duplicate Campaigns Found
          </h3>
          
          <div className="space-y-2 mb-4">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="flex items-center justify-between rounded-md bg-white p-3 border border-amber-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/campaigns/${dup.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-amber-900 hover:underline flex items-center gap-1"
                    >
                      {dup.title}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Copy className="h-3.5 w-3.5" />
                      {dup.lobbyCount} lobbies
                    </span>
                    <span className={cn('font-medium', getMatchColor(dup.similarity))}>
                      {Math.round(dup.similarity * 100)}% match
                    </span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMergeRequest(dup.id)}
                  className="ml-2"
                >
                  Merge Request
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
              className="text-gray-600 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
