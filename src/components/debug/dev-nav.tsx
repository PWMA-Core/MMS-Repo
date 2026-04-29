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

interface StoryStep {
  label: string
  /**
   * Demo session role to set before navigating. `null` clears the session
   * (anon visitor). Omit to leave the current role untouched.
   */
  role?: Role | null
  path: string
  autofill?: boolean
  note?: string
}

interface Story {
  id: string
  title: string
  kicker: string
  description: string
  steps: StoryStep[]
}

/**
 * Demo flows for client presentation. Linear narrative: each story walks
 * one user journey end-to-end. Clicking a step sets the demo session +
 * navigates + autofills the form (if applicable).
 *
 * Mapped to SYSTEM_FLOW_SOT.md:
 * - Story A → WF1 (Member Firm Application)
 * - Story B → WF2 (Individual member registration / approval entry)
 * - Story C → WF5 (Profile updates with PWMA approval)
 * - Story D → SOW 2.09 (Firm admin consolidated view)
 * - Story E → admin dashboard live counts
 */
const STORIES: Story[] = [
  {
    id: 'firm-onboarding',
    kicker: 'WF1',
    title: 'New firm onboarding',
    description:
      'Public firm submits application; PWMA admin reviews and approves; firm + admin account auto-created.',
    steps: [
      {
        label: '1. Visitor opens public application form',
        role: null,
        path: '/apply-firm',
        autofill: true,
        note: 'Form auto-fills with demo firm data. Walk through the 3 sections, then submit.',
      },
      {
        label: '2. Confirmation page',
        role: null,
        path: '/apply-firm/thanks',
        note: '"Application received" page. Talk through what happens next: M365 email, admin review.',
      },
      {
        label: '3. PWMA admin reviews the queue',
        role: 'pwma_admin',
        path: '/admin/firm-applications',
        note: 'Click Approve on the row submitted in step 1. Toast + status flips to Approved.',
      },
    ],
  },
  {
    id: 'individual-registration',
    kicker: 'WF2',
    title: 'New individual member registration',
    description:
      'Visitor signs up as individual member; PWMA admin approves; member signs in.',
    steps: [
      {
        label: '1. Visitor opens sign-up chooser',
        role: null,
        path: '/sign-up',
        note: 'Three options: Individual, Guest, Apply as a firm. Select Individual.',
      },
      {
        label: '2. Fill individual registration form',
        role: null,
        path: '/register/individual',
        autofill: true,
        note: 'Auto-fills with demo data. 3 sections: identity, contact, security. Submit.',
      },
      {
        label: '3. Email verification info page',
        role: null,
        path: '/verify',
        note: '"Check your email" explainer. In production, M365 sends the verify link.',
      },
      {
        label: '4. PWMA admin reviews the queue',
        role: 'pwma_admin',
        path: '/admin/approvals',
        note: 'See the pending member. Click Approve. Status flips to Active.',
      },
      {
        label: '5. Member signs in to their dashboard',
        role: 'individual_member',
        path: '/dashboard',
        note: 'Status: Active. Member sees the welcome view.',
      },
    ],
  },
  {
    id: 'profile-change',
    kicker: 'WF5',
    title: 'Profile change request (critical field)',
    description:
      'Member submits a change request for a critical field; PWMA admin approves; field updates.',
    steps: [
      {
        label: '1. Member opens their profile',
        role: 'individual_member',
        path: '/profile',
        note: 'Show critical fields (locked) and editable fields (inline). Click Request change on Legal name.',
      },
      {
        label: '2. PWMA admin reviews the queue',
        role: 'pwma_admin',
        path: '/admin/profile-changes',
        note: 'See the pending request with old → new value. Click Approve.',
      },
      {
        label: '3. Member sees updated field',
        role: 'individual_member',
        path: '/profile',
        note: 'Field is now updated. Approval audit trail captured.',
      },
    ],
  },
  {
    id: 'firm-admin-view',
    kicker: 'SOW 2.09',
    title: 'Firm admin consolidated view',
    description:
      'Firm admin signs in and sees the firm summary plus the directory of all firm members.',
    steps: [
      {
        label: '1. Firm admin dashboard',
        role: 'member_firm_admin',
        path: '/firm/dashboard',
        note: 'Firm tier, status, employee + active counts, coverage bar.',
      },
      {
        label: '2. Firm employees directory',
        role: 'member_firm_admin',
        path: '/firm/employees',
        note: 'List of every member linked to this firm with full profile + status. Powered by RLS SECURITY DEFINER helper.',
      },
    ],
  },
  {
    id: 'admin-overview',
    kicker: 'Admin',
    title: 'PWMA admin home',
    description:
      'Single place where PWMA staff see all queues at a glance with live counts.',
    steps: [
      {
        label: '1. Admin dashboard',
        role: 'pwma_admin',
        path: '/admin/dashboard',
        note: 'Live counts: members pending, profile changes, firm apps. Single-pane queue view.',
      },
    ],
  },
]

