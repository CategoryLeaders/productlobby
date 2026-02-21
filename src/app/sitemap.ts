import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://productlobby.vercel.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/campaigns`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/campaigns/new`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/score`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
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

    campaignPages = campaigns.map((campaign) => ({
      url: `${baseUrl}/campaigns/${campaign.slug}`,
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

    brandPages = brands.map((brand) => ({
      url: `${baseUrl}/brand/${brand.slug}`,
      lastModified: brand.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Sitemap: Failed to fetch brands', error)
  }

  return [...staticPages, ...campaignPages, ...brandPages]
}
