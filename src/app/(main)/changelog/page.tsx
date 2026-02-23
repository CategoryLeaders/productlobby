import { Metadata } from 'next';
import { ArrowRight, CheckCircle2, Zap, Bug, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Changelog | ProductLobby',
  description: 'Track ProductLobby updates, new features, improvements, and bug fixes. Stay informed about product releases and enhancements.',
  openGraph: {
    title: 'Changelog | ProductLobby',
    description: 'Track ProductLobby updates, new features, improvements, and bug fixes.',
    type: 'website',
  },
};

interface Change {
  label: string;
  type: 'new' | 'improved' | 'fixed';
}

interface Release {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: Change[];
}

const releases: Release[] = [
  {
    version: 'v2.8.0',
    date: 'February 15, 2026',
    title: 'Team Collaboration Suite',
    description:
      'Enhanced team productivity with real-time collaboration features, allowing multiple team members to work on product listings simultaneously with live updates.',
    changes: [
      { label: 'Real-time cursor tracking for team members', type: 'new' },
      { label: 'Instant synchronization of product changes', type: 'new' },
      { label: 'Team comments and mentions', type: 'new' },
      { label: 'Activity feed for team actions', type: 'improved' },
      { label: 'Performance boost in live collaboration mode', type: 'improved' },
    ],
  },
  {
    version: 'v2.7.5',
    date: 'February 8, 2026',
    title: 'Advanced Analytics Dashboard',
    description:
      'Comprehensive analytics platform providing deep insights into product performance, user engagement metrics, and conversion tracking with customizable reports.',
    changes: [
      { label: 'Interactive analytics dashboard', type: 'new' },
      { label: 'Custom report builder', type: 'new' },
      { label: 'User engagement heatmaps', type: 'new' },
      { label: 'Export analytics to CSV/PDF', type: 'new' },
      { label: 'Improved chart rendering performance', type: 'improved' },
      { label: 'Fixed timezone display in reports', type: 'fixed' },
    ],
  },
  {
    version: 'v2.7.0',
    date: 'January 28, 2026',
    title: 'AI-Powered Content Generation',
    description:
      'Leverage artificial intelligence to automatically generate compelling product descriptions, feature lists, and marketing copy tailored to your product category.',
    changes: [
      { label: 'AI description generator', type: 'new' },
      { label: 'Smart category detection', type: 'new' },
      { label: 'Tone and style customization', type: 'new' },
      { label: 'Batch content generation', type: 'improved' },
      { label: 'Fixed AI API timeout issues', type: 'fixed' },
    ],
  },
  {
    version: 'v2.6.3',
    date: 'January 15, 2026',
    title: 'Mobile App Enhancements',
    description:
      'Significant improvements to the mobile experience with faster load times, offline support, and native-like interactions across iOS and Android platforms.',
    changes: [
      { label: 'Offline mode for product browsing', type: 'new' },
      { label: 'Push notifications for product updates', type: 'new' },
      { label: '40% faster mobile page loads', type: 'improved' },
      { label: 'Improved touch interactions', type: 'improved' },
      { label: 'Fixed image caching on iOS', type: 'fixed' },
      { label: 'Corrected notification timestamps', type: 'fixed' },
    ],
  },
  {
    version: 'v2.5.0',
    date: 'December 20, 2025',
    title: 'API and Integrations Release',
    description:
      'Public API launch with comprehensive documentation, webhooks, and out-of-the-box integrations with popular third-party platforms and services.',
    changes: [
      { label: 'Public REST API v1', type: 'new' },
      { label: 'Webhook support for real-time events', type: 'new' },
      { label: 'Zapier integration', type: 'new' },
      { label: 'Slack integration for notifications', type: 'new' },
      { label: 'Rate limiting and quota management', type: 'improved' },
      { label: 'Fixed API authentication edge cases', type: 'fixed' },
    ],
  },
];

const getBadgeStyles = (type: 'new' | 'improved' | 'fixed') => {
  switch (type) {
    case 'new':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'improved':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'fixed':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  }
};

const getBadgeIcon = (type: 'new' | 'improved' | 'fixed') => {
  switch (type) {
    case 'new':
      return <Star className="w-3.5 h-3.5" />;
    case 'improved':
      return <Zap className="w-3.5 h-3.5" />;
    case 'fixed':
      return <Bug className="w-3.5 h-3.5" />;
  }
};

const getBadgeLabel = (type: 'new' | 'improved' | 'fixed') => {
  switch (type) {
    case 'new':
      return 'New';
    case 'improved':
      return 'Improved';
    case 'fixed':
      return 'Fixed';
  }
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-lime-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 mb-8">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Product Updates</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-400 dark:to-violet-500 bg-clip-text text-transparent">
              Changelog
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
            Stay up-to-date with the latest ProductLobby features, improvements, and fixes. We're continuously evolving to serve you better.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-6 text-base font-medium rounded-lg">
              Subscribe for Updates
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-600 px-8 py-6 text-base font-medium rounded-lg"
            >
              View Latest Release
            </Button>
          </div>
        </div>
      </div>

      {/* Changelog Timeline */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Timeline vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-violet-300 via-violet-400 to-lime-300 dark:from-violet-700 dark:via-violet-600 dark:to-lime-700"></div>

        <div className="space-y-20">
          {releases.map((release, index) => (
            <div key={release.version} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-4 h-4 bg-violet-600 rounded-full border-4 border-slate-50 dark:border-slate-950 shadow-md"></div>
              </div>

              {/* Content - alternating left and right */}
              <div className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-1/2 px-8">
                  {index % 2 === 0 ? (
                    // Left side content
                    <div className="text-right">
                      <div className="inline-block">
                        <div className="flex items-center justify-end gap-4 mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 text-sm font-semibold">
                            {release.version}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                          {release.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                          {release.date}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed max-w-sm ml-auto">
                          {release.description}
                        </p>

                        {/* Changes list */}
                        <div className="space-y-3 mb-6 max-w-sm ml-auto">
                          {release.changes.map((change, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3 justify-end"
                            >
                              <div className="flex-1 text-right">
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                  {change.label}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${getBadgeStyles(change.type)}`}
                              >
                                {getBadgeIcon(change.type)}
                                {getBadgeLabel(change.type)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="w-1/2 px-8">
                  {index % 2 === 1 ? (
                    // Right side content
                    <div className="text-left">
                      <div className="inline-block">
                        <div className="flex items-center gap-4 mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-300 text-sm font-semibold">
                            {release.version}
                          </span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                          {release.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                          {release.date}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed max-w-sm">
                          {release.description}
                        </p>

                        {/* Changes list */}
                        <div className="space-y-3 mb-6 max-w-sm">
                          {release.changes.map((change, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-3"
                            >
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium flex-shrink-0 ${getBadgeStyles(change.type)}`}
                              >
                                {getBadgeIcon(change.type)}
                                {getBadgeLabel(change.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-700 dark:text-slate-300 text-sm">
                                  {change.label}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 dark:from-violet-900 dark:to-violet-950 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Never Miss an Update
          </h2>
          <p className="text-violet-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our changelog to receive notifications about new features, improvements, and important updates.
          </p>
          <Button className="bg-lime-400 hover:bg-lime-500 text-slate-900 font-semibold px-8 py-6 text-base rounded-lg">
            Subscribe Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
