import { supabase } from '@/lib/supabase/client'
import type { NotificationTemplateKey } from '@/lib/constants/notifications'
import { renderEmail } from '@/lib/email/templates'

interface DispatchInput {
  to_email: string
  to_profile_id?: string | null
  template_key: NotificationTemplateKey
  payload: Record<string, unknown>
}

interface DispatchResult {
  ok: boolean
  notification_id?: string
  error?: string
}

/**
 * Enqueue a notification. Renders the email HTML + subject on the client so
 * the record is self-contained even if the template registry changes later,
 * then inserts into the notifications table as status='queued'.
 *
 * The server-side worker (Supabase Edge Function, implemented by James) is
 * responsible for sending via M365 SMTP and updating status to 'sent' /
 * 'failed'. See docs/arch/phase-2-member-registration.md + james-handover.md.
 *
 * Safe to call even when Supabase is offline: insert will error, we return
 * { ok: false, error } without throwing.
 */
export async function dispatchNotification(
  input: DispatchInput,
): Promise<DispatchResult> {
  try {
    const rendered = renderEmail(input.template_key, input.payload)
    const { error } = await supabase.from('notifications').insert({
      to_email: input.to_email,
      to_profile_id: input.to_profile_id ?? null,
      template_key: input.template_key,
      payload: input.payload as never,
      subject: rendered.subject,
      body_html: rendered.html,
      body_text: rendered.text,
    })
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, error: message }
  }
}

/**
 * Fire-and-forget wrapper. Use when the calling flow should not block on the
 * enqueue step (e.g., UX-critical mutation success toast). Logs failures to
 * console; does not surface to the user.
 */
export function dispatchNotificationAsync(input: DispatchInput): void {
  void dispatchNotification(input).then((result) => {
    if (!result.ok) {
      console.warn('[notifications] enqueue failed', input.template_key, result.error)
    }
  })
}
