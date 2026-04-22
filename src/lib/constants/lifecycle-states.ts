export const LIFECYCLE_STATES = [
  'employee',
  'unemployed',
  'general_public',
] as const
export type LifecycleState = (typeof LIFECYCLE_STATES)[number]

export const LIFECYCLE_STATE_LABELS: Record<LifecycleState, string> = {
  employee: 'Employee',
  unemployed: 'Unemployed',
  general_public: 'General public',
}
