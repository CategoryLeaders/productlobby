'use client'

import React, { useState } from 'react'
import { Code, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmbedWidgetProps {
  campaignId: string
  slug: string
  title: string
  lobbyCount: number
}

type ButtonColor = 'violet' | 'lime' | 'blue' | 'red'
type ButtonSize = 'sm' | 'md' | 'lg'

export function EmbedWidget({
  campaignId,
  slug,
  title,
  lobbyCount,
}: EmbedWidgetProps) {
  const [buttonColor, setButtonColor] = useState<ButtonColor>('violet')
  const [buttonSize, setButtonSize] = useState<ButtonSize>('md')
  const [showCount, setShowCount] = useState(true)
  const [copied, setCopied] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.productlobby.com'
  const embedUrl = `${appUrl}/embed/${slug}`

  // Get color styles for preview
  const colorClasses: Record<ButtonColor, string> = {
    violet: 'bg-violet-600 hover:bg-violet-700',
    lime: 'bg-lime-500 hover:bg-lime-600',
    blue: 'bg-blue-600 hover:bg-blue-700',
    red: 'bg-red-600 hover:bg-red-700',
  }

  // Get size styles for preview
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  // Generate HTML embed code
  const generateEmbedCode = () => {
    const params = new URLSearchParams({
      color: buttonColor,
      size: buttonSize,
      showCount: showCount.toString(),
    })

    return `<iframe
  src="${embedUrl}?${params.toString()}"
  width="100%"
  height="60"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  title="Lobby This Product on ProductLobby"
></iframe>`
  }

  const embedCode = generateEmbedCode()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Code className="h-5 w-5 text-violet-600" />
        <h3 className="text-lg font-semibold text-gray-900">Embed Widget</h3>
      </div>

      {/* Customization Options */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Color
          </label>
          <div className="flex gap-2">
            {(['violet', 'lime', 'blue', 'red'] as const).map((color) => (
              <button
                key={color}
                onClick={() => setButtonColor(color)}
                className={cn(
                  'w-10 h-10 rounded-lg border-2 transition-all',
                  buttonColor === color
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-300 hover:border-gray-400',
                  {
                    'bg-violet-600': color === 'violet',
                    'bg-lime-500': color === 'lime',
                    'bg-blue-600': color === 'blue',
                    'bg-red-600': color === 'red',
                  }
                )}
                title={`${color.charAt(0).toUpperCase() + color.slice(1)} button`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Button Size
          </label>
          <div className="flex gap-2">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setButtonSize(size)}
                className={cn(
                  'px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all',
                  buttonSize === size
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-300 hover:border-gray-400'
                )}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showCount}
              onChange={(e) => setShowCount(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-violet-600"
            />
            <span className="text-sm font-medium text-gray-700">
              Show Lobby Count
            </span>
          </label>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Preview</h4>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6 border border-gray-200">
          <button
            className={cn(
              'font-semibold text-white rounded-lg transition-colors cursor-not-allowed',
              colorClasses[buttonColor],
              sizeClasses[buttonSize]
            )}
            disabled
          >
            Lobby This Product
            {showCount && ` (${lobbyCount})`}
          </button>
        </div>
      </div>

      {/* Code Section */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Embed Code</h4>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-gray-100 text-xs font-mono whitespace-pre-wrap break-words">
            <code>{embedCode}</code>
          </pre>
        </div>
      </div>

      {/* Copy Button */}
      <Button
        onClick={handleCopy}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" />
            Copy Code
          </>
        )}
      </Button>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This widget will embed a button on your website.
          Visitors can click it to lobby "{title}" on ProductLobby.
        </p>
      </div>

      {/* Visit Link */}
      <a
        href={embedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <ExternalLink className="h-4 w-4" />
        View Embed Preview
      </a>
    </div>
  )
}
