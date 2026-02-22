/**
 * Utility Functions Tests
 * Verifies common utility functions like percentile calculation, clamping, formatting
 */

import {
  cn,
  formatCurrency,
  formatNumber,
  formatDate,
  formatRelativeTime,
  slugify,
  generateFingerprint,
  calculatePercentile,
  clamp,
  isValidEmail,
  isValidE164Phone,
  generateOTP,
  maskEmail,
  maskPhone,
} from '@/lib/utils'

// ============================================================================
// CLASS NAME UTILITY TESTS
// ============================================================================

describe('cn - Class Name Merger', () => {
  it('should merge class names', () => {
    const result = cn('px-2', 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle undefined values', () => {
    const result = cn('px-2', undefined, 'py-1')
    expect(result).toContain('px-2')
    expect(result).toContain('py-1')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toContain('base')
    expect(result).toContain('active')
  })

  it('should override conflicting tailwind classes', () => {
    // cn uses tailwind-merge to handle conflicts
    const result = cn('px-2', 'px-4')
    // Should keep the last one (px-4)
    expect(result).toContain('px-4')
  })
})

// ============================================================================
// CURRENCY FORMATTING TESTS
// ============================================================================

describe('formatCurrency', () => {
  it('should format as GBP by default', () => {
    const result = formatCurrency(100)
    expect(result).toContain('£')
  })

  it('should format positive amounts correctly', () => {
    const result = formatCurrency(1234.56, 'GBP')
    expect(result).toContain('1')
    expect(result).toContain('234')
  })

  it('should handle different currencies', () => {
    const gbp = formatCurrency(100, 'GBP')
    const usd = formatCurrency(100, 'USD')
    const eur = formatCurrency(100, 'EUR')

    expect(gbp).not.toBe(usd)
    expect(usd).not.toBe(eur)
  })

  it('should handle zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('should handle decimal amounts', () => {
    const result = formatCurrency(99.99)
    expect(result).toContain('99')
  })
})

// ============================================================================
// NUMBER FORMATTING TESTS
// ============================================================================

describe('formatNumber', () => {
  it('should format thousands with K', () => {
    const result = formatNumber(1500)
    expect(result).toBe('1.5K')
  })

  it('should format millions with M', () => {
    const result = formatNumber(2500000)
    expect(result).toBe('2.5M')
  })

  it('should return number as string for small values', () => {
    const result = formatNumber(500)
    expect(result).toBe('500')
  })

  it('should handle zero', () => {
    const result = formatNumber(0)
    expect(result).toBe('0')
  })

  it('should handle negative numbers', () => {
    const result = formatNumber(-1500)
    expect(result).toContain('-')
  })

  it('should round to one decimal place', () => {
    expect(formatNumber(1550)).toBe('1.6K')
    expect(formatNumber(1450)).toBe('1.4K')
  })
})

// ============================================================================
// DATE FORMATTING TESTS
// ============================================================================

describe('formatDate', () => {
  it('should format Date object', () => {
    const date = new Date('2026-02-22')
    const result = formatDate(date)
    expect(result).toContain('22')
    expect(result).toContain('Feb')
    expect(result).toContain('2026')
  })

  it('should format ISO string', () => {
    const result = formatDate('2026-02-22T00:00:00Z')
    expect(result).toContain('22')
    expect(result).toContain('Feb')
    expect(result).toContain('2026')
  })

  it('should use GB locale format', () => {
    const date = new Date('2026-02-22')
    const result = formatDate(date)
    // GB format: day month year
    expect(result).toMatch(/22\s+\w+\s+2026/)
  })
})

// ============================================================================
// RELATIVE TIME FORMATTING TESTS
// ============================================================================

describe('formatRelativeTime', () => {
  it('should show "just now" for very recent times', () => {
    const now = new Date()
    const result = formatRelativeTime(now)
    expect(result).toBe('just now')
  })

  it('should show minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const result = formatRelativeTime(fiveMinutesAgo)
    expect(result).toContain('m ago')
  })

  it('should show hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoHoursAgo)
    expect(result).toContain('h ago')
  })

  it('should show days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(threeDaysAgo)
    expect(result).toContain('d ago')
  })

  it('should show formatted date for older dates', () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(thirtyDaysAgo)
    expect(result).not.toContain('ago')
    expect(result).toContain('Feb')
  })

  it('should handle string input', () => {
    const dateString = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const result = formatRelativeTime(dateString)
    expect(result).toContain('m ago')
  })
})

// ============================================================================
// SLUGIFY TESTS
// ============================================================================

