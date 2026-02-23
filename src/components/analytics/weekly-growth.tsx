'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface WeeklyDataPoint {
  week: string
  lobbies: number
  comments: number
}

export interface WeeklyGrowthProps {
  data: WeeklyDataPoint[]
}

export const WeeklyGrowth: React.FC<WeeklyGrowthProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Weekly Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Find max values for scaling
  const maxLobbies = Math.max(...data.map((d) => d.lobbies), 1)
  const maxComments = Math.max(...data.map((d) => d.comments), 1)
  const maxValue = Math.max(maxLobbies, maxComments)

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle>Weekly Growth (8 Weeks)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Lobbies Chart */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Lobbies</h4>
            <div className="flex items-flex-end justify-between gap-2 h-48">
              {data.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full relative h-40 flex items-flex-end justify-center">
                    <div
                      className="w-full bg-violet-500 rounded-t-sm transition-all duration-300 hover:bg-violet-600 group-hover:shadow-lg"
                      style={{
                        height: `${(point.lobbies / maxValue) * 100}%`,
                      }}
                      title={`${point.lobbies} lobbies`}
                    />
                  </div>
                  <div className="text-xs text-gray-600 font-medium text-center w-full truncate">
                    {point.lobbies}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Chart */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Comments</h4>
            <div className="flex items-flex-end justify-between gap-2 h-48">
              {data.map((point, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full relative h-40 flex items-flex-end justify-center">
                    <div
                      className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300 hover:bg-emerald-600 group-hover:shadow-lg"
                      style={{
                        height: `${(point.comments / maxValue) * 100}%`,
                      }}
                      title={`${point.comments} comments`}
                    />
                  </div>
                  <div className="text-xs text-gray-600 font-medium text-center w-full truncate">
                    {point.comments}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Week Labels */}
          <div className="flex items-flex-end justify-between gap-2">
            {data.map((point, index) => (
              <div
                key={index}
                className="flex-1 text-xs text-gray-500 font-medium text-center truncate"
              >
                {point.week.split('-')[0]}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t border-gray-200 flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-violet-500" />
              <span className="text-sm text-gray-600">Lobbies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-sm text-gray-600">Comments</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
