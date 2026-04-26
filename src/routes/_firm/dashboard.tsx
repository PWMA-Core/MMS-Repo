import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useCurrentProfile } from '@/hooks/use-user'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Database } from '@/types/database'

type FirmMembership = Database['public']['Tables']['firm_memberships']['Row']
type MemberFirm = Database['public']['Tables']['member_firms']['Row']

interface EmployeeJoinRow {
  id: string
  role_in_firm: 'admin' | 'employee'
  start_date: string
  end_date: string | null
  profile: {
    id: string
    legal_name: string
    email: string
    account_status: string
  } | null
}

export function FirmAdminDashboardPage() {
  const { data: profile } = useCurrentProfile()

  const firm = useQuery({
    queryKey: ['firm-admin', 'my-firm', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data: membership, error: mError } = await supabase
        .from('firm_memberships')
        .select('*')
        .eq('profile_id', profile!.id)
        .eq('role_in_firm', 'admin')
        .is('end_date', null)
        .maybeSingle()
      if (mError) throw mError
      if (!membership) return null
      const { data: firmRow, error: fError } = await supabase
        .from('member_firms')
        .select('*')
        .eq('id', (membership as FirmMembership).firm_id)
        .single()
      if (fError) throw fError
      return firmRow as MemberFirm
    },
  })

  const employees = useQuery<EmployeeJoinRow[]>({
    queryKey: ['firm-admin', 'employees', firm.data?.id],
    enabled: !!firm.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firm_memberships')
        .select(
          `id, role_in_firm, start_date, end_date,
           profile:profiles(id, legal_name, email, account_status)`,
        )
        .eq('firm_id', firm.data!.id)
        .is('end_date', null)
      if (error) throw error
      return (data ?? []) as unknown as EmployeeJoinRow[]
    },
  })

  const employeeCount = employees.data?.length ?? 0
  const activeCount =
    employees.data?.filter((r) => r.profile?.account_status === 'active').length ?? 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">{firm.data?.name ?? 'Firm dashboard'}</h1>
        <p className="text-muted-foreground text-sm">
          Consolidated view of your firm's PWMA memberships.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>Linked to this firm</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {employees.isLoading ? '—' : employeeCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active accounts</CardTitle>
            <CardDescription>Approved members</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {employees.isLoading ? '—' : activeCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Firm status</CardTitle>
            <CardDescription>Membership tier and status</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {firm.isLoading ? (
              '—'
            ) : firm.data ? (
              <>
                <div className="capitalize">{firm.data.tier.replace('_', ' ')}</div>
                <div className="text-muted-foreground capitalize">{firm.data.status}</div>
              </>
            ) : (
              <span className="text-muted-foreground">No firm linked</span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
