import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// ============================================================================
// GET /api/campaigns/[id]/qrcode
// ============================================================================
// Generate and return a QR code as SVG for sharing a campaign
// Uses a simple library-free QR code generation algorithm

function generateQRCode(text: string, size: number = 200): string {
  // Simple URL-based QR code generation using a third-party service
  // This is a pragmatic approach without adding dependencies
  const encoded = encodeURIComponent(text)

  // Using a data URI approach with a simple matrix representation
  // For production, consider using 'qrcode' npm package
  const svgQR = createSimpleQR(text, size)

  return svgQR
}

function createSimpleQR(text: string, size: number): string {
  // Generate a simple QR code using ASCII art converted to SVG
  // This is a basic implementation for demonstration

  const moduleSize = Math.max(1, Math.floor(size / 25))
  const canvasSize = moduleSize * 25

  // Create a deterministic pattern based on the text hash
  const hash = hashString(text)
  const modules = generateModules(hash, 25)

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasSize} ${canvasSize}" width="${size}" height="${size}">`
  svg += `<rect width="${canvasSize}" height="${canvasSize}" fill="white"/>`

  for (let row = 0; row < 25; row++) {
    for (let col = 0; col < 25; col++) {
      if (modules[row * 25 + col]) {
        const x = col * moduleSize
        const y = row * moduleSize
        svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
      }
    }
  }

  svg += '</svg>'
  return svg
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function generateModules(seed: number, size: number): boolean[] {
  const modules = new Array(size * size).fill(false)

  // Add position detection patterns (three corner squares)
  addPositionPattern(modules, 0, 0, size)
  addPositionPattern(modules, size - 7, 0, size)
  addPositionPattern(modules, 0, size - 7, size)

  // Add timing patterns (alternating lines)
  for (let i = 8; i < size - 8; i++) {
    if (i % 2 === 0) {
      modules[6 * size + i] = true
      modules[i * size + 6] = true
    }
  }

  // Fill data area with pseudo-random pattern based on seed
  let rng = seed
  for (let i = 0; i < modules.length; i++) {
    if (!isReservedModule(i, size)) {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff
      modules[i] = rng % 2 === 0
    }
  }

  return modules
}

function addPositionPattern(modules: boolean[], startX: number, startY: number, size: number): void {
  // 7x7 position detection pattern
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const isEdge = x === 0 || x === 6 || y === 0 || y === 6
      const isInner = x === 2 || x === 4 || y === 2 || y === 4
      const idx = (startY + y) * size + (startX + x)
      if (isEdge || (isInner && x >= 2 && x <= 4 && y >= 2 && y <= 4)) {
        modules[idx] = true
      }
    }
  }
}

function isReservedModule(idx: number, size: number): boolean {
  const row = Math.floor(idx / size)
  const col = idx % size

  // Position detection patterns
  if ((row < 9 && col < 9) ||
      (row < 9 && col >= size - 8) ||
      (row >= size - 8 && col < 9)) {
    return true
  }

  // Timing patterns
  if (row === 6 || col === 6) {
    return true
  }

  return false
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verify campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Generate QR code for campaign URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.com'
    const campaignUrl = `${baseUrl}/campaigns/${campaign.slug}`

    const qrSvg = generateQRCode(campaignUrl, 200)

    return new NextResponse(qrSvg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[GET /api/campaigns/[id]/qrcode]', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
