'use client';

import { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Article {
  id: string;
  title: string;
  answer: string;
}

interface Category {
  name: string;
  icon: React.ReactNode;
  articles: Article[];
}

const categories: Category[] = [
  {
    name: 'Getting Started',
    icon: <BookOpen className="w-5 h-5" />,
    articles: [
      {
        id: 'gs-1',
        title: 'How do I create an account?',
        answer: 'Creating an account is simple. Click the "Sign Up" button in the top right corner, enter your email address, create a password, and follow the verification steps. You can also sign up using your Google or GitHub account for faster onboarding.',
      },
      {
        id: 'gs-2',
        title: 'What is ProductLobby?',
        answer: 'ProductLobby is a community-driven platform where creators can showcase their products and supporters can discover innovative projects. It connects makers with their audience and provides tools for feedback, collaboration, and growth.',
      },
      {
        id: 'gs-3',
        title: 'Is ProductLobby free to use?',
        answer: 'Yes, ProductLobby is free to use. You can create an account, browse products, and interact with the community at no cost. Some premium features may be available in the future, but core functionality will always be free.',
      },
      {
        id: 'gs-4',
        title: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password within 24 hours.',
      },
    ],
  },
  {
    name: 'Campaigns',
    icon: <BookOpen className="w-5 h-5" />,
    articles: [
      {
        id: 'camp-1',
        title: 'How do I launch a campaign?',
        answer: 'To launch a campaign, go to your dashboard, click "Create Campaign," fill in your product details, set goals and timeline, and publish. Your campaign will be visible to supporters immediately.',
      },
      {
        id: 'camp-2',
        title: 'Can I edit my campaign after launching?',
        answer: 'Yes, you can edit most campaign details including description, images, and goals. However, certain information like campaign type and creator cannot be changed once published. Updates are reflected immediately.',
      },
      {
        id: 'camp-3',
        title: 'How does the funding system work?',
        answer: 'Supporters can pledge money to campaigns they believe in. Funds are held securely and only transferred if the campaign reaches its goal by the deadline. If a campaign doesn\'t reach its goal, all pledges are refunded automatically.',
      },
      {
        id: 'camp-4',
        title: 'What payment methods are accepted?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, and digital payment methods including Apple Pay and Google Pay for supporter contributions.',
      },
    ],
  },
  {
    name: 'Account',
    icon: <BookOpen className="w-5 h-5" />,
    articles: [
      {
        id: 'acc-1',
        title: 'How do I update my profile?',
        answer: 'Go to your Settings page, click "Edit Profile," and update your information including profile picture, bio, website, and social media links. Changes are saved automatically.',
      },
      {
        id: 'acc-2',
        title: 'Can I change my username?',
        answer: 'You can change your display name anytime from your account settings. However, your account username (used for login) can only be changed once every 30 days for security reasons.',
      },
      {
        id: 'acc-3',
        title: 'How do I delete my account?',
        answer: 'To delete your account, go to Settings > Account > Danger Zone and click "Delete Account." This action is permanent and will remove all your data. You\'ll need to confirm with your password.',
      },
      {
        id: 'acc-4',
        title: 'How can I enable two-factor authentication?',
        answer: 'Navigate to Settings > Security, enable "Two-Factor Authentication," and follow the setup process with your authenticator app. This adds an extra layer of security to your account.',
      },
    ],
  },
  {
    name: 'Creators',
    icon: <BookOpen className="w-5 h-5" />,
    articles: [
      {
        id: 'cr-1',
        title: 'What are the requirements to become a creator?',
        answer: 'You need an active account, a valid email address, and to be at least 18 years old. Creators are also expected to follow our community guidelines and provide accurate information about their products.',
      },
      {
        id: 'cr-2',
        title: 'How do I track my campaign performance?',
        answer: 'Your dashboard provides real-time analytics including backer count, funding progress, engagement metrics, and supporter insights. Use this data to optimize your campaign and engage with your audience.',
      },
      {
        id: 'cr-3',
        title: 'Can I have multiple campaigns active?',
        answer: 'Yes, you can run multiple campaigns simultaneously. However, we recommend focusing on one campaign at a time for better engagement and results. Each campaign can have its own timeline and goals.',
      },
      {
        id: 'cr-4',
        title: 'How do I communicate with my supporters?',
        answer: 'Use the "Updates" section in your campaign to post news and progress updates. You can also message supporters directly and access a dedicated community discussion board for each campaign.',
      },
    ],
  },
  {
    name: 'Supporters',
    icon: <BookOpen className="w-5 h-5" />,
    articles: [
      {
        id: 'sup-1',
        title: 'How do I pledge to a campaign?',
        answer: 'Browse campaigns, click on one you\'re interested in, select your pledge tier, enter your payment information, and confirm. Your support will be processed securely and you\'ll receive confirmation.',
      },
      {
        id: 'sup-2',
        title: 'Can I change or cancel my pledge?',
        answer: 'You can modify your pledge amount anytime before the campaign ends by going to "My Pledges" and clicking edit. You can also cancel your pledge and receive a full refund at any time.',
      },
      {
        id: 'sup-3',
        title: 'What are pledge tiers?',
        answer: 'Creators offer different pledge tiers with various benefits at different price points. Choose the tier that matches your budget and desired rewards. Most campaigns offer starter, supporter, and backer tiers.',
      },
      {
        id: 'sup-4',
        title: 'When do I receive my rewards?',
        answer: 'Rewards are typically delivered after the campaign successfully funds and ends. Creators provide an estimated delivery date. You\'ll receive updates on your reward status through the campaign page.',
      },
    ],
  },
  {
    name: 'Technical',
    icon: <BookOpen className="w-5 h-5" />,
    articles: [
      {
        id: 'tech-1',
        title: 'What browsers are supported?',
        answer: 'ProductLobby works best on modern browsers: Chrome, Firefox, Safari, and Edge (latest versions). We also have a mobile app available for iOS and Android for the best mobile experience.',
      },
      {
        id: 'tech-2',
        title: 'Is my data secure?',
        answer: 'We use industry-standard SSL encryption, secure data centers, and regular security audits to protect your information. Payment data is processed through PCI-compliant payment processors.',
      },
      {
        id: 'tech-3',
        title: 'How can I report a bug or issue?',
        answer: 'Use the feedback button in your account menu or email support@productlobby.com with details about the issue. Include your browser, device, and steps to reproduce the problem when possible.',
      },
      {
        id: 'tech-4',
        title: 'What should I do if I encounter a payment issue?',
        answer: 'If your payment fails, check your card details and try again. If the problem persists, contact our support team immediately with your transaction ID and they\'ll investigate and help resolve it.',
      },
    ],
  },
];

interface ExpandedState {
  [key: string]: boolean;
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedArticles, setExpandedArticles] = useState<ExpandedState>({});

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      articles: category.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.articles.length > 0);

  const toggleArticle = (articleId: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  const totalArticles = filteredCategories.reduce(
    (acc, cat) => acc + cat.articles.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-violet-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-violet-600 to-violet-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <HelpCircle className="w-12 h-12 text-lime-300" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-4">
            Help Center
          </h1>
          <p className="text-xl text-violet-100 text-center max-w-2xl mx-auto mb-8">
            Find answers to your questions and get the most out of ProductLobby
          </p>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 text-base w-full border-2 border-violet-300 focus:border-lime-300 bg-white text-gray-900 rounded-lg shadow-lg"
            />
          </div>

          {/* Results count */}
          {searchQuery && (
            <p className="text-center text-violet-100 mt-4">
              Found {totalArticles} article{totalArticles !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* Categories and Articles */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <div key={category.name} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="text-violet-600">{category.icon}</div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                  <span className="ml-auto bg-lime-100 text-lime-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {category.articles.length}
                  </span>
                </div>

                {/* Articles */}
                <div className="space-y-3">
                  {category.articles.map((article) => (
                    <div
                      key={article.id}
                      className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-violet-50 transition-colors rounded-lg"
                      >
                        <h3 className="text-lg font-semibold text-gray-900">
                          {article.title}
                        </h3>
                        <div className="ml-4 flex-shrink-0 text-violet-600">
                          {expandedArticles[article.id] ? (
                            <ChevronUp className="w-6 h-6" />
                          ) : (
                            <ChevronDown className="w-6 h-6" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Answer */}
                      {expandedArticles[article.id] && (
                        <div className="px-6 pb-4 pt-0 border-t border-gray-100">
                          <p className="text-gray-700 leading-relaxed">
                            {article.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No articles found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms
            </p>
            <Button
              onClick={() => setSearchQuery('')}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Clear Search
            </Button>
          </div>
        )}
      </section>

      {/* Contact Support Section */}
      <section className="bg-violet-100 py-12 px-4 sm:px-6 lg:px-8 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Didn't find what you're looking for?
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Our support team is here to help. Reach out to us anytime with
            questions or feedback.
          </p>
          <Button className="bg-lime-500 hover:bg-lime-600 text-white font-semibold px-8 py-3">
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
}
