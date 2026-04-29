import { Link } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { supabase } from '@/lib/supabase/client'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Tr } from '@/components/ui/tr'

export function Header() {
  const status = useSessionStore((s) => s.status)
  const profile = useSessionStore((s) => s.profile)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-foreground/10 bg-background border-b">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <div className="border-foreground absolute left-0 h-5 w-5 rounded-full border" />
            <div className="border-foreground bg-background absolute right-0 h-5 w-5 rounded-full border" />
          </div>
          <span className="text-lg font-medium tracking-tight">PWMA MMS</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            to="/about"
            className="text-foreground/65 hover:text-foreground tracking-wide"
          >
            <Tr en="About" zh="關於" />
          </Link>
          {status === 'authenticated' ? (
            <>
              <Link
                to={profile?.role === 'pwma_admin' ? '/admin/dashboard' : '/dashboard'}
                className="text-foreground/65 hover:text-foreground tracking-wide"
              >
                <Tr en="Dashboard" zh="總覽" />
              </Link>
              <button onClick={handleSignOut} className="nexus-pill-outline">
                <Tr en="Sign out" zh="登出" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="text-foreground/65 hover:text-foreground tracking-wide"
              >
                <Tr en="Sign in" zh="登入" />
              </Link>
              <Link to="/sign-up" className="nexus-pill-primary">
                <i className="ph ph-plus-circle text-base" aria-hidden="true" />
                <Tr en="Sign up" zh="註冊" />
              </Link>
            </>
          )}
          <LanguageSwitcher size="sm" />
        </nav>
      </div>
    </header>
  )
}
