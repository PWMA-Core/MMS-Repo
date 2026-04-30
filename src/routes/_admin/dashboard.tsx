import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Tr, useTr } from '@/components/ui/tr'

export function AdminDashboardPage() {
  const t = useTr()
  const pendingCounts = useQuery({
    queryKey: ['admin', 'dashboard-counts'],
    queryFn: async () => {
      const [approvals, changes, firmApps] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('account_status', 'pending_pwma_approval'),
        supabase
          .from('profile_change_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase
          .from('firm_applications')
          .select('id', { count: 'exact', head: true })
          .in('status', ['submitted', 'pending_director_review', 'pending_approval']),
      ])
      return {
        approvals: approvals.count ?? 0,
        changes: changes.count ?? 0,
        firmApps: firmApps.count ?? 0,
      }
    },
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
  })

  const total =
    (pendingCounts.data?.approvals ?? 0) +
    (pendingCounts.data?.changes ?? 0) +
    (pendingCounts.data?.firmApps ?? 0)

  return (
    <>
      {/* Header */}
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">
            <Tr en="Overview" zh="概覽" />
          </div>
          <h1 className="title-huge">
            <Tr
              en={
                <>
                  Admin
                  <br />
                  Console
                </>
              }
              zh={
                <>
                  管理員
                  <br />
                  控制台
                </>
              }
            />
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <button type="button" className="nexus-pill-outline">
            <i className="ph ph-download-simple" aria-hidden="true" />
            <span>
              <Tr en="Export" zh="匯出" />
            </span>
          </button>
          <Link to="/admin/firm-applications" className="nexus-pill-primary">
            <i className="ph ph-list-checks text-lg" aria-hidden="true" />
            <span>
              <Tr en="Open queue" zh="開啟佇列" />
            </span>
          </Link>
        </div>
      </header>

      {/* KPIs + tier distribution */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex flex-col justify-between">
          <div className="mb-12 flex gap-16">
            <div className="flex flex-col">
              <span className="label-small mb-2">
                <Tr en="Pending workload" zh="待處理工作" />
              </span>
              <span className="text-5xl font-light tracking-tight">{total}</span>
            </div>
            <div className="flex flex-col">
              <span className="label-small mb-2">
                <Tr en="Member approvals" zh="會員審批" />
              </span>
              <span className="text-foreground/65 text-5xl font-light tracking-tight">
                {pendingCounts.data?.approvals ?? '—'}
              </span>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="border-foreground relative h-[180px] w-full border-b">
            {[
              {
                label: t('Members', '會員'),
                value: pendingCounts.data?.approvals ?? 0,
                height: 110,
              },
              {
                label: t('Changes', '修改'),
                value: pendingCounts.data?.changes ?? 0,
                height: 65,
              },
              {
                label: t('Firms', '機構'),
                value: pendingCounts.data?.firmApps ?? 0,
                height: 145,
              },
            ].map((bar, i) => (
              <div
                key={bar.label}
                className="absolute bottom-0 flex flex-col items-start"
                style={{ left: `${i * 30 + 5}%` }}
              >
                <div className="mb-2 translate-x-[6px] text-sm font-medium tracking-tight">
                  {bar.value}
                </div>
                <div
                  className="bg-foreground mb-2 w-px"
                  style={{ height: `${bar.height}px` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex w-full justify-between">
            <span className="label-small">
              <Tr en="Open work, by queue" zh="各佇列未處理工作" />
            </span>
            <span className="label-small">
              <Tr en="Live" zh="即時" />
            </span>
          </div>
        </section>

        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">
            <Tr en="Queue distribution" zh="佇列分布" />
          </div>
          <div className="mb-8 flex h-[90px] w-full">
            <div
              className="prop-solid h-full"
              style={{
                width: `${total === 0 ? 33 : ((pendingCounts.data?.approvals ?? 0) / total) * 100}%`,
              }}
            />
            <div
              className="prop-vertical h-full"
              style={{
                width: `${total === 0 ? 33 : ((pendingCounts.data?.changes ?? 0) / total) * 100}%`,
              }}
            />
            <div className="prop-fine-vertical h-full flex-grow" />
          </div>
          <div className="flex w-full justify-between">
            <div className="flex flex-col">
              <span className="mb-1 text-3xl font-light">
                {pendingCounts.data?.approvals ?? 0}
              </span>
              <span className="label-small flex items-center gap-2">
                <span className="bg-foreground h-2 w-2 rounded-full" />
                <Tr en="Members" zh="會員" />
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-3xl font-light">
                {pendingCounts.data?.changes ?? 0}
              </span>
              <span className="label-small flex items-center gap-2">
                <span className="prop-vertical border-foreground/25 h-2 w-2 border" />
                <Tr en="Changes" zh="修改" />
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-foreground/65 mb-1 text-3xl font-light">
                {pendingCounts.data?.firmApps ?? 0}
              </span>
              <span className="label-small flex items-center gap-2">
                <span className="prop-fine-vertical border-foreground/25 h-2 w-2 border" />
                <Tr en="Firms" zh="機構" />
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Queue list */}
      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">
            <Tr en="Queue" zh="佇列" />
          </span>
          <span className="label-small">
            <Tr en="Pending" zh="待處理" />
          </span>
          <span className="label-small">
            <Tr en="Description" zh="說明" />
          </span>
          <span className="label-small">
            <Tr en="Status" zh="狀態" />
          </span>
          <span className="label-small text-right">
            <Tr en="Action" zh="操作" />
          </span>
        </div>

        <QueueRow
          name={t('Member approvals', '會員審批')}
          count={pendingCounts.data?.approvals ?? 0}
          description={t(
            'New member registrations awaiting review',
            '待審核的新會員申請',
          )}
          to="/admin/approvals"
          variant="solid"
          clickLabel={t('Click to open queue', '點擊開啟佇列')}
          pendingLabel={t('Pending', '待審批')}
          clearLabel={t('Clear', '已清')}
        />
        <QueueRow
          name={t('Profile changes', '資料修改申請')}
          count={pendingCounts.data?.changes ?? 0}
          description={t('Critical-field change requests', '受保護欄位修改申請')}
          to="/admin/profile-changes"
          variant="hatched"
          clickLabel={t('Click to open queue', '點擊開啟佇列')}
          pendingLabel={t('Pending', '待審批')}
          clearLabel={t('Clear', '已清')}
        />
        <QueueRow
          name={t('Firm applications', '機構申請')}
          count={pendingCounts.data?.firmApps ?? 0}
          description={t('Firm onboarding (WF1)', '機構入會申請 (WF1)')}
          to="/admin/firm-applications"
          variant="outline"
          last
          clickLabel={t('Click to open queue', '點擊開啟佇列')}
          pendingLabel={t('Pending', '待審批')}
          clearLabel={t('Clear', '已清')}
        />
      </section>
    </>
  )
}

function QueueRow({
  name,
  count,
  description,
  to,
  variant,
  last = false,
  clickLabel,
  pendingLabel,
  clearLabel,
}: {
  name: string
  count: number
  description: string
  to: string
  variant: 'solid' | 'hatched' | 'outline'
  last?: boolean
  clickLabel: string
  pendingLabel: string
  clearLabel: string
}) {
  const statusClass =
    variant === 'solid'
      ? 'status-solid'
      : variant === 'hatched'
        ? 'status-hatched'
        : 'status-outline'
  return (
    <Link
      to={to}
      className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} group hover:bg-foreground/[0.03] relative -mx-4 cursor-pointer px-4 transition-colors`}
    >
      <div className="flex flex-col gap-1 pl-4">
        <span className="text-[1.1rem] font-medium tracking-tight">{name}</span>
        <span className="text-foreground/65 text-xs">{clickLabel}</span>
      </div>
      <div>
        <span className="value-medium">{count}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[0.95rem]">{description}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`status-square ${statusClass}`} />
        <span className="text-foreground/80 text-[0.9rem] tracking-wide">
          {count > 0 ? pendingLabel : clearLabel}
        </span>
      </div>
      <div className="text-right">
        <span className="border-foreground/25 group-hover:border-foreground inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
          <i className="ph ph-arrow-right" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
