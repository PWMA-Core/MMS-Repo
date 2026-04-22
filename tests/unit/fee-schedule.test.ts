import { describe, it, expect } from 'vitest'
import { FEE_SCHEDULE } from '@/lib/constants/fee-schedule'
import { APPLICATION_STATUSES } from '@/lib/constants/application-statuses'
import { ELIGIBILITY, APPLICATION_TYPE_REQUIREMENTS } from '@/lib/constants/eligibility'
import { ROLES } from '@/lib/constants/roles'
import { ACCOUNT_STATUSES } from '@/lib/constants/account-statuses'
import { LIFECYCLE_STATES } from '@/lib/constants/lifecycle-states'

describe('FEE_SCHEDULE', () => {
  it('CPWP application is 2000', () => {
    expect(FEE_SCHEDULE.application.cpwp).toBe(2000)
  })

  it('CPWPA application is 1000', () => {
    expect(FEE_SCHEDULE.application.cpwpa).toBe(1000)
  })

  it('Student CPWPA is 500', () => {
    expect(FEE_SCHEDULE.application.student_cpwpa).toBe(500)
  })

  it('Late penalties match spec (CPWP 500, CPWPA 250)', () => {
    expect(FEE_SCHEDULE.late_penalty.cpwp).toBe(500)
    expect(FEE_SCHEDULE.late_penalty.cpwpa).toBe(250)
  })

  it('Missing renewal penalty shifted from 1000 (pre-2024) to 2000 (from 2024)', () => {
    expect(FEE_SCHEDULE.missing_renewal.before_2024).toBe(1000)
    expect(FEE_SCHEDULE.missing_renewal.from_2024).toBe(2000)
    expect(FEE_SCHEDULE.missing_renewal.from_2024).toBeGreaterThan(
      FEE_SCHEDULE.missing_renewal.before_2024
    )
  })
})

describe('APPLICATION_STATUSES', () => {
  it('includes default status pending_for_checker', () => {
    expect(APPLICATION_STATUSES).toContain('pending_for_checker')
  })

  it('has no duplicate status values', () => {
    expect(new Set(APPLICATION_STATUSES).size).toBe(APPLICATION_STATUSES.length)
  })
})

describe('ELIGIBILITY matrix', () => {
  it('full_member_firm can apply for both', () => {
    expect(ELIGIBILITY.full_member_firm).toEqual({ cpwp: true, cpwpa: true })
  })

  it('associate_member_firm cannot apply for either', () => {
    expect(ELIGIBILITY.associate_member_firm).toEqual({ cpwp: false, cpwpa: false })
  })

  it('student can apply for CPWPA only', () => {
    expect(ELIGIBILITY.student).toEqual({ cpwp: false, cpwpa: true })
  })

  it('general_public cannot apply for CPWP', () => {
    expect(ELIGIBILITY.general_public.cpwp).toBe(false)
  })
})

describe('APPLICATION_TYPE_REQUIREMENTS', () => {
  it('CPWP requires 3 years experience', () => {
    expect(APPLICATION_TYPE_REQUIREMENTS.CPWP.experience_years_min).toBe(3)
  })

  it('CPWPA requires 0 years experience', () => {
    expect(APPLICATION_TYPE_REQUIREMENTS.CPWPA.experience_years_min).toBe(0)
  })

  it('both require all exam papers', () => {
    expect(APPLICATION_TYPE_REQUIREMENTS.CPWP.requires_all_exam_papers).toBe(true)
    expect(APPLICATION_TYPE_REQUIREMENTS.CPWPA.requires_all_exam_papers).toBe(true)
  })
})

describe('ROLES', () => {
  it('has exactly 4 SOW roles', () => {
    expect(ROLES).toHaveLength(4)
    expect(ROLES).toContain('pwma_admin')
    expect(ROLES).toContain('member_firm_admin')
    expect(ROLES).toContain('individual_member')
    expect(ROLES).toContain('guest')
  })
})

describe('ACCOUNT_STATUSES', () => {
  it('has 4 lifecycle states', () => {
    expect(ACCOUNT_STATUSES).toEqual([
      'pending_email_verify',
      'pending_pwma_approval',
      'active',
      'suspended',
    ])
  })
})

describe('LIFECYCLE_STATES', () => {
  it('has employee, unemployed, general_public', () => {
    expect(LIFECYCLE_STATES).toEqual(['employee', 'unemployed', 'general_public'])
  })
})
