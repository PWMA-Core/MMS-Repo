import { z } from 'zod'
import { hkidSchema } from '@/lib/validators/hkid'

/**
 * Critical profile fields. Users cannot edit these directly; changes go
 * through the profile_change_requests approval queue.
 */
export const CRITICAL_FIELDS = ['legal_name', 'date_of_birth', 'hkid', 'email'] as const
export type CriticalField = (typeof CRITICAL_FIELDS)[number]

export const nonCriticalProfileSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  address: z.string().trim().max(500).optional().or(z.literal('')),
})
export type NonCriticalProfileInput = z.infer<typeof nonCriticalProfileSchema>

export const profileChangeRequestSchema = z.object({
  field_name: z.enum(CRITICAL_FIELDS),
  new_value: z.string().trim().min(1, 'New value is required'),
  note: z.string().trim().max(1000).optional(),
})
export type ProfileChangeRequestInput = z.infer<typeof profileChangeRequestSchema>

export { hkidSchema }
