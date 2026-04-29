import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import type { Database } from '@/types/database'
import { Tr, useTr } from '@/components/ui/tr'

type ChangeRequest = Database['public']['Tables']['profile_change_requests']['Row']
type ChangeRequestWithProfile = ChangeRequest & {
  profile: { id: string; legal_name: string; email: string } | null
}

export function AdminProfileChangesPage() {
  const qc = useQueryClient()
  const t = useTr()

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
      toast.success(
        variables.approve
          ? t('Change approved and applied', '修改已批准並套用')
          : t('Change rejected', '修改已拒絕'),
      )
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
                  Profile
                  <br />
                  Changes
                </>
              }
              zh={
                <>
                  資料
                  <br />
                  修改申請
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
              <Tr en="Awaiting review" zh="待審核" />
            </span>
            <span className="text-5xl font-light tracking-tight">{total}</span>
          </div>
        </section>
      </div>

      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">
            <Tr en="Member" zh="會員" />
          </span>
          <span className="label-small">
            <Tr en="Field" zh="欄位" />
          </span>
          <span className="label-small">
            <Tr en="Old → New" zh="舊值 → 新值" />
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
            <Tr en="No pending change requests." zh="目前沒有待處理的修改申請。" />
          </p>
        )}

        {pending.data?.map((r, idx) => {
          const last = idx === total - 1
          return (
            <div
              key={r.id}
              className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} relative -mx-4 px-4`}
            >
              <div className="flex flex-col gap-1 pl-4">
                <span className="text-[1.1rem] font-medium tracking-tight">
                  {r.profile?.legal_name ?? '—'}
                </span>
                <span className="text-foreground/65 font-mono text-xs">
                  {r.profile?.email ?? '—'}
                </span>
              </div>
              <div>
                <span className="value-medium font-mono text-sm">{r.field_name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-foreground/50 text-xs">{r.old_value ?? '—'}</span>
                <span className="text-[0.95rem]">{r.new_value}</span>
                {r.note && (
                  <span className="text-foreground/50 max-w-xs truncate text-xs">
                    "{r.note}"
                  </span>
                )}
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
                  onClick={() => decide.mutate({ request: r, approve: true })}
                  disabled={decide.isPending}
                  className="bg-foreground text-background rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  <Tr en="Approve" zh="批准" />
                </button>
                <button
                  type="button"
                  onClick={() => decide.mutate({ request: r, approve: false })}
                  disabled={decide.isPending}
                  className="border-foreground/25 hover:border-foreground rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors disabled:opacity-30"
                >
                  <Tr en="Reject" zh="拒絕" />
                </button>
              </div>
            </div>
          )
        })}

        <p className="text-foreground/50 pt-6 text-xs">
          <Tr
            en="Critical-field changes (legal name, DOB, HKID, email) require admin approval."
            zh="受保護欄位修改（法定姓名、出生日期、HKID、電郵）須經管理員批准。"
          />
        </p>
      </section>
    </>
  )
}
