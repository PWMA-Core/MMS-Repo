import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { renewalFormSchema, type RenewalFormInput } from '@/lib/validators/renewal'
import { supabase } from '@/lib/supabase/client'
import { dispatchNotificationAsync } from '@/lib/notifications/dispatch'
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
import {
  DEFAULT_OPT_HOURS_REQUIRED,
  getCurrentRenewalYear,
} from '@/lib/constants/renewal'
import { Tr, useTr } from '@/components/ui/tr'

interface Props {
  profile: {
    id: string
    legal_name: string
    email: string
  }
}

interface PreviousApplication {
  id: string
  application_type: 'CPWP' | 'CPWPA'
  form_data: Record<string, unknown>
}

export function RenewalForm({ profile }: Props) {
  const currentYear = getCurrentRenewalYear()
  const t = useTr()

  /**
   * Auto-fill from the most recent prior application per decisions-log
   * 2026-04-22 "Renewal auto-fill confirmed". Falls back to empty if none.
   */
  const previous = useQuery<PreviousApplication | null>({
    queryKey: ['renewal', 'previous', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, application_type, form_data')
        .eq('profile_id', profile.id)
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as PreviousApplication | null
    },
  })

  const optSummary = useQuery({
    queryKey: ['renewal', 'opt-summary', profile.id, currentYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opt_records')
        .select('hours')
        .eq('profile_id', profile.id)
        .eq('year', currentYear)
      if (error) throw error
      const total = (data ?? []).reduce(
        (sum: number, r: { hours: number | string }) => sum + Number(r.hours),
        0,
      )
      return total
    },
  })

  const form = useForm<RenewalFormInput>({
    resolver: zodResolver(renewalFormSchema),
    defaultValues: {
      year: currentYear,
      application_type: previous.data?.application_type ?? 'CPWP',
      declared_opt_hours: optSummary.data ?? 0,
      declared_employment_change: false,
      employment_change_note: '',
    },
    values: {
      year: currentYear,
      application_type: previous.data?.application_type ?? 'CPWP',
      declared_opt_hours: optSummary.data ?? 0,
      declared_employment_change: false,
      employment_change_note: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (input: RenewalFormInput) => {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          profile_id: profile.id,
          application_type: input.application_type,
          application_kind: 'renewal',
          form_data: {
            year: input.year,
            declared_opt_hours: input.declared_opt_hours,
            declared_employment_change: input.declared_employment_change,
            employment_change_note: input.employment_change_note ?? null,
          },
          status: 'pending_for_checker',
          submitted_at: new Date().toISOString(),
        })
        .select('id, application_type, application_kind')
        .single()
      if (error || !data) throw error ?? new Error('Submission failed')
      return data
    },
    onSuccess: (result) => {
      toast.success(t('Renewal submitted', '續期申請已提交'))
      dispatchNotificationAsync({
        to_email: profile.email,
        to_profile_id: profile.id,
        template_key: 'application_submitted',
        payload: {
          legal_name: profile.legal_name,
          application_type: result.application_type,
          application_kind: result.application_kind,
        },
      })
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Submission failed', '提交失敗'))
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="application_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Tr en="Membership type" zh="會籍類別" />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-foreground/15 h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CPWP">CPWP</SelectItem>
                    <SelectItem value="CPWPA">CPWPA</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  <Tr
                    en="Pre-filled from your last application."
                    zh="已根據上次申請預填。"
                  />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="declared_opt_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  <Tr
                    en={`OPT hours for ${currentYear}`}
                    zh={`${currentYear} 年 OPT 時數`}
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  <Tr
                    en={`Requirement: ${DEFAULT_OPT_HOURS_REQUIRED} hours. Auto-fill once Phase 4 is live; for now, declare manually.`}
                    zh={`要求：${DEFAULT_OPT_HOURS_REQUIRED} 小時。第四階段上線後將自動填寫，現時請手動申報。`}
                  />
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="employment_change_note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Tr
                  en="Employment change note (optional)"
                  zh="就業狀況變更備註（選填）"
                />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                <Tr
                  en="If you changed firm or role since last renewal, explain here."
                  zh="如上次續期後有轉職或職銜變更，請在此說明。"
                />
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
                <Tr en="Submit renewal" zh="提交續期申請" />
              </>
            )}
          </button>
        </div>
      </form>
    </Form>
  )
}
