'use client'

interface JsonLdProps {
  data: Record<string, any>
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Pre-built structured data for common page types
export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'ProductLobby',
        url: 'https://productlobby.vercel.app',
        description:
          'Lobby for the products and features you want. Aggregate demand, influence brands, and turn your ideas into reality.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate:
              'https://productlobby.vercel.app/campaigns?query={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'ProductLobby',
        url: 'https://productlobby.vercel.app',
        logo: 'https://productlobby.vercel.app/logo.png',
        sameAs: [],
      }}
    />
  )
}

export function CampaignJsonLd({
  title,
  description,
  url,
  dateCreated,
  creator,
  lobbyCount,
}: {
  title: string
  description: string
  url: string
  dateCreated: string
  creator: string
  lobbyCount: number
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: title,
        description,
        url,
        dateCreated,
        author: {
          '@type': 'Person',
          name: creator,
        },
        interactionStatistic: {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: lobbyCount,
        },
      }}
    />
  )
}
