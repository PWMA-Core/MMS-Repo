import { z } from 'zod'

/**
 * Renewal confirm-profile step per design spec. Members must reconfirm
 * firm + contact before the renewal form opens.
 */
export const renewalProfileConfirmSchema = z.object({
  profile_still_correct: z.boolean().refine((v) => v === true, {
    message: 'Please confirm your profile or update it first',
  }),
  firm_still_correct: z.boolean(),
  lifecycle_state: z.enum(['employee', 'unemployed', 'general_public']),
})
export type RenewalProfileConfirmInput = z.infer<typeof renewalProfileConfirmSchema>

/**
 * Renewal form. OPT evidence will be auto-filled from opt_records once
 * Phase 4 lands; members may still upload supplementary documents.
 */
export const renewalFormSchema = z.object({
  year: z.number().int().min(2024).max(2030),
  application_type: z.enum(['CPWP', 'CPWPA']),
  declared_opt_hours: z.number().min(0).max(200),
  declared_employment_change: z.boolean(),
  employment_change_note: z.string().trim().max(1000).optional().or(z.literal('')),
})
export type RenewalFormInput = z.infer<typeof renewalFormSchema>
