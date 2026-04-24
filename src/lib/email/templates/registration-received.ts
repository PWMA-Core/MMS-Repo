import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  role: 'individual_member' | 'member_firm_admin' | 'guest'
}

export function registrationReceived(payload: Payload): RenderedEmail {
  const subject = 'We received your PWMA registration'
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Thank you for registering with PWMA. We have received your details and
    sent a separate email to verify your address. Once verified, the PWMA
    team will review your account.</p>
    <p>You will receive another email when the review is complete.</p>
  `
  const text = `Hi ${payload.legal_name},

Thank you for registering with PWMA. We have received your details and sent
a separate email to verify your address. Once verified, the PWMA team will
review your account. You will receive another email when the review is
complete.`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body, preheader: 'Registration received' }),
    text,
  }
}
