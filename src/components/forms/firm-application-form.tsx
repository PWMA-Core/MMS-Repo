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
import { Button } from '@/components/ui/button'
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
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <FormField
          control={form.control}
          name="proposed_firm_name"
          render={({ field }) => (
            <FormItem>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="full_member">Full Member Firm</SelectItem>
                  <SelectItem value="associate_member">Associate Member Firm</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contact_name"
          render={({ field }) => (
            <FormItem>
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
        <FormField
          control={form.control}
          name="firm_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firm address (optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes to PWMA (optional)</FormLabel>
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
        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Submitting...' : 'Submit application'}
        </Button>
      </form>
    </Form>
  )
}
