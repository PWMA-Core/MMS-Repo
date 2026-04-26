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
import type { Database } from '@/types/database'

type ChangeRequest = Database['public']['Tables']['profile_change_requests']['Row']
type ChangeRequestWithProfile = ChangeRequest & {
  profile: { id: string; legal_name: string; email: string } | null
}

export function AdminProfileChangesPage() {
  const qc = useQueryClient()

  const pending = useQuery<ChangeRequestWithProfile[]>({
    queryKey: ['admin', 'profile-change-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_change_requests')
        .select(
          `*, profile:profiles!profile_change_requests_profile_id_fkey(id, legal_name, email)`,
        )
        .eq('status', 'pending')
        .order('requested_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as ChangeRequestWithProfile[]
    },
  })

  const decide = useMutation({
    mutationFn: async (input: {
      request: ChangeRequestWithProfile
      approve: boolean
    }) => {
      const { request, approve } = input
      if (approve) {
        const update: Database['public']['Tables']['profiles']['Update'] = {
          [request.field_name]: request.new_value,
        }
        const { error: updateError } = await supabase
          .from('profiles')
          .update(update)
          .eq('id', request.profile_id)
        if (updateError) throw updateError
      }
      const { error: requestError } = await supabase
        .from('profile_change_requests')
        .update({
          status: approve ? 'approved' : 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', request.id)
      if (requestError) throw requestError
    },
    onSuccess: (_d, variables) => {
      toast.success(variables.approve ? 'Change approved and applied' : 'Change rejected')
      if (variables.request.profile) {
        dispatchNotificationAsync({
          to_email: variables.request.profile.email,
          to_profile_id: variables.request.profile.id,
          template_key: variables.approve
            ? 'profile_change_approved'
            : 'profile_change_rejected',
          payload: {
            legal_name: variables.request.profile.legal_name,
            field_name: variables.request.field_name,
            new_value: variables.request.new_value,
          },
        })
      }
      qc.invalidateQueries({ queryKey: ['admin', 'profile-change-requests'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed')
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Profile change requests</h1>
        <p className="text-muted-foreground text-sm">
          Critical-field changes (legal name, DOB, HKID, email) require admin approval.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending changes</CardTitle>
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
            <p className="text-muted-foreground text-sm">No pending change requests.</p>
          )}
          {!!pending.data?.length && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Old value</TableHead>
                  <TableHead>New value</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.field_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {r.old_value ?? '—'}
                    </TableCell>
                    <TableCell>{r.new_value}</TableCell>
                    <TableCell>
                      {format(new Date(r.requested_at), 'yyyy-MM-dd HH:mm')}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {r.note ?? '—'}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => decide.mutate({ request: r, approve: true })}
                        disabled={decide.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decide.mutate({ request: r, approve: false })}
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
