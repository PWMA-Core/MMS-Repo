import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { supabase } from '@/lib/supabase/client'
import { SideNav, type NavItem } from '@/components/layout/nav'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

interface Props {
  navItems: NavItem[]
  brand?: string
  /**
   * Override main content. If omitted, renders <Outlet /> for route-driven layouts.
   */
  children?: ReactNode
}

export function AppShell({ navItems, brand = 'PWMA MMS', children }: Props) {
  const profile = useSessionStore((s) => s.profile)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const initials = profile?.legal_name
    ? profile.legal_name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PW'

  return (
    <div className="bg-background text-foreground flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="border-foreground/10 relative z-10 flex h-full w-[280px] shrink-0 flex-col border-r px-8 pt-12 pb-8">
        {/* Brand */}
        <Link to="/" className="mb-20 flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center">
            <div className="border-foreground absolute left-0 h-6 w-6 rounded-full border" />
            <div className="border-foreground bg-background absolute right-0 h-6 w-6 rounded-full border" />
          </div>
          <span className="text-xl font-medium tracking-tight">{brand}</span>
        </Link>

        {/* Nav */}
        <SideNav items={navItems} />

        {/* User block */}
        <div className="border-foreground/10 mt-auto flex items-center justify-between border-t pt-8">
          <div className="flex items-center gap-3">
            <div className="bg-foreground/5 border-background text-foreground/70 flex h-9 w-9 items-center justify-center rounded-full border-2 text-[11px] font-medium">
              {initials}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="max-w-[140px] truncate text-sm font-medium">
                {profile?.legal_name ?? 'Guest'}
              </span>
              <Link
                to="/profile"
                className="text-foreground/65 hover:text-foreground text-[10px]"
              >
                Settings
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="border-foreground/25 hover:border-foreground flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
            title="Sign out"
          >
            <i className="ph ph-sign-out text-[14px]" aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="relative flex h-full flex-1 flex-col overflow-y-auto">
        {/* Subtle grid bg */}
        <div className="nexus-grid-bg pointer-events-none absolute inset-0 z-0 opacity-[0.024]" />
        {/* Language switcher (floating top-right) */}
        <div className="absolute top-6 right-6 z-30">
          <LanguageSwitcher />
        </div>
        <div className="relative z-10 mx-auto flex min-h-full w-full max-w-[1200px] flex-col p-16">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  )
}
