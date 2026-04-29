import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ACCOUNT_STATUS_LABELS } from '@/lib/constants/account-statuses'
import {
  LIFECYCLE_STATE_LABELS,
  type LifecycleState,
} from '@/lib/constants/lifecycle-states'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/**
 * Profile-confirm gate per design spec. Members must reconfirm their
 * employer, contact, and lifecycle state before a renewal form opens.
 */

interface Props {
  profile: {
    legal_name: string
    email: string
    phone: string | null
    address: string | null
    lifecycle_state: LifecycleState | null
    account_status: keyof typeof ACCOUNT_STATUS_LABELS
  }
  onConfirm: (data: { lifecycle_state: LifecycleState }) => void
  onEditProfile: () => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-foreground/10 grid grid-cols-[180px_1fr] items-center gap-6 border-b py-4">
      <span className="label-small">{label}</span>
      <span className="text-[1.05rem] font-medium tracking-tight">{value}</span>
    </div>
  )
}

export function RenewalConfirmProfile({ profile, onConfirm, onEditProfile }: Props) {
  const qc = useQueryClient()
  const [lifecycleState, setLifecycleState] = useState<LifecycleState>(
    profile.lifecycle_state ?? 'employee',
  )

  return (
    <section>
      <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
        <div>
          <div className="label-small mb-1">Step 1</div>
          <h2 className="title-medium">Confirm your profile</h2>
        </div>
        <span className="text-foreground/65 text-xs">
          Critical fields need PWMA approval to change
        </span>
      </div>

      <div className="mb-12 flex flex-col">
        <Row label="Legal name" value={profile.legal_name} />
        <Row label="Email" value={profile.email} />
        <Row label="Phone" value={profile.phone ?? '—'} />
        <Row label="Address" value={profile.address ?? '—'} />
        <Row
          label="Account status"
          value={ACCOUNT_STATUS_LABELS[profile.account_status]}
        />
      </div>

      <div className="mb-12 max-w-md space-y-3">
        <label className="label-small block">Current lifecycle state</label>
        <Select
          value={lifecycleState}
          onValueChange={(v) => setLifecycleState(v as LifecycleState)}
        >
          <SelectTrigger className="border-foreground/15 h-12 w-full rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(LIFECYCLE_STATE_LABELS) as LifecycleState[]).map((s) => (
              <SelectItem key={s} value={s}>
                {LIFECYCLE_STATE_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-foreground/50 text-xs leading-relaxed">
          Members transition between Employee, Unemployed, and General public.
        </p>
      </div>

      <div className="border-foreground/10 flex flex-wrap items-center gap-3 border-t pt-4">
        <button
          type="button"
          onClick={() => {
            qc.invalidateQueries({ queryKey: ['profile'] })
            onConfirm({ lifecycle_state: lifecycleState })
          }}
          className="nexus-pill-primary"
        >
          <i className="ph ph-arrow-right text-base" aria-hidden="true" />
          Confirm and continue
        </button>
        <button type="button" onClick={onEditProfile} className="nexus-pill-outline">
          <i className="ph ph-pencil-line text-base" aria-hidden="true" />
          Edit profile first
        </button>
      </div>
    </section>
  )
}
