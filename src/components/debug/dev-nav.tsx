import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bug, X, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import {
  clearDemoSession,
  getStoredDemoRole,
  setDemoSession,
} from '@/lib/debug/demo-session'
import { isMockSupabase } from '@/lib/supabase/client'
import { resetMockDb, reloadMockDb } from '@/lib/supabase/mock-client'
import type { Database } from '@/types/database'

type Role = Database['public']['Tables']['profiles']['Row']['role']

interface RouteSpec {
  path: string
  label: string
  autofillable?: boolean
  note?: string
}

interface Section {
  title: string
  routes: RouteSpec[]
}

const SECTIONS: Section[] = [
  {
    title: 'Public',
    routes: [
      { path: '/', label: 'Landing' },
      { path: '/about', label: 'About' },
      {
        path: '/apply-firm',
        label: 'Apply as firm (WF1)',
        autofillable: true,
      },
      { path: '/apply-firm/thanks', label: 'Firm apply thanks' },
    ],
  },
  {
    title: 'Auth',
    routes: [
      { path: '/sign-in', label: 'Sign in', autofillable: true },
      { path: '/sign-up', label: 'Sign up (chooser)' },
      { path: '/verify', label: 'Verify email (info)' },
      {
        path: '/reset-password',
        label: 'Reset password',
        autofillable: true,
      },
      { path: '/auth/callback', label: 'Auth callback (transient)' },
    ],
  },
  {
    title: 'Register',
    routes: [
      {
        path: '/register/individual',
        label: 'Register — individual',
        autofillable: true,
      },
      {
        path: '/register/guest',
        label: 'Register — guest',
        autofillable: true,
      },
    ],
  },
  {
    title: 'Member (needs session)',
    routes: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/profile', label: 'My profile' },
      {
        path: '/renewal',
        label: 'Renewal (WF3)',
        note: 'Profile-confirm step then renewal form.',
      },
    ],
  },
  {
    title: 'Firm admin (needs firm admin session)',
    routes: [
      { path: '/firm/dashboard', label: 'Firm dashboard' },
      { path: '/firm/employees', label: 'Employees list' },
    ],
  },
  {
    title: 'PWMA admin (needs admin session)',
    routes: [
      { path: '/admin/dashboard', label: 'Admin dashboard' },
      { path: '/admin/approvals', label: 'Member approvals' },
      { path: '/admin/profile-changes', label: 'Profile changes' },
      { path: '/admin/firm-applications', label: 'Firm applications' },
    ],
  },
]

const ROLES: { value: Role; label: string }[] = [
  { value: 'individual_member', label: 'Individual' },
  { value: 'member_firm_admin', label: 'Firm admin' },
  { value: 'pwma_admin', label: 'PWMA admin' },
  { value: 'guest', label: 'Guest' },
]

export function DevNav() {
  const [open, setOpen] = useState(false)
  const [activeRole, setActiveRole] = useState<Role | null>(() =>
    typeof window === 'undefined' ? null : getStoredDemoRole(),
  )
  const [expandedSection, setExpandedSection] = useState<string | null>(
    SECTIONS[0]!.title,
  )
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (activeRole) setDemoSession(activeRole)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRoleChange(role: Role | null) {
    if (role === null) {
      clearDemoSession()
      setActiveRole(null)
    } else {
      setDemoSession(role)
      setActiveRole(role)
    }
  }

  function go(path: string, autofill = false) {
    const target = autofill ? `${path}?demo=1` : path
    navigate(target)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? 'Close DevNav' : 'Open DevNav'}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'fixed right-4 bottom-4 z-[100] flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors',
          open
            ? 'bg-destructive text-destructive-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Bug className="h-5 w-5" />}
      </button>

      {open && (
        <aside
          role="dialog"
          aria-label="DevNav"
          className="bg-background fixed right-4 bottom-20 z-[100] flex max-h-[80vh] w-96 flex-col overflow-hidden rounded-lg border shadow-2xl"
        >
          <header className="bg-muted/40 flex items-center justify-between border-b px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">DevNav</h2>
              <p className="text-muted-foreground text-xs">
                Dev-only.{' '}
                {isMockSupabase ? (
                  <span className="rounded bg-amber-100 px-1 text-amber-900">
                    mock backend
                  </span>
                ) : (
                  <span className="rounded bg-emerald-100 px-1 text-emerald-900">
                    live Supabase
                  </span>
                )}
              </p>
            </div>
            {isMockSupabase && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (
                    confirm(
                      'Reset all mock data (profiles, firms, applications, notifications)? This cannot be undone.',
                    )
                  ) {
                    resetMockDb()
                    reloadMockDb()
                    clearDemoSession()
                    setActiveRole(null)
                    window.location.reload()
                  }
                }}
              >
                Reset data
              </Button>
            )}
          </header>

          <section className="border-b px-4 py-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Demo session
            </p>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant={activeRole === null ? 'default' : 'outline'}
                onClick={() => handleRoleChange(null)}
              >
                None
              </Button>
              {ROLES.map((r) => (
                <Button
                  key={r.value}
                  size="sm"
                  variant={activeRole === r.value ? 'default' : 'outline'}
                  onClick={() => handleRoleChange(r.value)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              {activeRole
                ? `Acting as ${activeRole}. Supabase calls will still fail until the project is provisioned; layouts and guards will respond.`
                : 'No demo session. Protected routes redirect to sign-in.'}
            </p>
          </section>

          <section className="flex-1 overflow-auto px-4 py-3">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Routes
            </p>
            <div className="space-y-2">
              {SECTIONS.map((s) => {
                const expanded = expandedSection === s.title
                return (
                  <div key={s.title} className="rounded-md border">
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expanded ? null : s.title)}
                      className="hover:bg-muted/50 flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
                    >
                      <span>{s.title}</span>
                      {expanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {expanded && (
                      <ul className="divide-y">
                        {s.routes.map((r) => {
                          const active = location.pathname === r.path
                          return (
                            <li
                              key={r.path}
                              className={cn(
                                'flex flex-col gap-1 px-3 py-2 text-sm',
                                active && 'bg-primary/5',
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm">{r.label}</p>
                                  <p className="text-muted-foreground truncate font-mono text-[11px]">
                                    {r.path}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => go(r.path)}
                                  >
                                    Go
                                  </Button>
                                  {r.autofillable && (
                                    <Button
                                      size="sm"
                                      onClick={() => go(r.path, true)}
                                      title="Navigate and autofill the form with demo data"
                                    >
                                      Go + fill
                                    </Button>
                                  )}
                                </div>
                              </div>
                              {r.note && (
                                <p className="text-muted-foreground text-[11px]">
                                  {r.note}
                                </p>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <footer className="text-muted-foreground border-t px-4 py-2 text-[11px]">
            Hidden in production. Clear demo + reload to exit demo mode.{' '}
            <Link to="/" className="underline underline-offset-4">
              Go to landing
            </Link>
          </footer>
        </aside>
      )}
    </>
  )
}
