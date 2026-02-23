import { Metadata } from "next";
import { Building2, TrendingUp, Users, DollarSign, Target, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Investor Relations | ProductLobby",
  description: "Join us in revolutionizing how product teams gather customer feedback. Learn about our growth, market opportunity, and investment potential.",
};

export default function InvestorsPage() {
  const metrics = [
    {
      icon: DollarSign,
      label: "Annual Recurring Revenue",
      value: "$2.5M+",
      trend: "+180%",
    },
    {
      icon: Users,
      label: "Active Users",
      value: "15,000+",
      trend: "+250%",
    },
    {
      icon: Target,
      label: "Campaign Growth",
      value: "50,000+",
      trend: "+320%",
    },
    {
      icon: TrendingUp,
      label: "Retention Rate",
      value: "92%",
      trend: "+8%",
    },
  ];

  const milestones = [
    {
      date: "Q4 2024",
      title: "Series A Funding Round",
      description: "Secured $8M Series A to accelerate product development and market expansion.",
    },
    {
      date: "Q3 2024",
      title: "Enterprise Customer Milestone",
      description: "Reached 50+ enterprise customers across Fortune 500 companies.",
    },
    {
      date: "Q2 2024",
      title: "Platform 2.0 Launch",
      description: "Launched advanced analytics and AI-powered insights engine.",
    },
    {
      date: "Q1 2024",
      title: "International Expansion",
      description: "Expanded operations to EMEA and APAC regions with 3 new offices.",
    },
  ];

  const teamHighlights = [
    {
      role: "CEO & Co-founder",
      description: "Former VP Product at TechCorp, led 50M+ user platform.",
    },
    {
      role: "CTO & Co-founder",
      description: "Ex-engineering lead at CloudScale, built scalable infrastructure.",
    },
    {
      role: "Chief Commercial Officer",
      description: "Previously VP Sales at SaaS leader, built $50M+ revenue pipeline.",
    },
    {
      role: "Chief Product Officer",
      description: "Led product at multiple unicorns, expert in user engagement.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-violet-100 to-lime-100 mb-6">
            <Building2 className="w-8 h-8 text-violet-600" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Investor Relations
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join us in revolutionizing how product teams gather and act on customer feedback. We're building the future of product-customer alignment.
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-violet-600 to-lime-500 hover:from-violet-700 hover:to-lime-600 text-white"
          >
            Download Investor Deck <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Platform Metrics */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Platform Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={index}
                  className="p-6 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-gradient-to-br hover:from-violet-50 hover:to-lime-50 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8 text-violet-600" />
                    <span className="text-sm font-semibold text-lime-600">
                      {metric.trend}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{metric.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-50 to-lime-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Market Opportunity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg border border-violet-200">
              <h3 className="text-2xl font-bold text-violet-600 mb-2">$25B</h3>
              <p className="text-gray-600">
                Total addressable market in product analytics and feedback platforms.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-lime-200">
              <h3 className="text-2xl font-bold text-lime-600 mb-2">35% CAGR</h3>
              <p className="text-gray-600">
                Expected market growth rate through 2028 as companies prioritize customer feedback.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-violet-200">
              <h3 className="text-2xl font-bold text-violet-600 mb-2">10x</h3>
              <p className="text-gray-600">
                Potential market expansion with AI-driven insights and workflow integration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Highlights */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamHighlights.map((member, index) => (
              <div 
                key={index}
                className="p-6 rounded-lg bg-gradient-to-br from-violet-50 to-lime-50 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {member.role}
                </h3>
                <p className="text-gray-600">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Milestones */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Recent Milestones
          </h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div 
                key={index}
                className="flex gap-6 pb-8 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-violet-100 to-lime-100">
                    <TrendingUp className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-semibold text-violet-600 mb-1">
                    {milestone.date}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Interested in Investing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            We'd love to discuss how ProductLobby can transform product development for your portfolio companies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              size="lg"
              className="border-violet-200 hover:bg-violet-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              investors@productlobby.com
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-lime-500 hover:from-violet-700 hover:to-lime-600 text-white"
            >
              Schedule a Call <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
