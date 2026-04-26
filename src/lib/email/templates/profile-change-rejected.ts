import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  field_name: string
  reason?: string
}

export function profileChangeRejected(payload: Payload): RenderedEmail {
  const subject = 'Profile change not approved'
  const reasonBlock = payload.reason
    ? `<p><strong>Reason:</strong> ${escapeHtml(payload.reason)}</p>`
    : ''
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Your request to change <strong>${escapeHtml(payload.field_name)}</strong>
    was not approved.</p>
    ${reasonBlock}
    <p>If you have questions, please reply to
    <a href="mailto:membership@pwma.org.hk">membership@pwma.org.hk</a>.</p>
  `
  const text = `Hi ${payload.legal_name},

Your request to change ${payload.field_name} was not approved.${
    payload.reason ? `\n\nReason: ${payload.reason}` : ''
  }

Questions: membership@pwma.org.hk`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
