import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'

export function CallbackPage() {
  const navigate = useNavigate()
  const status = useSessionStore((s) => s.status)

  useEffect(() => {
    if (status === 'authenticated') {
      navigate('/dashboard', { replace: true })
    } else if (status === 'unauthenticated') {
      navigate('/sign-in', { replace: true })
    }
  }, [status, navigate])

  return (
    <div className="w-full max-w-md text-center text-sm text-muted-foreground">
      Completing sign-in...
    </div>
  )
}
