'use client';

import { useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const metadata = {
  title: 'Glossary | ProductLobby',
  description: 'Definitions of key platform terms and concepts',
};

const glossaryTerms = [
  {
    term: 'Bookmark',
    definition: 'Save campaigns or creators to a personal collection for easy access later. Bookmarks help you organize and track your favorite items on the platform.',
  },
  {
    term: 'Brand',
    definition: 'A company or organization that uses ProductLobby to engage with supporters and gather feedback. Brands create campaigns to understand customer needs and preferences.',
  },
  {
    term: 'Campaign',
    definition: 'A focused initiative created by brands to gather feedback, collect ideas, or engage with their community. Campaigns enable supporters to contribute their thoughts and vote on proposals.',
  },
  {
    term: 'Category',
    definition: 'A thematic grouping of campaigns and content on ProductLobby. Categories help users discover relevant campaigns that match their interests.',
  },
  {
    term: 'Contribution Points',
    definition: 'Rewards earned by supporters for participating in campaigns, providing feedback, and engaging with content. Contribution points recognize active community participation.',
  },
  {
    term: 'Creator',
    definition: 'A user who generates content, ideas, or feedback on ProductLobby. Creators contribute valuable insights that help brands make better decisions.',
  },
  {
    term: 'Endorsement',
    definition: 'A way to show support for an idea, comment, or campaign by liking or upvoting it. Endorsements help highlight the most valuable contributions.',
  },
  {
    term: 'Impact Score',
    definition: 'A metric that measures the overall influence and effectiveness of a campaign or contribution. Higher impact scores indicate greater community resonance and engagement.',
  },
  {
    term: 'Lobby',
    definition: 'A community-driven movement on ProductLobby focused on a specific issue or goal. Lobbies amplify collective voices to create meaningful change.',
  },
  {
    term: 'Micro-Update',
    definition: 'A brief, real-time notification from brands about campaign progress, new ideas, or community milestones. Micro-updates keep supporters informed and engaged.',
  },
  {
    term: 'Milestone',
    definition: 'A significant achievement or checkpoint in a campaign\'s progress. Milestones celebrate community contributions and mark important campaign phases.',
  },
  {
    term: 'Sentiment Analysis',
    definition: 'An automated process that analyzes the tone and emotion in user feedback and comments. Sentiment analysis helps brands understand community feelings about their initiatives.',
  },
  {
    term: 'Signal Score',
    definition: 'A metric that quantifies the strength and validity of a campaign signal or feedback. Signal scores help identify the most reliable and impactful community insights.',
  },
  {
    term: 'Supporter',
    definition: 'A community member who engages with campaigns, provides feedback, and contributes ideas on ProductLobby. Supporters are the backbone of the community-driven platform.',
  },
  {
    term: 'Verification Badge',
    definition: 'A visual indicator that confirms a user\'s identity or status on ProductLobby. Verification badges build trust and credibility in the community.',
  },
  {
    term: 'Vote',
    definition: 'A way to express preference or agreement on campaigns, ideas, and proposals. Votes help prioritize the most important issues and ideas in the community.',
  },
  {
    term: 'Feedback Loop',
    definition: 'The continuous cycle of gathering feedback from supporters, analyzing insights, and implementing changes based on community input.',
  },
  {
    term: 'Trending',
    definition: 'Popular or rapidly growing campaigns, ideas, or discussions that are gaining significant community attention and engagement.',
  },
];

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTerms = glossaryTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <BookOpen className="h-12 w-12 sm:h-14 sm:w-14" />
            <h1 className="text-4xl sm:text-5xl font-bold">Platform Glossary</h1>
          </div>
          <p className="text-violet-100 text-lg sm:text-xl">
            Explore key terms and concepts that power the ProductLobby community
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search glossary terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 h-auto text-base border-violet-200 focus:border-violet-500 focus:ring-violet-500"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            {filteredTerms.length} of {glossaryTerms.length} terms
          </p>
        </div>

        {/* Terms Grid */}
        {filteredTerms.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTerms.map((item) => (
              <div
                key={item.term}
                className="bg-white rounded-lg border border-violet-100 p-6 hover:border-violet-300 hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-lg font-bold text-violet-900 mb-3">
                  {item.term}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-violet-100 p-12 text-center">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No terms found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search to find what you're looking for
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
