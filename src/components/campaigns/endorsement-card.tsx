'use client'

import React from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Star } from 'lucide-react'

interface Endorser {
  id: string
  displayName: string
  avatar?: string
  handle?: string
}

interface EndorsementCardProps {
  endorsement: {
    id: string
    userId: string
    user: Endorser
    title: string
    organization: string
    reason: string
    createdAt: string
  }
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const EndorsementCard: React.FC<EndorsementCardProps> = ({
  endorsement,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-violet-200 transition-colors">
      {/* Header with Avatar and Info */}
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 flex-shrink-0">
          {endorsement.user.avatar ? (
            <img
              src={endorsement.user.avatar}
              alt={endorsement.user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
              {endorsement.user.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Name and Title */}
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {endorsement.user.displayName}
              </h3>
              <p className="text-sm text-gray-600">
                {endorsement.title} {endorsement.organization && (
                  <span>
                    @ <span className="font-medium">{endorsement.organization}</span>
                  </span>
                )}
              </p>
            </div>

            {/* Star Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full flex-shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-amber-700">Verified</span>
            </div>
          </div>

          {/* Handle */}
          {endorsement.user.handle && (
            <p className="text-xs text-gray-500 mt-1">
              @{endorsement.user.handle}
            </p>
          )}
        </div>
      </div>

      {/* Reason/Quote */}
      {endorsement.reason && (
        <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-violet-100 rounded-lg border border-violet-200">
          <p className="text-sm text-gray-700 italic">
            "{endorsement.reason}"
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>Endorsed {getRelativeTime(endorsement.createdAt)}</span>
        <span className="text-gray-400">ID: {endorsement.id.slice(0, 8)}...</span>
      </div>
    </div>
  )
}

export default EndorsementCard