const ROUTE_SECTIONS: Section[] = [
  {
    title: 'Public',
    routes: [
      { path: '/', label: 'Landing' },
      { path: '/about', label: 'About' },
      { path: '/apply-firm', label: 'Apply as firm (WF1)', autofillable: true },
      { path: '/apply-firm/thanks', label: 'Firm apply thanks' },
    ],
  },
  {
    title: 'Auth',
    routes: [
      { path: '/sign-in', label: 'Sign in', autofillable: true },
      { path: '/sign-up', label: 'Sign up (chooser)' },
      { path: '/verify', label: 'Verify email (info)' },
      { path: '/reset-password', label: 'Reset password', autofillable: true },
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
      { path: '/register/guest', label: 'Register — guest', autofillable: true },
    ],
  },
  {
    title: 'Member',
    routes: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/profile', label: 'My profile' },
      { path: '/renewal', label: 'Renewal (WF3)' },
    ],
  },
  {
    title: 'Firm admin',
    routes: [
      { path: '/firm/dashboard', label: 'Firm dashboard' },
      { path: '/firm/employees', label: 'Employees list' },
    ],
  },
  {
    title: 'PWMA admin',
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

type Tab = 'stories' | 'routes'

export function DevNav() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('stories')
  const [activeRole, setActiveRole] = useState<Role | null>(() =>
    typeof window === 'undefined' ? null : getStoredDemoRole(),
  )
  const [expandedStory, setExpandedStory] = useState<string | null>(STORIES[0]!.id)
  const [expandedSection, setExpandedSection] = useState<string | null>(
    ROUTE_SECTIONS[0]!.title,
  )
  const [resetArmed, setResetArmed] = useState(false)
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

  function runStep(step: StoryStep) {
    if (step.role !== undefined) {
      if (step.role === null) {
        clearDemoSession()
        setActiveRole(null)
      } else {
        setDemoSession(step.role)
        setActiveRole(step.role)
      }
    }
    const target = step.autofill ? `${step.path}?demo=1` : step.path
    // Defer navigate so the session state update commits before any layout
    // guard reads it. Without this defer, AuthLayout (still mounted because
    // URL hasn't changed yet) sees status flip to authenticated and tries to
    // redirect to /dashboard, which then cascades through MemberLayout to
    // /admin/dashboard (or wherever the role-aware redirect lands), winning
    // the race against the navigate call here.
    setTimeout(() => navigate(target), 0)
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
          className="bg-background border-foreground/10 fixed right-4 bottom-20 z-[100] flex max-h-[85vh] w-[420px] flex-col overflow-hidden rounded-2xl border shadow-2xl"
        >
          <header className="border-foreground/10 flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-medium tracking-tight">Demo Console</h2>
              <p className="text-foreground/65 mt-0.5 text-xs">
                Dev-only.{' '}
                {isMockSupabase ? (
                  <span className="bg-foreground/5 text-foreground/80 rounded px-1.5 py-0.5">
                    mock backend
                  </span>
                ) : (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900">
                    live Supabase
                  </span>
                )}
              </p>
            </div>
            {isMockSupabase && (
              <Button
                size="sm"
                variant={resetArmed ? 'destructive' : 'outline'}
                onClick={() => {
                  if (!resetArmed) {
                    setResetArmed(true)
                    setTimeout(() => setResetArmed(false), 3000)
                    return
                  }
                  resetMockDb()
                  reloadMockDb()
                  clearDemoSession()
                  setActiveRole(null)
                  window.location.reload()
                }}
              >
                {resetArmed ? 'Click again to confirm' : 'Reset data'}
              </Button>
            )}
          </header>

          {/* Tab switcher */}
          <div className="border-foreground/10 flex border-b px-2">
            <button
              type="button"
              onClick={() => setTab('stories')}
              className={cn(
                'flex-1 px-3 py-2.5 text-xs font-medium tracking-wide transition-colors',
                tab === 'stories'
                  ? 'text-foreground border-foreground border-b-2'
                  : 'text-foreground/50 hover:text-foreground',
              )}
            >
              Demo flows
            </button>
            <button
              type="button"
              onClick={() => setTab('routes')}
              className={cn(
                'flex-1 px-3 py-2.5 text-xs font-medium tracking-wide transition-colors',
                tab === 'routes'
                  ? 'text-foreground border-foreground border-b-2'
                  : 'text-foreground/50 hover:text-foreground',
              )}
            >
              All routes
            </button>
          </div>

          {/* Active session indicator (always visible) */}
          <section className="border-foreground/10 bg-foreground/[0.02] border-b px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground/65 text-[10px] tracking-[0.04em] uppercase">
                Acting as
              </span>
              <span className="text-xs font-medium">
                {activeRole
                  ? ROLES.find((r) => r.value === activeRole)?.label
                  : 'Anon visitor'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleRoleChange(null)}
                className={cn(
                  'rounded-full border px-2.5 py-1 text-[11px] tracking-wide transition-colors',
                  activeRole === null
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-foreground/20 hover:border-foreground/50',
                )}
              >
                Anon
              </button>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleRoleChange(r.value)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[11px] tracking-wide transition-colors',
                    activeRole === r.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'border-foreground/20 hover:border-foreground/50',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          {/* Tab content */}
          {tab === 'stories' ? (
            <section className="flex-1 overflow-auto px-3 py-3">
              <div className="space-y-2">
                {STORIES.map((story, idx) => {
                  const expanded = expandedStory === story.id
                  return (
                    <div
                      key={story.id}
                      className="border-foreground/10 rounded-xl border"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedStory(expanded ? null : story.id)}
                        className="hover:bg-foreground/[0.03] flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className="text-foreground/50 text-[10px] tracking-[0.04em] uppercase">
                              Story {String.fromCharCode(65 + idx)} · {story.kicker}
                            </span>
                          </div>
                          <p className="text-sm font-medium tracking-tight">
                            {story.title}
                          </p>
                          {!expanded && (
                            <p className="text-foreground/50 mt-1 line-clamp-2 text-xs">
                              {story.description}
                            </p>
                          )}
                        </div>
                        {expanded ? (
                          <ChevronUp className="text-foreground/50 mt-0.5 h-4 w-4 shrink-0" />
                        ) : (
                          <ChevronDown className="text-foreground/50 mt-0.5 h-4 w-4 shrink-0" />
                        )}
                      </button>
                      {expanded && (
                        <>
                          <p className="text-foreground/65 -mt-1 px-4 pb-3 text-xs leading-relaxed">
                            {story.description}
                          </p>
                          <ol className="border-foreground/10 divide-foreground/5 divide-y border-t">
                            {story.steps.map((step, sIdx) => {
                              const active =
                                location.pathname === step.path &&
                                (step.role === undefined || step.role === activeRole)
                              return (
                                <li
                                  key={sIdx}
                                  className={cn(
                                    'flex flex-col gap-1.5 px-4 py-3',
                                    active && 'bg-foreground/[0.04]',
                                  )}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-medium tracking-tight">
                                      {step.label}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => runStep(step)}
                                      className="bg-foreground text-background shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide transition-opacity hover:opacity-90"
                                    >
                                      Run
                                    </button>
                                  </div>
                                  {step.note && (
                                    <p className="text-foreground/55 text-[11px] leading-relaxed">
                                      {step.note}
                                    </p>
                                  )}
                                  <p className="text-foreground/40 font-mono text-[10px]">
                                    {step.role === null
                                      ? 'as anon · '
                                      : step.role
                                        ? `as ${ROLES.find((r) => r.value === step.role)?.label} · `
                                        : ''}
                                    {step.path}
                                    {step.autofill ? ' (autofill)' : ''}
                                  </p>
                                </li>
                              )
                            })}
                          </ol>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ) : (
            <section className="flex-1 overflow-auto px-3 py-3">
              <div className="space-y-2">
                {ROUTE_SECTIONS.map((s) => {
                  const expanded = expandedSection === s.title
                  return (
                    <div key={s.title} className="border-foreground/10 rounded-xl border">
                      <button
                        type="button"
                        onClick={() => setExpandedSection(expanded ? null : s.title)}
                        className="hover:bg-foreground/[0.03] flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors"
                      >
                        <span>{s.title}</span>
                        {expanded ? (
                          <ChevronUp className="text-foreground/50 h-4 w-4" />
                        ) : (
                          <ChevronDown className="text-foreground/50 h-4 w-4" />
                        )}
                      </button>
                      {expanded && (
                        <ul className="border-foreground/10 divide-foreground/5 divide-y border-t">
                          {s.routes.map((r) => {
                            const active = location.pathname === r.path
                            return (
                              <li
                                key={r.path}
                                className={cn(
                                  'flex flex-col gap-1 px-4 py-2.5',
                                  active && 'bg-foreground/[0.04]',
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm">{r.label}</p>
                                    <p className="text-foreground/50 truncate font-mono text-[10px]">
                                      {r.path}
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 gap-1">
                                    <button
                                      type="button"
                                      onClick={() => go(r.path)}
                                      className="border-foreground/20 hover:border-foreground/50 rounded-full border px-2.5 py-1 text-[11px] transition-colors"
                                    >
                                      Go
                                    </button>
                                    {r.autofillable && (
                                      <button
                                        type="button"
                                        onClick={() => go(r.path, true)}
                                        className="bg-foreground text-background rounded-full px-2.5 py-1 text-[11px] transition-opacity hover:opacity-90"
                                      >
                                        Go + fill
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {r.note && (
                                  <p className="text-foreground/50 text-[10px]">
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
          )}

          <footer className="text-foreground/55 border-foreground/10 border-t px-5 py-2.5 text-[10px]">
            Hidden in production.{' '}
            <Link to="/" className="underline underline-offset-4">
              Go to landing
            </Link>
          </footer>
        </aside>
      )}
    </>
  )
}
