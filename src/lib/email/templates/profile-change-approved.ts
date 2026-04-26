import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  field_name: string
  new_value: string
}

export function profileChangeApproved(payload: Payload): RenderedEmail {
  const subject = 'Profile change approved'
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Your request to change <strong>${escapeHtml(payload.field_name)}</strong>
    has been approved. The field now reads <em>${escapeHtml(payload.new_value)}</em>.</p>
  `
  const text = `Hi ${payload.legal_name},

Your request to change ${payload.field_name} has been approved.
New value: ${payload.new_value}`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}
