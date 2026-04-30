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

export function RegistrationIndividualForm() {
  const navigate = useNavigate()
  const t = useTr()

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
      toast.success(
        t(
          'Account created. Check your email to verify.',
          '帳戶已建立，請查閱電郵進行驗證。',
        ),
      )
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
      const f = mapAuthError(error)
      toast.error(t(f.message, f.messageZh))
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
            kicker="Identity"
            title="Protected fields"
            kickerZh="身份"
            titleZh="受保護資料"
          />
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
                    <Tr
                      en="Including check digit. Cannot be changed without PWMA approval."
                      zh="請包括核對號碼。如需修改，須經 PWMA 批准。"
                    />
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
                  <FormLabel>
                    <Tr en="Legal name" zh="法定姓名" />
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('As shown on your HKID', '與 HKID 上一致')}
                      {...field}
                    />
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
                  <FormLabel>
                    <Tr en="Date of birth" zh="出生日期" />
                  </FormLabel>
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
          <SectionHeading
            kicker="Contact"
            title="How we reach you"
            kickerZh="聯絡"
            titleZh="聯絡方式"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Tr en="Email" zh="電郵" />
                  </FormLabel>
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
                  <FormLabel>
                    <Tr en="Phone" zh="電話" />
                  </FormLabel>
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
                  <FormLabel>
                    <Tr en="Address (optional)" zh="地址（選填）" />
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
                <Tr en="Create account" zh="建立帳戶" />
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  )
}
