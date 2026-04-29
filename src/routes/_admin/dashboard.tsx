import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'

export function AdminDashboardPage() {
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
          <div className="label-small mb-4">Overview</div>
          <h1 className="title-huge">
            Admin
            <br />
            Console
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <button type="button" className="nexus-pill-outline">
            <i className="ph ph-download-simple" aria-hidden="true" />
            <span>Export</span>
          </button>
          <Link to="/admin/firm-applications" className="nexus-pill-primary">
            <i className="ph ph-list-checks text-lg" aria-hidden="true" />
            <span>Open queue</span>
          </Link>
        </div>
      </header>

      {/* KPIs + tier distribution */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex flex-col justify-between">
          <div className="mb-12 flex gap-16">
            <div className="flex flex-col">
              <span className="label-small mb-2">Pending workload</span>
              <span className="text-5xl font-light tracking-tight">{total}</span>
            </div>
            <div className="flex flex-col">
              <span className="label-small mb-2">Member approvals</span>
              <span className="text-foreground/65 text-5xl font-light tracking-tight">
                {pendingCounts.data?.approvals ?? '—'}
              </span>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="border-foreground relative h-[180px] w-full border-b">
            {[
              {
                label: 'Members',
                value: pendingCounts.data?.approvals ?? 0,
                height: 110,
              },
              { label: 'Changes', value: pendingCounts.data?.changes ?? 0, height: 65 },
              { label: 'Firms', value: pendingCounts.data?.firmApps ?? 0, height: 145 },
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
            <span className="label-small">Open work, by queue</span>
            <span className="label-small">Live</span>
          </div>
        </section>

        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">Queue distribution</div>
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
                Members
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="mb-1 text-3xl font-light">
                {pendingCounts.data?.changes ?? 0}
              </span>
              <span className="label-small flex items-center gap-2">
                <span className="prop-vertical border-foreground/25 h-2 w-2 border" />
                Changes
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-foreground/65 mb-1 text-3xl font-light">
                {pendingCounts.data?.firmApps ?? 0}
              </span>
              <span className="label-small flex items-center gap-2">
                <span className="prop-fine-vertical border-foreground/25 h-2 w-2 border" />
                Firms
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Queue list */}
      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">Queue</span>
          <span className="label-small">Pending</span>
          <span className="label-small">Description</span>
          <span className="label-small">Status</span>
          <span className="label-small text-right">Action</span>
        </div>

        <QueueRow
          name="Member approvals"
          count={pendingCounts.data?.approvals ?? 0}
          description="New member registrations awaiting review"
          to="/admin/approvals"
          variant="solid"
        />
        <QueueRow
          name="Profile changes"
          count={pendingCounts.data?.changes ?? 0}
          description="Critical-field change requests"
          to="/admin/profile-changes"
          variant="hatched"
        />
        <QueueRow
          name="Firm applications"
          count={pendingCounts.data?.firmApps ?? 0}
          description="Firm onboarding (WF1)"
          to="/admin/firm-applications"
          variant="outline"
          last
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
}: {
  name: string
  count: number
  description: string
  to: string
  variant: 'solid' | 'hatched' | 'outline'
  last?: boolean
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
        <span className="text-foreground/65 text-xs">Click to open queue</span>
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
          {count > 0 ? 'Pending' : 'Clear'}
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
