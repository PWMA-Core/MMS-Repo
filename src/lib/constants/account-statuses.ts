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

export const ACCOUNT_STATUS_LABELS_ZH: Record<AccountStatus, string> = {
  pending_email_verify: '待電郵驗證',
  pending_pwma_approval: '待 PWMA 審批',
  active: '啟用中',
  suspended: '已停用',
}
