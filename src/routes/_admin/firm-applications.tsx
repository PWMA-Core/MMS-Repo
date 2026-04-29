import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import type { Database } from '@/types/database'

type FirmApplication = Database['public']['Tables']['firm_applications']['Row']

const STATUS_VARIANT: Record<
  string,
  { variant: 'solid' | 'hatched' | 'outline'; label: string }
> = {
  approved: { variant: 'solid', label: 'Approved' },
  submitted: { variant: 'hatched', label: 'Submitted' },
  pending_director_review: { variant: 'hatched', label: 'In review' },
  pending_approval: { variant: 'hatched', label: 'Pending approval' },
  rejected: { variant: 'outline', label: 'Rejected' },
}

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

  const total = list.data?.length ?? 0
  const pending =
    list.data?.filter((a) => a.status !== 'approved' && a.status !== 'rejected').length ??
    0

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">Queue</div>
          <h1 className="title-huge">
            Firm
            <br />
            Applications
          </h1>
        </div>
      </header>

      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">Total</span>
            <span className="text-5xl font-light tracking-tight">{total}</span>
          </div>
          <div className="flex flex-col">
            <span className="label-small mb-2">Pending</span>
            <span className="text-foreground/65 text-5xl font-light tracking-tight">
              {pending}
            </span>
          </div>
        </section>
      </div>

      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">Firm</span>
          <span className="label-small">Tier</span>
          <span className="label-small">Submitted</span>
          <span className="label-small">Status</span>
          <span className="label-small text-right">Actions</span>
        </div>

        {list.isError && (
          <p className="text-destructive py-8 text-sm">
            Failed to load: {(list.error as Error).message}
          </p>
        )}
        {list.isLoading && <p className="text-foreground/65 py-8 text-sm">Loading...</p>}
        {!list.isLoading && total === 0 && (
          <p className="text-foreground/65 py-8 text-sm">No applications.</p>
        )}

        {list.data?.map((a, idx) => {
          const last = idx === total - 1
          const statusInfo = STATUS_VARIANT[a.status] ?? {
            variant: 'outline' as const,
            label: a.status,
          }
          const isDecided = a.status === 'approved' || a.status === 'rejected'
          return (
            <div
              key={a.id}
              className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} relative -mx-4 px-4`}
            >
              <div className="flex flex-col gap-1 pl-4">
                <span className="text-[1.1rem] font-medium tracking-tight">
                  {a.proposed_firm_name}
                </span>
                <span className="text-foreground/65 font-mono text-xs">
                  BR: {a.business_registration_number ?? '—'}
                </span>
                <span className="text-foreground/65 text-xs">
                  {a.contact_name} · {a.contact_email}
                </span>
              </div>
              <div>
                <span className="value-medium capitalize">
                  {a.tier_requested.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[0.95rem]">
                  {format(new Date(a.submitted_at), 'yyyy-MM-dd')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`status-square status-${statusInfo.variant}`} />
                <span className="text-foreground/80 text-[0.9rem] tracking-wide">
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => decide.mutate({ row: a, decision: 'approved' })}
                  disabled={decide.isPending || isDecided}
                  className="bg-foreground text-background rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => decide.mutate({ row: a, decision: 'rejected' })}
                  disabled={decide.isPending || isDecided}
                  className="border-foreground/25 hover:border-foreground rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors disabled:opacity-30"
                >
                  Reject
                </button>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
