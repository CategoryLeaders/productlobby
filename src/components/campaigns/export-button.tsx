'use client'

import { useState } from 'react'
import { Download, Loader2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  campaignId: string
  campaignSlug: string
  className?: string
}

export function ExportButton({
  campaignId,
  campaignSlug,
  className,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { addToast } = useToast()

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/campaigns/${campaignId}/export?format=${format}`)

      if (!response.ok) {
        throw new Error('Failed to export campaign')
      }

      // Get the blob from response
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('content-disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename="')[1]?.split('"')[0]
        : `campaign-${campaignSlug}.${format}`

      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      addToast(`Campaign exported as ${format.toUpperCase()}`, 'success')
      setShowDropdown(false)
    } catch (error) {
      console.error('Export error:', error)
      addToast('Failed to export campaign', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        className="flex items-center gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg">
          <button
            onClick={() => handleExport('json')}
            disabled={loading}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 first:rounded-t-md"
          >
            Export as JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={loading}
            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 last:rounded-b-md border-t border-gray-200"
          >
            Export as CSV
          </button>
        </div>
      )}
    </div>
  )
}
