import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  application_type: 'CPWP' | 'CPWPA'
  application_kind: 'new' | 'renewal'
}

export function applicationSubmitted(payload: Payload): RenderedEmail {
  const subject = `${payload.application_type} ${payload.application_kind} application submitted`
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>We received your ${payload.application_type} ${payload.application_kind}
    application. The PWMA team will review and follow up with any questions.</p>
    <p>You will receive updates by email when the status changes.</p>
  `
  const text = `Hi ${payload.legal_name},

We received your ${payload.application_type} ${payload.application_kind} application.
The PWMA team will review and follow up with any questions.`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
