import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  field_name: string
  new_value: string
}

export function profileChangeSubmitted(payload: Payload): RenderedEmail {
  const subject = 'Profile change request received'
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>We received your request to change <strong>${escapeHtml(payload.field_name)}</strong>
    to <em>${escapeHtml(payload.new_value)}</em>. The PWMA team will review it
    and email you once a decision is made.</p>
  `
  const text = `Hi ${payload.legal_name},

We received your request to change ${payload.field_name} to "${payload.new_value}".
The PWMA team will email you once a decision is made.`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
