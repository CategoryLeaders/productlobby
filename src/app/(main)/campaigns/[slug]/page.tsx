import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import CampaignDetailPage from './campaign-detail'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const campaign = await prisma.campaign.findFirst({
    where: { slug: params.slug },
    select: {
      title: true,
      description: true,
      slug: true,
      category: true,
      media: {
        where: { kind: 'IMAGE' },
        orderBy: { order: 'asc' },
        take: 1,
        select: { url: true },
      },
      targetedBrand: {
        select: { name: true },
      },
    },
  })

  if (!campaign) {
    return {
      title: 'Campaign Not Found',
      description: 'This campaign does not exist on ProductLobby.',
    }
  }

  const description = campaign.description.length > 160
    ? campaign.description.slice(0, 157) + '...'
    : campaign.description

  const brandSuffix = campaign.targetedBrand
    ? ` — targeted at ${campaign.targetedBrand.name}`
    : ''

  const ogImage = campaign.media[0]?.url || 'https://productlobby.vercel.app/og-default.png'

  return {
    title: campaign.title,
    description: `${description}${brandSuffix}`,
    openGraph: {
      title: campaign.title,
      description: `${description}${brandSuffix}`,
      url: `https://productlobby.vercel.app/campaigns/${campaign.slug}`,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: campaign.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description: `${description}${brandSuffix}`,
      images: [ogImage],
    },
  }
}

export default function Page({ params }: PageProps) {
  return <CampaignDetailPage params={params} />
}
