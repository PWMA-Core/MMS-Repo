import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useCurrentProfile } from '@/hooks/use-user'
import { type AccountStatus } from '@/lib/constants/account-statuses'

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
  { variant: 'solid' | 'hatched' | 'outline'; label: string }
> = {
  active: { variant: 'solid', label: 'Active' },
  pending_email_verify: { variant: 'hatched', label: 'Pending verify' },
  pending_pwma_approval: { variant: 'hatched', label: 'Pending review' },
  suspended: { variant: 'outline', label: 'Suspended' },
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

  const total = employees.data?.length ?? 0
  const active =
    employees.data?.filter((e) => e.profile?.account_status === 'active').length ?? 0

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">Firm overview</div>
          <h1 className="title-huge">
            Employees
            <br />
            Directory
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <button type="button" className="nexus-pill-outline">
            <i className="ph ph-download-simple" aria-hidden="true" />
            Export
          </button>
          <button type="button" className="nexus-pill-primary">
            <i className="ph ph-plus-circle text-lg" aria-hidden="true" />
            Invite member
          </button>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">Total linked</span>
            <span className="text-5xl font-light tracking-tight">{total}</span>
          </div>
          <div className="flex flex-col">
            <span className="label-small mb-2">Active accounts</span>
            <span className="text-foreground/65 text-5xl font-light tracking-tight">
              {active}
            </span>
          </div>
        </section>
        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">Coverage</div>
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
          <span className="label-small">Member details</span>
          <span className="label-small">Role</span>
          <span className="label-small">Linked since</span>
          <span className="label-small">Status</span>
          <span className="label-small text-right">Action</span>
        </div>

        {employees.isLoading && (
          <p className="text-foreground/65 py-8 text-sm">Loading...</p>
        )}
        {!employees.isLoading && total === 0 && (
          <p className="text-foreground/65 py-8 text-sm">No employees linked yet.</p>
        )}

        {employees.data?.map((e, idx) => {
          const statusInfo = e.profile
            ? STATUS_VARIANT[e.profile.account_status]
            : { variant: 'outline' as const, label: '—' }
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
                  {e.end_date ? `Ended ${e.end_date}` : 'Active link'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`status-square status-${statusInfo.variant}`} />
                <span className="text-foreground/80 text-[0.9rem] tracking-wide">
                  {statusInfo.label}
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
