import type { NotificationTemplateKey } from '@/lib/constants/notifications'
import { registrationReceived } from './registration-received'
import { emailVerifyReminder } from './email-verify-reminder'
import { accountApproved } from './account-approved'
import { accountRejected } from './account-rejected'
import { profileChangeSubmitted } from './profile-change-submitted'
import { profileChangeApproved } from './profile-change-approved'
import { profileChangeRejected } from './profile-change-rejected'
import { firmApplicationReceived } from './firm-application-received'
import { firmApplicationDecision } from './firm-application-decision'
import { renewalReminder } from './renewal-reminder'
import { applicationSubmitted } from './application-submitted'
import { applicationStatusUpdate } from './application-status-update'

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export type EmailRenderer<P> = (payload: P) => RenderedEmail

type TemplateRegistry = Record<NotificationTemplateKey, (payload: never) => RenderedEmail>

export const emailTemplates: TemplateRegistry = {
  registration_received: registrationReceived,
  email_verify_reminder: emailVerifyReminder,
  account_approved: accountApproved,
  account_rejected: accountRejected,
  profile_change_submitted: profileChangeSubmitted,
  profile_change_approved: profileChangeApproved,
  profile_change_rejected: profileChangeRejected,
  firm_application_received: firmApplicationReceived,
  firm_application_decision: firmApplicationDecision,
  renewal_reminder: renewalReminder,
  application_submitted: applicationSubmitted,
  application_status_update: applicationStatusUpdate,
}

export function renderEmail(
  key: NotificationTemplateKey,
  payload: Record<string, unknown>,
): RenderedEmail {
  const renderer = emailTemplates[key] as (p: Record<string, unknown>) => RenderedEmail
  if (!renderer) {
    throw new Error(`Unknown email template: ${key}`)
  }
  return renderer(payload)
}
