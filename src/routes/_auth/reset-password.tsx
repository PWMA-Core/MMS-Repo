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
import { Tr, useTr } from '@/components/ui/tr'

export function ResetPasswordPage() {
  const t = useTr()
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
      toast.success(
        t('Reset link sent. Check your inbox.', '重設連結已發送，請查閱電郵。'),
      )
      form.reset()
    },
    onError: (error: Error) => {
      const f = mapAuthError(error)
      toast.error(t(f.message, f.messageZh))
    },
  })

  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Recovery" zh="帳戶恢復" />
        </div>
        <h1 className="title-large">
          <Tr en="Reset password" zh="重設密碼" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm">
          <Tr
            en="Enter your email to receive a reset link."
            zh="輸入你嘅電郵地址以接收重設連結。"
          />
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
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-foreground text-background flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Tr en="Sending..." zh="發送中..." />
            ) : (
              <>
                <i className="ph ph-paper-plane-tilt text-base" aria-hidden="true" />
                <Tr en="Send reset link" zh="發送重設連結" />
              </>
            )}
          </button>
          <p className="pt-2 text-center text-sm">
            <Link
              to="/sign-in"
              className="text-foreground/65 hover:text-foreground underline underline-offset-4"
            >
              <Tr en="Back to sign-in" zh="返回登入" />
            </Link>
          </p>
        </form>
      </Form>
    </div>
  )
}
