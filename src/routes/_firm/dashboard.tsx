import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useCurrentProfile } from '@/hooks/use-user'
import type { Database } from '@/types/database'
import { Tr, useTr } from '@/components/ui/tr'

type FirmMembership = Database['public']['Tables']['firm_memberships']['Row']
type MemberFirm = Database['public']['Tables']['member_firms']['Row']

interface EmployeeJoinRow {
  id: string
  role_in_firm: 'admin' | 'employee'
  start_date: string
  end_date: string | null
  profile: {
    id: string
    legal_name: string
    email: string
    account_status: string
  } | null
}

export function FirmAdminDashboardPage() {
  const { data: profile } = useCurrentProfile()
  const t = useTr()

  const firm = useQuery({
    queryKey: ['firm-admin', 'my-firm', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data: membership, error: mError } = await supabase
        .from('firm_memberships')
        .select('*')
        .eq('profile_id', profile!.id)
        .eq('role_in_firm', 'admin')
        .is('end_date', null)
        .maybeSingle()
      if (mError) throw mError
      if (!membership) return null
      const { data: firmRow, error: fError } = await supabase
        .from('member_firms')
        .select('*')
        .eq('id', (membership as FirmMembership).firm_id)
        .single()
      if (fError) throw fError
      return firmRow as MemberFirm
    },
  })

  const employees = useQuery<EmployeeJoinRow[]>({
    queryKey: ['firm-admin', 'employees', firm.data?.id],
    enabled: !!firm.data?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('firm_memberships')
        .select(
          `id, role_in_firm, start_date, end_date,
           profile:profiles(id, legal_name, email, account_status)`,
        )
        .eq('firm_id', firm.data!.id)
        .is('end_date', null)
      if (error) throw error
      return (data ?? []) as unknown as EmployeeJoinRow[]
    },
  })

  const employeeCount = employees.data?.length ?? 0
  const activeCount =
    employees.data?.filter((r) => r.profile?.account_status === 'active').length ?? 0

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">
            <Tr en="Firm overview" zh="機構概覽" />
          </div>
          <h1 className="title-huge">{firm.data?.name ?? t('Firm', '機構')}</h1>
        </div>
        <div className="mb-2 flex gap-4">
          <Link to="/firm/employees" className="nexus-pill-outline">
            <i className="ph ph-users" aria-hidden="true" />
            <Tr en="Employees" zh="員工" />
          </Link>
          <Link to="/profile" className="nexus-pill-primary">
            <i className="ph ph-user text-lg" aria-hidden="true" />
            <Tr en="My profile" zh="我的資料" />
          </Link>
        </div>
      </header>

      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex flex-col">
          <div className="mb-12 flex gap-16">
            <div className="flex flex-col">
              <span className="label-small mb-2">
                <Tr en="Total employees" zh="員工總數" />
              </span>
              <span className="text-5xl font-light tracking-tight">
                {employees.isLoading ? '—' : employeeCount}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="label-small mb-2">
                <Tr en="Active accounts" zh="啟用帳戶" />
              </span>
              <span className="text-foreground/65 text-5xl font-light tracking-tight">
                {employees.isLoading ? '—' : activeCount}
              </span>
            </div>
          </div>

          <div className="border-foreground flex h-[180px] w-full items-end border-b">
            <div
              className="prop-solid"
              style={{
                width: `${employeeCount === 0 ? 0 : (activeCount / employeeCount) * 100}%`,
                height: '120px',
              }}
            />
            <div className="prop-fine-vertical flex-grow" style={{ height: '60px' }} />
          </div>
          <div className="mt-4 flex w-full justify-between">
            <span className="label-small">
              <Tr en="Coverage" zh="覆蓋率" />
            </span>
            <span className="label-small">
              {employeeCount === 0
                ? '0%'
                : `${Math.round((activeCount / employeeCount) * 100)}% ${t('active', '啟用中')}`}
            </span>
          </div>
        </section>

        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">
            <Tr en="Firm status" zh="機構狀態" />
          </div>
          {firm.isLoading ? (
            <span className="text-foreground/65 text-sm">
              <Tr en="Loading..." zh="載入中..." />
            </span>
          ) : firm.data ? (
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="label-small mb-2">
                  <Tr en="Tier" zh="級別" />
                </span>
                <span className="text-3xl font-light capitalize">
                  {firm.data.tier.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="label-small mb-2">
                  <Tr en="Status" zh="狀態" />
                </span>
                <span className="text-foreground/65 text-3xl font-light capitalize">
                  {firm.data.status}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-foreground/65 text-sm">
              <Tr en="No firm linked" zh="未連結機構" />
            </span>
          )}
        </section>
      </div>
    </>
  )
}
