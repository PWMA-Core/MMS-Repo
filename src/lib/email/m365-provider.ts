import type {
  EmailProvider,
  EmailSendParams,
  EmailSendResult,
} from '@/lib/email/interface'

interface M365Config {
  user: string
  pass: string
  from?: string
  host?: string
  port?: number
}

/**
 * Microsoft 365 SMTP email provider.
 *
 * Sends transactional email via the PWMA-owned M365 mailbox.
 * Default endpoint is smtp.office365.com:587 with STARTTLS. Authentication
 * uses the mailbox user with an app password or OAuth2.
 *
 * Runs server-side only (Node). The SMTP transport (nodemailer) is wired up
 * as part of backend setup.
 */
export class M365Provider implements EmailProvider {
  private config: M365Config

  constructor(config: M365Config) {
    this.config = {
      host: 'smtp.office365.com',
      port: 587,
      ...config,
    }
  }

  async send(_params: EmailSendParams): Promise<EmailSendResult> {
    void this.config
    throw new Error('M365 SMTP transport not yet wired up')
  }
}
