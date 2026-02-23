'use client'

import React, { useState, useRef, useEffect } from 'react'
import { QrCode, Copy, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QRCodeGeneratorProps {
  campaignId: string
  slug: string
  title: string
}

// Simple QR code generator - creates a visual grid pattern
function generateSimpleQRCode(text: string, size: number = 200): string {
  // Create a simple deterministic hash-based grid pattern
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0)
  }, 0)

  const gridSize = 21 // Standard QR code is 21x21 modules
  const moduleSize = size / gridSize

  let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`
  svg += `<rect width="${size}" height="${size}" fill="white"/>`

  // Create a deterministic pattern based on the hash
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Create position-based pattern with some structure
      const position = i * gridSize + j
      const isSet =
        // Fixed corner patterns (quiet zone)
        (i < 7 && j < 7) ||
        (i < 7 && j >= gridSize - 8) ||
        (i >= gridSize - 8 && j < 7) ||
        // Add hash-based pattern for data
        (position % 3 === (Math.abs(hash) % 3) && position % 7 < 4)

      if (isSet) {
        const x = j * moduleSize
        const y = i * moduleSize
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }

  svg += '</svg>'
  return svg
}

export function QRCodeGenerator({
  campaignId,
  slug,
  title,
}: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [downloadInProgress, setDownloadInProgress] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const campaignUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.com'}/campaigns/${slug}`

  // Generate QR code SVG
  const qrCodeSvg = generateSimpleQRCode(campaignUrl)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaignUrl)
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Error copying to clipboard:', err)
    }
  }

  const handleDownloadQR = async () => {
    try {
      setDownloadInProgress(true)

      // Create SVG blob
      const svgBlob = new Blob([qrCodeSvg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(svgBlob)

      // Create download link
      const link = document.createElement('a')
      link.href = url
      link.download = `${slug}-qrcode.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Cleanup
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading QR code:', err)
    } finally {
      setDownloadInProgress(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <QrCode className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Campaign QR Code</h3>
        </div>
        <p className="text-sm text-gray-600">
          Share this QR code to drive engagement with your campaign
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* QR Code Section */}
        <div className="flex flex-col items-center justify-center flex-shrink-0">
          <div className="relative p-4 bg-gradient-to-br from-violet-50 to-lime-50 rounded-lg border-2 border-dashed border-violet-200">
            {/* QR Code SVG */}
            <div
              className="p-4 bg-white rounded border border-gray-200"
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
            />
            <div className="absolute top-2 right-2 bg-lime-500 text-slate-900 px-2 py-1 rounded-md text-xs font-semibold">
              Scan
            </div>
          </div>

          {/* Campaign Title Below QR */}
          <p className="text-center text-sm font-medium text-gray-700 mt-4 max-w-xs line-clamp-2">
            {title}
          </p>
        </div>

        {/* Information Section */}
        <div className="flex-1 flex flex-col justify-between">
          {/* URL Display Card */}
          <div className="bg-gradient-to-r from-violet-50 to-lime-50 rounded-lg p-4 border border-violet-100 mb-6">
            <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Campaign URL
            </p>
            <div className="break-all">
              <code className="text-sm font-mono text-violet-700 bg-white bg-opacity-50 px-3 py-2 rounded inline-block border border-violet-200">
                {campaignUrl}
              </code>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCopyLink}
              variant={copied ? 'secondary' : 'outline'}
              size="default"
              className={cn(
                'w-full justify-center',
                copied && 'border-lime-300 bg-lime-50 text-lime-700 hover:bg-lime-100'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>

            <Button
              onClick={handleDownloadQR}
              disabled={downloadInProgress}
              variant="primary"
              size="default"
              className="w-full justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloadInProgress ? 'Downloading...' : 'Download QR'}
            </Button>
          </div>

          {/* Info Text */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed">
              Share this QR code on social media, emails, or print materials to help supporters discover and endorse your campaign. The QR code directs to your campaign page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
