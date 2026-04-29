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
import { ACCOUNT_STATUS_LABELS } from '@/lib/constants/account-statuses'
import { ROLE_LABELS } from '@/lib/constants/roles'
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

const CRITICAL_FIELD_LABELS: Record<CriticalField, string> = {
  legal_name: 'Legal name',
  date_of_birth: 'Date of birth',
  hkid: 'HKID',
  email: 'Email',
}

export function MemberProfilePage() {
  const { data: profile, isLoading } = useCurrentProfile()

  if (isLoading) {
    return <div className="text-foreground/65 py-12 text-sm">Loading profile...</div>
  }
  if (!profile) {
    return (
      <div className="max-w-md py-12">
        <div className="label-small mb-3">Notice</div>
        <h2 className="title-medium mb-3">Profile not yet provisioned</h2>
        <p className="text-foreground/65 text-sm">
          Your registration may still be processing. Refresh the page in a moment, or
          contact PWMA admin if this persists.
        </p>
      </div>
    )
  }

  return (
    <>
      <header className="mb-16 flex items-end justify-between">
        <div>
          <div className="label-small mb-4">Member</div>
          <h1 className="title-huge">My profile</h1>
        </div>
      </header>

      {/* Status block */}
      <div className="mb-20 grid grid-cols-12 gap-16">
        <section className="col-span-7 flex gap-16">
          <div className="flex flex-col">
            <span className="label-small mb-2">Account status</span>
            <span className="text-3xl font-light tracking-tight">
              {ACCOUNT_STATUS_LABELS[profile.account_status]}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="label-small mb-2">Role</span>
            <span className="text-foreground/65 text-3xl font-light tracking-tight">
              {ROLE_LABELS[profile.role]}
            </span>
          </div>
        </section>
      </div>

      {/* Critical fields (protected) */}
      <section className="mb-16">
        <div className="border-foreground mb-2 flex items-end justify-between border-b pb-4">
          <div>
            <div className="label-small mb-1">Identity (protected)</div>
            <h2 className="title-medium">Critical fields</h2>
          </div>
          <span className="text-foreground/65 text-xs">
            Changes need PWMA admin approval
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
      toast.success('Change request submitted. PWMA will review.')
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
      toast.error(error.message || 'Request failed')
    },
  })

  return (
    <div
      className={`grid grid-cols-[200px_1fr_auto] items-center gap-6 py-5 ${last ? '' : 'border-foreground/10 border-b'}`}
    >
      <div>
        <span className="label-small">{CRITICAL_FIELD_LABELS[field]}</span>
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
            Request change
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request change: {CRITICAL_FIELD_LABELS[field]}</DialogTitle>
            <DialogDescription>
              PWMA will review your request. You can keep using the system while you wait.
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
                    <FormLabel className="label-small">New value</FormLabel>
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
                    <FormLabel className="label-small">Reason (optional)</FormLabel>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="nexus-pill-primary disabled:opacity-50"
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit request'}
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
      toast.success('Profile updated')
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Update failed')
    },
  })

  return (
    <section>
      <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
        <div>
          <div className="label-small mb-1">Editable</div>
          <h2 className="title-medium">Contact details</h2>
        </div>
        <span className="text-foreground/65 text-xs">Saved instantly</span>
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
                <FormLabel className="label-small">Phone</FormLabel>
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
                <FormLabel className="label-small">Address</FormLabel>
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
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </Form>
    </section>
  )
}
