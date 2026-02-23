'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  Sparkles,
  Image,
  Share2,
  MessageSquare,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Campaign {
  title: string;
  description: string;
  imageUrl?: string;
  lobbyCount?: number;
  shareCount?: number;
  tags?: string[];
  lastUpdated?: Date | string;
}

interface Suggestion {
  id: string;
  type:
    | 'improve_description'
    | 'add_image'
    | 'increase_shares'
    | 'engage_supporters'
    | 'add_tags'
    | 'update_frequently';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  actionLabel: string;
}

interface SmartSuggestionsProps {
  campaign: Campaign;
  onSuggestionAction?: (suggestionId: string) => void;
}

export function SmartSuggestions({
  campaign,
  onSuggestionAction,
}: SmartSuggestionsProps) {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<
    Set<string>
  >(new Set());

  const generateSuggestions = (): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    // Check description length
    if (!campaign.description || campaign.description.length < 200) {
      suggestions.push({
        id: 'improve_description',
        type: 'improve_description',
        title: 'Expand Your Description',
        description:
          'Add more details to your campaign description to help supporters understand your vision better.',
        priority: 'high',
        icon: <Sparkles className="w-5 h-5" />,
        actionLabel: 'Edit Description',
      });
    }

    // Check for image
    if (!campaign.imageUrl) {
      suggestions.push({
        id: 'add_image',
        type: 'add_image',
        title: 'Add a Campaign Image',
        description:
          'Campaigns with images get 40% more engagement. Add a compelling visual to attract supporters.',
        priority: 'high',
        icon: <Image className="w-5 h-5" />,
        actionLabel: 'Upload Image',
      });
    }

    // Check share count
    if (!campaign.shareCount || campaign.shareCount < 5) {
      suggestions.push({
        id: 'increase_shares',
        type: 'increase_shares',
        title: 'Increase Social Sharing',
        description:
          'Promote your campaign on social media to reach more potential supporters and amplify your message.',
        priority: 'medium',
        icon: <Share2 className="w-5 h-5" />,
        actionLabel: 'Share Campaign',
      });
    }

    // Check lobby count (engagement)
    if (!campaign.lobbyCount || campaign.lobbyCount < 10) {
      suggestions.push({
        id: 'engage_supporters',
        type: 'engage_supporters',
        title: 'Engage Your Supporters',
        description:
          'Respond to comments and messages from your supporters to build community and increase participation.',
        priority: 'medium',
        icon: <MessageSquare className="w-5 h-5" />,
        actionLabel: 'View Comments',
      });
    }

    // Check tags
    if (!campaign.tags || campaign.tags.length < 3) {
      suggestions.push({
        id: 'add_tags',
        type: 'add_tags',
        title: 'Add Campaign Tags',
        description:
          'Tags help your campaign get discovered by supporters interested in related topics. Aim for 3-5 tags.',
        priority: 'low',
        icon: <Tag className="w-5 h-5" />,
        actionLabel: 'Add Tags',
      });
    }

    // Check last updated
    const lastUpdated = campaign.lastUpdated
      ? new Date(campaign.lastUpdated)
      : null;
    const now = new Date();
    const daysSinceUpdate = lastUpdated
      ? Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    if (!lastUpdated || daysSinceUpdate! > 14) {
      suggestions.push({
        id: 'update_frequently',
        type: 'update_frequently',
        title: 'Update Campaign Regularly',
        description:
          'Keep your campaign fresh with regular updates. Recent activity boosts visibility and shows you\'re actively working on your goals.',
        priority: 'low',
        icon: <Clock className="w-5 h-5" />,
        actionLabel: 'Post Update',
      });
    }

    return suggestions.filter((s) => !dismissedSuggestions.has(s.id));
  };

  const suggestions = generateSuggestions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDismiss = (suggestionId: string) => {
    setDismissedSuggestions(
      new Set([...dismissedSuggestions, suggestionId])
    );
  };

  const handleAction = (suggestionId: string) => {
    onSuggestionAction?.(suggestionId);
  };

  if (suggestions.length === 0) {
    return (
      <div className="rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-lime-50 p-6">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">All Set!</h3>
        </div>
        <p className="text-sm text-gray-600">
          Your campaign is looking great. Keep engaging with your supporters to maintain momentum.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-gray-900">Smart Suggestions</h3>
        <span className="ml-auto text-xs font-medium text-violet-600 bg-violet-100 px-2 py-1 rounded">
          {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 text-violet-600 mt-1">
                {suggestion.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      {suggestion.title}
                      <span
                        className={cn(
                          'text-xs font-semibold px-2 py-1 rounded border',
                          getPriorityColor(suggestion.priority)
                        )}
                      >
                        {suggestion.priority === 'high'
                          ? 'High'
                          : suggestion.priority === 'medium'
                            ? 'Medium'
                            : 'Low'}
                      </span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {suggestion.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 h-8"
                    onClick={() => handleAction(suggestion.id)}
                  >
                    {suggestion.actionLabel}
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <button
                    onClick={() => handleDismiss(suggestion.id)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-lime-200 bg-gradient-to-r from-lime-50 to-transparent p-3">
        <p className="text-xs text-gray-600">
          These suggestions are based on best practices for successful campaigns. Focus on high-priority items first.
        </p>
      </div>
    </div>
  );
}
