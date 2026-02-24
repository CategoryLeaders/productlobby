export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

interface Testimonial {
  id: string
  author: string
  role: string
  content: string
  rating: number
  platform: string
  likes: number
  date: string
  verified: boolean
}

interface SocialProofData {
  totalTestimonials: number
  averageRating: number
  verifiedPercentage: number
  testimonials: Testimonial[]
}

interface SocialProofResponse {
  success: boolean
  data?: SocialProofData
  error?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<SocialProofResponse>> {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const campaignId = params.id

    // Try to find campaign by UUID or slug
    const campaign = await prisma.campaign.findFirst({
      where: {
        OR: [{ id: campaignId }, { slug: campaignId }],
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Check authorization
    if (campaign.creatorUserId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Simulated testimonials data
    const testimonials: Testimonial[] = [
      {
        id: '1',
        author: 'Sarah Johnson',
        role: 'Product Manager, Tech Startup',
        content: 'This campaign has been absolutely transformative for our business. The support and engagement we received exceeded all expectations.',
        rating: 5,
        platform: 'LinkedIn',
        likes: 342,
        date: '2 weeks ago',
        verified: true,
      },
      {
        id: '2',
        author: 'Michael Chen',
        role: 'Founder & CEO',
        content: 'The community engagement through this platform is unparalleled. Highly recommend to anyone looking to build momentum.',
        rating: 5,
        platform: 'Twitter',
        likes: 218,
        date: '1 week ago',
        verified: true,
      },
      {
        id: '3',
        author: 'Emma Rodriguez',
        role: 'Marketing Director',
        content: 'Great experience! The tools and support made it easy to launch and manage our campaign effectively.',
        rating: 4,
        platform: 'Facebook',
        likes: 156,
        date: '3 days ago',
        verified: true,
      },
      {
        id: '4',
        author: 'James Wilson',
        role: 'Community Lead',
        content: 'Best platform for community-driven campaigns. The features are intuitive and the support team is fantastic.',
        rating: 5,
        platform: 'LinkedIn',
        likes: 289,
        date: '5 days ago',
        verified: false,
      },
      {
        id: '5',
        author: 'Lisa Anderson',
        role: 'Brand Strategist',
        content: 'Impressive results and wonderful community support. This platform truly makes a difference in reaching your goals.',
        rating: 4,
        platform: 'Instagram',
        likes: 412,
        date: '1 day ago',
        verified: true,
      },
      {
        id: '6',
        author: 'David Lee',
        role: 'Business Developer',
        content: 'Outstanding platform with excellent features. Would definitely recommend to others launching campaigns.',
        rating: 5,
        platform: 'Twitter',
        likes: 195,
        date: '4 days ago',
        verified: true,
      },
    ]

    const data: SocialProofData = {
      totalTestimonials: testimonials.length,
      averageRating: 4.67,
      verifiedPercentage: 83,
      testimonials,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching social proof data:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
