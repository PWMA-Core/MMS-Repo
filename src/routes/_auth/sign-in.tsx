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
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Access your PWMA member account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
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
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
              {needsVerification && (
                <ResendVerificationButton email={form.getValues('email')} />
              )}
              <div className="flex justify-between text-sm">
                <Link
                  to="/reset-password"
                  className="text-muted-foreground underline underline-offset-4"
                >
                  Forgot password?
                </Link>
                <Link
                  to="/sign-up"
                  className="text-muted-foreground underline underline-offset-4"
                >
                  Create account
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
