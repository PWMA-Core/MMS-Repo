import type { EmailProvider } from '@/lib/email/interface'
import { M365Provider } from '@/lib/email/m365-provider'

/**
 * Factory for the email provider.
 * Reads VITE_EMAIL_PROVIDER and returns an instance implementing the
 * EmailProvider interface.
 *
 * Server-side only: SMTP credentials are not exposed to the client bundle.
 */
export function createEmailProvider(): EmailProvider {
  const provider = import.meta.env.VITE_EMAIL_PROVIDER ?? 'm365'

  switch (provider) {
    case 'm365': {
      const user = import.meta.env.M365_SMTP_USER
      const pass = import.meta.env.M365_SMTP_PASS
      const from = import.meta.env.M365_SMTP_FROM
      if (!user || !pass) {
        throw new Error('M365_SMTP_USER or M365_SMTP_PASS is not set')
      }
      return new M365Provider({ user, pass, from })
    }
    default:
      throw new Error(`Unsupported email provider: ${provider}`)
  }
}

export type {
  EmailProvider,
  EmailSendParams,
  EmailSendResult,
} from '@/lib/email/interface'
