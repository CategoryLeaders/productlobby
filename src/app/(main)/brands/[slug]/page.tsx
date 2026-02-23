import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import BrandDashboard from './brand-dashboard'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
    select: {
      name: true,
      description: true,
      logo: true,
      _count: {
        select: { campaigns: true },
      },
    },
  })

  if (!brand) {
    return {
      title: 'Brand Not Found',
      description: 'This brand does not exist on ProductLobby.',
    }
  }

  const description = brand.description
    ? brand.description.length > 160
      ? brand.description.slice(0, 157) + '...'
      : brand.description
    : `Discover campaigns targeting ${brand.name}`

  return {
    title: `${brand.name} - ProductLobby Brand Dashboard`,
    description,
    openGraph: {
      title: `${brand.name} on ProductLobby`,
      description,
      url: `https://www.productlobby.com/brands/${params.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${brand.name} - ProductLobby`,
      description,
      creator: '@ProductLobby',
    },
  }
}

export default async function BrandPage({ params }: PageProps) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
    include: {
      campaigns: {
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              handle: true,
              avatar: true,
              email: true,
            },
          },
          media: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: { lobbies: true, follows: true },
          },
        },
      },
    },
  })

  if (!brand) {
    notFound()
  }

  return <BrandDashboard brand={brand} />
}
