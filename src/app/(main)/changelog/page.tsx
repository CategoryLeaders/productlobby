'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Zap, Sparkles, Bug } from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChangelogEntry {
  id: string
  date: string
  title: string
  description: string
  type: 'feature' | 'improvement' | 'fix'
}

const changelogEntries: ChangelogEntry[] = [
  {
    id: '1',
    date: '2026-02-23',
    title: 'Campaign Success Criteria Tracker',
    description:
      'Creators can now set success criteria for their campaigns, including minimum lobbies, target dates, and pledge value goals. Progress is displayed with visual indicators showing how close campaigns are to meeting their targets.',
    type: 'feature',
  },
  {
    id: '2',
    date: '2026-02-23',
    title: 'Campaign Collaboration Requests',
    description:
      'Users can now submit collaboration requests to campaign creators, expressing interest in contributing, reviewing, or promoting campaigns. Creators get a dedicated view of all collaboration requests.',
    type: 'feature',
  },
  {
    id: '3',
    date: '2026-02-23',
    title: 'Platform Changelog Page',
    description:
      'A new public changelog page showcasing all platform updates, features, and improvements. This helps keep the community informed about what\'s new and what\'s being worked on.',
    type: 'feature',
  },
  {
    id: '4',
    date: '2026-02-20',
    title: 'Improved Campaign Analytics Dashboard',
    description:
      'Enhanced the analytics dashboard with better visualization of campaign performance metrics, including engagement rates, supporter demographics, and trend analysis.',
    type: 'improvement',
  },
  {
    id: '5',
    date: '2026-02-18',
    title: 'Campaign Comparison Tool',
    description:
      'New feature allowing users to compare multiple campaigns side-by-side, viewing metrics, pledges, and community sentiment all in one view.',
    type: 'feature',
  },
  {
    id: '6',
    date: '2026-02-15',
    title: 'Fixed Email Notification Timing Issues',
    description:
      'Resolved issues where campaign update notifications were being sent at incorrect times. All notifications should now arrive promptly.',
    type: 'fix',
  },
  {
    id: '7',
    date: '2026-02-12',
    title: 'Enhanced Search Functionality',
    description:
      'Improved full-text search across campaigns, brands, and users. Search results now include helpful filters for category, status, and relevance ranking.',
    type: 'improvement',
  },
  {
    id: '8',
    date: '2026-02-10',
    title: 'Brand Leaderboard Public Launch',
    description:
      'The brand leaderboard is now publicly accessible, showing which brands are most responsive to customer feedback. Includes metrics for response rates, response speed, and action rates.',
    type: 'feature',
  },
  {
    id: '9',
    date: '2026-02-08',
    title: 'Performance Optimizations',
    description:
      'Optimized database queries and implemented caching for campaign listings, significantly improving page load times across the platform.',
    type: 'improvement',
  },
  {
    id: '10',
    date: '2026-02-05',
    title: 'Campaign Update Reactions',
    description:
      'Users can now react to campaign updates with emojis. Creators can see which updates generate the most positive sentiment from their supporters.',
    type: 'feature',
  },
]

const getTypeIcon = (
  type: 'feature' | 'improvement' | 'fix'
) => {
  switch (type) {
    case 'feature':
      return <Sparkles className="w-5 h-5" />
    case 'improvement':
      return <Zap className="w-5 h-5" />
    case 'fix':
      return <Bug className="w-5 h-5" />
  }
}

const getTypeColor = (
  type: 'feature' | 'improvement' | 'fix'
): {
  bg: string
  text: string
  badge: string
  icon: string
} => {
  switch (type) {
    case 'feature':
      return {
        bg: 'bg-violet-50',
        text: 'text-violet-700',
        badge: 'bg-violet-600',
        icon: 'text-violet-600',
      }
    case 'improvement':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        badge: 'bg-blue-600',
        icon: 'text-blue-600',
      }
    case 'fix':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        badge: 'bg-green-600',
        icon: 'text-green-600',
      }
  }
}

const getTypeLabel = (type: 'feature' | 'improvement' | 'fix'): string => {
  switch (type) {
    case 'feature':
      return 'Feature'
    case 'improvement':
      return 'Improvement'
    case 'fix':
      return 'Fix'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return date.toLocaleDateString('en-US', options)
}

const ChangelogCard = ({ entry }: { entry: ChangelogEntry }) => {
  const colors = getTypeColor(entry.type)
  return (
    <div
      className={cn(
        'border rounded-lg p-6 transition-all hover:shadow-md',
        colors.bg,
        'border-gray-200'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'p-2 rounded-full flex-shrink-0',
            colors.bg
          )}
        >
          <div className={cn(colors.icon)}>
            {getTypeIcon(entry.type)}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">
              {entry.title}
            </h3>
            <Badge className={cn('text-white', colors.badge)}>
              {getTypeLabel(entry.type)}
            </Badge>
          </div>

          <p className="text-sm text-gray-600 mb-3">{entry.description}</p>

          <p className="text-xs text-gray-500">{formatDate(entry.date)}</p>
        </div>
      </div>
    </div>
  )
}

const Timeline = ({ entries }: { entries: ChangelogEntry[] }) => {
  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <div key={entry.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 rounded-full bg-violet-600 mt-2"></div>
            {index < entries.length - 1 && (
              <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
            )}
          </div>
          <div className="pb-4 flex-1">
            <ChangelogCard entry={entry} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChangelogPage() {
  const featureCount = changelogEntries.filter(e => e.type === 'feature').length
  const improvementCount = changelogEntries.filter(e => e.type === 'improvement').length
  const fixCount = changelogEntries.filter(e => e.type === 'fix').length

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Link href="/">
              <Button
                variant="ghost"
                className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>

            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              What's New
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Stay updated with the latest features, improvements, and fixes to
              ProductLobby. We're constantly working to make it easier for you
              to advocate for the products you love.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-violet-50 border border-violet-200 rounded-lg">
                <Sparkles className="w-8 h-8 text-violet-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-violet-700 font-medium">Features</p>
                  <p className="text-2xl font-bold text-violet-900">
                    {featureCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Zap className="w-8 h-8 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Improvements
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {improvementCount}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Bug className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Fixes</p>
                  <p className="text-2xl font-bold text-green-900">
                    {fixCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">
            Recent Updates
          </h2>
          <Timeline entries={changelogEntries} />
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-violet-50 to-lime-50 border-t border-gray-200 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
                Have Ideas for Improvements?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We'd love to hear your feedback. Let us know what features you'd
                like to see next.
              </p>
              <Link href="/feedback">
                <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-base">
                  Send Feedback
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
