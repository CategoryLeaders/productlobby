import type { Metadata } from 'next'
import { Poppins, Inter, Nunito, Baloo_2 } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
})

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['600', '700'],
})

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['500'],
})

const baloo2 = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo2',
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'ProductLobby — Your Ideas, Their Products',
  description: 'Lobby for the products and features you want. Aggregate demand, influence brands, and turn your ideas into reality on ProductLobby.',
  keywords: ['product requests', 'demand aggregation', 'crowdfunding', 'brand engagement'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} ${nunito.variable} ${baloo2.variable} font-sans antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
