import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSessionStore } from '@/stores/session-store'

/**
 * Subscribes to Supabase auth events and syncs the Zustand session store.
 * Mount once at the app root.
 */
export function useSessionSync() {
  const setSession = useSessionStore((s) => s.setSession)
  const setProfile = useSessionStore((s) => s.setProfile)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setSession(session)
      if (!session) setProfile(null)
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [setSession, setProfile])
}

export function useSession() {
  return useSessionStore((s) => ({
    status: s.status,
    session: s.session,
    user: s.user,
    profile: s.profile,
  }))
}
