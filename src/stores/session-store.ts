import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface SessionState {
  status: SessionStatus
  session: Session | null
  user: User | null
  profile: Profile | null
  setSession: (session: Session | null) => void
  setProfile: (profile: Profile | null) => void
  reset: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  status: 'loading',
  session: null,
  user: null,
  profile: null,
  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
      status: session?.user ? 'authenticated' : 'unauthenticated',
    }),
  setProfile: (profile) => set({ profile }),
  reset: () =>
    set({
      status: 'unauthenticated',
      session: null,
      user: null,
      profile: null,
    }),
}))
