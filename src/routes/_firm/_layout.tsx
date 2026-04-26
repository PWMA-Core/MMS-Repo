import { Outlet, Navigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { useCurrentProfile } from '@/hooks/use-user'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SideNav } from '@/components/layout/nav'

const firmNavItems = [
  { to: '/firm/dashboard', label: 'Dashboard' },
  { to: '/firm/employees', label: 'Employees' },
  { to: '/profile', label: 'My profile' },
]

export function FirmAdminLayout() {
  const status = useSessionStore((s) => s.status)
  const profileQuery = useCurrentProfile()

  if (status === 'loading' || profileQuery.isLoading) {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
        Loading...
      </div>
    )
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/sign-in" replace />
  }
  if (profileQuery.data && profileQuery.data.role !== 'member_firm_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="grid flex-1 grid-cols-[220px_1fr]">
        <SideNav items={firmNavItems} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
