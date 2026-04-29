import { Link } from 'react-router-dom'
import { useCurrentProfile } from '@/hooks/use-user'
import { ACCOUNT_STATUS_LABELS } from '@/lib/constants/account-statuses'

export function MemberDashboardPage() {
  const { data: profile, isLoading } = useCurrentProfile()

  const statusVariant: 'solid' | 'hatched' | 'outline' =
    profile?.account_status === 'active'
      ? 'solid'
      : profile?.account_status === 'pending_pwma_approval'
        ? 'hatched'
        : 'outline'

  return (
    <>
      {/* Header */}
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">Welcome</div>
          <h1 className="title-huge">
            {profile?.legal_name?.split(' ')[0] ?? 'Member'}
            <br />
            Portal
          </h1>
        </div>
        <div className="mb-2 flex gap-4">
          <Link to="/profile" className="nexus-pill-outline">
            <i className="ph ph-user" aria-hidden="true" />
            Profile
          </Link>
          <Link to="/renewal" className="nexus-pill-primary">
            <i className="ph ph-arrows-clockwise text-lg" aria-hidden="true" />
            Renew membership
          </Link>
        </div>
      </header>

      {/* Status block */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex flex-col">
          <div className="mb-12 flex gap-16">
            <div className="flex flex-col">
              <span className="label-small mb-2">Account status</span>
              <span className="text-5xl font-light tracking-tight">
                {isLoading
                  ? '—'
                  : profile?.account_status
                    ? ACCOUNT_STATUS_LABELS[profile.account_status]
                    : 'Unknown'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="label-small mb-2">Member since</span>
              <span className="text-foreground/65 text-5xl font-light tracking-tight">
                {profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'}
              </span>
            </div>
          </div>
          <p className="text-foreground/65 max-w-md text-sm leading-relaxed">
            {profile?.account_status === 'pending_pwma_approval'
              ? 'Your account is awaiting PWMA admin approval. You will receive an email once reviewed.'
              : profile?.account_status === 'active'
                ? 'Your account is active. Use the menu to update your profile or file your annual renewal.'
                : 'Welcome to the PWMA Membership system.'}
          </p>
        </section>

        <section className="col-span-5 flex flex-col justify-end">
          <div className="label-small mb-6">Membership health</div>
          <div className="mb-8 flex h-[90px] w-full">
            <div
              className={`h-full ${statusVariant === 'solid' ? 'prop-solid' : statusVariant === 'hatched' ? 'prop-vertical' : 'prop-fine-vertical'} w-full`}
            />
          </div>
          <div className="flex w-full justify-between">
            <div className="flex flex-col">
              <span className="label-small flex items-center gap-2">
                <span className={`status-square status-${statusVariant}`} />
                Status
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Quick actions */}
      <section className="mt-auto">
        <div className="list-grid border-foreground text-foreground/65 mb-2 border-b pb-4">
          <span className="label-small">Action</span>
          <span className="label-small">Type</span>
          <span className="label-small">Description</span>
          <span className="label-small">Status</span>
          <span className="label-small text-right">Open</span>
        </div>

        <ActionRow
          name="My profile"
          type="Profile"
          description="Edit non-critical fields, request changes for critical ones"
          to="/profile"
          variant="solid"
        />
        <ActionRow
          name="Annual renewal"
          type="WF3"
          description="Profile-confirm gate and renewal application"
          to="/renewal"
          variant="hatched"
          last
        />
      </section>
    </>
  )
}

function ActionRow({
  name,
  type,
  description,
  to,
  variant,
  last = false,
}: {
  name: string
  type: string
  description: string
  to: string
  variant: 'solid' | 'hatched' | 'outline'
  last?: boolean
}) {
  return (
    <Link
      to={to}
      className={`list-grid py-5 ${last ? 'border-b-0' : 'border-foreground/10 border-b'} group hover:bg-foreground/[0.03] relative -mx-4 cursor-pointer px-4 transition-colors`}
    >
      <div className="flex flex-col gap-1 pl-4">
        <span className="text-[1.1rem] font-medium tracking-tight">{name}</span>
      </div>
      <div>
        <span className="value-medium">{type}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[0.95rem]">{description}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`status-square status-${variant}`} />
        <span className="text-foreground/80 text-[0.9rem] tracking-wide">Open</span>
      </div>
      <div className="text-right">
        <span className="border-foreground/25 group-hover:border-foreground inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors">
          <i className="ph ph-arrow-right" aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}
