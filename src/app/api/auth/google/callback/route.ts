import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { createSession } from '@/lib/auth'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://productlobby.vercel.app'

interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  id_token: string
  token_type: string
}

interface GoogleUserInfo {
  sub: string        // Google's unique user ID
  email: string
  email_verified: boolean
  name: string
  picture?: string
  given_name?: string
  family_name?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_denied`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_invalid`)
    }

    // Verify CSRF state
    const cookieStore = await cookies()
    const savedState = cookieStore.get('oauth_state')?.value
    cookieStore.delete('oauth_state')

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_state_mismatch`)
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_not_configured`)
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: `${APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_token_failed`)
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json()

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!userInfoResponse.ok) {
      console.error('User info fetch failed:', await userInfoResponse.text())
      return NextResponse.redirect(`${APP_URL}/login?error=oauth_userinfo_failed`)
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json()

    // Find or create user + OAuth account
    let oauthAccount = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleUser.sub,
        },
      },
      include: { user: true },
    })

    let userId: string

    if (oauthAccount) {
      // Existing OAuth account — update tokens
      userId = oauthAccount.userId
      await prisma.oAuthAccount.update({
        where: { id: oauthAccount.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || oauthAccount.refreshToken,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      })

      // Update avatar if changed
      if (googleUser.picture && googleUser.picture !== oauthAccount.user.avatar) {
        await prisma.user.update({
          where: { id: userId },
          data: { avatar: googleUser.picture },
        })
      }
    } else {
      // Check if a user with this email already exists (linked via magic link)
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      })

      if (user) {
        // Link Google account to existing user
        userId = user.id
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerAccountId: googleUser.sub,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          },
        })

        // Update profile with Google data if missing
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true,
            avatar: user.avatar || googleUser.picture || null,
            displayName: user.displayName === user.email.split('@')[0]
              ? googleUser.name
              : user.displayName,
          },
        })
      } else {
        // Create new user + OAuth account
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            displayName: googleUser.name || googleUser.email.split('@')[0],
            avatar: googleUser.picture || null,
            emailVerified: googleUser.email_verified,
            oauthAccounts: {
              create: {
                provider: 'google',
                providerAccountId: googleUser.sub,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
              },
            },
          },
        })
        userId = user.id
      }
    }

    // Create session
    await createSession(userId)

    // Check for redirect cookie (set when user was redirected to login from a protected page)
    const redirectPath = cookieStore.get('oauth_redirect')?.value
    cookieStore.delete('oauth_redirect')

    // Redirect to saved path or campaigns page
    const redirectTo = redirectPath && redirectPath.startsWith('/') ? redirectPath : '/campaigns'
    return NextResponse.redirect(`${APP_URL}${redirectTo}`)
  } catch (error) {
    console.error('Google OAuth callback error:', error)
    return NextResponse.redirect(`${APP_URL}/login?error=oauth_server_error`)
  }
}
