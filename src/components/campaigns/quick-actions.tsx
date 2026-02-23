'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Share2, 
  ThumbsUp, 
  MessageSquare, 
  Flag, 
  Bookmark, 
  Link2,
  X,
  HelpCircle,
  Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

export interface QuickActionsProps {
  campaignId: string
  className?: string
}

interface ActionConfig {
  id: string
  label: string
  icon: React.ReactNode
  color: string
  action: () => Promise<void>
}

export const CampaignQuickActions: React.FC<QuickActionsProps> = ({
  campaignId,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { addToast } = useToast()

  // Check bookmark status on mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}/bookmark-status`)
        if (response.ok) {
          const data = await response.json()
          setBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      }
    }
    checkBookmarkStatus()
  }, [campaignId])

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard shortcut (?)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === '?' && !isOpen) {
        event.preventDefault()
        setIsOpen(true)
      }
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleShare = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'SHARE' })
      })

      if (response.ok) {
        const data = await response.json()
        if (navigator.share) {
          await navigator.share({
            title: data.title,
            text: data.description,
            url: `${window.location.origin}/campaigns/${campaignId}`
          })
        } else {
          addToast('Share link copied to clipboard!', 'success')
        }
      } else {
        addToast('Failed to share campaign', 'error')
      }
    } catch (error) {
      console.error('Share error:', error)
      addToast('Error sharing campaign', 'error')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleVote = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'VOTE' })
      })

      if (response.ok) {
        addToast('Vote counted! Thanks for your support', 'success')
      } else {
        addToast('Failed to record vote', 'error')
      }
    } catch (error) {
      console.error('Vote error:', error)
      addToast('Error voting on campaign', 'error')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleComment = async () => {
    // Navigate to comments section or open comment modal
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth' })
      const commentInput = commentsSection.querySelector('textarea') as HTMLTextAreaElement
      if (commentInput) commentInput.focus()
    } else {
      addToast('Comments section not found', 'info')
    }
    setIsOpen(false)
  }

  const handleReport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType: 'REPORT' })
      })

      if (response.ok) {
        addToast('Report submitted. Thank you for keeping our community safe', 'success')
      } else {
        addToast('Failed to submit report', 'error')
      }
    } catch (error) {
      console.error('Report error:', error)
      addToast('Error submitting report', 'error')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleBookmark = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/quick-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          actionType: 'BOOKMARK',
          bookmarked: !bookmarked
        })
      })

      if (response.ok) {
        setBookmarked(!bookmarked)
        addToast(
          bookmarked ? 'Bookmark removed' : 'Campaign bookmarked!',
          'success'
        )
      } else {
        addToast('Failed to update bookmark', 'error')
      }
    } catch (error) {
      console.error('Bookmark error:', error)
      addToast('Error updating bookmark', 'error')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const handleCopyLink = async () => {
    setIsLoading(true)
    try {
      const campaignUrl = `${window.location.origin}/campaigns/${campaignId}`
      await navigator.clipboard.writeText(campaignUrl)
      addToast('Campaign link copied to clipboard!', 'success')
    } catch (error) {
      console.error('Copy link error:', error)
      addToast('Failed to copy link', 'error')
    } finally {
      setIsLoading(false)
      setIsOpen(false)
    }
  }

  const actions: ActionConfig[] = [
    {
      id: 'share',
      label: 'Share',
      icon: <Share2 className="w-5 h-5" />,
      color: 'hover:bg-blue-50 hover:text-blue-600',
      action: handleShare
    },
    {
      id: 'vote',
      label: 'Vote',
      icon: <ThumbsUp className="w-5 h-5" />,
      color: 'hover:bg-green-50 hover:text-green-600',
      action: handleVote
    },
    {
      id: 'comment',
      label: 'Comment',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'hover:bg-purple-50 hover:text-purple-600',
      action: handleComment
    },
    {
      id: 'report',
      label: 'Report',
      icon: <Flag className="w-5 h-5" />,
      color: 'hover:bg-red-50 hover:text-red-600',
      action: handleReport
    },
    {
      id: 'bookmark',
      label: bookmarked ? 'Bookmarked' : 'Bookmark',
      icon: <Bookmark className={cn('w-5 h-5', bookmarked && 'fill-current')} />,
      color: 'hover:bg-yellow-50 hover:text-yellow-600',
      action: handleBookmark
    },
    {
      id: 'copy-link',
      label: 'Copy Link',
      icon: <Link2 className="w-5 h-5" />,
      color: 'hover:bg-gray-50 hover:text-gray-600',
      action: handleCopyLink
    }
  ]

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        className
      )}
    >
      {/* Actions Menu */}
      <div
        className={cn(
          'absolute bottom-20 right-0 flex flex-col gap-2 transition-all duration-300 origin-bottom-right',
          isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
        )}
      >
        {actions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => action.action()}
            disabled={isLoading}
            title={action.label}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
              'bg-white border border-gray-200 shadow-lg',
              'text-gray-700',
              action.color,
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'hover:shadow-xl transform hover:scale-110'
            )}
            style={{
              transitionDelay: isOpen ? `${index * 30}ms` : '0ms',
              animation: isOpen ? `slideUp 0.3s ease-out ${index * 30}ms both` : 'none'
            }}
          >
            {action.icon}
          </button>
        ))}
      </div>

      {/* Tooltip hint */}
      {!isOpen && (
        <div
          className={cn(
            'absolute bottom-24 right-16 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm',
            'whitespace-nowrap pointer-events-none opacity-0 transition-opacity duration-200',
            'group-hover:opacity-100'
          )}
        >
          Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs ml-1">?</kbd> for quick actions
        </div>
      )}

      {/* FAB - Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        title="Quick actions (press ? key)"
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200',
          'bg-violet-600 hover:bg-violet-700 text-white shadow-lg hover:shadow-xl',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transform hover:scale-110 active:scale-95',
          'group relative'
        )}
      >
        <div
          className={cn(
            'absolute transition-transform duration-300',
            isOpen ? 'rotate-45 scale-100' : 'rotate-0 scale-100'
          )}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </div>

        {/* Tooltip on hover */}
        <div
          className={cn(
            'absolute bottom-20 right-0 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm',
            'whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100',
            'transition-opacity duration-200'
          )}
        >
          Quick Actions (?)
        </div>
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CampaignQuickActions
