import type { MemberType } from '@/lib/constants/member-types'

/**
 * Member type eligibility for applying for CPWP / CPWPA.
 */
export const ELIGIBILITY: Record<MemberType, { cpwp: boolean; cpwpa: boolean }> = {
  full_member_firm: { cpwp: true, cpwpa: true },
  individual_full_member: { cpwp: true, cpwpa: true },
  student: { cpwp: false, cpwpa: true },
  associate_member_firm: { cpwp: false, cpwpa: false },
  associate_member_firm_employee: { cpwp: false, cpwpa: true },
  general_public: { cpwp: false, cpwpa: true },
  unemployed: { cpwp: false, cpwpa: true },
}

/**
 * Application-type qualification requirements.
 * CPWP: 3 years relevant practitioner experience + all exam papers complete.
 * CPWPA: all exam papers complete (no experience required).
 */
export const APPLICATION_TYPE_REQUIREMENTS = {
  CPWP: {
    experience_years_min: 3,
    requires_all_exam_papers: true,
  },
  CPWPA: {
    experience_years_min: 0,
    requires_all_exam_papers: true,
  },
} as const

export type ApplicationType = keyof typeof APPLICATION_TYPE_REQUIREMENTS
