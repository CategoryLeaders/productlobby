import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'

export async function GET() {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json(
      { success: false, error: 'Google OAuth is not configured' },
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

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${APP_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
