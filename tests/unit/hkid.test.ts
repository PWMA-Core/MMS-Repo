import { describe, it, expect } from 'vitest'
import { isValidHkid, normalizeHkid, hkidSchema } from '@/lib/validators/hkid'

describe('isValidHkid — valid cases', () => {
  it('accepts valid single-letter HKID A1234563', () => {
    expect(isValidHkid('A1234563')).toBe(true)
  })

  it('accepts valid single-letter HKID B1234566', () => {
    expect(isValidHkid('B1234566')).toBe(true)
  })

  it('accepts valid single-letter HKID Z9876546', () => {
    expect(isValidHkid('Z9876546')).toBe(true)
  })

  it('accepts valid two-letter HKID AB1234569', () => {
    expect(isValidHkid('AB1234569')).toBe(true)
  })

  it('accepts check digit A (=10) as in G123456A', () => {
    expect(isValidHkid('G123456A')).toBe(true)
  })

  it('is case-insensitive on letters', () => {
    expect(isValidHkid('a1234563')).toBe(true)
    expect(isValidHkid('ab1234569')).toBe(true)
  })

  it('accepts formatted HKID with parentheses A123456(3)', () => {
    expect(isValidHkid('A123456(3)')).toBe(true)
  })

  it('accepts formatted HKID with parentheses AB123456(9)', () => {
    expect(isValidHkid('AB123456(9)')).toBe(true)
  })

  it('accepts HKID with trailing whitespace and check digit in parens', () => {
    expect(isValidHkid('  A123456(3)  ')).toBe(true)
  })
})

describe('isValidHkid — invalid cases', () => {
  it('rejects empty string', () => {
    expect(isValidHkid('')).toBe(false)
  })

  it('rejects whitespace only', () => {
    expect(isValidHkid('   ')).toBe(false)
  })

  it('rejects wrong checksum A1234567', () => {
    expect(isValidHkid('A1234567')).toBe(false)
  })

  it('rejects K1234563 (wrong checksum)', () => {
    expect(isValidHkid('K1234563')).toBe(false)
  })

  it('rejects wrong format (digits only)', () => {
    expect(isValidHkid('12345678')).toBe(false)
  })

  it('rejects too few digits', () => {
    expect(isValidHkid('A12345')).toBe(false)
  })

  it('rejects too many digits', () => {
    expect(isValidHkid('A12345678')).toBe(false)
  })

  it('rejects three letters', () => {
    expect(isValidHkid('ABC123456')).toBe(false)
  })

  it('rejects invalid check digit (letter other than A)', () => {
    expect(isValidHkid('A123456B')).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isValidHkid(null as unknown as string)).toBe(false)
    expect(isValidHkid(undefined as unknown as string)).toBe(false)
  })
})

describe('normalizeHkid', () => {
  it('strips parentheses and spaces, uppercases letters', () => {
    expect(normalizeHkid('a123456(3)')).toBe('A1234563')
    expect(normalizeHkid(' AB 123456 (9) ')).toBe('AB1234569')
  })
})

describe('hkidSchema (zod)', () => {
  it('transforms and validates valid input', () => {
    const result = hkidSchema.safeParse('a123456(3)')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('A1234563')
    }
  })

  it('returns an error for invalid input', () => {
    const result = hkidSchema.safeParse('A1234567')
    expect(result.success).toBe(false)
  })

  it('returns an error for empty input', () => {
    const result = hkidSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})
