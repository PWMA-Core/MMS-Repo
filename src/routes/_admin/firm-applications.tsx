import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import type { Database } from '@/types/database'
import { Tr, useTr } from '@/components/ui/tr'

type FirmApplication = Database['public']['Tables']['firm_applications']['Row']

const STATUS_VARIANT: Record<
  string,
  { variant: 'solid' | 'hatched' | 'outline'; en: string; zh: string }
> = {
  approved: { variant: 'solid', en: 'Approved', zh: '已批准' },
  submitted: { variant: 'hatched', en: 'Submitted', zh: '已提交' },
  pending_director_review: { variant: 'hatched', en: 'In review', zh: '審核中' },
  pending_approval: { variant: 'hatched', en: 'Pending approval', zh: '待批准' },
  rejected: { variant: 'outline', en: 'Rejected', zh: '已拒絕' },
}

export function AdminFirmApplicationsPage() {
  const qc = useQueryClient()
  const t = useTr()

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
          ? t('Firm application approved', '機構申請已批准')
          : t('Firm application rejected', '機構申請已拒絕'),
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
      toast.error(error.message || t('Action failed', '操作失敗'))
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
          <div className="label-small mb-4">
            <Tr en="Queue" zh="佇列" />
          </div>
          <h1 className="title-huge">
            <Tr
              en={
                <>
                  Firm
                  <br />
                  Applications
                </>
              }
              zh={
                <>
                  機構
                  <br />
                  申請
                </>
              }
            />
          </h1>
        </div>
      </header>

      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Total" zh="總數" />
            </span>
            <span className="text-5xl font-light tracking-tight">{total}</span>
          </div>
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Pending" zh="待處理" />
            </span>
            <span className="text-foreground/65 text-5xl font-light tracking-tight">
              {pending}
            </span>
          </div>
        </section>
      </div>

      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">
            <Tr en="Firm" zh="機構" />
          </span>
          <span className="label-small">
            <Tr en="Tier" zh="級別" />
          </span>
          <span className="label-small">
            <Tr en="Submitted" zh="提交日期" />
          </span>
          <span className="label-small">
            <Tr en="Status" zh="狀態" />
          </span>
          <span className="label-small text-right">
            <Tr en="Actions" zh="操作" />
          </span>
        </div>

        {list.isError && (
          <p className="text-destructive py-8 text-sm">
            {t('Failed to load:', '載入失敗：')} {(list.error as Error).message}
          </p>
        )}
        {list.isLoading && (
          <p className="text-foreground/65 py-8 text-sm">
            <Tr en="Loading..." zh="載入中..." />
          </p>
        )}
        {!list.isLoading && total === 0 && (
          <p className="text-foreground/65 py-8 text-sm">
            <Tr en="No applications." zh="目前沒有申請。" />
          </p>
        )}

        {list.data?.map((a, idx) => {
          const last = idx === total - 1
          const statusInfo = STATUS_VARIANT[a.status] ?? {
            variant: 'outline' as const,
            en: a.status,
            zh: a.status,
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
                  <Tr en={statusInfo.en} zh={statusInfo.zh} />
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => decide.mutate({ row: a, decision: 'approved' })}
                  disabled={decide.isPending || isDecided}
                  className="bg-foreground text-background rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  <Tr en="Approve" zh="批准" />
                </button>
                <button
                  type="button"
                  onClick={() => decide.mutate({ row: a, decision: 'rejected' })}
                  disabled={decide.isPending || isDecided}
                  className="border-foreground/25 hover:border-foreground rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors disabled:opacity-30"
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
