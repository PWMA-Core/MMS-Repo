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

export function FirmApplicationForm() {
  const navigate = useNavigate()
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
      toast.success('Application submitted. PWMA will be in touch.')
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
      toast.error(error.message || 'Submission failed')
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
          <SectionHeading kicker="Section 1" title="Firm details" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="proposed_firm_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Firm name</FormLabel>
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
                  <FormLabel>Business registration number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    As issued by the Hong Kong Inland Revenue Department.
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
                  <FormLabel>Membership tier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-foreground/15 h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="full_member">Full member firm</SelectItem>
                      <SelectItem value="associate_member">
                        Associate member firm
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
                  <FormLabel>Firm address (optional)</FormLabel>
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
          <SectionHeading kicker="Section 2" title="Primary contact" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Contact name</FormLabel>
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
                  <FormLabel>Contact email</FormLabel>
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
                  <FormLabel>Contact phone</FormLabel>
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
          <SectionHeading kicker="Section 3" title="Notes (optional)" />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes to PWMA</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Anything PWMA should know about the firm or application context.
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
              'Submitting...'
            ) : (
              <>
                <i className="ph ph-paper-plane-tilt text-base" aria-hidden="true" />
                Submit application
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  )
}
