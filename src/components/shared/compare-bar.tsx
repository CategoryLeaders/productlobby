'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface CompareBarProps {
  onClose?: () => void
}

interface SelectedCampaign {
  id: string
  title: string
}

export const CompareBar: React.FC<CompareBarProps> = ({ onClose }) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<SelectedCampaign[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const loadSelected = () => {
      if (typeof window === 'undefined') return

      try {
        const stored = localStorage.getItem('productlobby-compare-ids')
        if (stored) {
          const ids = stored.split(',').filter(id => id.trim())
          // In a real scenario, we would fetch campaign titles here
          // For now, we'll just store IDs and fetch titles from sessionStorage
          const campaignsData = sessionStorage.getItem('productlobby-compare-titles')
          if (campaignsData) {
            const campaigns = JSON.parse(campaignsData) as SelectedCampaign[]
            setSelectedCampaigns(campaigns.filter(c => ids.includes(c.id)))
          } else {
            setSelectedCampaigns(ids.map(id => ({ id, title: 'Campaign' })))
          }
        }
      } catch (error) {
        console.error('Error loading compare bar data:', error)
      }
    }

    loadSelected()
  }, [])

  // Show/hide based on number of selected campaigns
  useEffect(() => {
    setIsVisible(selectedCampaigns.length >= 2)
  }, [selectedCampaigns])

  const handleClear = () => {
    localStorage.removeItem('productlobby-compare-ids')
    sessionStorage.removeItem('productlobby-compare-titles')
    setSelectedCampaigns([])
    setIsVisible(false)
    if (onClose) {
      onClose()
    }
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('compareBarClear'))
  }

  const handleRemove = (id: string) => {
    const remaining = selectedCampaigns.filter(c => c.id !== id)
    if (remaining.length < 2) {
      handleClear()
      return
    }

    const ids = remaining.map(c => c.id).join(',')
    localStorage.setItem('productlobby-compare-ids', ids)

    setSelectedCampaigns(remaining)
    window.dispatchEvent(new CustomEvent('compareBarUpdate'))
  }

  if (!isVisible) {
    return null
  }

  const comparisonUrl = `/campaigns/compare?ids=${selectedCampaigns.map(c => c.id).join(',')}`

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Info Section */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <p className="text-sm font-semibold text-gray-900">
                  Compare {selectedCampaigns.length} campaigns
                </p>
              </div>

              {/* Mini Campaign List */}
              <div className="hidden sm:flex items-center gap-2 overflow-x-auto pb-2">
                {selectedCampaigns.map(campaign => (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1 flex-shrink-0 text-sm"
                  >
                    <span className="text-gray-700 truncate max-w-[150px]">
                      {campaign.title}
                    </span>
                    <button
                      onClick={() => handleRemove(campaign.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                      title="Remove from comparison"
                      aria-label={`Remove ${campaign.title}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleClear}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                title="Clear selection"
              >
                Clear
              </button>

              <Link href={comparisonUrl}>
                <Button
                  variant="primary"
                  size="sm"
                  className="inline-flex items-center gap-2 text-sm"
                >
                  Compare Now
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
