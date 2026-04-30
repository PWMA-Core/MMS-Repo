import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  contact_name: string
  proposed_firm_name: string
  decision: 'approved' | 'rejected'
  reason?: string
}

export function firmApplicationDecision(payload: Payload): RenderedEmail {
  const approved = payload.decision === 'approved'
  const subject = approved
    ? `${payload.proposed_firm_name} - member firm application approved`
    : `${payload.proposed_firm_name} - member firm application not approved`
  const reasonBlock = payload.reason
    ? `<p><strong>Reason:</strong> ${escapeHtml(payload.reason)}</p>`
    : ''
  const body = approved
    ? `
      <p>Hi ${escapeHtml(payload.contact_name)},</p>
      <p>Your application for <strong>${escapeHtml(payload.proposed_firm_name)}</strong>
      has been approved. A welcome message with your invoice will follow. Firm
      admins can register accounts to start managing their employees' memberships.</p>
    `
    : `
      <p>Hi ${escapeHtml(payload.contact_name)},</p>
      <p>After review, your application for <strong>${escapeHtml(payload.proposed_firm_name)}</strong>
      was not approved.</p>
      ${reasonBlock}
      <p>If you wish to discuss, please reply to
      <a href="mailto:membership@pwma.org.hk">membership@pwma.org.hk</a>.</p>
    `
  const text = approved
    ? `Hi ${payload.contact_name},

Your application for ${payload.proposed_firm_name} has been approved.
A welcome message with your invoice will follow.`
    : `Hi ${payload.contact_name},

Your application for ${payload.proposed_firm_name} was not approved.${
        payload.reason ? `\n\nReason: ${payload.reason}` : ''
      }`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
