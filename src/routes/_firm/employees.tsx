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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ACCOUNT_STATUS_LABELS,
  type AccountStatus,
} from '@/lib/constants/account-statuses'

interface EmployeeRow {
  id: string
  role_in_firm: 'admin' | 'employee'
  start_date: string
  end_date: string | null
  profile: {
    id: string
    legal_name: string
    email: string
    account_status: AccountStatus
  } | null
}

export function FirmEmployeesPage() {
  const { data: profile } = useCurrentProfile()

  const firmId = useQuery({
    queryKey: ['firm-admin', 'firm-id', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firm_memberships')
        .select('firm_id')
        .eq('profile_id', profile!.id)
        .eq('role_in_firm', 'admin')
        .is('end_date', null)
        .maybeSingle()
      if (error) throw error
      return data?.firm_id ?? null
    },
  })

  const employees = useQuery<EmployeeRow[]>({
    queryKey: ['firm-admin', 'employees-page', firmId.data],
    enabled: !!firmId.data,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firm_memberships')
        .select(
          `id, role_in_firm, start_date, end_date,
           profile:profiles(id, legal_name, email, account_status)`,
        )
        .eq('firm_id', firmId.data!)
        .order('start_date', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as EmployeeRow[]
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p className="text-muted-foreground text-sm">
          Members currently or previously linked to your firm.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All linked members</CardTitle>
          <CardDescription>
            {employees.isLoading ? 'Loading...' : `${employees.data?.length ?? 0} total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!employees.isLoading && !employees.data?.length && (
            <p className="text-muted-foreground text-sm">No employees linked yet.</p>
          )}
          {!!employees.data?.length && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account status</TableHead>
                  <TableHead>Linked since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.profile?.legal_name ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.profile?.email ?? '—'}
                    </TableCell>
                    <TableCell className="text-xs uppercase">{e.role_in_firm}</TableCell>
                    <TableCell>
                      {e.profile ? ACCOUNT_STATUS_LABELS[e.profile.account_status] : '—'}
                    </TableCell>
                    <TableCell>{e.start_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
