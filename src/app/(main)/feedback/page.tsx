import { Metadata } from "next";
import { MessageSquare, Bug, Lightbulb, Heart, Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Feedback Hub | ProductLobby",
  description: "Share your feedback and see how we're improving ProductLobby",
};

export default function FeedbackPage() {
  const categories = [
    {
      id: "bug",
      title: "Bug Report",
      description: "Report issues or problems you've encountered",
      icon: Bug,
      color: "bg-red-50 hover:bg-red-100",
      iconColor: "text-red-600",
    },
    {
      id: "feature",
      title: "Feature Request",
      description: "Suggest new features or improvements",
      icon: Lightbulb,
      color: "bg-yellow-50 hover:bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      id: "general",
      title: "General Feedback",
      description: "Share your thoughts and ideas",
      icon: MessageSquare,
      color: "bg-violet-50 hover:bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      id: "praise",
      title: "Praise",
      description: "Tell us what you love about ProductLobby",
      icon: Heart,
      color: "bg-pink-50 hover:bg-pink-100",
      iconColor: "text-pink-600",
    },
  ];

  const recentFeedback = [
    {
      id: 1,
      author: "Sarah Chen",
      category: "Feature Request",
      title: "Dark mode support",
      excerpt: "Would love to have a dark mode option for nighttime usage.",
      timestamp: "2 days ago",
      votes: 247,
    },
    {
      id: 2,
      author: "Alex Rodriguez",
      category: "Bug Report",
      title: "Login timeout issue",
      excerpt: "Sessions expire too quickly when inactive.",
      timestamp: "1 week ago",
      votes: 89,
    },
    {
      id: 3,
      author: "Jordan Liu",
      category: "Praise",
      title: "Amazing product",
      excerpt: "ProductLobby has transformed how we gather user insights!",
      timestamp: "3 days ago",
      votes: 156,
    },
    {
      id: 4,
      author: "Emma Watson",
      category: "Feature Request",
      title: "API export functionality",
      excerpt: "Would be great to export feedback data via API.",
      timestamp: "5 days ago",
      votes: 203,
    },
  ];

  const stats = [
    { label: "Total Feedback Received", value: "12,847" },
    { label: "Features Shipped", value: "43" },
    { label: "Avg Response Time", value: "2 days" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-lime-50">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-violet-100 to-lime-100 rounded-2xl">
              <MessageSquare className="w-12 h-12 text-violet-600" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Share Your Feedback
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your voice matters. Help us build a better ProductLobby by sharing your thoughts, ideas, and feedback.
          </p>
        </div>
      </section>

      {/* Categories Section */}
      <section className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Choose a Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  className={`group ${category.color} p-6 rounded-xl transition-all duration-200 text-left border-2 border-transparent hover:border-violet-300 cursor-pointer`}
                >
                  <div className="flex flex-col h-full">
                    <IconComponent className={`w-8 h-8 ${category.iconColor} mb-4 group-hover:scale-110 transition-transform`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex-grow">
                      {category.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-violet-50 to-lime-50">
                <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-lime-600 mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Feedback Section */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Recent Feedback
          </h2>
          <div className="space-y-4">
            {recentFeedback.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {feedback.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600">
                        by {feedback.author}
                      </span>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-violet-100 text-violet-700 rounded-full">
                        {feedback.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {feedback.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{feedback.excerpt}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                  <span className="text-sm font-medium text-gray-700">
                    {feedback.votes} votes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 bg-gradient-to-r from-violet-600 to-lime-500">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Share Your Feedback?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Submit your feedback now and help shape the future of ProductLobby.
          </p>
          <Button
            size="lg"
            className="bg-white text-violet-600 hover:bg-gray-100 font-semibold"
          >
            <Send className="w-5 h-5 mr-2" />
            Submit Feedback
          </Button>
        </div>
      </section>
    </div>
  );
}
