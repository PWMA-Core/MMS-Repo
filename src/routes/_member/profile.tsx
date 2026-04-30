import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useCurrentProfile } from '@/hooks/use-user'
import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import {
  CRITICAL_FIELDS,
  nonCriticalProfileSchema,
  profileChangeRequestSchema,
  type NonCriticalProfileInput,
  type ProfileChangeRequestInput,
  type CriticalField,
} from '@/lib/validators/profile'
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_LABELS_ZH,
} from '@/lib/constants/account-statuses'
import { ROLE_LABELS, ROLE_LABELS_ZH } from '@/lib/constants/roles'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tr, useTr } from '@/components/ui/tr'

const CRITICAL_FIELD_LABELS: Record<CriticalField, { en: string; zh: string }> = {
  legal_name: { en: 'Legal name', zh: '法定姓名' },
  date_of_birth: { en: 'Date of birth', zh: '出生日期' },
  hkid: { en: 'HKID', zh: 'HKID' },
  email: { en: 'Email', zh: '電郵' },
}

export function MemberProfilePage() {
  const { data: profile, isLoading } = useCurrentProfile()
  const t = useTr()

  if (isLoading) {
    return (
      <div className="text-foreground/65 py-12 text-sm">
        {t('Loading profile...', '載入資料中...')}
      </div>
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
            en="Your registration may still be processing. Refresh the page in a moment, or contact PWMA admin if this persists."
            zh="你的註冊可能仍在處理中，請稍後重新整理頁面。如問題持續，請聯絡 PWMA 管理員。"
          />
        </p>
      </div>
    )
  }

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">
            <Tr en="Member" zh="會員" />
          </div>
          <h1 className="title-huge">
            <Tr en="My profile" zh="我的資料" />
          </h1>
        </div>
      </header>

      {/* Status block */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Account status" zh="帳戶狀態" />
            </span>
            <span className="text-3xl font-light tracking-tight">
              <Tr
                en={ACCOUNT_STATUS_LABELS[profile.account_status]}
                zh={ACCOUNT_STATUS_LABELS_ZH[profile.account_status]}
              />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="label-small mb-2">
              <Tr en="Role" zh="角色" />
            </span>
            <span className="text-foreground/65 text-3xl font-light tracking-tight">
              <Tr en={ROLE_LABELS[profile.role]} zh={ROLE_LABELS_ZH[profile.role]} />
            </span>
          </div>
        </section>
      </div>

      {/* Critical fields (protected) */}
      <section className="mb-16">
        <div className="border-foreground mb-2 flex items-end justify-between border-b pb-4">
          <div>
            <div className="label-small mb-1">
              <Tr en="Identity (protected)" zh="身份（受保護）" />
            </div>
            <h2 className="title-medium">
              <Tr en="Critical fields" zh="受保護資料" />
            </h2>
          </div>
          <span className="text-foreground/65 text-xs">
            <Tr en="Changes need PWMA admin approval" zh="修改須經 PWMA 管理員批准" />
          </span>
        </div>

        <div className="flex flex-col">
          {CRITICAL_FIELDS.map((field, idx) => {
            const value =
              field === 'date_of_birth'
                ? (profile.date_of_birth ?? '—')
                : field === 'legal_name'
                  ? profile.legal_name
                  : field === 'hkid'
                    ? profile.hkid
                    : profile.email
            const last = idx === CRITICAL_FIELDS.length - 1
            return (
              <CriticalFieldRow
                key={field}
                profileId={profile.id}
                profileEmail={profile.email}
                profileName={profile.legal_name}
                field={field}
                currentValue={value ?? ''}
                last={last}
              />
            )
          })}
        </div>
      </section>

      {/* Non-critical contact */}
      <NonCriticalFieldsForm profile={profile} />
    </>
  )
}

