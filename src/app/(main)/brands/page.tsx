import { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Navbar } from '@/components/shared/navbar'
import { Footer } from '@/components/shared/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/utils'
import { TrendingUp, Target, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Brands - ProductLobby',
  description: 'Discover all brands with active campaigns on ProductLobby. See what consumers are requesting.',
}

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { campaigns: true },
      },
    },
    orderBy: [
      { campaigns: { _count: 'desc' } },
      { name: 'asc' },
    ],
  })

  const brandsWithActiveCampaigns = await Promise.all(
    brands.map(async (brand) => {
      const activeCampaigns = await prisma.campaign.count({
        where: {
          targetedBrandId: brand.id,
          status: 'LIVE',
        },
      })

      return {
        ...brand,
        activeCampaigns,
      }
    })
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
              Brand Directory
            </h1>
            <p className="text-xl text-gray-600">
              Explore all brands with active campaigns. See what consumers are demanding.
            </p>
          </div>
        </section>

        {/* Brands Grid Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {brandsWithActiveCampaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600 mb-4">No brands with campaigns yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brandsWithActiveCampaigns.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-3">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-violet-200 rounded-lg flex items-center justify-center text-xl font-bold text-violet-600">
                            {brand.name.charAt(0)}
                          </div>
                        )}
                        {brand.status === 'VERIFIED' && (
                          <Badge className="bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-violet-600 transition-colors">
                        {brand.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {brand.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {brand.description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="space-y-2 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                              <Target className="w-4 h-4 text-violet-600" />
                              Total Campaigns
                            </span>
                            <span className="font-semibold text-gray-900">
                              {brand._count.campaigns}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-lime-500" />
                              Active
                            </span>
                            <span className="font-semibold text-gray-900">
                              {brand.activeCampaigns}
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <button className="w-full mt-4 pt-4 border-t border-gray-200 text-violet-600 hover:text-violet-700 font-semibold text-sm flex items-center justify-between group-hover:gap-2 transition-all">
                          View Dashboard
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-white border-t border-gray-200 py-12 mt-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-3">
              Don't See Your Brand?
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Start a campaign for any brand and help shape their future.
            </p>
            <Link href="/campaigns/new">
              <Button className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 text-base">
                Start a Campaign
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
