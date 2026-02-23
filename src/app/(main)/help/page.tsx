'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  HelpCircle,
  Lightbulb,
  Users,
  BarChart3,
  Mail,
  ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { FAQAccordion, type FAQItem } from '@/components/help/faq-accordion'
import { cn } from '@/lib/utils'

// FAQ Content organized by category
const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Lightbulb,
    description: 'New to ProductLobby? Start here',
    items: [
      {
        id: 'gs-1',
        question: 'What is ProductLobby?',
        answer:
          'ProductLobby is a consumer advocacy platform that empowers users to influence product development. You can create or support campaigns to demand changes from brands, share your preferences, and join a community of like-minded consumers pushing for products you want to see in the market.',
      },
      {
        id: 'gs-2',
        question: 'How do I create an account?',
        answer:
          'Click the "Sign In" button in the top navigation, then choose to sign up with your email. You\'ll receive a magic link to verify your email address. No password needed! Complete your profile with a display name, avatar, and bio to get started.',
      },
      {
        id: 'gs-3',
        question: 'Is ProductLobby free to use?',
        answer:
          'Yes! ProductLobby is completely free to use. You can create campaigns, lobby for products, pledge support, and participate in the community at no cost. We\'re building a platform where consumers have a voice.',
      },
      {
        id: 'gs-4',
        question: 'How do I edit my profile?',
        answer:
          'Go to your profile settings in the top navigation menu. You can update your display name, avatar, bio, location, website, and social media handles. Your profile helps other users understand your interests and expertise.',
      },
    ],
  },
  {
    id: 'campaigns',
    title: 'Campaigns',
    icon: BarChart3,
    description: 'Create and manage campaigns',
    items: [
      {
        id: 'camp-1',
        question: 'What is a campaign?',
        answer:
          'A campaign is a focused effort to demand a specific product or feature. It can be a new product you want to see created, an improvement to an existing product, or a change in how a product works. Campaigns help organize community support around specific demands.',
      },
      {
        id: 'camp-2',
        question: 'How do I create a campaign?',
        answer:
          'Click "Create Campaign" from the main navigation. Fill in the campaign details including title, description, target brand, and campaign category. You can add images, set goals, and define what success looks like. Review the business case to show brands why this product matters.',
      },
      {
        id: 'camp-3',
        question: 'Can I edit my campaign after publishing?',
        answer:
          'Yes! As the campaign creator, you can edit most details including the title, description, images, and goals. Go to your campaign and click "Edit". Some details like the basic campaign type cannot be changed once published.',
      },
      {
        id: 'camp-4',
        question: 'How are campaigns ranked?',
        answer:
          'Campaigns are ranked by a demand signal score that considers lobbies (pledges of support), comments, shares, and community engagement. The more people who support your campaign and engage with it, the higher it ranks on the platform.',
      },
      {
        id: 'camp-5',
        question: 'What does the demand signal show?',
        answer:
          'The demand signal is a measure of how much community support your campaign has gathered. It includes the number of lobbies, community comments, social shares, and engagement metrics. A strong demand signal helps brands understand that real demand exists for the product.',
      },
      {
        id: 'camp-6',
        question: 'Can I see who lobbied for my campaign?',
        answer:
          'Yes! As a campaign creator, you can view a list of supporters who have pledged to your campaign. You can see their profiles and reach out to engage with your community. This helps build momentum and understand your audience.',
      },
    ],
  },
  {
    id: 'lobbying',
    title: 'Lobbying & Support',
    icon: Users,
    description: 'Support campaigns and make your voice heard',
    items: [
      {
        id: 'lob-1',
        question: 'What does it mean to lobby for a campaign?',
        answer:
          'Lobbying for a campaign means pledging your support for that product or change. When you lobby, you\'re telling brands that you want this product to exist and that you\'re willing to purchase it or support the initiative. It\'s a signal of demand.',
      },
      {
        id: 'lob-2',
        question: 'How do I show my support for a campaign?',
        answer:
          'Visit any campaign and click the "Lobby" button. You can specify how many units you\'d purchase, set a price point you\'d be willing to pay, and write a comment explaining why you support the product. Your support adds to the campaign\'s demand signal.',
      },
      {
        id: 'lob-3',
        question: 'Can I change my lobby commitment?',
        answer:
          'Yes, you can edit or withdraw your lobbying commitment at any time. Simply visit the campaign, click on your pledge, and adjust your commitment level, purchase price, or comment. You\'re never locked into a campaign.',
      },
      {
        id: 'lob-4',
        question: 'Do I have to purchase the product if it gets made?',
        answer:
          'Not at all! Lobbying shows brands you\'re interested in the product, but you\'re never obligated to buy it if it becomes available. Your lobby is a signal of demand and interest, not a binding contract.',
      },
      {
        id: 'lob-5',
        question: 'Can I see other people\'s reasons for supporting a campaign?',
        answer:
          'Yes! Each campaign shows a feed of supporter comments and reasons. You can see what motivates others, add your own thoughts, and engage in discussions about why the product matters.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Settings',
    icon: HelpCircle,
    description: 'Manage your account',
    items: [
      {
        id: 'acc-1',
        question: 'How do I change my password?',
        answer:
          'ProductLobby uses magic link authentication, so you don\'t have a traditional password. If you need to sign in again, just click "Sign In" and enter your email to receive a new magic link.',
      },
      {
        id: 'acc-2',
        question: 'How do I delete my account?',
        answer:
          'You can request account deletion from your account settings. Click your profile menu, select "Settings", then choose "Delete Account". Your data will be removed from the platform, though your campaign contributions may remain visible for historical purposes.',
      },
      {
        id: 'acc-3',
        question: 'What happens to my campaigns if I delete my account?',
        answer:
          'If you delete your account, your campaigns will be archived but remain visible on the platform for historical reference. The campaign data is preserved so the community\'s work isn\'t lost. You can transfer campaign ownership to another user before deleting your account.',
      },
      {
        id: 'acc-4',
        question: 'How do I control my notification preferences?',
        answer:
          'Visit your account settings and find the "Notifications" section. You can control which types of notifications you receive, including updates on campaigns you\'ve supported, comments on your campaigns, and platform announcements.',
      },
      {
        id: 'acc-5',
        question: 'Is my data secure?',
        answer:
          'Yes, we take data security seriously. ProductLobby uses industry-standard encryption and follows GDPR and other privacy regulations. Your email is never shared publicly, and you control what information is visible on your profile.',
      },
    ],
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter FAQs based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqCategories
    }

    const query = searchQuery.toLowerCase()

    return faqCategories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.items.length > 0)
  }, [searchQuery])

  const displayedCategories = selectedCategory
    ? filteredCategories.filter((cat) => cat.id === selectedCategory)
    : filteredCategories

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-violet-600 to-violet-700 text-white py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Help Center</h1>
            <p className="text-xl text-violet-100 mb-8">
              Find answers to common questions and learn how to make the most of ProductLobby
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setSelectedCategory(null)
                }}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-20 space-y-2">
                <h2 className="font-semibold text-gray-900 mb-4">Categories</h2>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'w-full text-left px-4 py-2 rounded-lg transition-colors',
                    !selectedCategory
                      ? 'bg-violet-100 text-violet-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  All Topics
                </button>

                {faqCategories.map((category) => {
                  const Icon = category.icon
                  const matchCount = category.items.filter((item) => {
                    if (!searchQuery.trim()) return true
                    const query = searchQuery.toLowerCase()
                    return (
                      item.question.toLowerCase().includes(query) ||
                      item.answer.toLowerCase().includes(query)
                    )
                  }).length

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        'w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                        selectedCategory === category.id
                          ? 'bg-violet-100 text-violet-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{category.title}</span>
                      {searchQuery && matchCount > 0 && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                          {matchCount}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">
              {displayedCategories.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search query or browse all categories
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {displayedCategories.map((category) => (
                    <section key={category.id} className="scroll-mt-20">
                      <div className="flex items-center gap-3 mb-6">
                        {React.createElement(category.icon, {
                          className: 'w-6 h-6 text-violet-600',
                        })}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {category.title}
                          </h2>
                          <p className="text-gray-600 text-sm">
                            {category.description}
                          </p>
                        </div>
                      </div>

                      <FAQAccordion items={category.items} />
                    </section>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Support CTA Section */}
        <section className="bg-gradient-to-r from-violet-50 to-lime-50 py-16 px-4 sm:px-6 lg:px-8 mt-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Mail className="w-12 h-12 text-violet-600 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Still have questions?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Can't find the answer you're looking for? Reach out to our support team and we'll get back to you as soon as possible.
                  </p>
                  <a
                    href="mailto:support@productlobby.com"
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    Email Support
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="bg-gradient-to-br from-violet-100 to-lime-100 rounded-lg p-6 flex flex-col justify-center">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Quick Tips
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>
                        Use the search bar to quickly find answers
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>
                        Check the category that matches your question
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>
                        Explore other campaigns to see examples
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lime-600 font-bold">•</span>
                      <span>
                        Check your profile settings for customization options
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
