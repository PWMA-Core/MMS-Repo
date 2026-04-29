import { Navigate } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { useCurrentProfile } from '@/hooks/use-user'
import { AppShell } from '@/components/layout/app-shell'

const adminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', zh: '總覽', icon: 'squares-four' },
  { to: '/admin/approvals', label: 'Approvals', zh: '會員批核', icon: 'user-check' },
  {
    to: '/admin/profile-changes',
    label: 'Profile changes',
    zh: '資料變更',
    icon: 'pencil-line',
  },
  {
    to: '/admin/firm-applications',
    label: 'Firm applications',
    zh: '公司申請',
    icon: 'buildings',
  },
]

export function AdminLayout() {
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

  if (profileQuery.data && profileQuery.data.role !== 'pwma_admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <AppShell navItems={adminNavItems} brand="PWMA Admin" />
}
