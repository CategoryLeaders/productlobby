import { Metadata } from "next";
import { Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Testimonials | ProductLobby",
};

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  featured?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    quote: "ProductLobby transformed how we gather user feedback. Our product decisions are now data-driven and user-centric.",
    author: "Sarah Chen",
    role: "Product Manager",
    company: "TechVentures Inc",
    rating: 5,
    featured: true,
  },
  {
    id: "2",
    quote: "The platform is incredibly intuitive. We saw 40% more engagement from our community in just two weeks.",
    author: "Marcus Johnson",
    role: "Community Lead",
    company: "CreativeHub",
    rating: 5,
  },
  {
    id: "3",
    quote: "Best investment for our startup. ProductLobby helped us validate our MVP before building it.",
    author: "Elena Rodriguez",
    role: "Co-founder",
    company: "StartupX Labs",
    rating: 5,
  },
  {
    id: "4",
    quote: "The roadmap feature alone is worth it. Our users love seeing what we're building next.",
    author: "David Park",
    role: "Founder",
    company: "AppStudio",
    rating: 5,
  },
  {
    id: "5",
    quote: "Supporting hundreds of creators has never been easier. The moderation tools are stellar.",
    author: "Priya Patel",
    role: "Platform Manager",
    company: "Creator Network",
    rating: 5,
  },
  {
    id: "6",
    quote: "Our user satisfaction scores jumped from 7.2 to 8.9. ProductLobby made the difference.",
    author: "James Wilson",
    role: "CEO",
    company: "CloudPro Solutions",
    rating: 5,
  },
  {
    id: "7",
    quote: "The analytics dashboard gives us insights we never had before. Game-changer for product strategy.",
    author: "Lisa Thompson",
    role: "Head of Product",
    company: "InnovateTech",
    rating: 5,
  },
  {
    id: "8",
    quote: "We doubled our feature requests in the first month. The engagement metrics speak for themselves.",
    author: "Alex Foster",
    role: "Product Designer",
    company: "DesignFlow",
    rating: 5,
  },
  {
    id: "9",
    quote: "ProductLobby's support team is exceptional. They helped us customize everything to our needs.",
    author: "Amanda Cruz",
    role: "Operations Director",
    company: "BrandForce",
    rating: 5,
  },
  {
    id: "10",
    quote: "Finally a platform that understands what creators need. Simple, powerful, and user-friendly.",
    author: "Ben Martinez",
    role: "Content Creator",
    company: "IndieCreators",
    rating: 5,
  },
  {
    id: "11",
    quote: "The ROI has been incredible. Our product team is 10x more efficient with ProductLobby.",
    author: "Sophie Laurent",
    role: "CTO",
    company: "DevFlow Inc",
    rating: 5,
  },
  {
    id: "12",
    quote: "Best customer feedback tool in the market. Our community feels heard and valued.",
    author: "Ryan Collins",
    role: "VP Product",
    company: "GrowthHub",
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  featured = false,
}: {
  testimonial: Testimonial;
  featured?: boolean;
}) {
  return (
    <div
      className={`${
        featured ? "col-span-1 md:col-span-2 lg:col-span-2" : ""
      } rounded-xl border border-violet-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between mb-4">
        <Quote className="text-violet-500" size={24} />
        <StarRating rating={testimonial.rating} />
      </div>
      <p
        className={`${
          featured ? "text-lg" : "text-base"
        } text-gray-700 mb-6 leading-relaxed`}
      >
        "{testimonial.quote}"
      </p>
      <div className="border-t border-violet-100 pt-4">
        <p className="font-semibold text-gray-900">{testimonial.author}</p>
        <p className="text-sm text-gray-600">{testimonial.role}</p>
        <p className="text-sm text-lime-600 font-medium">{testimonial.company}</p>
      </div>
    </div>
  );
}

export default function TestimonialsPage() {
  const featuredTestimonial = testimonials.find((t) => t.featured);
  const otherTestimonials = testimonials.filter((t) => !t.featured);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <Quote className="text-violet-500" size={48} />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h1>
          <p className="text-lg text-gray-600">
            Join thousands of product teams and creators who are building better with ProductLobby
          </p>
        </div>
      </section>

      {/* Featured Testimonial */}
      {featuredTestimonial && (
        <section className="px-4 py-8 sm:px-6 lg:px-8 mb-12">
          <div className="mx-auto max-w-4xl">
            <TestimonialCard testimonial={featuredTestimonial} featured={true} />
          </div>
        </section>
      )}

      {/* Testimonials Grid - Masonry Style */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherTestimonials.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-violet-50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join thousands of happy users
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Start gathering feedback, prioritizing features, and building products your users love
          </p>
          <Button
            asChild
            size="lg"
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <a href="/auth/signup">Get Started Free</a>
          </Button>
        </div>
      </section>
    </main>
  );
}
