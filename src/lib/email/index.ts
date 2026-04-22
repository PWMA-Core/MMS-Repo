import type { EmailProvider } from '@/lib/email/interface'
import { ResendProvider } from '@/lib/email/resend-provider'

/**
 * Factory for the email provider.
 * Reads VITE_EMAIL_PROVIDER and returns an instance implementing the
 * EmailProvider interface.
 *
 * Server-side only: RESEND_API_KEY is not exposed to the client bundle.
 */
export function createEmailProvider(): EmailProvider {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER ?? 'resend'
  const apiKey = import.meta.env.RESEND_API_KEY

  switch (provider) {
    case 'resend':
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not set')
      }
      return new ResendProvider(apiKey)
    default:
      throw new Error(`Unsupported email provider: ${provider}`)
  }
}

export type { EmailProvider, EmailSendParams, EmailSendResult } from '@/lib/email/interface'
