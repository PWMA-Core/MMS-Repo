import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
 * Prevents the profile-mismatch pain point the previous MS/CPWP split
 * created.
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

export function RenewalConfirmProfile({ profile, onConfirm, onEditProfile }: Props) {
  const qc = useQueryClient()
  const [lifecycleState, setLifecycleState] = useState<LifecycleState>(
    profile.lifecycle_state ?? 'employee',
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm your profile</CardTitle>
        <CardDescription>
          Before you renew, please confirm your details are correct. You can edit
          non-critical fields (phone, address) directly. Critical fields (name, HKID, DOB,
          email) require PWMA approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-[160px_1fr] gap-y-2">
          <span className="text-muted-foreground">Legal name</span>
          <span>{profile.legal_name}</span>
          <span className="text-muted-foreground">Email</span>
          <span>{profile.email}</span>
          <span className="text-muted-foreground">Phone</span>
          <span>{profile.phone ?? '—'}</span>
          <span className="text-muted-foreground">Address</span>
          <span>{profile.address ?? '—'}</span>
          <span className="text-muted-foreground">Account status</span>
          <span>{ACCOUNT_STATUS_LABELS[profile.account_status]}</span>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">Current status</p>
          <Select
            value={lifecycleState}
            onValueChange={(v) => setLifecycleState(v as LifecycleState)}
          >
            <SelectTrigger className="w-full">
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
          <p className="text-muted-foreground text-xs">
            Per Rachel, members transition Employee ↔ Unemployed ↔ General public.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button
            onClick={() => {
              qc.invalidateQueries({ queryKey: ['profile'] })
              onConfirm({ lifecycle_state: lifecycleState })
            }}
          >
            Confirm and continue
          </Button>
          <Button variant="outline" onClick={onEditProfile}>
            Edit profile first
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
