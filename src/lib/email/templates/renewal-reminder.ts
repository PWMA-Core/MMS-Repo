import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  year: number
  renewal_url: string
  opt_hours_recorded: number
  opt_hours_required: number
  closes_at: string
}

export function renewalReminder(payload: Payload): RenderedEmail {
  const subject = `Your ${payload.year} PWMA renewal is due`
  const shortfall = Math.max(0, payload.opt_hours_required - payload.opt_hours_recorded)
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Your ${payload.year} PWMA renewal closes on
    <strong>${escapeHtml(payload.closes_at)}</strong>.</p>
    <p>OPT hours recorded: ${payload.opt_hours_recorded} / ${payload.opt_hours_required}.
    ${shortfall > 0 ? `You need <strong>${shortfall} more</strong> before renewing.` : 'You have met the requirement.'}</p>
    <p><a href="${escapeHtml(payload.renewal_url)}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">Start renewal</a></p>
  `
  const text = `Hi ${payload.legal_name},

Your ${payload.year} PWMA renewal closes on ${payload.closes_at}.
OPT hours: ${payload.opt_hours_recorded} / ${payload.opt_hours_required}
Start renewal: ${payload.renewal_url}`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
