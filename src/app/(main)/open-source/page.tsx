import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Users,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Open Source at ProductLobby | Contribute to Product Democracy',
  description:
    'Explore ProductLobby\'s open source projects and contribute to the future of product advocacy. Join our community of developers and makers.',
  openGraph: {
    title: 'Open Source at ProductLobby',
    description:
      'Explore ProductLobby\'s open source projects and contribute to the future of product advocacy.',
    type: 'website',
    url: 'https://www.productlobby.com/open-source',
    images: [
      {
        url: '/brand/og/productlobby-og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'Open Source at ProductLobby',
      },
    ],
  },
};

interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  languageBg: string;
  languageText: string;
  stars: number;
  forks: number;
  url: string;
  topics: string[];
}

interface Contributor {
  id: string;
  name: string;
  initials: string;
  bgColor: string;
}

const featuredRepos: Repository[] = [
  {
    id: '1',
    name: 'productlobby-sdk',
    description:
      'Official TypeScript SDK for integrating ProductLobby campaigns into your applications. Includes real-time updates, analytics, and customizable UI components.',
    language: 'TypeScript',
    languageBg: 'bg-blue-100',
    languageText: 'text-blue-800',
    stars: 1240,
    forks: 189,
    url: 'https://github.com/productlobby/productlobby-sdk',
    topics: ['sdk', 'typescript', 'integration'],
  },
  {
    id: '2',
    name: 'campaign-analytics',
    description:
      'Advanced analytics engine for understanding campaign performance. Provides sentiment analysis, trend detection, and demographic insights to help campaigns succeed.',
    language: 'Python',
    languageBg: 'bg-green-100',
    languageText: 'text-green-800',
    stars: 856,
    forks: 142,
    url: 'https://github.com/productlobby/campaign-analytics',
    topics: ['analytics', 'python', 'sentiment-analysis'],
  },
  {
    id: '3',
    name: 'feedback-widget',
    description:
      'Embeddable feedback collection widget for websites. Easy-to-integrate component for gathering user insights and driving product decisions.',
    language: 'React',
    languageBg: 'bg-purple-100',
    languageText: 'text-purple-800',
    stars: 2103,
    forks: 347,
    url: 'https://github.com/productlobby/feedback-widget',
    topics: ['react', 'feedback', 'widget', 'component'],
  },
  {
    id: '4',
    name: 'pl-design-system',
    description:
      'Comprehensive design system and component library used across ProductLobby. Built with Tailwind CSS and featuring 100+ reusable components.',
    language: 'TypeScript',
    languageBg: 'bg-blue-100',
    languageText: 'text-blue-800',
    stars: 1567,
    forks: 223,
    url: 'https://github.com/productlobby/pl-design-system',
    topics: ['design-system', 'components', 'tailwind'],
  },
];

const contributors: Contributor[] = [
  { id: '1', name: 'Sarah Chen', initials: 'SC', bgColor: 'bg-violet-500' },
  { id: '2', name: 'Marcus Johnson', initials: 'MJ', bgColor: 'bg-lime-500' },
  { id: '3', name: 'Alex Rivera', initials: 'AR', bgColor: 'bg-indigo-500' },
  { id: '4', name: 'Emma Williams', initials: 'EW', bgColor: 'bg-fuchsia-500' },
  { id: '5', name: 'David Park', initials: 'DP', bgColor: 'bg-cyan-500' },
  { id: '6', name: 'Jessica Liu', initials: 'JL', bgColor: 'bg-rose-500' },
];

const ContributionSteps = [
  {
    icon: GitFork,
    title: 'Fork the Repository',
    description: 'Create your own copy of the project on GitHub to start making changes.',
  },
  {
    icon: BookOpen,
    title: 'Create a Branch',
    description: 'Create a feature branch from main for your contribution.',
  },
  {
    icon: CheckCircle2,
    title: 'Submit a Pull Request',
    description: 'Push your changes and open a pull request for review by the team.',
  },
  {
    icon: Users,
    title: 'Code Review',
    description: 'Work with maintainers to refine your contribution and get it merged.',
  },
];

