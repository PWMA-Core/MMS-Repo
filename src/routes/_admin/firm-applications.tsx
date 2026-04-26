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

type FirmApplication = Database['public']['Tables']['firm_applications']['Row']

export function AdminFirmApplicationsPage() {
  const qc = useQueryClient()

  const list = useQuery<FirmApplication[]>({
    queryKey: ['admin', 'firm-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firm_applications')
        .select('*')
        .order('submitted_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })

  const decide = useMutation({
    mutationFn: async (input: {
      row: FirmApplication
      decision: 'approved' | 'rejected'
    }) => {
      const { error } = await supabase
        .from('firm_applications')
        .update({
          status: input.decision,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', input.row.id)
      if (error) throw error
    },
    onSuccess: (_d, variables) => {
      toast.success(
        variables.decision === 'approved'
          ? 'Firm application approved'
          : 'Firm application rejected',
      )
      dispatchNotificationAsync({
        to_email: variables.row.contact_email,
        template_key: 'firm_application_decision',
        payload: {
          contact_name: variables.row.contact_name,
          proposed_firm_name: variables.row.proposed_firm_name,
          decision: variables.decision,
        },
      })
      qc.invalidateQueries({ queryKey: ['admin', 'firm-applications'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Action failed')
    },
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Firm applications</h1>
        <p className="text-muted-foreground text-sm">
          Member firm applications (WF1). Director sign-off chain is captured in the
          record; Executive Committee review is tracked manually until the online chain
          lands.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All applications</CardTitle>
          <CardDescription>
            {list.isLoading ? 'Loading...' : `${list.data?.length ?? 0} total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {list.isError && (
            <p className="text-destructive text-sm">
              Failed to load: {(list.error as Error).message}
            </p>
          )}
          {!list.isLoading && !list.data?.length && (
            <p className="text-muted-foreground text-sm">No applications.</p>
          )}
          {!!list.data?.length && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firm</TableHead>
                  <TableHead>BR number</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.data.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.proposed_firm_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.business_registration_number ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div>{a.contact_name}</div>
                      <div className="text-muted-foreground text-xs">
                        {a.contact_email}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs uppercase">
                      {a.tier_requested.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-xs uppercase">
                      {a.status.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(a.submitted_at), 'yyyy-MM-dd')}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => decide.mutate({ row: a, decision: 'approved' })}
                        disabled={
                          decide.isPending ||
                          a.status === 'approved' ||
                          a.status === 'rejected'
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => decide.mutate({ row: a, decision: 'rejected' })}
                        disabled={
                          decide.isPending ||
                          a.status === 'approved' ||
                          a.status === 'rejected'
                        }
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
