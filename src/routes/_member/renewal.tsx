import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentProfile } from '@/hooks/use-user'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RenewalConfirmProfile } from '@/components/forms/renewal-confirm-profile'
import { RenewalForm } from '@/components/forms/renewal-form'
import type { LifecycleState } from '@/lib/constants/lifecycle-states'

type Step = 'confirm' | 'form'

export function MemberRenewalPage() {
  const { data: profile, isLoading } = useCurrentProfile()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [step, setStep] = useState<Step>('confirm')

  const saveLifecycle = useMutation({
    mutationFn: async (lifecycle_state: LifecycleState) => {
      if (!profile) throw new Error('No profile')
      const { error } = await supabase
        .from('profiles')
        .update({ lifecycle_state })
        .eq('id', profile.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      setStep('form')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Could not save lifecycle state')
    },
  })

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Loading profile...</p>
  }
  if (!profile) {
    return <p className="text-muted-foreground text-sm">Profile not found.</p>
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Renewal</h1>
        <p className="text-muted-foreground text-sm">
          Confirm your profile, then file your annual renewal.
        </p>
      </div>

      {step === 'confirm' ? (
        <RenewalConfirmProfile
          profile={profile}
          onConfirm={(data) => saveLifecycle.mutate(data.lifecycle_state)}
          onEditProfile={() => navigate('/profile')}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Renewal form</CardTitle>
            <CardDescription>
              Pre-filled from your last application. OPT hours will auto-fill from events
              once Phase 4 is live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RenewalForm
              profile={{
                id: profile.id,
                legal_name: profile.legal_name,
                email: profile.email,
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
