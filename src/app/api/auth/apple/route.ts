import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'

export async function GET(request: NextRequest) {
  if (!APPLE_CLIENT_ID) {
    return NextResponse.json(
      { success: false, error: 'Apple Sign In is not yet configured' },
      { status: 503 }
    )
  }

  // Generate CSRF state token
  const state = crypto.randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  })

  // Store redirect path if provided
  const redirect = request.nextUrl.searchParams.get('redirect')
  if (redirect) {
    cookieStore.set('oauth_redirect', redirect, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
  }

  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/apple/callback`,
    response_type: 'code',
    response_mode: 'form_post',
    scope: 'email name',
    state,
  })

  return NextResponse.redirect(
    `https://appleid.apple.com/auth/authorize?${params.toString()}`
  )
}