describe('slugify', () => {
  it('should convert to lowercase', () => {
    const result = slugify('Hello World')
    expect(result).toBe(result.toLowerCase())
  })

  it('should replace spaces with hyphens', () => {
    const result = slugify('hello world')
    expect(result).toBe('hello-world')
  })

  it('should remove special characters', () => {
    const result = slugify('Hello@World!')
    expect(result).not.toContain('@')
    expect(result).not.toContain('!')
  })

  it('should handle multiple spaces', () => {
    const result = slugify('hello   world')
    expect(result).not.toContain('   ')
  })

  it('should remove leading and trailing hyphens', () => {
    const result = slugify('-hello-world-')
    expect(result).not.toMatch(/^-/)
    expect(result).not.toMatch(/-$/)
  })

  it('should handle underscores as separators', () => {
    const result = slugify('hello_world')
    expect(result).toBe('hello-world')
  })

  it('should preserve numbers', () => {
    const result = slugify('Product 123')
    expect(result).toContain('123')
  })
})

// ============================================================================
// FINGERPRINT GENERATION TESTS
// ============================================================================

describe('generateFingerprint', () => {
  it('should generate consistent fingerprint for same input', () => {
    const input = {
      template: 'standard',
      keywords: ['ai', 'product'],
    }
    const result1 = generateFingerprint(input)
    const result2 = generateFingerprint(input)

    expect(result1).toBe(result2)
  })

  it('should include brand ID when provided', () => {
    const input = {
      brandId: 'brand-123',
      template: 'standard',
      keywords: ['ai'],
    }
    const result = generateFingerprint(input)
    expect(result).toContain('brand-123')
  })

  it('should use "open" when no brand ID', () => {
    const input = {
      template: 'standard',
      keywords: ['ai'],
    }
    const result = generateFingerprint(input)
    expect(result).toContain('open')
  })

  it('should normalize product URL', () => {
    const input1 = {
      productUrl: 'https://example.com/path',
      template: 'standard',
      keywords: ['ai'],
    }
    const input2 = {
      productUrl: 'HTTPS://EXAMPLE.COM/PATH',
      template: 'standard',
      keywords: ['ai'],
    }
    const result1 = generateFingerprint(input1)
    const result2 = generateFingerprint(input2)

    expect(result1).toBe(result2)
  })

  it('should sort keywords consistently', () => {
    const input1 = {
      template: 'standard',
      keywords: ['c', 'a', 'b'],
    }
    const input2 = {
      template: 'standard',
      keywords: ['b', 'c', 'a'],
    }
    const result1 = generateFingerprint(input1)
    const result2 = generateFingerprint(input2)

    expect(result1).toBe(result2)
  })

  it('should differ for different templates', () => {
    const base = {
      template: 'standard',
      keywords: ['ai'],
    }
    const input1 = { ...base }
    const input2 = { ...base, template: 'premium' }

    const result1 = generateFingerprint(input1)
    const result2 = generateFingerprint(input2)

    expect(result1).not.toBe(result2)
  })
})

// ============================================================================
// PERCENTILE CALCULATION TESTS
// ============================================================================

describe('calculatePercentile', () => {
  it('should return 0 for empty array', () => {
    const result = calculatePercentile([], 50)
    expect(result).toBe(0)
  })

  it('should return value for single element', () => {
    const result = calculatePercentile([42], 50)
    expect(result).toBe(42)
  })

  it('should calculate median (50th percentile)', () => {
    const values = [10, 20, 30, 40, 50]
    const result = calculatePercentile(values, 50)
    expect(result).toBe(30)
  })

  it('should calculate 25th percentile', () => {
    const values = [10, 20, 30, 40, 50]
    const result = calculatePercentile(values, 25)
    expect(result).toBeGreaterThanOrEqual(10)
    expect(result).toBeLessThanOrEqual(30)
  })

  it('should calculate 75th percentile', () => {
    const values = [10, 20, 30, 40, 50]
    const result = calculatePercentile(values, 75)
    expect(result).toBeGreaterThanOrEqual(30)
    expect(result).toBeLessThanOrEqual(50)
  })

  it('should calculate 90th percentile', () => {
    const values = [10, 20, 30, 40, 50]
    const result = calculatePercentile(values, 90)
    expect(result).toBeGreaterThanOrEqual(40)
  })

  it('should not mutate input array', () => {
    const values = [50, 30, 10, 40, 20]
    const original = [...values]
    calculatePercentile(values, 50)
    expect(values).toEqual(original)
  })

  it('should handle unsorted input', () => {
    const values = [50, 10, 30, 20, 40]
    const result = calculatePercentile(values, 50)
    expect(result).toBe(30)
  })

  it('should handle duplicate values', () => {
    const values = [10, 10, 20, 20, 30]
    const result = calculatePercentile(values, 50)
    expect(result).toBeGreaterThanOrEqual(10)
    expect(result).toBeLessThanOrEqual(30)
  })
})

