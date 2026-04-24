import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import { Button } from '@/components/ui/button'
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
import { ROLE_LABELS } from '@/lib/constants/roles'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function AdminApprovalsPage() {
  const qc = useQueryClient()

  const pending = useQuery<Profile[]>({
    queryKey: ['admin', 'pending-approvals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_status', 'pending_pwma_approval')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const decide = useMutation({
    mutationFn: async (input: { row: Profile; approve: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          account_status: input.approve ? 'active' : 'suspended',
        })
        .eq('id', input.row.id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.approve ? 'Member approved' : 'Member rejected')
      dispatchNotificationAsync({
        to_email: variables.row.email,
        to_profile_id: variables.row.id,
        template_key: variables.approve ? 'account_approved' : 'account_rejected',
        payload: {
          legal_name: variables.row.legal_name,
          dashboard_url: `${window.location.origin}/dashboard`,
        },
      })
      qc.invalidateQueries({ queryKey: ['admin', 'pending-approvals'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed')
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Approvals</h1>
        <p className="text-muted-foreground text-sm">
          Review new members waiting for PWMA approval.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending PWMA approval</CardTitle>
          <CardDescription>
            {pending.isLoading
              ? 'Loading...'
              : `${pending.data?.length ?? 0} awaiting review`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pending.isError && (
            <p className="text-destructive text-sm">
              Failed to load: {(pending.error as Error).message}
            </p>
          )}
          {!pending.isLoading && !pending.data?.length && (
            <p className="text-muted-foreground text-sm">No members awaiting approval.</p>
          )}
          {!!pending.data?.length && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Legal name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.legal_name}</TableCell>
                    <TableCell>{p.email}</TableCell>
                    <TableCell>{ROLE_LABELS[p.role]}</TableCell>
                    <TableCell>
                      {format(new Date(p.created_at), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => decide.mutate({ row: p, approve: true })}
                        disabled={decide.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decide.mutate({ row: p, approve: false })}
                        disabled={decide.isPending}
                      >
                        Reject
                      </Button>
                    </TableCell>
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
