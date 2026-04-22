import { Link } from 'react-router-dom'
import { useSessionStore } from '@/stores/session-store'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export function Header() {
  const status = useSessionStore((s) => s.status)
  const profile = useSessionStore((s) => s.profile)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="text-lg font-semibold">
          PWMA MMS
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            About
          </Link>
          {status === 'authenticated' ? (
            <>
              <Link
                to={profile?.role === 'pwma_admin' ? '/admin/dashboard' : '/dashboard'}
                className="text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
              <Button size="sm" variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
              <Button size="sm" asChild>
                <Link to="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
