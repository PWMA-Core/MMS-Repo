import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={pending || sent}
      className="w-full"
    >
      {sent
        ? 'Verification email sent'
        : pending
          ? 'Sending...'
          : 'Resend verification email'}
    </Button>
  )
}
