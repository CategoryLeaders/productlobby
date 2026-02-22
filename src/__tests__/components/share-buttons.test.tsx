/**
 * ShareButtons Component Tests
 * Verifies ShareButtons component renders correctly and handles user interactions
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ShareButtons } from '@/components/shared/share-buttons'

// ============================================================================
// SETUP & MOCKS
// ============================================================================

// Mock next/link to avoid import errors
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return children
  }
})

// Mock Button component if it's complex
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Twitter: ({ className }: any) => <span className={className}>TwitterIcon</span>,
  Facebook: ({ className }: any) => <span className={className}>FacebookIcon</span>,
  Linkedin: ({ className }: any) => <span className={className}>LinkedInIcon</span>,
  MessageCircle: ({ className }: any) => <span className={className}>WhatsAppIcon</span>,
  Mail: ({ className }: any) => <span className={className}>MailIcon</span>,
  Share2: ({ className }: any) => <span className={className}>ShareIcon</span>,
  Check: ({ className }: any) => <span className={className}>CheckIcon</span>,
}))

// Mock fetch
global.fetch = jest.fn()

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Mock window.open
window.open = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  ;(global.fetch as jest.Mock).mockClear()
  ;(window.open as jest.Mock).mockClear()
  ;(navigator.clipboard.writeText as jest.Mock).mockClear()
})

// ============================================================================
// TEST DATA
// ============================================================================

const defaultProps = {
  campaignId: 'campaign-123',
  campaignTitle: 'Awesome AI Product',
  campaignSlug: 'awesome-ai-product',
  showStats: false,
}

// ============================================================================
// RENDERING TESTS
// ============================================================================

describe('ShareButtons Component - Rendering', () => {
  it('should render copy link button', () => {
    render(<ShareButtons {...defaultProps} />)
    const copyButton = screen.getByText(/Copy Link/i)
    expect(copyButton).toBeInTheDocument()
  })

  it('should render all social platform buttons', () => {
    render(<ShareButtons {...defaultProps} />)

    expect(screen.getByText(/Twitter/i)).toBeInTheDocument()
    expect(screen.getByText(/Facebook/i)).toBeInTheDocument()
    expect(screen.getByText(/LinkedIn/i)).toBeInTheDocument()
    expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument()
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
  })

  it('should render with required props only', () => {
    const { container } = render(<ShareButtons {...defaultProps} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with optional showStats prop', () => {
    render(<ShareButtons {...defaultProps} showStats={true} />)
    expect(screen.getByText(/Copy Link/i)).toBeInTheDocument()
  })
})

// ============================================================================
// COPY LINK FUNCTIONALITY TESTS
// ============================================================================

describe('ShareButtons - Copy Link Button', () => {
  it('should copy URL to clipboard when copy link clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const copyButton = screen.getByText(/Copy Link/i)
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled()
    })
  })

  it('should use campaign URL if no referral URL provided', async () => {
    const { NEXT_PUBLIC_APP_URL } = process.env

    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const copyButton = screen.getByText(/Copy Link/i)
    fireEvent.click(copyButton)

    await waitFor(() => {
      const copiedUrl = (navigator.clipboard.writeText as jest.Mock).mock.calls[0]?.[0]
      expect(copiedUrl).toContain('awesome-ai-product')
    })
  })

  it('should show "Copied!" feedback after copying', async () => {
    jest.useFakeTimers()

    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const copyButton = screen.getByText(/Copy Link/i)
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText(/Copied/i)).toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should track share event when copy link clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const copyButton = screen.getByText(/Copy Link/i)
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/campaigns/campaign-123/share`,
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('COPY_LINK'),
        })
      )
    })
  })
})

// ============================================================================
// SOCIAL PLATFORM BUTTON TESTS
// ============================================================================

describe('ShareButtons - Social Platform Buttons', () => {
  it('should open Twitter share intent when Twitter button clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const twitterButton = screen.getByText(/Twitter/i)
    fireEvent.click(twitterButton)

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank'
      )
    })
  })

  it('should open Facebook share when Facebook button clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const facebookButton = screen.getByText(/Facebook/i)
    fireEvent.click(facebookButton)

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer'),
        '_blank'
      )
    })
  })

  it('should open LinkedIn share when LinkedIn button clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const linkedinButton = screen.getByText(/LinkedIn/i)
    fireEvent.click(linkedinButton)

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('linkedin.com/sharing'),
        '_blank'
      )
    })
  })

  it('should open WhatsApp share when WhatsApp button clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const whatsappButton = screen.getByText(/WhatsApp/i)
    fireEvent.click(whatsappButton)

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('wa.me'),
        '_blank'
      )
    })
  })

  it('should open email share when Email button clicked', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const emailButton = screen.getByText(/Email/i)
    fireEvent.click(emailButton)

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('mailto:'),
        '_blank'
      )
    })
  })

  it('should include campaign title in share messages', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const twitterButton = screen.getByText(/Twitter/i)
    fireEvent.click(twitterButton)

    await waitFor(() => {
      const callArgs = (window.open as jest.Mock).mock.calls[0]?.[0]
      expect(callArgs).toContain(encodeURIComponent('Awesome AI Product'))
    })
  })

  it('should track share event for each platform', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const twitterButton = screen.getByText(/Twitter/i)
    fireEvent.click(twitterButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/campaigns/campaign-123/share`,
        expect.objectContaining({
          body: expect.stringContaining('TWITTER'),
        })
      )
    })
  })
})

// ============================================================================
// LOADING STATE TESTS
// ============================================================================

describe('ShareButtons - Loading State', () => {
  it('should disable buttons when loading', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    )

    const copyButton = screen.getByText(/Copy Link/i) as HTMLButtonElement
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(copyButton).toBeDisabled()
    })
  })
})

// ============================================================================
// STATS DISPLAY TESTS
// ============================================================================

describe('ShareButtons - Stats Display', () => {
  it('should not display stats when showStats is false', () => {
    render(<ShareButtons {...defaultProps} showStats={false} />)

    expect(screen.queryByText(/Share Activity/i)).not.toBeInTheDocument()
  })

  it('should fetch and display share stats when showStats is true', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        byPlatform: {
          TWITTER: 10,
          FACEBOOK: 5,
          LINKEDIN: 8,
        },
      }),
    })

    render(<ShareButtons {...defaultProps} showStats={true} />)

    await waitFor(() => {
      expect(screen.getByText(/Share Activity/i)).toBeInTheDocument()
    })
  })

  it('should display platform-specific share counts', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        byPlatform: {
          TWITTER: 12,
          FACEBOOK: 8,
          LINKEDIN: 15,
        },
      }),
    })

    render(<ShareButtons {...defaultProps} showStats={true} />)

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument()
    })
  })

  it('should handle empty stats gracefully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ byPlatform: {} }),
    })

    const { container } = render(<ShareButtons {...defaultProps} showStats={true} />)
    await waitFor(() => {
      expect(container).toBeInTheDocument()
    })
  })

  it('should handle stats fetch error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'))

    const { container } = render(<ShareButtons {...defaultProps} showStats={true} />)
    await waitFor(() => {
      expect(container).toBeInTheDocument()
    })
  })
})

// ============================================================================
// REFERRAL URL TESTS
// ============================================================================

describe('ShareButtons - Referral URL', () => {
  it('should use referral URL when provided by API', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: 'https://example.com/ref-12345' }),
    })

    const copyButton = screen.getByText(/Copy Link/i)
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/ref-12345'
      )
    })
  })

  it('should prefer referral URL over campaign URL in social shares', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: 'https://example.com/ref-abc' }),
    })

    const twitterButton = screen.getByText(/Twitter/i)
    fireEvent.click(twitterButton)

    await waitFor(() => {
      const callUrl = (window.open as jest.Mock).mock.calls[0]?.[0]
      expect(callUrl).toContain('ref-abc')
    })
  })
})

// ============================================================================
// ERROR HANDLING TESTS
// ============================================================================

describe('ShareButtons - Error Handling', () => {
  it('should handle copy to clipboard error gracefully', async () => {
    ;(navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(
      new Error('Copy failed')
    )

    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const copyButton = screen.getByText(/Copy Link/i)
    expect(() => {
      fireEvent.click(copyButton)
    }).not.toThrow()
  })

  it('should handle share track API error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'))

    render(<ShareButtons {...defaultProps} />)

    const copyButton = screen.getByText(/Copy Link/i)
    expect(() => {
      fireEvent.click(copyButton)
    }).not.toThrow()
  })

  it('should handle stats fetch API error gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API error'))

    const { container } = render(
      <ShareButtons {...defaultProps} showStats={true} />
    )

    expect(container).toBeInTheDocument()
  })
})

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

describe('ShareButtons - Integration Tests', () => {
  it('should handle multiple rapid clicks', async () => {
    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const copyButton = screen.getByText(/Copy Link/i)

    fireEvent.click(copyButton)
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  it('should work with custom app URL', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_APP_URL
    process.env.NEXT_PUBLIC_APP_URL = 'https://custom.example.com'

    render(<ShareButtons {...defaultProps} />)

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ referralUrl: null }),
    })

    const twitterButton = screen.getByText(/Twitter/i)
    fireEvent.click(twitterButton)

    await waitFor(() => {
      const callUrl = (window.open as jest.Mock).mock.calls[0]?.[0]
      expect(callUrl).toContain('custom.example.com')
    })

    process.env.NEXT_PUBLIC_APP_URL = originalEnv
  })
})
