'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Twitter, Instagram, Linkedin, Music2, Globe } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

interface ProfileHeaderProps {
  displayName: string
  handle: string
  avatar?: string
  bio?: string
  joinDate: string
  twitterHandle?: string
  instagramHandle?: string
  tiktokHandle?: string
  linkedinHandle?: string
  location?: string
  website?: string
  stats: {
    campaignsCreated: number
    campaignsSupported: number
    commentsMade: number
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  displayName,
  handle,
  avatar,
  bio,
  joinDate,
  twitterHandle,
  instagramHandle,
  tiktokHandle,
  linkedinHandle,
  location,
  website,
  stats,
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
          <Avatar
            src={avatar}
            alt={displayName}
            initials={getInitials(displayName)}
            size="lg"
            className="w-24 h-24 sm:w-32 sm:h-32"
          />

          <div className="flex-1">
            {/* Name & Handle */}
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-1">
              {displayName}
            </h1>
            <p className="text-lg text-gray-600 mb-4">@{handle}</p>

            {/* Bio */}
            {bio && (
              <p className="text-gray-700 text-sm sm:text-base mb-4 max-w-2xl">
                {bio}
              </p>
            )}

            {/* Location & Website */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
              {location && <span>{location}</span>}
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  {website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Social Links */}
            {(twitterHandle ||
              instagramHandle ||
              tiktokHandle ||
              linkedinHandle) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {twitterHandle && (
                  <a
                    href={`https://twitter.com/${twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">@{twitterHandle}</span>
                  </a>
                )}
                {instagramHandle && (
                  <a
                    href={`https://instagram.com/${instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">{instagramHandle}</span>
                  </a>
                )}
                {tiktokHandle && (
                  <a
                    href={`https://tiktok.com/@${tiktokHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="TikTok"
                  >
                    <Music2 className="w-4 h-4" />
                    <span className="text-sm">@{tiktokHandle}</span>
                  </a>
                )}
                {linkedinHandle && (
                  <a
                    href={`https://linkedin.com/in/${linkedinHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">{linkedinHandle}</span>
                  </a>
                )}
              </div>
            )}

            {/* Join Date */}
            <p className="text-xs text-gray-600">
              Joined {formatDate(new Date(joinDate).toISOString())}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 bg-gray-50 rounded-lg p-4 sm:p-6">
          <div className="text-center">
            <p className="font-display font-bold text-2xl sm:text-3xl text-violet-600 mb-1">
              {formatNumber(stats.campaignsCreated)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Campaign{stats.campaignsCreated !== 1 ? 's' : ''} Created
            </p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl sm:text-3xl text-lime-500 mb-1">
              {formatNumber(stats.campaignsSupported)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Campaign{stats.campaignsSupported !== 1 ? 's' : ''} Supported
            </p>
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-2xl sm:text-3xl text-violet-600 mb-1">
              {formatNumber(stats.commentsMade)}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              Comment{stats.commentsMade !== 1 ? 's' : ''} Made
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
