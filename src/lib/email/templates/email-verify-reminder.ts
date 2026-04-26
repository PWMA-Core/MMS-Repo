import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  verify_url: string
}

export function emailVerifyReminder(payload: Payload): RenderedEmail {
  const subject = 'Please verify your PWMA email'
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Please confirm your email address so we can move your PWMA account forward.</p>
    <p><a href="${escapeHtml(payload.verify_url)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Verify email</a></p>
    <p style="font-size:13px;color:#6b7280;">If the button does not work, paste this link into your browser:<br />${escapeHtml(payload.verify_url)}</p>
  `
  const text = `Hi ${payload.legal_name},

Please verify your email to continue your PWMA registration:
${payload.verify_url}`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body, preheader: 'Verify your email' }),
    text,
  }
}