function CriticalFieldRow({
  profileId,
  profileEmail,
  profileName,
  field,
  currentValue,
  last,
}: {
  profileId: string
  profileEmail: string
  profileName: string
  field: CriticalField
  currentValue: string
  last?: boolean
}) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()
  const t = useTr()

  const form = useForm<ProfileChangeRequestInput>({
    resolver: zodResolver(profileChangeRequestSchema),
    defaultValues: {
      field_name: field,
      new_value: '',
      note: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: ProfileChangeRequestInput) => {
      const { error } = await supabase.from('profile_change_requests').insert({
        profile_id: profileId,
        field_name: values.field_name,
        old_value: currentValue,
        new_value: values.new_value,
        note: values.note ?? null,
      })
      if (error) throw error
    },
    onSuccess: (_data, submitted) => {
      toast.success(
        t(
          'Change request submitted. PWMA will review.',
          '修改申請已提交，PWMA 將進行審核。',
        ),
      )
      dispatchNotificationAsync({
        to_email: profileEmail,
        to_profile_id: profileId,
        template_key: 'profile_change_submitted',
        payload: {
          legal_name: profileName,
          field_name: submitted.field_name,
          new_value: submitted.new_value,
        },
      })
      setOpen(false)
      form.reset()
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Request failed', '申請失敗'))
    },
  })

  const fieldLabel = CRITICAL_FIELD_LABELS[field]

  return (
    <div
      className={`grid grid-cols-[200px_1fr_auto] items-center gap-6 py-5 ${last ? '' : 'border-foreground/10 border-b'}`}
    >
      <div>
        <span className="label-small">
          <Tr en={fieldLabel.en} zh={fieldLabel.zh} />
        </span>
      </div>
      <div>
        <span className="text-[1.05rem] font-medium tracking-tight">
          {currentValue || '—'}
        </span>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className="border-foreground/25 hover:border-foreground rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide transition-colors"
          >
            <Tr en="Request change" zh="申請修改" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <Tr
                en={`Request change: ${fieldLabel.en}`}
                zh={`申請修改：${fieldLabel.zh}`}
              />
            </DialogTitle>
            <DialogDescription>
              <Tr
                en="PWMA will review your request. You can keep using the system while you wait."
                zh="PWMA 會審核你的申請，等待期間你可正常使用系統。"
              />
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="new_value"
                render={({ field: ff }) => (
                  <FormItem>
                    <FormLabel className="label-small">
                      <Tr en="New value" zh="新內容" />
                    </FormLabel>
                    <FormControl>
                      <Input className="h-11 rounded-xl" {...ff} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field: ff }) => (
                  <FormItem>
                    <FormLabel className="label-small">
                      <Tr en="Reason (optional)" zh="原因（選填）" />
                    </FormLabel>
                    <FormControl>
                      <Input className="h-11 rounded-xl" {...ff} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="nexus-pill-outline"
                >
                  <Tr en="Cancel" zh="取消" />
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="nexus-pill-primary disabled:opacity-50"
                >
                  {mutation.isPending ? (
                    <Tr en="Submitting..." zh="提交中..." />
                  ) : (
                    <Tr en="Submit request" zh="提交申請" />
                  )}
                </button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NonCriticalFieldsForm({
  profile,
}: {
  profile: {
    id: string
    phone: string | null
    address: string | null
  }
}) {
  const qc = useQueryClient()
  const t = useTr()
  const form = useForm<NonCriticalProfileInput>({
    resolver: zodResolver(nonCriticalProfileSchema),
    defaultValues: {
      phone: profile.phone ?? '',
      address: profile.address ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: NonCriticalProfileInput) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          phone: values.phone || null,
          address: values.address || null,
        })
        .eq('id', profile.id)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success(t('Profile updated', '資料已更新'))
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Update failed', '更新失敗'))
    },
  })

  return (
    <section>
      <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
        <div>
          <div className="label-small mb-1">
            <Tr en="Editable" zh="可自行修改" />
          </div>
          <h2 className="title-medium">
            <Tr en="Contact details" zh="聯絡資料" />
          </h2>
        </div>
        <span className="text-foreground/65 text-xs">
          <Tr en="Saved instantly" zh="即時儲存" />
        </span>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="max-w-2xl space-y-6"
        >
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label-small">
                  <Tr en="Phone" zh="電話" />
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-foreground/15 h-12 rounded-xl text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label-small">
                  <Tr en="Address" zh="地址" />
                </FormLabel>
                <FormControl>
                  <Input
                    className="border-foreground/15 h-12 rounded-xl text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <button
            type="submit"
            disabled={mutation.isPending}
            className="nexus-pill-primary disabled:opacity-50"
          >
            <i className="ph ph-floppy-disk text-base" aria-hidden="true" />
            {mutation.isPending ? (
              <Tr en="Saving..." zh="儲存中..." />
            ) : (
              <Tr en="Save changes" zh="儲存" />
            )}
          </button>
        </form>
      </Form>
    </section>
  )
}
