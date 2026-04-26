import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useSessionStore } from '@/stores/session-store'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useCurrentProfile() {
  const user = useSessionStore((s) => s.user)

  return useQuery<Profile | null>({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
      if (error) throw error
      return data
    },
  })
}
