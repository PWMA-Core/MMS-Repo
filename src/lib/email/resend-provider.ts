import { Resend } from 'resend'
import type { EmailProvider, EmailSendParams, EmailSendResult } from '@/lib/email/interface'

export class ResendProvider implements EmailProvider {
  private client: Resend

  constructor(apiKey: string) {
    this.client = new Resend(apiKey)
  }

  async send(params: EmailSendParams): Promise<EmailSendResult> {
    const { data, error } = await this.client.emails.send({
      from: 'PWMA <no-reply@pwma.org.hk>',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })
    if (error) throw new Error(error.message)
    return { id: data?.id ?? 'unknown' }
  }
}
