import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  reason?: string
}

export function accountRejected(payload: Payload): RenderedEmail {
  const subject = 'Your PWMA registration was not approved'
  const reasonBlock = payload.reason
    ? `<p><strong>Reason:</strong> ${escapeHtml(payload.reason)}</p>`
    : ''
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Thank you for your interest in PWMA. After review, we are unable to
    approve your registration at this time.</p>
    ${reasonBlock}
    <p>If you believe this was in error or would like to appeal, please reply
    to <a href="mailto:membership@pwma.org.hk">membership@pwma.org.hk</a>.</p>
  `
  const text = `Hi ${payload.legal_name},

After review, we are unable to approve your PWMA registration at this time.${
    payload.reason ? `\n\nReason: ${payload.reason}` : ''
  }

If you would like to appeal, please reply to membership@pwma.org.hk.`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