export default function OpenSourcePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-violet-50 via-white to-lime-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Github className="h-10 w-10 text-violet-600" />
            <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Open Source
            </span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Open Source at ProductLobby
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            We believe in the power of open source and community-driven development. Explore our
            projects, contribute your ideas, and help shape the future of product advocacy.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              size="lg"
            >
              <Github className="h-4 w-4 mr-2" />
              View on GitHub
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-300 hover:bg-gray-50"
            >
              Browse Issues
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Projects Section */}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Projects</h2>
          <p className="text-lg text-gray-600">
            Discover the open source projects powering ProductLobby and making product democracy possible.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {featuredRepos.map((repo) => (
            <div
              key={repo.id}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-8 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">{repo.name}</h3>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${repo.languageBg} ${repo.languageText}`}
                  >
                    {repo.language}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 flex-1">{repo.description}</p>

              {/* Topics */}
              <div className="flex flex-wrap gap-2 mb-6">
                {repo.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              {/* Stats and CTA */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                <div className="flex gap-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                    <span className="font-semibold text-gray-900">{repo.stars.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GitFork className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-gray-900">{repo.forks.toLocaleString()}</span>
                  </div>
                </div>
                <a href={repo.url} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                    View on GitHub
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contribution Guidelines Section */}
      <div className="border-t border-gray-200 bg-gradient-to-br from-lime-50 to-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contribution Guidelines
            </h2>
            <p className="text-lg text-gray-600">
              We welcome contributions from developers of all skill levels. Here's how to get started.
            </p>
          </div>

          {/* How to Contribute Steps */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">How to Contribute</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {ContributionSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-violet-100 mr-4">
                        <Icon className="h-6 w-6 text-violet-600" />
                      </div>
                      <div className="h-1 w-8 bg-lime-400 rounded"></div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Getting Started Box */}
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="font-semibold text-violet-600 flex-shrink-0">1.</span>
                <span>
                  Check out our{' '}
                  <a href="#" className="font-semibold text-violet-600 hover:underline">
                    Contributing.md
                  </a>{' '}
                  file for detailed guidelines
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-violet-600 flex-shrink-0">2.</span>
                <span>
                  Look for issues labeled "good-first-issue" to find tasks perfect for newcomers
                </span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-violet-600 flex-shrink-0">3.</span>
                <span>Join our community Discord to discuss ideas and get help from maintainers</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-violet-600 flex-shrink-0">4.</span>
                <span>
                  Follow the coding standards and tests requirements outlined in each project's README
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Community Contributors Section */}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Community Contributors</h2>
          <p className="text-lg text-gray-600 mb-8">
            We're grateful for the hundreds of developers who contribute to ProductLobby's open
            source ecosystem.
          </p>
        </div>

        {/* Contributor Avatars Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          {contributors.map((contributor) => (
            <div
              key={contributor.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6"
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-full text-white font-bold text-lg ${contributor.bgColor}`}
              >
                {contributor.initials}
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{contributor.name}</h4>
                <p className="text-sm text-gray-600">Active Contributor</p>
              </div>
            </div>
          ))}
        </div>

        {/* Join Contributors CTA */}
        <div className="rounded-xl bg-gradient-to-r from-violet-100 to-lime-100 p-8 text-center border border-violet-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Become a Contributor</h3>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Your contributions help shape the future of product advocacy. Whether you're fixing bugs,
            adding features, or improving documentation, we'd love to have you on the team.
          </p>
          <a href="https://github.com/productlobby" target="_blank" rel="noopener noreferrer">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white">
              Join as a Contributor
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* Open Issues Section */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Open Issues Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-amber-100">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Open Issues</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">247</p>
                <p className="text-gray-600">Across all ProductLobby repositories</p>
              </div>
              <p className="text-gray-700 mb-6">
                Check out our current open issues across all repositories. From bug fixes to feature
                requests, there's always something to work on.
              </p>
              <a
                href="https://github.com/productlobby"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full border-gray-300 hover:bg-gray-50">
                  Browse All Issues
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>

            {/* Good First Issues Card */}
            <div className="rounded-xl border-2 border-lime-300 bg-gradient-to-br from-lime-50 to-white p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-lime-200">
                  <CheckCircle2 className="h-6 w-6 text-lime-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Good First Issues</h3>
              </div>
              <div className="mb-6">
                <p className="text-4xl font-bold text-gray-900 mb-2">42</p>
                <p className="text-gray-600">Perfect for newcomers and first-time contributors</p>
              </div>
              <p className="text-gray-700 mb-6">
                Start your open source journey with issues specifically tagged as "good-first-issue".
                These are great opportunities to learn and make an impact.
              </p>
              <a
                href="https://github.com/productlobby"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-lime-600 hover:bg-lime-700 text-white">
                  Find Good First Issues
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* License Section */}
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-8 w-8 text-violet-600" />
            <h2 className="text-2xl font-bold text-gray-900">License</h2>
          </div>
          <p className="text-gray-700 mb-4">
            All ProductLobby open source projects are released under the{' '}
            <span className="font-semibold">MIT License</span>, one of the most permissive open
            source licenses available.
          </p>
          <p className="text-gray-600 mb-6">
            This means you're free to use, modify, and distribute our software, even for commercial
            purposes, as long as you include a copy of the license and copyright notice.
          </p>
          <a
            href="https://opensource.org/licenses/MIT"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
              Learn More About MIT License
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </a>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-gray-200 bg-gradient-to-br from-violet-50 via-white to-lime-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of developers building the future of product advocacy with ProductLobby.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/productlobby"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                <Github className="h-4 w-4 mr-2" />
                Visit Our GitHub
              </Button>
            </a>
            <Button
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              Join Our Community
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
