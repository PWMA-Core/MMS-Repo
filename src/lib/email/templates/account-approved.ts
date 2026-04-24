import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  dashboard_url: string
}

export function accountApproved(payload: Payload): RenderedEmail {
  const subject = 'Your PWMA account is approved'
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Welcome to PWMA. Your account is approved and ready to use.</p>
    <p><a href="${escapeHtml(payload.dashboard_url)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Go to dashboard</a></p>
    <p>From here you can submit a CPWP or CPWPA application, manage your profile,
    and register for events.</p>
  `
  const text = `Hi ${payload.legal_name},

Welcome to PWMA. Your account is approved.
Sign in: ${payload.dashboard_url}`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body, preheader: 'Your account is active' }),
    text,
  }
}