// ============================================================================
// CLAMP TESTS
// ============================================================================

describe('clamp', () => {
  it('should return value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('should return min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })

  it('should return max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('should handle equal min and max', () => {
    expect(clamp(5, 10, 10)).toBe(10)
  })

  it('should work with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
  })

  it('should work with decimals', () => {
    expect(clamp(5.5, 0, 10)).toBe(5.5)
    expect(clamp(-1.5, 0, 10)).toBe(0)
    expect(clamp(15.5, 0, 10)).toBe(10)
  })
})

// ============================================================================
// EMAIL VALIDATION TESTS
// ============================================================================

describe('isValidEmail', () => {
  it('should validate standard email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
  })

  it('should validate email with dots in local part', () => {
    expect(isValidEmail('first.last@example.com')).toBe(true)
  })

  it('should validate email with numbers', () => {
    expect(isValidEmail('user123@example.com')).toBe(true)
  })

  it('should reject email without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false)
  })

  it('should reject email without domain', () => {
    expect(isValidEmail('user@')).toBe(false)
  })

  it('should reject email without TLD', () => {
    expect(isValidEmail('user@example')).toBe(false)
  })

  it('should reject email with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

// ============================================================================
// E.164 PHONE VALIDATION TESTS
// ============================================================================

describe('isValidE164Phone', () => {
  it('should validate standard E.164 format', () => {
    expect(isValidE164Phone('+442071838750')).toBe(true)
  })

  it('should validate various country codes', () => {
    expect(isValidE164Phone('+14155552671')).toBe(true) // US
    expect(isValidE164Phone('+33123456789')).toBe(true) // France
  })

  it('should reject without leading +', () => {
    expect(isValidE164Phone('442071838750')).toBe(false)
  })

  it('should reject with spaces', () => {
    expect(isValidE164Phone('+44 207 1838750')).toBe(false)
  })

  it('should reject with dashes', () => {
    expect(isValidE164Phone('+44-207-1838750')).toBe(false)
  })

  it('should reject too short', () => {
    expect(isValidE164Phone('+1')).toBe(false)
  })

  it('should reject too long', () => {
    expect(isValidE164Phone('+442071838750123456')).toBe(false)
  })
})

// ============================================================================
// OTP GENERATION TESTS
// ============================================================================

describe('generateOTP', () => {
  it('should generate 6 digit OTP by default', () => {
    const result = generateOTP()
    expect(result.length).toBe(6)
  })

  it('should generate only digits', () => {
    const result = generateOTP()
    expect(/^\d+$/.test(result)).toBe(true)
  })

  it('should generate custom length', () => {
    expect(generateOTP(4).length).toBe(4)
    expect(generateOTP(8).length).toBe(8)
  })

  it('should generate different values', () => {
    const otp1 = generateOTP()
    const otp2 = generateOTP()
    expect(otp1).not.toBe(otp2)
  })

  it('should not start with 0 in all cases (each digit is 0-9)', () => {
    // Just verify format is correct
    const result = generateOTP()
    expect(/^\d+$/.test(result)).toBe(true)
  })
})

// ============================================================================
// EMAIL MASKING TESTS
// ============================================================================

describe('maskEmail', () => {
  it('should mask middle of email local part', () => {
    const result = maskEmail('user@example.com')
    expect(result).toContain('u')
    expect(result).toContain('r')
    expect(result).toContain('*')
    expect(result).toContain('@example.com')
  })

  it('should preserve domain', () => {
    const result = maskEmail('john@gmail.com')
    expect(result).toContain('gmail.com')
  })

  it('should handle short local parts', () => {
    const result = maskEmail('ab@example.com')
    expect(result).toContain('a')
    expect(result).toContain('*')
  })

  it('should work with longer emails', () => {
    const result = maskEmail('verylongemailaddress@example.com')
    expect(result).toContain('v')
    expect(result).toContain('e')
    expect(result).toContain('*')
  })
})

// ============================================================================
// PHONE MASKING TESTS
// ============================================================================

describe('maskPhone', () => {
  it('should show last 4 digits', () => {
    const result = maskPhone('+442071838750')
    expect(result).toContain('8750')
  })

  it('should mask everything except last 4', () => {
    const result = maskPhone('+442071838750')
    expect(result.slice(-4)).toBe('8750')
    expect(result.includes('207')).toBe(false)
  })

  it('should handle short phone numbers', () => {
    const result = maskPhone('1234')
    expect(result).toContain('1234')
  })

  it('should handle very short inputs', () => {
    const result = maskPhone('12')
    expect(result.length).toBeLessThanOrEqual(2)
  })

  it('should use asterisks for masking', () => {
    const result = maskPhone('+442071838750')
    expect(result).toContain('*')
  })
})
