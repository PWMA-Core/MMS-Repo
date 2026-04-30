export const ROLES = [
  'pwma_admin',
  'member_firm_admin',
  'individual_member',
  'guest',
] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  pwma_admin: 'PWMA Admin',
  member_firm_admin: 'Firm Admin',
  individual_member: 'Individual Member',
  guest: 'Guest',
}

export const ROLE_LABELS_ZH: Record<Role, string> = {
  pwma_admin: 'PWMA 管理員',
  member_firm_admin: '機構管理員',
  individual_member: '個人會員',
  guest: '訪客',
}
