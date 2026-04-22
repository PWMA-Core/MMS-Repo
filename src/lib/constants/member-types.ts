/**
 * Member types used in eligibility checks when applying for CPWP or CPWPA.
 */
export const MEMBER_TYPES = [
  'full_member_firm',
  'individual_full_member',
  'student',
  'associate_member_firm',
  'associate_member_firm_employee',
  'general_public',
  'unemployed',
] as const
export type MemberType = (typeof MEMBER_TYPES)[number]

export const MEMBER_TYPE_LABELS: Record<MemberType, string> = {
  full_member_firm: 'Full Member Firm',
  individual_full_member: 'Individual Full Member',
  student: 'Student',
  associate_member_firm: 'Associate Member Firm',
  associate_member_firm_employee: 'Associate Member Firm Employee',
  general_public: 'General Public',
  unemployed: 'Unemployed',
}
