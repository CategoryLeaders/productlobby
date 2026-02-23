'use client'

import React, { useState } from 'react'
import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react'
import {
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  ModalClose,
} from '@/components/ui/modal'
import ConfettiCelebration from './confetti-celebration'

export interface MilestoneCelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  campaignTitle: string
  campaignSlug: string
  milestoneCount: number
  milestoneType: 'lobby' | 'pledge' | 'signal' | 'supporter'
}

/**
 * Celebration modal shown when a campaign reaches a milestone
 * Displays confetti animation, milestone info, and share buttons
 */
export function MilestoneCelebrationModal({
  isOpen,
  onClose,
  campaignTitle,
  campaignSlug,
  milestoneCount,
  milestoneType,
}: MilestoneCelebrationModalProps) {
  const [copied, setCopied] = useState(false)

  const campaignUrl = `https://www.productlobby.com/campaigns/${campaignSlug}`

  const getMilestoneMessage = () => {
    switch (milestoneType) {
      case 'lobby':
        return `🎉 We've reached ${milestoneCount} lobbies for "${campaignTitle}"! Join the movement!`
      case 'pledge':
        return `🎉 ${milestoneCount} pledges for "${campaignTitle}"! Your voice matters!`
      case 'signal':
        return `🎉 Signal score milestone reached for "${campaignTitle}"! Let's keep the momentum!`
      case 'supporter':
        return `🎉 ${milestoneCount} supporters backing "${campaignTitle}"! Make it happen!`
      default:
        return `🎉 Milestone reached for "${campaignTitle}"!`
    }
  }

  const getShareText = () => {
    const message = getMilestoneMessage()
    return `${message}\n\nSupport the campaign: ${campaignUrl}`
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(getShareText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`,
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      <ConfettiCelebration />

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        <ModalContent className="relative z-50 max-w-md">
          <ModalClose onClick={onClose} />

          <ModalHeader className="bg-gradient-to-r from-violet-50 to-lime-50">
            <ModalTitle className="text-center text-2xl">
              🎉 Milestone Reached!
            </ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-6">
            {/* Milestone Info */}
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                {milestoneType === 'lobby' && `${milestoneCount} lobbies`}
                {milestoneType === 'pledge' && `${milestoneCount} pledges`}
                {milestoneType === 'supporter' && `${milestoneCount} supporters`}
                {milestoneType === 'signal' && 'Signal score milestone'}
              </p>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {campaignTitle}
              </h3>
            </div>

            {/* Celebration Stats */}
            <div className="grid grid-cols-2 gap-4 py-4 bg-gradient-to-br from-violet-50 to-lime-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600">
                  {milestoneCount}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {milestoneType === 'lobby' ? 'Lobbies' : 'Count'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-lime-600">📈</div>
                <p className="text-xs text-gray-600 mt-1">Momentum</p>
              </div>
            </div>

            {/* Share Section */}
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-semibold text-gray-900">Share the win!</p>

              <div className="flex gap-2">
                {/* Twitter */}
                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Twitter
                  </span>
                </a>

                {/* Facebook */}
                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Facebook
                  </span>
                </a>

                {/* LinkedIn */}
                <a
                  href={shareUrls.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    LinkedIn
                  </span>
                </a>
              </div>

              {/* Copy Link */}
              <button
                onClick={handleCopy}
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm font-medium">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </ModalBody>

          <ModalFooter>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </ModalFooter>
        </ModalContent>
      </div>
    </>
  )
}

export default MilestoneCelebrationModal
