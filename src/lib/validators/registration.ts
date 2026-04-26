import { z } from 'zod'
import { hkidSchema } from '@/lib/validators/hkid'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, 'Invalid phone number')

export const registerIndividualSchema = z
  .object({
    hkid: hkidSchema,
    legal_name: z.string().trim().min(2, 'Legal name is required').max(200),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    email: z.string().trim().email('Invalid email address'),
    phone: phoneSchema,
    address: z.string().trim().max(500).optional().or(z.literal('')),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
export type RegisterIndividualInput = z.infer<typeof registerIndividualSchema>

export const registerFirmAdminSchema = z
  .object({
    firm_name: z.string().trim().min(2, 'Firm name is required').max(300),
    business_registration_number: z.string().trim().min(1, 'BR number is required'),
    firm_contact_email: z.string().trim().email('Invalid firm contact email'),
    firm_contact_phone: phoneSchema,
    firm_address: z.string().trim().max(500).optional().or(z.literal('')),
    // Admin profile
    hkid: hkidSchema,
    legal_name: z.string().trim().min(2, 'Legal name is required').max(200),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    email: z.string().trim().email('Invalid email address'),
    phone: phoneSchema,
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
export type RegisterFirmAdminInput = z.infer<typeof registerFirmAdminSchema>

export const registerGuestSchema = z
  .object({
    legal_name: z.string().trim().min(2, 'Legal name is required').max(200),
    email: z.string().trim().email('Invalid email address'),
    phone: phoneSchema,
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
export type RegisterGuestInput = z.infer<typeof registerGuestSchema>
