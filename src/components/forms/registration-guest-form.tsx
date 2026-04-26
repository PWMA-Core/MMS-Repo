import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  registerGuestSchema,
  type RegisterGuestInput,
} from '@/lib/validators/registration'
import { supabase } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-messages'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import { useDemoAutofill } from '@/lib/debug/use-demo-autofill'
import { DEMO_REGISTRATION_GUEST } from '@/lib/debug/dummy-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function RegistrationGuestForm() {
  const navigate = useNavigate()

  const form = useForm<RegisterGuestInput>({
    resolver: zodResolver(registerGuestSchema),
    defaultValues: {
      legal_name: '',
      email: '',
      phone: '',
      password: '',
      confirm_password: '',
    },
  })
  useDemoAutofill(form, DEMO_REGISTRATION_GUEST)

  const mutation = useMutation({
    mutationFn: async (input: RegisterGuestInput) => {
      // Guest profiles do not require HKID at registration. Use a sentinel
      // value so the NOT NULL + UNIQUE constraint holds. Upgrades to member
      // collect HKID later.
      const guestHkidSentinel = `GUEST-${crypto.randomUUID()}`

      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}/auth/callback`,
          data: {
            hkid: guestHkidSentinel,
            legal_name: input.legal_name,
            phone: input.phone,
            role: 'guest',
            lifecycle_state: 'general_public',
          },
        },
      })
      if (authError) throw authError

      return auth
    },
    onSuccess: (_data, input) => {
      toast.success('Guest account created. Check your email to verify.')
      dispatchNotificationAsync({
        to_email: input.email,
        template_key: 'registration_received',
        payload: {
          legal_name: input.legal_name,
          role: 'guest',
        },
      })
      navigate('/verify')
    },
    onError: (error: Error) => {
      toast.error(mapAuthError(error).message)
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="legal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Guests can register for events without providing HKID. Convert to full
                member later to apply for certifications.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creating account...' : 'Create guest account'}
        </Button>
      </form>
    </Form>
  )
}
