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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    return <p className="text-muted-foreground text-sm">Loading profile...</p>
  }
  if (!profile) {
    return (
      <p className="text-muted-foreground text-sm">
        Profile not found. Your registration may still be provisioning.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="text-muted-foreground text-sm">
          Account {ACCOUNT_STATUS_LABELS[profile.account_status]} ·{' '}
          {ROLE_LABELS[profile.role]}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identity (protected)</CardTitle>
          <CardDescription>
            These fields cannot be changed without PWMA admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {CRITICAL_FIELDS.map((field) => {
            const value =
              field === 'date_of_birth'
                ? (profile.date_of_birth ?? '—')
                : field === 'legal_name'
                  ? profile.legal_name
                  : field === 'hkid'
                    ? profile.hkid
                    : profile.email
            return (
              <CriticalFieldRow
                key={field}
                profileId={profile.id}
                profileEmail={profile.email}
                profileName={profile.legal_name}
                field={field}
                currentValue={value ?? ''}
              />
            )
          })}
        </CardContent>
      </Card>

      <NonCriticalFieldsForm profile={profile} />
    </div>
  )
}

function CriticalFieldRow({
  profileId,
  profileEmail,
  profileName,
  field,
  currentValue,
}: {
  profileId: string
  profileEmail: string
  profileName: string
  field: CriticalField
  currentValue: string
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
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium">{CRITICAL_FIELD_LABELS[field]}</p>
        <p className="text-muted-foreground text-sm">{currentValue}</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Request change
          </Button>
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
                    <FormLabel>New value</FormLabel>
                    <FormControl>
                      <Input {...ff} />
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
                    <FormLabel>Reason (optional)</FormLabel>
                    <FormControl>
                      <Input {...ff} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Submitting...' : 'Submit request'}
                </Button>
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
    <Card>
      <CardHeader>
        <CardTitle>Contact details</CardTitle>
        <CardDescription>You can edit these directly.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
