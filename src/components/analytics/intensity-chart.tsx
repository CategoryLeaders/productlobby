'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface IntensityChartProps {
  neatIdea: number
  probablyBuy: number
  takeMyMoney: number
}

export const IntensityChart: React.FC<IntensityChartProps> = ({
  neatIdea,
  probablyBuy,
  takeMyMoney,
}) => {
  const total = neatIdea + probablyBuy + takeMyMoney

  if (total === 0) {
    return (
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle>Support Intensity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No lobby data yet
          </div>
        </CardContent>
      </Card>
    )
  }

  const neatIdeaPercent = Math.round((neatIdea / total) * 100)
  const probablyBuyPercent = Math.round((probablyBuy / total) * 100)
  const takeMyMoneyPercent = Math.round((takeMyMoney / total) * 100)

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <CardTitle>Support Intensity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stacked Bar Chart */}
          <div>
            <div className="flex h-12 gap-1 rounded-lg overflow-hidden shadow-sm">
              {/* Neat Idea - Green */}
              <div
                className="bg-emerald-500 flex items-center justify-center transition-all duration-300 hover:bg-emerald-600"
                style={{ width: `${neatIdeaPercent}%` }}
              >
                {neatIdeaPercent > 5 && (
                  <span className="text-white text-xs font-bold">
                    {neatIdeaPercent}%
                  </span>
                )}
              </div>

              {/* Probably Buy - Amber */}
              <div
                className="bg-amber-500 flex items-center justify-center transition-all duration-300 hover:bg-amber-600"
                style={{ width: `${probablyBuyPercent}%` }}
              >
                {probablyBuyPercent > 5 && (
                  <span className="text-white text-xs font-bold">
                    {probablyBuyPercent}%
                  </span>
                )}
              </div>

              {/* Take My Money - Violet */}
              <div
                className="bg-violet-500 flex items-center justify-center transition-all duration-300 hover:bg-violet-600"
                style={{ width: `${takeMyMoneyPercent}%` }}
              >
                {takeMyMoneyPercent > 5 && (
                  <span className="text-white text-xs font-bold">
                    {takeMyMoneyPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Neat Idea</p>
                <p className="text-xs text-gray-600">
                  {neatIdea} ({neatIdeaPercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-amber-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Probably Buy
                </p>
                <p className="text-xs text-gray-600">
                  {probablyBuy} ({probablyBuyPercent}%)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-violet-500" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Take My Money!
                </p>
                <p className="text-xs text-gray-600">
                  {takeMyMoney} ({takeMyMoneyPercent}%)
                </p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total Lobbies: <span className="font-semibold text-gray-900">{total}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
