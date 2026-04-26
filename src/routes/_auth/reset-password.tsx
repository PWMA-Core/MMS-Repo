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
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
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
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? 'Sending...' : 'Send reset link'}
              </Button>
              <p className="text-muted-foreground text-center text-sm">
                <Link to="/sign-in" className="underline underline-offset-4">
                  Back to sign-in
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
