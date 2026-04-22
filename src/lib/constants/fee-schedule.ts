/**
 * Fee schedule. Amounts in HKD.
 */
export const FEE_SCHEDULE = {
  application: {
    cpwp: 2000,
    cpwpa: 1000,
    student_cpwpa: 500,
  },
  late_penalty: {
    cpwp: 500,
    cpwpa: 250,
  },
  unfulfilled_opt_penalty: {
    cpwp: 500,
    cpwpa: 250,
  },
  missing_renewal: {
    before_2024: 1000,
    from_2024: 2000,
  },
} as const
