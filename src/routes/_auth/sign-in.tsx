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
import { Tr, useTr } from '@/components/ui/tr'

export function SignInPage() {
  const navigate = useNavigate()
  const t = useTr()
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
      toast.success(t('Signed in', '登入成功'))
      navigate('/dashboard')
    },
    onError: (error: Error) => {
      const friendly = mapAuthError(error)
      setNeedsVerification(friendly.code === 'email_not_confirmed')
      toast.error(t(friendly.message, friendly.messageZh))
    },
  })

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Welcome back" zh="歡迎回來" />
        </div>
        <h1 className="title-large">
          <Tr en="Sign in" zh="登入" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm">
          <Tr en="Access your PWMA member account." zh="登入你嘅 PWMA 會員帳戶。" />
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
                <FormLabel className="label-small">
                  <Tr en="Email" zh="電郵" />
                </FormLabel>
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
                <FormLabel className="label-small">
                  <Tr en="Password" zh="密碼" />
                </FormLabel>
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
              <Tr en="Signing in..." zh="登入中..." />
            ) : (
              <>
                <i className="ph ph-sign-in text-base" aria-hidden="true" />
                <Tr en="Sign in" zh="登入" />
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
              <Tr en="Forgot password?" zh="忘記密碼？" />
            </Link>
            <Link
              to="/sign-up"
              className="text-foreground/65 hover:text-foreground underline underline-offset-4"
            >
              <Tr en="Create account" zh="建立帳戶" />
            </Link>
          </div>
        </form>
      </Form>
    </div>
  )
}
