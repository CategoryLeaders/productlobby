import { Metadata } from 'next'
import HomePage from './home-page'

export const metadata: Metadata = {
  title: 'ProductLobby — Lobby for the Products You Want to Exist',
  description: 'Aggregate demand for products you believe in. Show brands there\'s real market demand. Turn your ideas into reality on ProductLobby.',
  openGraph: {
    title: 'ProductLobby — Lobby for the Products You Want to Exist',
    description: 'Aggregate demand for products you believe in. Show brands there\'s real market demand. Turn your ideas into reality.',
    url: 'https://www.productlobby.com',
    type: 'website',
    images: [
      {
        url: '/brand/og/productlobby-og-1200x630.png',
        width: 1200,
        height: 630,
        alt: 'ProductLobby — Your Ideas, Their Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ProductLobby — Lobby for the Products You Want',
    description: 'Aggregate demand. Influence brands. Turn ideas into reality.',
    images: ['/brand/og/productlobby-og-1200x630.png'],
    creator: '@ProductLobby',
  },
}

export default function Page() {
  return <HomePage />
}
