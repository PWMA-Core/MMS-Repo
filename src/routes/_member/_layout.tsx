import { Outlet, Navigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { useCurrentProfile } from '@/hooks/use-user'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { SideNav } from '@/components/layout/nav'

const memberNavItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
  { to: '/renewal', label: 'Renewal' },
]

export function MemberLayout() {
  const status = useSessionStore((s) => s.status)
  const profileQuery = useCurrentProfile()

  if (status === 'loading') {
    return (
      <div className="text-muted-foreground flex min-h-screen items-center justify-center text-sm">
        Loading...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/sign-in" replace />
  }

  if (profileQuery.data?.role === 'pwma_admin') {
    return <Navigate to="/admin/dashboard" replace />
  }

  if (profileQuery.data?.role === 'member_firm_admin') {
    return <Navigate to="/firm/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="grid flex-1 grid-cols-[200px_1fr]">
        <SideNav items={memberNavItems} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}
