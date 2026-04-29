import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-messages'

export function ResendVerificationButton({ email }: { email: string }) {
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const onClick = async () => {
    if (!email) {
      toast.error('Enter your email above first.')
      return
    }
    setPending(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setPending(false)
    if (error) {
      toast.error(mapAuthError(error).message)
      return
    }
    setSent(true)
    toast.success('Verification email sent. Check your inbox.')
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || sent}
      className="border-foreground/15 text-foreground/65 hover:text-foreground hover:border-foreground/40 inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium tracking-wide transition-colors disabled:opacity-50"
    >
      <i className="ph ph-envelope-simple text-base" aria-hidden="true" />
      {sent
        ? 'Verification email sent'
        : pending
          ? 'Sending...'
          : 'Resend verification email'}
    </button>
  )
}
