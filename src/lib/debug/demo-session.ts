/**
 * Demo session helper for the DevNav overlay.
 *
 * Sets a fake session + profile in the Zustand store so protected routes
 * render without hitting Supabase auth. Persists across refresh via
 * sessionStorage. All writes are tagged DEMO so they can be audited.
 *
 * Does NOT make Supabase queries succeed; any page that reads data from
 * Supabase (admin queues, firm employee list, etc.) will still show
 * "failed to load". That is fine for layout preview.
 */

import type { Session, User } from '@supabase/supabase-js'
import { useSessionStore } from '@/stores/session-store'
import { DEMO_PROFILES } from './dummy-data'
import type { Database } from '@/types/database'

type Role = Database['public']['Tables']['profiles']['Row']['role']

const STORAGE_KEY = '__pwma_demo_session__'

function buildFakeUser(email: string, id: string): User {
  return {
    id,
    email,
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: { provider: 'demo' },
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: undefined,
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    identities: [],
    factors: [],
    is_anonymous: false,
  } as unknown as User
}

function buildFakeSession(user: User): Session {
  return {
    access_token: 'demo-access-token',
    refresh_token: 'demo-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  } as unknown as Session
}

export function setDemoSession(role: Role): void {
  const profile = DEMO_PROFILES[role]
  const user = buildFakeUser(profile.email, profile.auth_user_id ?? profile.id)
  const session = buildFakeSession(user)

  useSessionStore.setState({
    status: 'authenticated',
    session,
    user,
    profile,
  })

  sessionStorage.setItem(STORAGE_KEY, role)
}

export function clearDemoSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
  useSessionStore.setState({
    status: 'unauthenticated',
    session: null,
    user: null,
    profile: null,
  })
}

export function getStoredDemoRole(): Role | null {
  if (typeof window === 'undefined') return null
  const value = sessionStorage.getItem(STORAGE_KEY)
  return (value as Role | null) ?? null
}

export function restoreDemoSession(): Role | null {
  const stored = getStoredDemoRole()
  if (stored) setDemoSession(stored)
  return stored
}
