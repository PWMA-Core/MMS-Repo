import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentProfile } from '@/hooks/use-user'
import { supabase } from '@/lib/supabase/client'
import { RenewalConfirmProfile } from '@/components/forms/renewal-confirm-profile'
import { RenewalForm } from '@/components/forms/renewal-form'
import type { LifecycleState } from '@/lib/constants/lifecycle-states'
import { Tr, useTr } from '@/components/ui/tr'

type Step = 'confirm' | 'form'

export function MemberRenewalPage() {
  const { data: profile, isLoading } = useCurrentProfile()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const t = useTr()
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
      toast.error(error.message || t('Could not save lifecycle state', '無法儲存狀態'))
    },
  })

  if (isLoading) {
    return (
      <p className="text-foreground/65 py-12 text-sm">
        {t('Loading profile...', '載入資料中...')}
      </p>
    )
  }
  if (!profile) {
    return (
      <div className="max-w-md py-12">
        <div className="label-small mb-3">
          <Tr en="Notice" zh="提示" />
        </div>
        <h2 className="title-medium mb-3">
          <Tr en="Profile not yet provisioned" zh="個人資料尚未建立" />
        </h2>
        <p className="text-foreground/65 text-sm">
          <Tr
            en="Refresh in a moment, or contact PWMA admin if this persists."
            zh="請稍後重新整理頁面，如問題持續請聯絡 PWMA 管理員。"
          />
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
            <Tr
              en={
                <>
                  Annual
                  <br />
                  Renewal
                </>
              }
              zh={
                <>
                  年度
                  <br />
                  續期
                </>
              }
            />
          </h1>
        </div>
      </header>

      {/* Step indicator */}
      <div className="mb-12 flex items-center gap-3">
        <span
          className={`status-square ${step === 'confirm' ? 'status-solid' : 'status-outline'}`}
        />
        <span className="label-small">
          <Tr en="1. Confirm profile" zh="1. 確認個人資料" />
        </span>
        <span className="bg-foreground/15 mx-3 h-px flex-1" />
        <span
          className={`status-square ${step === 'form' ? 'status-solid' : 'status-outline'}`}
        />
        <span className="label-small">
          <Tr en="2. File renewal" zh="2. 提交續期" />
        </span>
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
                <div className="label-small mb-1">
                  <Tr en="Step 2" zh="第二步" />
                </div>
                <h2 className="title-medium">
                  <Tr en="Renewal form" zh="續期申請表" />
                </h2>
              </div>
              <span className="text-foreground/65 text-xs">
                <Tr en="Auto-filled from last application" zh="已根據上次申請預填" />
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
