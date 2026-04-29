import { Navigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { useCurrentProfile } from '@/hooks/use-user'
import { AppShell } from '@/components/layout/app-shell'

const firmNavItems = [
  { to: '/firm/dashboard', label: 'Dashboard', zh: '總覽', icon: 'squares-four' },
  { to: '/firm/employees', label: 'Employees', zh: '員工名冊', icon: 'users' },
  { to: '/profile', label: 'My profile', zh: '個人資料', icon: 'user' },
]

export function FirmAdminLayout() {
  const status = useSessionStore((s) => s.status)
  const profileQuery = useCurrentProfile()

  if (status === 'loading' || profileQuery.isLoading) {
    return (
      <div className="text-foreground/65 flex min-h-screen items-center justify-center text-sm">
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

  return <AppShell navItems={firmNavItems} brand="PWMA Firm" />
}
