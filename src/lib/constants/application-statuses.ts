/**
 * Full application status set for CPWP and CPWPA applications.
 */
export const APPLICATION_STATUSES = [
  'pending_for_checker',
  'recommended_for_approval',
  'recommended_for_rejection',
  'approved',
  'rejected',
  'marginal_case',
  'pending_payment_verification',
  'transferred_to_cpwpa',
  'transferred_to_cpwp',
  'grandfathered',
  'appeal_case',
  'withdrawn',
  'set_aside_for_next_meeting',
] as const

export const RENEWAL_ONLY_STATUSES = [
  'voluntary_suspension',
  'voluntary_suspension_expired',
  'voluntary_suspension_fulfillment',
  'os_charges_or_condition_imposed',
  'condition_imposed',
  'condition_imposed_expired',
  'condition_imposed_fulfillment',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]
export type RenewalOnlyStatus = (typeof RENEWAL_ONLY_STATUSES)[number]
