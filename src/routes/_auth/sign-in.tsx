import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { signInSchema, type SignInInput } from '@/lib/validators/auth'
import { supabase } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-messages'
import { useDemoAutofill } from '@/lib/debug/use-demo-autofill'
import { DEMO_SIGN_IN } from '@/lib/debug/dummy-data'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ResendVerificationButton } from '@/components/auth/resend-verification-button'

export function SignInPage() {
  const navigate = useNavigate()
  const [needsVerification, setNeedsVerification] = useState(false)
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })
  useDemoAutofill(form, DEMO_SIGN_IN)

  const mutation = useMutation({
    mutationFn: async (input: SignInInput) => {
      const { error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setNeedsVerification(false)
      toast.success('Signed in')
      navigate('/dashboard')
    },
    onError: (error: Error) => {
      const friendly = mapAuthError(error)
      setNeedsVerification(friendly.code === 'email_not_confirmed')
      toast.error(friendly.message)
    },
  })

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">Welcome back</div>
        <h1 className="title-large">Sign in</h1>
        <p className="text-foreground/65 mt-3 text-sm">
          Access your PWMA member account.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label-small">Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="label-small">Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password"
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
            className="bg-foreground text-background flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              'Signing in...'
            ) : (
              <>
                <i className="ph ph-sign-in text-base" aria-hidden="true" />
                Sign in
              </>
            )}
          </button>
          {needsVerification && (
            <ResendVerificationButton email={form.getValues('email')} />
          )}
          <div className="flex justify-between pt-2 text-sm">
            <Link
              to="/reset-password"
              className="text-foreground/65 hover:text-foreground underline underline-offset-4"
            >
              Forgot password?
            </Link>
            <Link
              to="/sign-up"
              className="text-foreground/65 hover:text-foreground underline underline-offset-4"
            >
              Create account
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
