import { Outlet, Link, Navigate, useLocation } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

// Paths under AuthLayout that an authenticated user is allowed to view
// (e.g. immediately after sign-up, before admin approval). Without this
// allow-list, the post-signup navigate('/verify') gets redirected to
// /dashboard before the verify page can render.
const ALLOW_AUTHENTICATED = new Set(['/verify', '/verify/confirmed', '/auth/callback'])

export function AuthLayout() {
  const status = useSessionStore((s) => s.status)
  const location = useLocation()

  if (status === 'authenticated' && !ALLOW_AUTHENTICATED.has(location.pathname)) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="bg-background relative flex min-h-screen flex-col">
      <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
      <header className="border-foreground/10 bg-background relative z-10 border-b">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative flex h-7 w-7 items-center justify-center">
              <div className="border-foreground absolute left-0 h-5 w-5 rounded-full border" />
              <div className="border-foreground bg-background absolute right-0 h-5 w-5 rounded-full border" />
            </div>
            <span className="text-lg font-medium tracking-tight">PWMA MMS</span>
          </Link>
          <LanguageSwitcher size="sm" />
        </div>
      </header>
      <main className="relative z-10 flex flex-1 items-start justify-center p-4 pt-16">
        <Outlet />
      </main>
    </div>
  )
}
