import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import {
  firmApplicationSchema,
  type FirmApplicationInput,
} from '@/lib/validators/firm-application'
import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
import { useDemoAutofill } from '@/lib/debug/use-demo-autofill'
import { DEMO_FIRM_APPLICATION } from '@/lib/debug/dummy-data'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export function FirmApplicationForm() {
  const navigate = useNavigate()
  const t = useTr()
  const form = useForm<FirmApplicationInput>({
    resolver: zodResolver(firmApplicationSchema),
    defaultValues: {
      proposed_firm_name: '',
      business_registration_number: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      firm_address: '',
      tier_requested: 'full_member',
      notes: '',
    },
  })
  useDemoAutofill(form, DEMO_FIRM_APPLICATION)

  const mutation = useMutation({
    mutationFn: async (input: FirmApplicationInput) => {
      const { error } = await supabase.from('firm_applications').insert({
        proposed_firm_name: input.proposed_firm_name,
        business_registration_number: input.business_registration_number,
        contact_name: input.contact_name,
        contact_email: input.contact_email,
        contact_phone: input.contact_phone,
        firm_address: input.firm_address || null,
        tier_requested: input.tier_requested,
        notes: input.notes || null,
      })
      if (error) throw error
      return null
    },
    onSuccess: (_, input) => {
      toast.success(
        t(
          'Application submitted. PWMA will be in touch.',
          '申請已提交，PWMA 將與你聯絡。',
        ),
      )
      dispatchNotificationAsync({
        to_email: input.contact_email,
        template_key: 'firm_application_received',
        payload: {
          contact_name: input.contact_name,
          proposed_firm_name: input.proposed_firm_name,
        },
      })
      navigate('/apply-firm/thanks')
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Submission failed', '提交失敗'))
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-12"
      >
        {/* Section 1: Firm */}
        <section>
          <SectionHeading
            kicker="Section 1"
            title="Firm details"
            kickerZh="第一節"
            titleZh="機構資料"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="proposed_firm_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Tr en="Firm name" zh="機構名稱" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="business_registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Tr en="Business registration number" zh="商業登記號碼" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    <Tr
                      en="As issued by the Hong Kong Inland Revenue Department."
                      zh="由香港稅務局發出。"
                    />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tier_requested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Tr en="Membership tier" zh="會籍級別" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-foreground/15 h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_member">
                        <Tr en="Full member firm" zh="正式會員機構" />
                      </SelectItem>
                      <SelectItem value="associate_member">
                        <Tr en="Associate member firm" zh="附屬會員機構" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firm_address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Tr en="Firm address (optional)" zh="機構地址（選填）" />
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

        {/* Section 2: Contact */}
        <section>
          <SectionHeading
            kicker="Section 2"
            title="Primary contact"
            kickerZh="第二節"
            titleZh="主要聯絡人"
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <Tr en="Contact name" zh="聯絡人姓名" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Tr en="Contact email" zh="聯絡電郵" />
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
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Tr en="Contact phone" zh="聯絡電話" />
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

        {/* Section 3: Notes */}
        <section>
          <SectionHeading
            kicker="Section 3"
            title="Notes (optional)"
            kickerZh="第三節"
            titleZh="備註（選填）"
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Tr en="Notes to PWMA" zh="給 PWMA 的備註" />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  <Tr
                    en="Anything PWMA should know about the firm or application context."
                    zh="任何有助 PWMA 了解機構或申請背景嘅資料。"
                  />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Submit */}
        <div className="border-foreground/10 flex justify-end border-t pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="nexus-pill-primary disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Tr en="Submitting..." zh="提交中..." />
            ) : (
              <>
                <i className="ph ph-paper-plane-tilt text-base" aria-hidden="true" />
                <Tr en="Submit application" zh="提交申請" />
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  )
}
