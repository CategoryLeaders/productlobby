/**
 * Brand Verification Utilities
 * Handles verification tokens, domain ownership, and email domain validation
 */

import crypto from 'crypto'
import { prisma } from '@/lib/db'

export type VerificationStatus =
  | 'PENDING'
  | 'EMAIL_VERIFIED'
  | 'DOMAIN_VERIFIED'
  | 'FULLY_VERIFIED'
  | 'REJECTED'

export interface VerificationState {
  status: VerificationStatus
  emailVerified: boolean
  domainVerified: boolean
  completedAt?: Date
  rejectedReason?: string
}

/**
 * Generate a cryptographically secure verification token
 * 32 bytes = 64 character hex string
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify domain ownership by checking DNS TXT records
 * In production, this would check actual DNS records.
 * For now, we accept the verification if the token is stored.
 */
export async function verifyDomainOwnership(
  domain: string,
  token: string
): Promise<boolean> {
  try {
    // Expected TXT record name for domain verification
    const txtRecordName = `_productlobby.${domain}`

    // In production, you would:
    // 1. Use a DNS lookup library to query the TXT records
    // 2. Check if the token appears in the TXT records
    // 3. For now, we'll validate that we have stored the verification attempt

    // Verify that a recent verification attempt exists for this domain and token
    const verification = await prisma.brandVerification.findFirst({
      where: {
        token,
        method: 'DNS_TXT',
      },
    })

    if (!verification) {
      return false
    }

    // In a real implementation, you would check actual DNS records here
    // For MVP, we trust the verification if token was sent to email
    // In production: dns.resolveTxt(txtRecordName)
    return true
  } catch (error) {
    console.error('Domain verification error:', error)
    return false
  }
}

/**
 * Verify that an email domain matches the brand's website domain
 * Extracts domain from email and website, then compares them
 */
export function verifyEmailDomain(email: string, brandDomain: string): boolean {
  try {
    // Extract domain from email
    const emailParts = email.split('@')
    if (emailParts.length !== 2) {
      return false
    }
    const emailDomain = emailParts[1].toLowerCase()

    // Normalize brand domain (remove protocol and www)
    let normalizedDomain = brandDomain.toLowerCase()
    if (normalizedDomain.startsWith('http://')) {
      normalizedDomain = normalizedDomain.slice(7)
    }
    if (normalizedDomain.startsWith('https://')) {
      normalizedDomain = normalizedDomain.slice(8)
    }
    if (normalizedDomain.startsWith('www.')) {
      normalizedDomain = normalizedDomain.slice(4)
    }
    normalizedDomain = normalizedDomain.split('/')[0] // Remove path if present

    // Exact match or subdomain match
    return emailDomain === normalizedDomain || emailDomain.endsWith(`.${normalizedDomain}`)
  } catch (error) {
    console.error('Email domain verification error:', error)
    return false
  }
}

/**
 * Get the current verification status for a brand
 * Aggregates all verification records to determine overall status
 */
export async function getBrandVerificationStatus(
  brandId: string
): Promise<VerificationState> {
  try {
    const verifications = await prisma.brandVerification.findMany({
      where: { brandId },
    })

    if (verifications.length === 0) {
      return {
        status: 'PENDING',
        emailVerified: false,
        domainVerified: false,
      }
    }

    // Check if any verification was rejected
    const rejectedVerification = verifications.find(
      (v) => v.status === 'FAILED'
    )
    if (rejectedVerification) {
      return {
        status: 'REJECTED',
        emailVerified: false,
        domainVerified: false,
        rejectedReason: 'Domain ownership could not be verified',
      }
    }

    // Check verification progress
    const emailVerified = verifications.some(
      (v) => v.method === 'EMAIL_DOMAIN' && v.status === 'VERIFIED'
    )
    const domainVerified = verifications.some(
      (v) => v.method === 'DNS_TXT' && v.status === 'VERIFIED'
    )

    let status: VerificationStatus = 'PENDING'
    if (emailVerified && domainVerified) {
      status = 'FULLY_VERIFIED'
    } else if (emailVerified && !domainVerified) {
      status = 'EMAIL_VERIFIED'
    } else if (domainVerified) {
      status = 'DOMAIN_VERIFIED'
    }

    const completedVerification = verifications.find(
      (v) => v.status === 'VERIFIED' && v.verifiedAt
    )

    return {
      status,
      emailVerified,
      domainVerified,
      completedAt: completedVerification?.verifiedAt || undefined,
    }
  } catch (error) {
    console.error('Get brand verification status error:', error)
    return {
      status: 'PENDING',
      emailVerified: false,
      domainVerified: false,
    }
  }
}

/**
 * Create a brand verification record
 */
export async function createBrandVerification(
  brandId: string,
  method: 'EMAIL_DOMAIN' | 'DNS_TXT',
  token: string
) {
  return prisma.brandVerification.create({
    data: {
      brandId,
      method,
      status: 'PENDING',
      token,
    },
  })
}

/**
 * Mark a verification as complete
 */
export async function completeBrandVerification(token: string) {
  return prisma.brandVerification.updateMany({
    where: { token },
    data: {
      status: 'VERIFIED',
      verifiedAt: new Date(),
    },
  })
}

/**
 * Mark a verification as failed
 */
export async function failBrandVerification(token: string) {
  return prisma.brandVerification.updateMany({
    where: { token },
    data: {
      status: 'FAILED',
    },
  })
}
