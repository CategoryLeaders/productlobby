'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  rank: number;
  id: string;
  name: string;
  lobbyCount: number;
  trend: 'up' | 'down' | 'stable';
  isCurrentCampaign: boolean;
}

interface CompetitorTrackerProps {
  campaignId: string;
}

export function CompetitorTracker({ campaignId }: CompetitorTrackerProps) {
  const [competitors, setCompetitors] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/campaigns/${campaignId}/competitors`);
        if (!response.ok) {
          throw new Error('Failed to fetch competitors');
        }
        const data = await response.json();
        setCompetitors(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitors();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">Error loading competitors: {error}</p>
      </div>
    );
  }

  if (competitors.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">No competitors found in this category.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Campaign
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Lobby Count
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Trend
              </th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((campaign) => (
              <tr
                key={campaign.id}
                className={cn(
                  'border-b border-gray-200 transition-colors hover:bg-gray-50',
                  campaign.isCurrentCampaign && 'bg-blue-50'
                )}
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    {campaign.rank <= 3 && (
                      <Trophy className="h-4 w-4 text-amber-500" />
                    )}
                    <span className="font-semibold">{campaign.rank}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span>{campaign.name}</span>
                    {campaign.isCurrentCampaign && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        You are here
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  {campaign.lobbyCount}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    {campaign.trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    )}
                    {campaign.trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    {campaign.trend === 'stable' && (
                      <Minus className="h-4 w-4 text-gray-600" />
                    )}
                    <span className="text-gray-600">
                      {campaign.trend === 'up' && 'Trending Up'}
                      {campaign.trend === 'down' && 'Trending Down'}
                      {campaign.trend === 'stable' && 'Stable'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
