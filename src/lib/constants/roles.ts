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
