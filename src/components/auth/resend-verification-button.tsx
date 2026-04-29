import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { mapAuthError } from '@/lib/auth/error-messages'
import { Tr, useTr } from '@/components/ui/tr'

export function ResendVerificationButton({ email }: { email: string }) {
  const t = useTr()
  const [pending, setPending] = useState(false)
  const [sent, setSent] = useState(false)

  const onClick = async () => {
    if (!email) {
      toast.error(t('Enter your email above first.', '請先輸入你嘅電郵地址。'))
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
    toast.success(
      t('Verification email sent. Check your inbox.', '驗證電郵已發送，請查閱信箱。'),
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || sent}
      className="border-foreground/15 text-foreground/65 hover:text-foreground hover:border-foreground/40 inline-flex w-full items-center justify-center gap-2 rounded-full border px-6 py-2.5 text-sm font-medium tracking-wide transition-colors disabled:opacity-50"
    >
      <i className="ph ph-envelope-simple text-base" aria-hidden="true" />
      {sent ? (
        <Tr en="Verification email sent" zh="驗證電郵已發送" />
      ) : pending ? (
        <Tr en="Sending..." zh="發送中..." />
      ) : (
        <Tr en="Resend verification email" zh="重新發送驗證電郵" />
      )}
    </button>
  )
}
