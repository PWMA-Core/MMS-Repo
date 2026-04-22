import { Outlet, Link, Navigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'

export function AuthLayout() {
  const status = useSessionStore((s) => s.status)

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-14 items-center px-4">
          <Link to="/" className="text-lg font-semibold">
            PWMA MMS
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center p-4 pt-10">
        <Outlet />
      </main>
    </div>
  )
}
