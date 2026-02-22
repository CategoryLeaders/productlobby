'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface LobbyBreakdownBarProps {
  neatIdea: number
  probablyBuy: number
  takeMyMoney: number
  showLabels?: boolean
}

export const LobbyBreakdownBar: React.FC<LobbyBreakdownBarProps> = ({
  neatIdea,
  probablyBuy,
  takeMyMoney,
  showLabels = true,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<
    'neatIdea' | 'probablyBuy' | 'takeMyMoney' | null
  >(null)

  const total = neatIdea + probablyBuy + takeMyMoney

  if (total === 0) {
    return (
      <div className="w-full">
        <div className="h-3 bg-gray-100 rounded-full" />
        {showLabels && (
          <div className="mt-2 text-xs text-gray-400 text-center">No lobbies yet</div>
        )}
      </div>
    )
  }

  const neatIdeaPercent = (neatIdea / total) * 100
  const probablyBuyPercent = (probablyBuy / total) * 100
  const takeMyMoneyPercent = (takeMyMoney / total) * 100

  return (
    <div className="w-full">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 gap-0">
        {/* Neat Idea segment */}
        {neatIdea > 0 && (
          <div
            className={cn(
              'bg-gray-400 transition-all cursor-pointer hover:brightness-90',
              hoveredSegment === 'neatIdea' && 'brightness-110'
            )}
            style={{ width: `${neatIdeaPercent}%` }}
            onMouseEnter={() => setHoveredSegment('neatIdea')}
            onMouseLeave={() => setHoveredSegment(null)}
            onFocus={() => setHoveredSegment('neatIdea')}
            onBlur={() => setHoveredSegment(null)}
            role="region"
            aria-label={`Neat Idea: ${neatIdea} lobbies`}
            tabIndex={0}
          />
        )}

        {/* Probably Buy segment */}
        {probablyBuy > 0 && (
          <div
            className={cn(
              'bg-violet-400 transition-all cursor-pointer hover:brightness-90',
              hoveredSegment === 'probablyBuy' && 'brightness-110'
            )}
            style={{ width: `${probablyBuyPercent}%` }}
            onMouseEnter={() => setHoveredSegment('probablyBuy')}
            onMouseLeave={() => setHoveredSegment(null)}
            onFocus={() => setHoveredSegment('probablyBuy')}
            onBlur={() => setHoveredSegment(null)}
            role="region"
            aria-label={`Probably Buy: ${probablyBuy} lobbies`}
            tabIndex={0}
          />
        )}

        {/* Take My Money segment */}
        {takeMyMoney > 0 && (
          <div
            className={cn(
              'bg-lime-500 transition-all cursor-pointer hover:brightness-90',
              hoveredSegment === 'takeMyMoney' && 'brightness-110'
            )}
            style={{ width: `${takeMyMoneyPercent}%` }}
            onMouseEnter={() => setHoveredSegment('takeMyMoney')}
            onMouseLeave={() => setHoveredSegment(null)}
            onFocus={() => setHoveredSegment('takeMyMoney')}
            onBlur={() => setHoveredSegment(null)}
            role="region"
            aria-label={`Take My Money: ${takeMyMoney} lobbies`}
            tabIndex={0}
          />
        )}
      </div>

      {/* Labels below bar */}
      {showLabels && (
        <div className="mt-3 flex justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
            <span className="text-gray-700">
              Neat Idea <span className="text-gray-500">({neatIdea})</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
            <span className="text-gray-700">
              Probably Buy <span className="text-gray-500">({probablyBuy})</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-lime-500" />
            <span className="text-gray-700">
              Take My Money <span className="text-gray-500">({takeMyMoney})</span>
            </span>
          </div>
        </div>
      )}

      {/* Tooltip on hover */}
      {hoveredSegment && (
        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 text-xs">
          {hoveredSegment === 'neatIdea' && (
            <p className="text-gray-700">
              <strong className="text-gray-900">{neatIdea} people</strong> say this is a neat
              idea ({((neatIdea / total) * 100).toFixed(0)}%)
            </p>
          )}
          {hoveredSegment === 'probablyBuy' && (
            <p className="text-gray-700">
              <strong className="text-gray-900">{probablyBuy} people</strong> would probably buy
              ({((probablyBuy / total) * 100).toFixed(0)}%)
            </p>
          )}
          {hoveredSegment === 'takeMyMoney' && (
            <p className="text-gray-700">
              <strong className="text-gray-900">{takeMyMoney} people</strong> say take my money!
              ({((takeMyMoney / total) * 100).toFixed(0)}%)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
