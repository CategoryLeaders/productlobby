import { Briefcase, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JobListing {
  id: string
  title: string
  department: string
  location: string
  type: 'Full-time' | 'Contract'
  description: string
}

const jobListings: JobListing[] = [
  {
    id: 'fullstack-1',
    title: 'Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Join our engineering team to build scalable web applications with Next.js and TypeScript. You will work on both frontend and backend systems, collaborate with product and design teams, and help shape the future of our platform.',
  },
  {
    id: 'designer-1',
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description:
      'We are looking for a talented product designer to create beautiful and intuitive user experiences. You will conduct user research, iterate on designs, and work closely with engineering and product teams to deliver delightful products.',
  },
  {
    id: 'community-1',
    title: 'Community Manager',
    department: 'Community',
    location: 'Remote',
    type: 'Full-time',
    description:
      'Build and nurture our growing community of product advocates and creators. You will engage with members, moderate discussions, organize events, and help shape our community strategy and culture.',
  },
  {
    id: 'growth-1',
    title: 'Growth Marketing Lead',
    department: 'Marketing',
    location: 'New York, NY',
    type: 'Contract',
    description:
      'Lead our growth initiatives and scaling strategies. You will oversee marketing campaigns, analyze metrics, optimize conversion funnels, and develop strategies to accelerate user acquisition and retention.',
  },
]

const perks = [
  'Competitive salary and equity',
  'Health, dental, and vision insurance',
  'Flexible work arrangements',
  '401(k) matching',
  'Professional development budget',
  'Paid time off',
  'Collaborative and innovative culture',
  'Remote-friendly environment',
]

export const metadata = {
  title: 'Careers - ProductLobby',
  description: 'Join our team and help shape the future of product development.',
}

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-lg bg-blue-100 p-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900">Join Our Team</h1>
          <p className="mb-8 text-lg text-slate-600">
            Help us revolutionize product development and empower creators and brands
            to build better products together.
          </p>
          <p className="text-slate-500">
            We are a passionate team building tools that matter. If you are excited about
            our mission and want to make an impact, we would love to hear from you.
          </p>
        </div>
      </section>

      {/* Job Listings */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Open Positions</h2>
          <div className="space-y-6">
            {jobListings.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">{job.title}</h3>
                    <p className="text-sm font-medium text-slate-500">{job.department}</p>
                  </div>
                  <span
                    className={cn(
                      'whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium',
                      job.type === 'Full-time'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    )}
                  >
                    {job.type}
                  </span>
                </div>

                <p className="mb-4 text-slate-700">{job.description}</p>

                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{job.type}</span>
                  </div>
                </div>

                <a
                  href="mailto:careers@productlobby.com?subject=Application for Position"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-3xl font-bold text-slate-900">Why Join Us</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {perks.map((perk, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-600" />
                  <span className="text-slate-700">{perk}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-lg bg-blue-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Do not see your role?</h2>
          <p className="mb-6 text-slate-600">
            Send us your resume and let us know how you can contribute to our mission.
          </p>
          <a
            href="mailto:careers@productlobby.com"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </div>
  )
}
