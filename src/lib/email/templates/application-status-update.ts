import { wrapEmailHtml, escapeHtml } from './layout'
import type { RenderedEmail } from './index'

interface Payload {
  legal_name: string
  application_type: 'CPWP' | 'CPWPA'
  application_kind: 'new' | 'renewal'
  from_status: string | null
  to_status: string
  note?: string
}

export function applicationStatusUpdate(payload: Payload): RenderedEmail {
  const subject = `${payload.application_type} ${payload.application_kind} status: ${humanize(payload.to_status)}`
  const noteBlock = payload.note
    ? `<p><strong>Note:</strong> ${escapeHtml(payload.note)}</p>`
    : ''
  const body = `
    <p>Hi ${escapeHtml(payload.legal_name)},</p>
    <p>Your ${payload.application_type} ${payload.application_kind} application is now
    <strong>${escapeHtml(humanize(payload.to_status))}</strong>.</p>
    ${payload.from_status ? `<p style="color:#6b7280;">Previously: ${escapeHtml(humanize(payload.from_status))}</p>` : ''}
    ${noteBlock}
  `
  const text = `Hi ${payload.legal_name},

Your ${payload.application_type} ${payload.application_kind} application is now: ${humanize(payload.to_status)}${
    payload.from_status ? ` (was ${humanize(payload.from_status)})` : ''
  }${payload.note ? `\n\nNote: ${payload.note}` : ''}`
  return {
    subject,
    html: wrapEmailHtml({ title: subject, body }),
    text,
  }
}

function humanize(status: string): string {
  return status.replace(/_/g, ' ')
}
