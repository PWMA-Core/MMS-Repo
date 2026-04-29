import { Navigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { useCurrentProfile } from '@/hooks/use-user'
import { AppShell } from '@/components/layout/app-shell'

const memberNavItems = [
  { to: '/dashboard', label: 'Dashboard', zh: '總覽', icon: 'squares-four' },
  { to: '/profile', label: 'Profile', zh: '個人資料', icon: 'user' },
  { to: '/renewal', label: 'Renewal', zh: '會籍續期', icon: 'arrows-clockwise' },
]

export function MemberLayout() {
  const status = useSessionStore((s) => s.status)
  const profileQuery = useCurrentProfile()

  if (status === 'loading') {
    return (
      <div className="text-foreground/65 flex min-h-screen items-center justify-center text-sm">
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

  return <AppShell navItems={memberNavItems} brand="PWMA Member" />
}
