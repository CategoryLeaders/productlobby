import { Metadata } from 'next'

export interface CampaignMetadataInput {
  title: string
  description?: string | null
  slug: string
  image?: string
}

/**
 * Generate OpenGraph and Twitter metadata for a campaign
 */
export function getCampaignMetadata(campaign: CampaignMetadataInput): Metadata {
  const domain = 'productlobby.com'
  const baseUrl = 'https://www.productlobby.com'
  const campaignUrl = `${baseUrl}/campaigns/${campaign.slug}`
  const descriptionText = campaign.description?.slice(0, 155).trim() ?? ''
  const fullDescription = descriptionText.length >= 155 ? `${descriptionText}...` : descriptionText

  return {
    title: `${campaign.title} | ProductLobby`,
    description: fullDescription,
    openGraph: {
      title: campaign.title,
      description: fullDescription,
      url: campaignUrl,
      siteName: 'ProductLobby',
      type: 'article',
      images: campaign.image ? [
        {
          url: campaign.image,
          width: 1200,
          height: 630,
          alt: campaign.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: campaign.title,
      description: fullDescription,
      creator: '@productlobby',
      images: campaign.image ? [campaign.image] : undefined,
    },
    alternates: {
      canonical: campaignUrl,
    },
  }
}

/**
 * Generate structured data (JSON-LD) for a campaign
 */
export function getCampaignStructuredData(campaign: CampaignMetadataInput & { createdAt?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: campaign.title,
    description: campaign.description?.slice(0, 255),
    image: campaign.image,
    datePublished: campaign.createdAt,
    publisher: {
      '@type': 'Organization',
      name: 'ProductLobby',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.productlobby.com/logo.png',
      },
    },
  }
}
