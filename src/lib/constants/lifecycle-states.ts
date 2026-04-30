export const LIFECYCLE_STATES = ['employee', 'unemployed', 'general_public'] as const
export type LifecycleState = (typeof LIFECYCLE_STATES)[number]

export const LIFECYCLE_STATE_LABELS: Record<LifecycleState, string> = {
  employee: 'Employee',
  unemployed: 'Unemployed',
  general_public: 'General public',
}

export const LIFECYCLE_STATE_LABELS_ZH: Record<LifecycleState, string> = {
  employee: '在職',
  unemployed: '待業',
  general_public: '一般公眾',
}
