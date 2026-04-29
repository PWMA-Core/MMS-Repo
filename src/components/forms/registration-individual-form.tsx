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
import { mapAuthError } from '@/lib/auth/error-messages'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import { useDemoAutofill } from '@/lib/debug/use-demo-autofill'
import { DEMO_REGISTRATION_INDIVIDUAL } from '@/lib/debug/dummy-data'
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

function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
      <div>
        <div className="label-small mb-1">{kicker}</div>
        <h2 className="title-medium">{title}</h2>
      </div>
    </div>
  )
}

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
  useDemoAutofill(form, DEMO_REGISTRATION_INDIVIDUAL)

  const mutation = useMutation({
    mutationFn: async (input: RegisterIndividualInput) => {
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}/auth/callback`,
          data: {
            hkid: input.hkid,
            legal_name: input.legal_name,
            date_of_birth: input.date_of_birth,
            phone: input.phone,
            address: input.address || null,
            role: 'individual_member',
          },
        },
      })
      if (authError) throw authError

      return auth
    },
    onSuccess: (_data, input) => {
      toast.success('Account created. Check your email to verify.')
      dispatchNotificationAsync({
        to_email: input.email,
        template_key: 'registration_received',
        payload: {
          legal_name: input.legal_name,
          role: 'individual_member',
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
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-12"
      >
        <section>
          <SectionHeading kicker="Identity" title="Protected fields" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                    Including check digit. Cannot be changed without PWMA approval.
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section>
          <SectionHeading kicker="Contact" title="How we reach you" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <FormItem className="md:col-span-2">
                  <FormLabel>Address (optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section>
          <SectionHeading kicker="Security" title="Account password" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
          </div>
        </section>

        <div className="border-foreground/10 flex justify-end border-t pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="nexus-pill-primary disabled:opacity-50"
          >
            {mutation.isPending ? (
              'Creating account...'
            ) : (
              <>
                <i className="ph ph-plus-circle text-base" aria-hidden="true" />
                Create account
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  )
}
