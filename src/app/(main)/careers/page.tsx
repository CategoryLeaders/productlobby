import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  MapPin,
  Heart,
  Zap,
  Users,
  Trophy,
  GraduationCap,
  TrendingUp,
  Send,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers at ProductLobby | Join Our Team',
  description:
    'Explore open positions at ProductLobby. Join a team building the future of product feedback and communication.',
  keywords: [
    'careers',
    'jobs',
    'hiring',
    'product management',
    'engineering',
    'design',
  ],
};

const benefits = [
  {
    icon: MapPin,
    title: 'Remote First',
    description: 'Work from anywhere in the world with flexible arrangements',
  },
  {
    icon: GraduationCap,
    title: 'Learning Budget',
    description: 'Annual learning stipend for courses, conferences, and development',
  },
  {
    icon: Heart,
    title: 'Health & Wellness',
    description: 'Comprehensive health coverage and wellness programs',
  },
  {
    icon: Trophy,
    title: 'Equity',
    description: 'Own a piece of ProductLobby as we grow together',
  },
];

const positions = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Lead the technical architecture of our platform. We\'re looking for an experienced engineer to guide our engineering team and shape our product.',
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Design beautiful and intuitive experiences for our users. Shape the visual direction and UX of ProductLobby across web and mobile.',
  },
  {
    id: 3,
    title: 'Head of Marketing',
    department: 'Marketing',
    location: 'London',
    type: 'Full-time',
    description:
      'Lead our marketing strategy and build our brand. Drive growth through integrated marketing campaigns and strategic partnerships.',
  },
  {
    id: 4,
    title: 'Developer Advocate',
    department: 'Community',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Be the voice of our developer community. Create content, engage with developers, and shape the future of our platform.',
  },
  {
    id: 5,
    title: 'Data Analyst',
    department: 'Data',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Turn data into insights that drive product decisions. Build dashboards and analytics that help us understand our users better.',
  },
  {
    id: 6,
    title: 'Customer Success Manager',
    department: 'Support',
    location: 'London / Remote',
    type: 'Full-time',
    description:
      'Own customer relationships and ensure their success with ProductLobby. You\'ll work closely with key accounts and support teams.',
  },
];

const values = [
  {
    icon: Users,
    title: 'Customer-Centric',
    description: 'Everything we do starts with understanding our users',
  },
  {
    icon: Zap,
    title: 'Move Fast',
    description: 'We iterate quickly and learn from our users continuously',
  },
  {
    icon: TrendingUp,
    title: 'Impact Driven',
    description: 'We measure success by the value we create for our customers',
  },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Join Our <span className="text-violet-600">Team</span>
          </h1>
          <p className="mb-8 text-xl text-slate-600">
            Help us build the future of product feedback and communication. We're
            a passionate team dedicated to empowering businesses to understand their
            customers better and create products people love.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              Explore Open Roles
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-violet-200 hover:bg-violet-50"
            >
              Learn About Us
            </Button>
          </div>
        </div>
      </section>

      {/* Why Work Here Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Why Join ProductLobby?
            </h2>
            <p className="text-lg text-slate-600">
              We invest in our team because great people build great products
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-violet-200"
                >
                  <div className="mb-4 inline-block rounded-lg bg-violet-100 p-3">
                    <Icon className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Open Positions
            </h2>
            <p className="text-lg text-slate-600">
              Join us and help shape the future of product feedback
            </p>
          </div>

          <div className="space-y-6">
            {positions.map((position) => (
              <div
                key={position.id}
                className="rounded-lg border border-slate-200 bg-white p-8 transition-all hover:shadow-md hover:border-violet-200"
              >
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-bold text-slate-900">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4" />
                        {position.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </div>
                      <div className="inline-flex items-center rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-700">
                        {position.type}
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mb-6 text-slate-600">{position.description}</p>
                <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Values Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-violet-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Our Values
            </h2>
            <p className="text-lg text-slate-600">
              These principles guide everything we do
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="inline-block rounded-lg bg-white p-4 shadow-sm">
                      <Icon className="h-8 w-8 text-violet-600" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900">
                    {value.title}
                  </h3>
                  <p className="text-slate-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-violet-200 bg-gradient-to-br from-violet-50 to-slate-50 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-900">
            Don't see your role?
          </h2>
          <p className="mb-8 text-lg text-slate-600">
            We're always looking for talented people to join our team. Send us your
            CV and let's explore how you can grow with ProductLobby.
          </p>
          <Button
            size="lg"
            className="bg-lime-500 hover:bg-lime-600 text-slate-900 font-semibold"
          >
            <Send className="mr-2 h-5 w-5" />
            Send Your CV
          </Button>
        </div>
      </section>
    </main>
  );
}
