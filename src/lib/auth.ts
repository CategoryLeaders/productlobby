import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { prisma } from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
)

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface SessionUser {
  id: string
  email: string
  displayName: string
  handle?: string
  emailVerified: boolean
  phoneVerified: boolean
}

export interface Session {
  user: SessionUser
  expires: Date
}

// Create a new session for a user
export async function createSession(userId: string): Promise<string> {
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  const jwt = await new SignJWT({ sessionToken: token })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(JWT_SECRET)

  return jwt
}

// Get current session from cookies
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (!sessionCookie?.value) {
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
    const sessionToken = payload.sessionToken as string

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            handle: true,
            emailVerified: true,
            phoneVerified: true,
          },
        },
      },
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    // Refresh session if less than 1 day remaining
    if (session.expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000) {
      const newExpiresAt = new Date(Date.now() + SESSION_DURATION)
      await prisma.session.update({
        where: { id: session.id },
        data: { expiresAt: newExpiresAt },
      })
    }

    return {
      user: session.user,
      expires: session.expiresAt,
    }
  } catch {
    return null
  }
}

// Get current user (convenience function)
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session?.user || null
}

// Require authentication (throws if not authenticated)
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

// Delete session (logout)
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')

  if (sessionCookie?.value) {
    try {
      const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET)
      const sessionToken = payload.sessionToken as string

      await prisma.session.deleteMany({
        where: { token: sessionToken },
      })
    } catch {
      // Token invalid, just clear cookie
    }
  }
}

// Create magic link token
export async function createMagicLink(email: string): Promise<string> {
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    // Create user with email as display name initially
    user = await prisma.user.create({
      data: {
        email,
        displayName: email.split('@')[0],
      },
    })
  }

  // Delete any existing magic links for this user
  await prisma.magicLink.deleteMany({
    where: { userId: user.id },
  })

  // Create new magic link
  await prisma.magicLink.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  })

  return token
}

// Verify magic link and create session
export async function verifyMagicLink(token: string): Promise<{ jwt: string; user: SessionUser } | null> {
  const magicLink = await prisma.magicLink.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          handle: true,
          emailVerified: true,
          phoneVerified: true,
        },
      },
    },
  })

  if (!magicLink || magicLink.expiresAt < new Date() || magicLink.usedAt) {
    return null
  }

  // Mark magic link as used
  await prisma.magicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  })

  // Mark email as verified
  if (!magicLink.user.emailVerified) {
    await prisma.user.update({
      where: { id: magicLink.userId },
      data: { emailVerified: true },
    })
    magicLink.user.emailVerified = true
  }

  // Create session
  const jwt = await createSession(magicLink.userId)

  return { jwt, user: magicLink.user }
}

// Create phone verification code
export async function createPhoneVerification(userId: string, phone: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  // Delete any existing verifications for this user
  await prisma.phoneVerification.deleteMany({
    where: { userId },
  })

  await prisma.phoneVerification.create({
    data: {
      userId,
      phone,
      code,
      expiresAt,
    },
  })

  return code
}

// Verify phone code
export async function verifyPhoneCode(userId: string, code: string): Promise<boolean> {
  const verification = await prisma.phoneVerification.findFirst({
    where: {
      userId,
      code,
      expiresAt: { gt: new Date() },
      verifiedAt: null,
      attempts: { lt: 5 },
    },
  })

  if (!verification) {
    // Increment attempts if verification exists but code is wrong
    await prisma.phoneVerification.updateMany({
      where: {
        userId,
        verifiedAt: null,
      },
      data: { attempts: { increment: 1 } },
    })
    return false
  }

  // Mark as verified
  await prisma.phoneVerification.update({
    where: { id: verification.id },
    data: { verifiedAt: new Date() },
  })

  // Update user phone
  await prisma.user.update({
    where: { id: userId },
    data: {
      phoneE164: verification.phone,
      phoneVerified: true,
    },
  })

  return true
}

// Check if user has required verification for high-signal actions
export async function requirePhoneVerification(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneVerified: true },
  })

  if (!user?.phoneVerified) {
    throw new Error('Phone verification required for this action')
  }
}
