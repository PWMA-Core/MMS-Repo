import { z } from 'zod'

/**
 * HK ID format: 1 or 2 letters, 6 digits, check digit (0-9 or A).
 * Example: A123456(3) or AB123456(9).
 *
 * Checksum algorithm (per Immigration Department):
 * - Pad 1-letter IDs with a leading space (space value = 36).
 * - Char values: digit = 0-9; A=10, B=11, ..., Z=35; space=36.
 * - Weights: 9, 8, 7, 6, 5, 4, 3, 2 for the 8 padded characters.
 * - Check-digit weight = 1; 'A' at check position = 10.
 * - (weighted sum + check value) must be divisible by 11.
 */
const HKID_REGEX = /^([A-Z]{1,2})(\d{6})([0-9A])$/

function charValue(c: string): number {
  if (c === ' ') return 36
  if (/[A-Z]/.test(c)) return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10
  return parseInt(c, 10)
}

export function isValidHkid(input: string): boolean {
  if (typeof input !== 'string') return false
  const normalized = input.toUpperCase().replace(/[()\s-]/g, '')
  const match = normalized.match(HKID_REGEX)
  if (!match) return false
  const [, letters, digits, check] = match
  const padded = letters.length === 1 ? ' ' + letters + digits : letters + digits
  let sum = 0
  for (let i = 0; i < padded.length; i++) {
    sum += charValue(padded[i]) * (9 - i)
  }
  const checkValue = check === 'A' ? 10 : parseInt(check, 10)
  return (sum + checkValue) % 11 === 0
}

export function normalizeHkid(input: string): string {
  return input.toUpperCase().replace(/[()\s-]/g, '')
}

export const hkidSchema = z
  .string()
  .trim()
  .min(1, 'HKID is required')
  .refine(isValidHkid, { message: 'Invalid HK ID format or checksum' })
  .transform(normalizeHkid)
