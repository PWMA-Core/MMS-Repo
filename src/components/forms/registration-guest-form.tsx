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

  const mutation = useMutation({
    mutationFn: async (input: RegisterGuestInput) => {
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError

      // Guest profiles do not require HKID at registration. Use a sentinel
      // value so the NOT NULL + UNIQUE constraint holds. Upgrades to member
      // collect HKID later.
      const guestHkidSentinel = `GUEST-${auth.user?.id ?? crypto.randomUUID()}`

      const { error: profileError } = await supabase.from('profiles').insert({
        auth_user_id: auth.user?.id ?? null,
        hkid: guestHkidSentinel,
        email: input.email,
        legal_name: input.legal_name,
        phone: input.phone,
        role: 'guest',
        account_status: 'pending_email_verify',
        lifecycle_state: 'general_public',
      })
      if (profileError) throw profileError

      return auth
    },
    onSuccess: () => {
      toast.success('Guest account created. Check your email to verify.')
      navigate('/verify')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Guest registration failed')
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
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
                Guests can register for events without providing HKID. Convert
                to full member later to apply for certifications.
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
