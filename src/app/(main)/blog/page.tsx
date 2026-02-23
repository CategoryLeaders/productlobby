import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProductLobby Blog | Product Updates & Community Insights',
  description:
    'Read our latest product updates, community stories, brand insights, and tips & tricks for successful product advocacy.',
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: 'Product Updates' | 'Community' | 'Brand Insights' | 'Tips & Tricks';
  readingTime: number;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Introducing Campaign Sentiment Analysis',
    excerpt:
      'We are excited to announce a new feature that helps brands understand the sentiment of campaign comments at a glance with our word cloud visualization.',
    date: '2025-02-20',
    author: 'Sarah Chen',
    category: 'Product Updates',
    readingTime: 5,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    id: '2',
    title: 'How to Run a Successful Product Campaign',
    excerpt:
      'Learn from our most successful campaigns what it takes to engage your community and drive real product improvements.',
    date: '2025-02-15',
    author: 'Marcus Johnson',
    category: 'Tips & Tricks',
    readingTime: 8,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    id: '3',
    title: 'Community Spotlight: February Edition',
    excerpt:
      'This month we celebrate the most active community members who have made a real difference in product development.',
    date: '2025-02-10',
    author: 'Alex Rivera',
    category: 'Community',
    readingTime: 6,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    id: '4',
    title: 'What Brands Are Learning From Your Feedback',
    excerpt:
      'Discover how leading brands are using ProductLobby to understand customer needs and accelerate product development.',
    date: '2025-02-05',
    author: 'Emma Williams',
    category: 'Brand Insights',
    readingTime: 7,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    id: '5',
    title: 'Advanced Notification Preferences Now Available',
    excerpt:
      'Take control of how you receive updates about campaigns you care about with our newly released granular notification settings.',
    date: '2025-01-30',
    author: 'David Park',
    category: 'Product Updates',
    readingTime: 4,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
  {
    id: '6',
    title: 'Building Better Products With Your Voice',
    excerpt:
      'Understanding how community feedback translates into real product decisions and the impact your voice can have.',
    date: '2025-01-25',
    author: 'Jessica Liu',
    category: 'Tips & Tricks',
    readingTime: 9,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
  },
];

const getCategoryColor = (
  category: BlogPost['category']
): { bg: string; text: string } => {
  switch (category) {
    case 'Product Updates':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    case 'Community':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'Brand Insights':
      return { bg: 'bg-purple-100', text: 'text-purple-800' };
    case 'Tips & Tricks':
      return { bg: 'bg-orange-100', text: 'text-orange-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900">ProductLobby Blog</h1>
          <p className="mt-4 text-lg text-gray-600">
            Product updates, community stories, brand insights, and tips for successful product advocacy.
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => {
            const categoryColor = getCategoryColor(post.category);
            return (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-gray-200">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  {/* Category Badge */}
                  <div className="mb-3 inline-block">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor.bg} ${categoryColor.text}`}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="mb-3 text-xl font-bold text-gray-900">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="mb-4 flex-1 text-gray-600">
                    {post.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
                    <div>
                      <p className="font-medium text-gray-900">{post.author}</p>
                      <p>{formatDate(post.date)}</p>
                    </div>
                    <p className="text-right">{post.readingTime} min read</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-gray-200 bg-blue-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Stay Updated</h3>
            <p className="mt-2 text-gray-600">
              Subscribe to our newsletter to get the latest ProductLobby updates delivered to your inbox.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
