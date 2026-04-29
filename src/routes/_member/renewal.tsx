import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentProfile } from '@/hooks/use-user'
import { supabase } from '@/lib/supabase/client'
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
    return <p className="text-foreground/65 py-12 text-sm">Loading profile...</p>
  }
  if (!profile) {
    return (
      <div className="max-w-md py-12">
        <div className="label-small mb-3">Notice</div>
        <h2 className="title-medium mb-3">Profile not yet provisioned</h2>
        <p className="text-foreground/65 text-sm">
          Refresh in a moment, or contact PWMA admin if this persists.
        </p>
      </div>
    )
  }

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">WF3</div>
          <h1 className="title-huge">
            Annual
            <br />
            Renewal
          </h1>
        </div>
      </header>

      {/* Step indicator */}
      <div className="mb-12 flex items-center gap-3">
        <span
          className={`status-square ${step === 'confirm' ? 'status-solid' : 'status-outline'}`}
        />
        <span className="label-small">1. Confirm profile</span>
        <span className="bg-foreground/15 mx-3 h-px flex-1" />
        <span
          className={`status-square ${step === 'form' ? 'status-solid' : 'status-outline'}`}
        />
        <span className="label-small">2. File renewal</span>
      </div>

      <div className="max-w-3xl">
        {step === 'confirm' ? (
          <RenewalConfirmProfile
            profile={profile}
            onConfirm={(data) => saveLifecycle.mutate(data.lifecycle_state)}
            onEditProfile={() => navigate('/profile')}
          />
        ) : (
          <section>
            <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
              <div>
                <div className="label-small mb-1">Step 2</div>
                <h2 className="title-medium">Renewal form</h2>
              </div>
              <span className="text-foreground/65 text-xs">
                Auto-filled from last application
              </span>
            </div>
            <RenewalForm
              profile={{
                id: profile.id,
                legal_name: profile.legal_name,
                email: profile.email,
              }}
            />
          </section>
        )}
      </div>
    </>
  )
}
