import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_LABELS_ZH,
} from '@/lib/constants/account-statuses'
import {
  LIFECYCLE_STATE_LABELS,
  LIFECYCLE_STATE_LABELS_ZH,
  type LifecycleState,
} from '@/lib/constants/lifecycle-states'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tr, useTr } from '@/components/ui/tr'

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
  const t = useTr()
  const [lifecycleState, setLifecycleState] = useState<LifecycleState>(
    profile.lifecycle_state ?? 'employee',
  )

  return (
    <section>
      <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
        <div>
          <div className="label-small mb-1">
            <Tr en="Step 1" zh="第一步" />
          </div>
          <h2 className="title-medium">
            <Tr en="Confirm your profile" zh="確認個人資料" />
          </h2>
        </div>
        <span className="text-foreground/65 text-xs">
          <Tr
            en="Critical fields need PWMA approval to change"
            zh="受保護欄位需經 PWMA 批准方可修改"
          />
        </span>
      </div>

      <div className="mb-12 flex flex-col">
        <Row label={t('Legal name', '法定姓名')} value={profile.legal_name} />
        <Row label={t('Email', '電郵')} value={profile.email} />
        <Row label={t('Phone', '電話')} value={profile.phone ?? '—'} />
        <Row label={t('Address', '地址')} value={profile.address ?? '—'} />
        <Row
          label={t('Account status', '帳戶狀態')}
          value={t(
            ACCOUNT_STATUS_LABELS[profile.account_status],
            ACCOUNT_STATUS_LABELS_ZH[profile.account_status],
          )}
        />
      </div>

      <div className="mb-12 max-w-md space-y-3">
        <label className="label-small block">
          <Tr en="Current lifecycle state" zh="目前生命週期狀態" />
        </label>
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
                <Tr en={LIFECYCLE_STATE_LABELS[s]} zh={LIFECYCLE_STATE_LABELS_ZH[s]} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-foreground/50 text-xs leading-relaxed">
          <Tr
            en="Members transition between Employee, Unemployed, and General public."
            zh="會員狀態可在在職、失業及一般公眾之間切換。"
          />
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
          <Tr en="Confirm and continue" zh="確認並繼續" />
        </button>
        <button type="button" onClick={onEditProfile} className="nexus-pill-outline">
          <i className="ph ph-pencil-line text-base" aria-hidden="true" />
          <Tr en="Edit profile first" zh="先修改資料" />
        </button>
      </div>
    </section>
  )
}
