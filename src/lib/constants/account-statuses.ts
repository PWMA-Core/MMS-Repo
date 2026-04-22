export const ACCOUNT_STATUSES = [
  'pending_email_verify',
  'pending_pwma_approval',
  'active',
  'suspended',
] as const
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number]

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  pending_email_verify: 'Pending email verify',
  pending_pwma_approval: 'Pending PWMA approval',
  active: 'Active',
  suspended: 'Suspended',
}
