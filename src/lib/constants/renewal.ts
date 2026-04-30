/**
 * Renewal defaults. Authoritative values live in the renewal_periods table,
 * but these constants back the UI when Supabase is offline / the period row
 * has not loaded yet.
 */

export const DEFAULT_OPT_HOURS_REQUIRED = 10

export const RENEWAL_WINDOW_DAYS = 60

export function getCurrentRenewalYear(now: Date = new Date()): number {
  return now.getFullYear()
}
