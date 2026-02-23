'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

interface Campaign {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: string
  createdAt: string
  creator: {
    id: string
    displayName: string
    handle?: string
    avatar?: string
  }
  targetedBrand?: {
    id: string
    name: string
    slug: string
    logo?: string
  }
  media?: {
    id: string
    url: string
  }
  lobbyStats: {
    totalLobbies: number
    intensityDistribution: {
      NEAT_IDEA: number
      PROBABLY_BUY: number
      TAKE_MY_MONEY: number
    }
  }
}

interface ComparisonTableProps {
  campaigns: Campaign[]
  onRemove: (id: string) => void
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  campaigns,
  onRemove,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-32">
              Campaign
            </th>
            {campaigns.map((campaign) => (
              <th key={campaign.id} className="px-6 py-4 text-left w-64 min-w-64">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">
                      {campaign.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      by {campaign.creator.displayName}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemove(campaign.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {/* Preview Image */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Preview
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4">
                {campaign.media?.url ? (
                  <img
                    src={campaign.media.url}
                    alt={campaign.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </td>
            ))}
          </tr>

          {/* Description */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Description
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4 text-sm text-gray-600">
                <p className="line-clamp-3">{campaign.description}</p>
              </td>
            ))}
          </tr>

          {/* Category */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Category
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
                  {campaign.category}
                </span>
              </td>
            ))}
          </tr>

          {/* Status */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Status
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    campaign.status
                  )}`}
                >
                  {campaign.status}
                </span>
              </td>
            ))}
          </tr>

          {/* Targeted Brand */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Brand
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4">
                {campaign.targetedBrand ? (
                  <div className="flex items-center gap-2">
                    {campaign.targetedBrand.logo && (
                      <img
                        src={campaign.targetedBrand.logo}
                        alt={campaign.targetedBrand.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {campaign.targetedBrand.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not specified</span>
                )}
              </td>
            ))}
          </tr>

          {/* Creator */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Creator
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {campaign.creator.avatar ? (
                      <img
                        src={campaign.creator.avatar}
                        alt={campaign.creator.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                        {campaign.creator.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {campaign.creator.displayName}
                    </p>
                    {campaign.creator.handle && (
                      <p className="text-xs text-gray-500">
                        @{campaign.creator.handle}
                      </p>
                    )}
                  </div>
                </div>
              </td>
            ))}
          </tr>

          {/* Lobbies */}
          <tr className="border-b border-gray-200 bg-violet-50">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Total Lobbies
            </td>
            {campaigns.map((campaign) => {
              const max = Math.max(
                ...campaigns.map((c) => c.lobbyStats.totalLobbies)
              )
              const isLeading =
                campaign.lobbyStats.totalLobbies === max && max > 0

              return (
                <td
                  key={campaign.id}
                  className={`px-6 py-4 text-2xl font-bold ${
                    isLeading ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {campaign.lobbyStats.totalLobbies}
                  {isLeading && (
                    <p className="text-xs font-medium text-green-600 mt-1">
                      Leading
                    </p>
                  )}
                </td>
              )
            })}
          </tr>

          {/* High Intensity Support */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Take My Money
            </td>
            {campaigns.map((campaign) => {
              const max = Math.max(
                ...campaigns.map(
                  (c) => c.lobbyStats.intensityDistribution.TAKE_MY_MONEY
                )
              )
              const isLeading =
                campaign.lobbyStats.intensityDistribution.TAKE_MY_MONEY === max &&
                max > 0

              return (
                <td
                  key={campaign.id}
                  className={`px-6 py-4 text-lg font-semibold ${
                    isLeading ? 'text-green-600' : 'text-gray-900'
                  }`}
                >
                  {campaign.lobbyStats.intensityDistribution.TAKE_MY_MONEY}
                </td>
              )
            })}
          </tr>

          {/* Medium Intensity Support */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Probably Buy
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4 text-lg font-semibold text-gray-900">
                {campaign.lobbyStats.intensityDistribution.PROBABLY_BUY}
              </td>
            ))}
          </tr>

          {/* Low Intensity Support */}
          <tr className="border-b border-gray-200">
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Neat Idea
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4 text-lg font-semibold text-gray-900">
                {campaign.lobbyStats.intensityDistribution.NEAT_IDEA}
              </td>
            ))}
          </tr>

          {/* Launch Date */}
          <tr>
            <td className="px-6 py-4 text-sm font-medium text-gray-700">
              Created
            </td>
            {campaigns.map((campaign) => (
              <td key={campaign.id} className="px-6 py-4">
                <span className="text-sm text-gray-600">
                  {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
