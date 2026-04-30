import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useCurrentProfile } from '@/hooks/use-user'
import { type AccountStatus } from '@/lib/constants/account-statuses'
import { Tr, useTr } from '@/components/ui/tr'

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

const STATUS_VARIANT: Record<
  AccountStatus,
  { variant: 'solid' | 'hatched' | 'outline'; en: string; zh: string }
> = {
  active: { variant: 'solid', en: 'Active', zh: '啟用中' },
  pending_email_verify: { variant: 'hatched', en: 'Pending verify', zh: '待驗證' },
  pending_pwma_approval: { variant: 'hatched', en: 'Pending review', zh: '待審核' },
  suspended: { variant: 'outline', en: 'Suspended', zh: '已停用' },
}

export function FirmEmployeesPage() {
  const { data: profile } = useCurrentProfile()
  const t = useTr()

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

  const total = employees.data?.length ?? 0
  const active =
    employees.data?.filter((e) => e.profile?.account_status === 'active').length ?? 0

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">
            <Tr en="Firm overview" zh="機構概覽" />
          </div>
          <h1 className="title-huge">
            <Tr
              en={
                <>
                  Employees
                  <br />
                  Directory
                </>
              }
              zh={
                <>
                  員工
                  <br />
                  名冊
                </>
              }
            />
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <button type="button" className="nexus-pill-outline">
            <i className="ph ph-download-simple" aria-hidden="true" />
            <Tr en="Export" zh="匯出" />
          </button>
          <button type="button" className="nexus-pill-primary">
            <i className="ph ph-plus-circle text-lg" aria-hidden="true" />
            <Tr en="Invite member" zh="邀請會員" />
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Total linked" zh="已連結總數" />
            </span>
            <span className="text-5xl font-light tracking-tight">{total}</span>
          </div>
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Active accounts" zh="啟用帳戶" />
            </span>
            <span className="text-foreground/65 text-5xl font-light tracking-tight">
              {active}
            </span>
          </div>
        </section>
        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">
            <Tr en="Coverage" zh="覆蓋率" />
          </div>
          <div className="flex h-[60px] w-full">
            <div
              className="prop-solid h-full"
              style={{
                width: `${total === 0 ? 0 : (active / total) * 100}%`,
              }}
            />
            <div className="prop-fine-vertical h-full flex-grow" />
          </div>
        </section>
      </div>

      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">
            <Tr en="Member details" zh="會員資料" />
          </span>
          <span className="label-small">
            <Tr en="Role" zh="職位" />
          </span>
          <span className="label-small">
            <Tr en="Linked since" zh="連結日期" />
          </span>
          <span className="label-small">
            <Tr en="Status" zh="狀態" />
          </span>
          <span className="label-small text-right">
            <Tr en="Action" zh="操作" />
          </span>
        </div>

        {employees.isLoading && (
          <p className="text-foreground/65 py-8 text-sm">
            <Tr en="Loading..." zh="載入中..." />
          </p>
        )}
        {!employees.isLoading && total === 0 && (
          <p className="text-foreground/65 py-8 text-sm">
            <Tr en="No employees linked yet." zh="尚未連結任何員工。" />
          </p>
        )}

        {employees.data?.map((e, idx) => {
          const statusInfo = e.profile
            ? STATUS_VARIANT[e.profile.account_status]
            : { variant: 'outline' as const, en: '—', zh: '—' }
          const last = idx === total - 1
          return (
            <div
              key={e.id}
              className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} group hover:bg-foreground/[0.03] relative -mx-4 px-4 transition-colors`}
            >
              {idx === 0 && (
                <div className="bg-foreground absolute top-1/2 left-0 h-1/2 w-[3px] -translate-y-1/2" />
              )}
              <div className="flex flex-col gap-1 pl-4">
                <span className="text-[1.1rem] font-medium tracking-tight">
                  {e.profile?.legal_name ?? '—'}
                </span>
                <span className="text-foreground/65 font-mono text-xs">
                  {e.profile?.email ?? '—'}
                </span>
              </div>
              <div>
                <span className="value-medium capitalize">{e.role_in_firm}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[0.95rem]">{e.start_date}</span>
                <span className="text-foreground/50 text-xs">
                  {e.end_date
                    ? `${t('Ended', '已結束')} ${e.end_date}`
                    : t('Active link', '連結中')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`status-square status-${statusInfo.variant}`} />
                <span className="text-foreground/80 text-[0.9rem] tracking-wide">
                  <Tr en={statusInfo.en} zh={statusInfo.zh} />
                </span>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  className="border-foreground/25 hover:border-foreground inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
                >
                  <i className="ph ph-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>
          )
        })}
      </section>
    </>
  )
}
