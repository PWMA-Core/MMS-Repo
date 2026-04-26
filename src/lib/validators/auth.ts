import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')

export const signInSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type SignInInput = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    email: z.string().trim().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
export type SignUpInput = z.infer<typeof signUpSchema>

export const resetPasswordSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
})
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
