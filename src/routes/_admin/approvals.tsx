import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import { ROLE_LABELS, ROLE_LABELS_ZH } from '@/lib/constants/roles'
import type { Database } from '@/types/database'
import { Tr, useTr } from '@/components/ui/tr'

type Profile = Database['public']['Tables']['profiles']['Row']

export function AdminApprovalsPage() {
  const qc = useQueryClient()
  const t = useTr()

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
      toast.success(
        variables.approve
          ? t('Member approved', '會員已批准')
          : t('Member rejected', '會員已拒絕'),
      )
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
      toast.error(error.message || t('Action failed', '操作失敗'))
    },
  })

  const total = pending.data?.length ?? 0

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">
            <Tr en="Queue" zh="佇列" />
          </div>
          <h1 className="title-huge">
            <Tr
              en={
                <>
                  Member
                  <br />
                  Approvals
                </>
              }
              zh={
                <>
                  會員
                  <br />
                  審批
                </>
              }
            />
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <button type="button" className="nexus-pill-outline">
            <i className="ph ph-arrows-clockwise" aria-hidden="true" />
            <Tr en="Refresh" zh="重新整理" />
          </button>
        </div>
      </header>

      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Awaiting review" zh="待審核" />
            </span>
            <span className="text-5xl font-light tracking-tight">{total}</span>
          </div>
        </section>
      </div>

      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">
            <Tr en="Member details" zh="會員資料" />
          </span>
          <span className="label-small">
            <Tr en="Role" zh="角色" />
          </span>
          <span className="label-small">
            <Tr en="Requested" zh="申請日期" />
          </span>
          <span className="label-small">
            <Tr en="Status" zh="狀態" />
          </span>
          <span className="label-small text-right">
            <Tr en="Actions" zh="操作" />
          </span>
        </div>

        {pending.isError && (
          <p className="text-destructive py-8 text-sm">
            {t('Failed to load:', '載入失敗：')} {(pending.error as Error).message}
          </p>
        )}
        {pending.isLoading && (
          <p className="text-foreground/65 py-8 text-sm">
            <Tr en="Loading..." zh="載入中..." />
          </p>
        )}
        {!pending.isLoading && total === 0 && (
          <p className="text-foreground/65 py-8 text-sm">
            <Tr en="No members awaiting approval." zh="目前沒有待審批的會員。" />
          </p>
        )}

        {pending.data?.map((p, idx) => {
          const last = idx === total - 1
          return (
            <div
              key={p.id}
              className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} group hover:bg-foreground/[0.03] relative -mx-4 px-4 transition-colors`}
            >
              <div className="flex flex-col gap-1 pl-4">
                <span className="text-[1.1rem] font-medium tracking-tight">
                  {p.legal_name}
                </span>
                <span className="text-foreground/65 font-mono text-xs">{p.email}</span>
              </div>
              <div>
                <span className="value-medium">
                  <Tr en={ROLE_LABELS[p.role]} zh={ROLE_LABELS_ZH[p.role]} />
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[0.95rem]">
                  {format(new Date(p.created_at), 'yyyy-MM-dd')}
                </span>
                <span className="text-foreground/50 text-xs">
                  {format(new Date(p.created_at), 'HH:mm')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="status-square status-hatched" />
                <span className="text-foreground/80 text-[0.9rem] tracking-wide">
                  <Tr en="Pending" zh="待審批" />
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => decide.mutate({ row: p, approve: true })}
                  disabled={decide.isPending}
                  className="bg-foreground text-background rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Tr en="Approve" zh="批准" />
                </button>
                <button
                  type="button"
                  onClick={() => decide.mutate({ row: p, approve: false })}
                  disabled={decide.isPending}
                  className="border-foreground/25 hover:border-foreground rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors disabled:opacity-50"
                >
                  <Tr en="Reject" zh="拒絕" />
                </button>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
