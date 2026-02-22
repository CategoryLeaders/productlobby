import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const title = searchParams.get('title') || 'ProductLobby Campaign'
    const brand = searchParams.get('brand') || 'Brand'
    const lobbies = searchParams.get('lobbies') || '0'
    const category = searchParams.get('category') || 'Other'

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
            justifyContent: 'space-between',
            padding: '60px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header with logo and brand info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'white',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#7C3AED',
                }}
              >
                PL
              </div>
              <span style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>ProductLobby</span>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {category}
            </div>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Campaign title */}
            <h1
              style={{
                color: 'white',
                fontSize: '56px',
                fontWeight: 'bold',
                lineHeight: '1.2',
                margin: '0',
                maxWidth: '900px',
              }}
            >
              {title}
            </h1>

            {/* Brand and stats row */}
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>Targeted brand:</span>
                <span style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>{brand}</span>
              </div>

              {/* Lobby count badge */}
              <div
                style={{
                  background: '#CDFE56',
                  color: '#1F2937',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>👥</span>
                {lobbies} lobbies
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              paddingTop: '24px',
            }}
          >
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
              Aggregate demand. Influence brands.
            </span>
            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>productlobby.com</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
