'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'

export interface Supporter {
  id: string
  displayName: string
  handle: string | null
  lobbyCount: number
}

export interface TopSupportersProps {
  supporters: Supporter[]
}

export const TopSupporters: React.FC<TopSupportersProps> = ({ supporters }) => {
  if (supporters.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Top Supporters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No supporters yet
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find max lobby count for scaling
  const maxLobbies = Math.max(...supporters.map((s) => s.lobbyCount), 1)

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle>Top Supporters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {supporters.map((supporter, index) => {
            const percentage = (supporter.lobbyCount / maxLobbies) * 100

            return (
              <div key={supporter.id} className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 font-bold flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 flex-shrink-0" />

                {/* Name & Handle */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${supporter.handle || supporter.id}`}
                    className="block font-medium text-sm text-foreground hover:text-violet-600 truncate"
                  >
                    {supporter.displayName}
                  </Link>
                  {supporter.handle && (
                    <p className="text-xs text-gray-500 truncate">
                      @{supporter.handle}
                    </p>
                  )}
                </div>

                {/* Lobby Count Bar */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1 min-w-24">
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {supporter.lobbyCount}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
