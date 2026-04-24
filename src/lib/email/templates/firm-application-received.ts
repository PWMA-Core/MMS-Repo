import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  contact_name: string
  proposed_firm_name: string
}

export function firmApplicationReceived(payload: Payload): RenderedEmail {
  const subject = 'Member firm application received'
  const body = `
    <p>Hi ${escapeHtml(payload.contact_name)},</p>
    <p>We received your application on behalf of <strong>${escapeHtml(payload.proposed_firm_name)}</strong>.
    The PWMA team will begin review, and your application will be forwarded to
    the Executive Committee for sign-off. Typical turnaround is 4–6 weeks.</p>
    <p>You will receive another email once a decision is made.</p>
  `
  const text = `Hi ${payload.contact_name},

We received your application on behalf of ${payload.proposed_firm_name}.
Typical turnaround is 4-6 weeks; we'll email once a decision is made.`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
