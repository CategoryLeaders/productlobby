'use client';

import { useState, useEffect } from 'react';
import { History, Tag, Filter, Sparkles, Bug, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChangeCategory = 'all' | 'feature' | 'fix' | 'improvement' | 'security';

interface ChangelogEntry {
  id: string;
  date: string;
  version: string;
  title: string;
  description: string;
  category: 'feature' | 'fix' | 'improvement' | 'security';
}

const changelogEntries: ChangelogEntry[] = [
  {
    id: '1',
    date: 'February 20, 2026',
    version: 'v2.5.0',
    title: 'Real-time Collaboration Features',
    description: 'Added live cursor tracking and instant synchronization for team members editing the same product listing simultaneously.',
    category: 'feature',
  },
  {
    id: '2',
    date: 'February 18, 2026',
    version: 'v2.4.9',
    title: 'Performance Improvements',
    description: 'Optimized image loading and database queries, reducing page load times by 40%.',
    category: 'improvement',
  },
  {
    id: '3',
    date: 'February 15, 2026',
    version: 'v2.4.8',
    title: 'Security Patch',
    description: 'Fixed critical XSS vulnerability in product description renderer. All users should update immediately.',
    category: 'security',
  },
  {
    id: '4',
    date: 'February 12, 2026',
    version: 'v2.4.7',
    title: 'Advanced Analytics Dashboard',
    description: 'New comprehensive dashboard showing product performance metrics, user engagement, and conversion tracking.',
    category: 'feature',
  },
  {
    id: '5',
    date: 'February 10, 2026',
    version: 'v2.4.6',
    title: 'Mobile App Bug Fix',
    description: 'Resolved issue where notifications were not displaying on iOS devices running iOS 17+.',
    category: 'fix',
  },
  {
    id: '6',
    date: 'February 8, 2026',
    version: 'v2.4.5',
    title: 'Dark Mode Enhancement',
    description: 'Improved contrast ratios and refined color palette for better readability in dark mode across all pages.',
    category: 'improvement',
  },
  {
    id: '7',
    date: 'February 5, 2026',
    version: 'v2.4.4',
    title: 'AI-Powered Product Tagging',
    description: 'Introduced intelligent auto-tagging system that suggests relevant tags based on product descriptions.',
    category: 'feature',
  },
  {
    id: '8',
    date: 'February 1, 2026',
    version: 'v2.4.3',
    title: 'Search Algorithm Update',
    description: 'Enhanced search algorithm with improved relevance ranking and typo correction.',
    category: 'improvement',
  },
  {
    id: '9',
    date: 'January 28, 2026',
    version: 'v2.4.2',
    title: 'Export to PDF Fix',
    description: 'Fixed formatting issues when exporting product listings to PDF format.',
    category: 'fix',
  },
  {
    id: '10',
    date: 'January 25, 2026',
    version: 'v2.4.1',
    title: 'Two-Factor Authentication',
    description: 'Added support for TOTP-based two-factor authentication and hardware security keys.',
    category: 'security',
  },
  {
    id: '11',
    date: 'January 22, 2026',
    version: 'v2.4.0',
    title: 'Team Management System',
    description: 'Complete overhaul of team features with role-based access control, permissions management, and audit logs.',
    category: 'feature',
  },
  {
    id: '12',
    date: 'January 18, 2026',
    version: 'v2.3.9',
    title: 'API Rate Limit Updates',
    description: 'Adjusted rate limiting to be more generous for free tier users and better aligned with usage patterns.',
    category: 'improvement',
  },
  {
    id: '13',
    date: 'January 15, 2026',
    version: 'v2.3.8',
    title: 'Bulk Import Tool',
    description: 'New bulk import feature supporting CSV and JSON formats for quick product catalog uploads.',
    category: 'feature',
  },
  {
    id: '14',
    date: 'January 12, 2026',
    version: 'v2.3.7',
    title: 'Email Delivery Issue',
    description: 'Fixed bug preventing notification emails from being sent to users with special characters in email addresses.',
    category: 'fix',
  },
  {
    id: '15',
    date: 'January 8, 2026',
    version: 'v2.3.6',
    title: 'Database Security Enhancement',
    description: 'Implemented end-to-end encryption for sensitive user data at rest and in transit.',
    category: 'security',
  },
  {
    id: '16',
    date: 'January 5, 2026',
    version: 'v2.3.5',
    title: 'Responsive Design Improvements',
    description: 'Refined layouts for tablet devices and improved touch interactions throughout the platform.',
    category: 'improvement',
  },
  {
    id: '17',
    date: 'January 1, 2026',
    version: 'v2.3.4',
    title: 'Integration with Slack',
    description: 'New Slack integration allowing teams to receive ProductLobby notifications directly in Slack channels.',
    category: 'feature',
  },
  {
    id: '18',
    date: 'December 28, 2025',
    version: 'v2.3.3',
    title: 'Webhook Stability Fix',
    description: 'Improved webhook delivery reliability and added automatic retry logic for failed deliveries.',
    category: 'fix',
  },
  {
    id: '19',
    date: 'December 25, 2025',
    version: 'v2.3.2',
    title: 'Accessibility Compliance',
    description: 'Enhanced accessibility features to meet WCAG 2.1 AA standards across all components.',
    category: 'improvement',
  },
  {
    id: '20',
    date: 'December 20, 2025',
    version: 'v2.3.1',
    title: 'Custom Domain Support',
    description: 'Added ability to host public product pages on custom domains with automatic SSL certificate provisioning.',
    category: 'feature',
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'feature':
      return <Sparkles className="w-4 h-4" />;
    case 'fix':
      return <Bug className="w-4 h-4" />;
    case 'improvement':
      return <Zap className="w-4 h-4" />;
    case 'security':
      return <Shield className="w-4 h-4" />;
    default:
      return <Tag className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'feature':
      return 'bg-violet-100 text-violet-800 border-violet-300';
    case 'fix':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'security':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'feature':
      return 'Feature';
    case 'fix':
      return 'Fix';
    case 'improvement':
      return 'Improvement';
    case 'security':
      return 'Security';
    default:
      return 'Update';
  }
};

export default function ChangelogPage() {
  const [selectedCategory, setSelectedCategory] = useState<ChangeCategory>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Changelog - ProductLobby';
  }, []);

  const filteredEntries =
    selectedCategory === 'all'
      ? changelogEntries
      : changelogEntries.filter(
          (entry) => entry.category === selectedCategory
        );

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <History className="w-10 h-10" />
            <h1 className="text-5xl font-bold">Changelog</h1>
          </div>
          <p className="text-lg text-violet-100 max-w-2xl">
            Stay updated with the latest features, improvements, and fixes to
            ProductLobby. We're constantly working to make your experience
            better.
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filter:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => setSelectedCategory('all')}
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              className={
                selectedCategory === 'all'
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : ''
              }
            >
              All
            </Button>
            <Button
              onClick={() => setSelectedCategory('feature')}
              variant={selectedCategory === 'feature' ? 'default' : 'outline'}
              className={
                selectedCategory === 'feature'
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : ''
              }
            >
              Features
            </Button>
            <Button
              onClick={() => setSelectedCategory('fix')}
              variant={selectedCategory === 'fix' ? 'default' : 'outline'}
              className={
                selectedCategory === 'fix'
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : ''
              }
            >
              Fixes
            </Button>
            <Button
              onClick={() => setSelectedCategory('improvement')}
              variant={
                selectedCategory === 'improvement' ? 'default' : 'outline'
              }
              className={
                selectedCategory === 'improvement'
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : ''
              }
            >
              Improvements
            </Button>
            <Button
              onClick={() => setSelectedCategory('security')}
              variant={selectedCategory === 'security' ? 'default' : 'outline'}
              className={
                selectedCategory === 'security'
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : ''
              }
            >
              Security
            </Button>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-300 via-lime-300 to-violet-300" />

          {/* Timeline Entries */}
          <div className="space-y-8">
            {filteredEntries.map((entry, index) => (
              <div key={entry.id} className="relative pl-24">
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-12 h-12 bg-white border-4 border-violet-600 rounded-full flex items-center justify-center shadow-lg hover:border-lime-400 transition-colors duration-300">
                  {getCategoryIcon(entry.category)}
                </div>

                {/* Entry card */}
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border-l-4 border-violet-600">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        {entry.date}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {entry.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border">
                        <Tag className="w-3 h-3" />
                        {entry.version}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{entry.description}</p>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                        entry.category
                      )}`}
                    >
                      {getCategoryIcon(entry.category)}
                      {getCategoryLabel(entry.category)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No entries found for this category.
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-16 p-6 bg-lime-50 rounded-lg border border-lime-200">
          <p className="text-gray-700 text-sm">
            <strong>Note:</strong> ProductLobby is constantly evolving. Check
            back regularly for the latest updates and improvements. For more
            detailed information about any release, visit our{' '}
            <span className="text-violet-600 font-semibold">
              documentation
            </span>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
