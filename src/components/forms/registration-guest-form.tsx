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
import { Tr, useTr } from '@/components/ui/tr'

function SectionHeading({
  kicker,
  title,
  kickerZh,
  titleZh,
}: {
  kicker: string
  title: string
  kickerZh: string
  titleZh: string
}) {
  return (
    <div className="border-foreground mb-6 flex items-end justify-between border-b pb-4">
      <div>
        <div className="label-small mb-1">
          <Tr en={kicker} zh={kickerZh} />
        </div>
        <h2 className="title-medium">
          <Tr en={title} zh={titleZh} />
        </h2>
      </div>
    </div>
  )
}

export function RegistrationGuestForm() {
  const navigate = useNavigate()
  const t = useTr()

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
      toast.success(
        t(
          'Guest account created. Check your email to verify.',
          '訪客帳戶已建立，請查閱電郵進行驗證。',
        ),
      )
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
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-12"
      >
        <section>
          <SectionHeading
            kicker="Profile"
            title="Your details"
            kickerZh="個人資料"
            titleZh="基本資料"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="legal_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Tr en="Legal name" zh="法定姓名" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    <Tr
                      en="Guests can register for events without providing HKID. Convert to full member later to apply for certifications."
                      zh="訪客毋須提供 HKID 即可報名活動。日後可升級為正式會員以申請認證。"
                    />
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
                  <FormLabel>
                    <Tr en="Email" zh="電郵" />
                  </FormLabel>
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
                  <FormLabel>
                    <Tr en="Phone" zh="電話" />
                  </FormLabel>
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
          <SectionHeading
            kicker="Security"
            title="Account password"
            kickerZh="安全"
            titleZh="帳戶密碼"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Tr en="Password" zh="密碼" />
                  </FormLabel>
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
                  <FormLabel>
                    <Tr en="Confirm password" zh="確認密碼" />
                  </FormLabel>
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
              <Tr en="Creating account..." zh="建立帳戶中..." />
            ) : (
              <>
                <i className="ph ph-plus-circle text-base" aria-hidden="true" />
                <Tr en="Create guest account" zh="建立訪客帳戶" />
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  )
}
