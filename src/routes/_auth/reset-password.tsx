import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/auth'
import { supabase } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-messages'
import { useDemoAutofill } from '@/lib/debug/use-demo-autofill'
import { DEMO_RESET } from '@/lib/debug/dummy-data'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export function ResetPasswordPage() {
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })
  useDemoAutofill(form, DEMO_RESET)

  const mutation = useMutation({
    mutationFn: async (input: ResetPasswordInput) => {
      const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: `${import.meta.env.VITE_PUBLIC_URL ?? window.location.origin}/auth/callback`,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Reset link sent. Check your inbox.')
      form.reset()
    },
    onError: (error: Error) => {
      toast.error(mapAuthError(error).message)
    },
  })

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">Recovery</div>
        <h1 className="title-large">Reset password</h1>
        <p className="text-foreground/65 mt-3 text-sm">
          Enter your email to receive a reset link.
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
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-foreground text-background flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <i className="ph ph-paper-plane-tilt text-base" aria-hidden="true" />
                Send reset link
              </>
            )}
          </button>
          <p className="pt-2 text-center text-sm">
            <Link
              to="/sign-in"
              className="text-foreground/65 hover:text-foreground underline underline-offset-4"
            >
              Back to sign-in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  )
}
