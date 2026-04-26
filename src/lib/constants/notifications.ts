/**
 * Notification template registry. Every enqueued notification must match a
 * template_key in this list. Templates live in src/lib/email/templates/.
 */

export const NOTIFICATION_TEMPLATE_KEYS = [
  'registration_received',
  'email_verify_reminder',
  'account_approved',
  'account_rejected',
  'profile_change_submitted',
  'profile_change_approved',
  'profile_change_rejected',
  'firm_application_received',
  'firm_application_decision',
  'renewal_reminder',
  'application_submitted',
  'application_status_update',
] as const

export type NotificationTemplateKey = (typeof NOTIFICATION_TEMPLATE_KEYS)[number]

export const NOTIFICATION_TEMPLATE_LABELS: Record<NotificationTemplateKey, string> = {
  registration_received: 'Registration received',
  email_verify_reminder: 'Email verification reminder',
  account_approved: 'Account approved',
  account_rejected: 'Account rejected',
  profile_change_submitted: 'Profile change submitted',
  profile_change_approved: 'Profile change approved',
  profile_change_rejected: 'Profile change rejected',
  firm_application_received: 'Firm application received',
  firm_application_decision: 'Firm application decision',
  renewal_reminder: 'Renewal reminder',
  application_submitted: 'Application submitted',
  application_status_update: 'Application status update',
}
