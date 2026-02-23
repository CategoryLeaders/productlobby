import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/campaigns`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/brands`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/success-stories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic campaign pages
  let campaignPages: MetadataRoute.Sitemap = []
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'LIVE' },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    })

    campaignPages = campaigns.map((campaign: { slug: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/campaigns/${campaign.slug}`,
      lastModified: campaign.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Sitemap: Failed to fetch campaigns', error)
  }

  // Dynamic brand pages
  let brandPages: MetadataRoute.Sitemap = []
  try {
    const brands = await prisma.brand.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    })

    brandPages = brands.map((brand: { slug: string; updatedAt: Date }) => ({
      url: `${BASE_URL}/brands/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Sitemap: Failed to fetch brands', error)
  }

  return [...staticPages, ...campaignPages, ...brandPages]
}
