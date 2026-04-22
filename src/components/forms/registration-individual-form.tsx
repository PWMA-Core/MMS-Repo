import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  registerIndividualSchema,
  type RegisterIndividualInput,
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

export function RegistrationIndividualForm() {
  const navigate = useNavigate()

  const form = useForm<RegisterIndividualInput>({
    resolver: zodResolver(registerIndividualSchema),
    defaultValues: {
      hkid: '',
      legal_name: '',
      date_of_birth: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirm_password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (input: RegisterIndividualInput) => {
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}/auth/callback`,
        },
      })
      if (authError) throw authError

      const { error: profileError } = await supabase.from('profiles').insert({
        auth_user_id: auth.user?.id ?? null,
        hkid: input.hkid,
        email: input.email,
        legal_name: input.legal_name,
        date_of_birth: input.date_of_birth,
        phone: input.phone,
        address: input.address || null,
        role: 'individual_member',
        account_status: 'pending_email_verify',
      })
      if (profileError) throw profileError

      return auth
    },
    onSuccess: () => {
      toast.success('Account created. Check your email to verify.')
      navigate('/verify')
    },
    onError: (error: Error) => {
      const msg = error.message.toLowerCase()
      if (msg.includes('duplicate') && msg.includes('hkid')) {
        toast.error('HKID already registered. Sign in or contact support.')
      } else if (msg.includes('duplicate') && msg.includes('email')) {
        toast.error('Email already registered. Sign in or reset password.')
      } else {
        toast.error(error.message || 'Registration failed')
      }
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
          name="hkid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>HKID</FormLabel>
              <FormControl>
                <Input placeholder="A123456(3)" autoComplete="off" {...field} />
              </FormControl>
              <FormDescription>
                Your HK Identity Card number including check digit. Cannot be
                changed after registration without PWMA approval.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="legal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Legal name</FormLabel>
              <FormControl>
                <Input placeholder="As shown on your HKID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of birth</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
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
                <Input type="email" placeholder="you@example.com" {...field} />
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
                <Input placeholder="+852 ..." {...field} />
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
              <FormLabel>Address (optional)</FormLabel>
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

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </Form>
  )
}
