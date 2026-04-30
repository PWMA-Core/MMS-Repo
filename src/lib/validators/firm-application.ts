import { z } from 'zod'

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, 'Invalid phone number')

export const firmApplicationSchema = z.object({
  proposed_firm_name: z.string().trim().min(2, 'Firm name is required').max(300),
  business_registration_number: z.string().trim().min(1, 'BR number is required').max(50),
  contact_name: z.string().trim().min(2, 'Contact name is required').max(200),
  contact_email: z.string().trim().email('Invalid email'),
  contact_phone: phoneSchema,
  firm_address: z.string().trim().max(500).optional().or(z.literal('')),
  tier_requested: z.enum(['full_member', 'associate_member']),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
})
export type FirmApplicationInput = z.infer<typeof firmApplicationSchema>
