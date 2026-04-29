import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bug, ChevronDown, ChevronUp } from 'lucide-react'

import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { useTr } from '@/components/ui/tr'
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
  zhLabel: string
  autofillable?: boolean
  note?: string
  zhNote?: string
}

interface Section {
  title: string
  zhTitle: string
  routes: RouteSpec[]
}

interface StoryStep {
  label: string
  zhLabel: string
  /**
   * Demo session role to set before navigating. `null` clears the session
   * (anon visitor). Omit to leave the current role untouched.
   */
  role?: Role | null
  path: string
  autofill?: boolean
  note?: string
  zhNote?: string
}

interface Story {
  id: string
  title: string
  zhTitle: string
  kicker: string
  description: string
  zhDescription: string
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
    zhTitle: '新機構入會',
    description:
      'Public firm submits application; PWMA admin reviews and approves; firm + admin account auto-created.',
    zhDescription: '公開機構提交申請；PWMA 管理員審批；機構同管理員帳戶自動建立。',
    steps: [
      {
        label: '1. Visitor opens public application form',
        zhLabel: '1. 訪客打開公開申請表',
        role: null,
        path: '/apply-firm',
        autofill: true,
        note: 'Form auto-fills with demo firm data. Walk through the 3 sections, then submit.',
        zhNote: '表格會自動填入示範機構資料。逐個 section 行一遍，然後提交。',
      },
      {
        label: '2. Confirmation page',
        zhLabel: '2. 確認頁',
        role: null,
        path: '/apply-firm/thanks',
        note: '"Application received" page. Talk through what happens next: M365 email, admin review.',
        zhNote: '「申請已收到」頁面。介紹下一步：M365 電郵、管理員審批。',
      },
      {
        label: '3. PWMA admin reviews the queue',
        zhLabel: '3. PWMA 管理員處理佇列',
        role: 'pwma_admin',
        path: '/admin/firm-applications',
        note: 'Click Approve on the row submitted in step 1. Toast + status flips to Approved.',
        zhNote: '喺第 1 步提交嘅申請點「批准」。Toast 出現，狀態轉為「已批准」。',
      },
    ],
  },
  {
    id: 'individual-registration',
    kicker: 'WF2',
    title: 'New individual member registration',
    zhTitle: '新個人會員註冊',
    description:
      'Visitor signs up as individual member; PWMA admin approves; member signs in.',
    zhDescription: '訪客以個人會員身份註冊；PWMA 管理員批核；會員登入。',
    steps: [
      {
        label: '1. Visitor opens sign-up chooser',
        zhLabel: '1. 訪客打開註冊選擇頁',
        role: null,
        path: '/sign-up',
        note: 'Three options: Individual, Guest, Apply as a firm. Select Individual.',
        zhNote: '三個選項：個人、訪客、機構申請。揀「個人」。',
      },
      {
        label: '2. Fill individual registration form',
        zhLabel: '2. 填寫個人註冊表',
        role: null,
        path: '/register/individual',
        autofill: true,
        note: 'Auto-fills with demo data. 3 sections: identity, contact, security. Submit.',
        zhNote: '自動填入示範資料。共 3 個 section：身份、聯絡、保安。提交。',
      },
      {
        label: '3. Email verification info page',
        zhLabel: '3. 電郵核實提示頁',
        role: null,
        path: '/verify',
        note: '"Check your email" explainer. In production, M365 sends the verify link.',
        zhNote: '「請查閱電郵」嘅提示頁。實際運行時，M365 會發核實連結。',
      },
      {
        label: '4. Visitor opens Gmail and reads the email',
        zhLabel: '4. 訪客打開 Gmail 查閱電郵',
        role: null,
        path: '/demo/gmail',
        note: 'Mocked Gmail interface showing the verification email PWMA sends. Click the "Verify email" button inside the email to advance.',
        zhNote:
          '模擬 Gmail 介面，展示 PWMA 發出嘅核實電郵。點擊電郵入面嘅「核實電郵」按鈕繼續。',
      },
      {
        label: '5. Visitor clicks the verification link',
        zhLabel: '5. 訪客點擊核實連結',
        role: null,
        path: '/verify/confirmed',
        note: 'Lands on the confirmation page: account created, email confirmed, awaiting PWMA approval.',
        zhNote: '落到確認頁：帳戶已建立、電郵已確認、等待 PWMA 批核。',
      },
      {
        label: '6. PWMA admin reviews the queue',
        zhLabel: '6. PWMA 管理員處理佇列',
        role: 'pwma_admin',
        path: '/admin/approvals',
        note: 'See the pending member. Click Approve. Status flips to Active.',
        zhNote: '睇到待批核會員。點「批准」。狀態轉為「啟用中」。',
      },
      {
        label: '7. Member signs in to their dashboard',
        zhLabel: '7. 會員登入儀表板',
        role: 'individual_member',
        path: '/dashboard',
        note: 'Status: Active. Member sees the welcome view.',
        zhNote: '狀態：啟用中。會員睇到歡迎頁。',
      },
    ],
  },
  {
    id: 'profile-change',
    kicker: 'WF5',
    title: 'Profile change request (critical field)',
    zhTitle: '資料修改申請（受保護欄位）',
    description:
      'Member submits a change request for a critical field; PWMA admin approves; field updates.',
    zhDescription: '會員為受保護欄位提交修改申請；PWMA 管理員批核；欄位更新。',
    steps: [
      {
        label: '1. Member opens their profile',
        zhLabel: '1. 會員打開個人資料',
        role: 'individual_member',
        path: '/profile',
        note: 'Show critical fields (locked) and editable fields (inline). Click Request change on Legal name.',
        zhNote:
          '展示受保護欄位（鎖定）同可編輯欄位（即場改）。喺「法定全名」點「申請修改」。',
      },
      {
        label: '2. PWMA admin reviews the queue',
        zhLabel: '2. PWMA 管理員處理佇列',
        role: 'pwma_admin',
        path: '/admin/profile-changes',
        note: 'See the pending request with old → new value. Click Approve.',
        zhNote: '睇到待批核申請（舊值 → 新值）。點「批准」。',
      },
      {
        label: '3. Member sees updated field',
        zhLabel: '3. 會員睇到更新後嘅欄位',
        role: 'individual_member',
        path: '/profile',
        note: 'Field is now updated. Approval audit trail captured.',
        zhNote: '欄位已更新。批核紀錄已保存。',
      },
    ],
  },
  {
    id: 'firm-admin-view',
    kicker: 'SOW 2.09',
    title: 'Firm admin consolidated view',
    zhTitle: '機構管理員整合視圖',
    description:
      'Firm admin signs in and sees the firm summary plus the directory of all firm members.',
    zhDescription: '機構管理員登入後睇到機構概要同所有員工名冊。',
    steps: [
      {
        label: '1. Firm admin dashboard',
        zhLabel: '1. 機構儀表板',
        role: 'member_firm_admin',
        path: '/firm/dashboard',
        note: 'Firm tier, status, employee + active counts, coverage bar.',
        zhNote: '機構等級、狀態、員工數同啟用人數、覆蓋率。',
      },
      {
        label: '2. Firm employees directory',
        zhLabel: '2. 員工名冊',
        role: 'member_firm_admin',
        path: '/firm/employees',
        note: 'List of every member linked to this firm with full profile + status. Powered by RLS SECURITY DEFINER helper.',
        zhNote: '機構內每位員工嘅完整資料同狀態，由 RLS SECURITY DEFINER helper 提供。',
      },
    ],
  },
  {
    id: 'admin-overview',
    kicker: 'Admin',
    title: 'PWMA admin home',
    zhTitle: 'PWMA 管理員首頁',
    description:
      'Single place where PWMA staff see all queues at a glance with live counts.',
    zhDescription: 'PWMA 同事一個位睇晒所有佇列同即時數字。',
    steps: [
      {
        label: '1. Admin dashboard',
        zhLabel: '1. 管理員儀表板',
        role: 'pwma_admin',
        path: '/admin/dashboard',
        note: 'Live counts: members pending, profile changes, firm apps. Single-pane queue view.',
        zhNote: '即時數字：待批會員、資料修改、機構申請。集中佇列視圖。',
      },
    ],
  },
]

const ROUTE_SECTIONS: Section[] = [
  {
    title: 'Public',
    zhTitle: '公開',
    routes: [
      { path: '/', label: 'Landing', zhLabel: '首頁' },
      { path: '/about', label: 'About', zhLabel: '關於' },
      {
        path: '/apply-firm',
        label: 'Apply as firm (WF1)',
        zhLabel: '機構申請 (WF1)',
        autofillable: true,
      },
      {
        path: '/apply-firm/thanks',
        label: 'Firm apply thanks',
        zhLabel: '機構申請已提交',
      },
    ],
  },
  {
    title: 'Auth',
    zhTitle: '登入認證',
    routes: [
      { path: '/sign-in', label: 'Sign in', zhLabel: '登入', autofillable: true },
      { path: '/sign-up', label: 'Sign up (chooser)', zhLabel: '註冊（選擇頁）' },
      { path: '/verify', label: 'Verify email (info)', zhLabel: '核實電郵（提示頁）' },
      {
        path: '/verify/confirmed',
        label: 'Verify confirmed',
        zhLabel: '核實成功',
      },
      {
        path: '/demo/gmail',
        label: 'Mock Gmail (demo)',
        zhLabel: '模擬 Gmail（示範）',
      },
      {
        path: '/reset-password',
        label: 'Reset password',
        zhLabel: '重設密碼',
        autofillable: true,
      },
      {
        path: '/auth/callback',
        label: 'Auth callback (transient)',
        zhLabel: '認證 callback（過渡頁）',
      },
    ],
  },
  {
    title: 'Register',
    zhTitle: '註冊',
    routes: [
      {
        path: '/register/individual',
        label: 'Register — individual',
        zhLabel: '註冊—個人',
        autofillable: true,
      },
      {
        path: '/register/guest',
        label: 'Register — guest',
        zhLabel: '註冊—訪客',
        autofillable: true,
      },
    ],
  },
  {
    title: 'Member',
    zhTitle: '會員',
    routes: [
      { path: '/dashboard', label: 'Dashboard', zhLabel: '總覽' },
      { path: '/profile', label: 'My profile', zhLabel: '個人資料' },
      { path: '/renewal', label: 'Renewal (WF3)', zhLabel: '續期 (WF3)' },
    ],
  },
  {
    title: 'Firm admin',
    zhTitle: '機構管理員',
    routes: [
      { path: '/firm/dashboard', label: 'Firm dashboard', zhLabel: '機構儀表板' },
      { path: '/firm/employees', label: 'Employees list', zhLabel: '員工名冊' },
    ],
  },
  {
    title: 'PWMA admin',
    zhTitle: 'PWMA 管理員',
    routes: [
      { path: '/admin/dashboard', label: 'Admin dashboard', zhLabel: '管理員儀表板' },
      { path: '/admin/approvals', label: 'Member approvals', zhLabel: '會員批核' },
      {
        path: '/admin/profile-changes',
        label: 'Profile changes',
        zhLabel: '資料修改',
      },
      {
        path: '/admin/firm-applications',
        label: 'Firm applications',
        zhLabel: '機構申請',
      },
    ],
  },
]

const ROLES: { value: Role; label: string; zhLabel: string }[] = [
  { value: 'individual_member', label: 'Individual', zhLabel: '個人會員' },
  { value: 'member_firm_admin', label: 'Firm admin', zhLabel: '機構管理員' },
  { value: 'pwma_admin', label: 'PWMA admin', zhLabel: 'PWMA 管理員' },
  { value: 'guest', label: 'Guest', zhLabel: '訪客' },
]

type Tab = 'stories' | 'routes'

export function DevNav() {
  const t = useTr()
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
  // Tracks which story step the demo is "on right now". Set when the user
  // clicks Run on a step (or via Cmd+→). Drives the top-left step indicator
  // and the keyboard step advance.
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const [activeStepIndex, setActiveStepIndex] = useState(-1)
  // True after the active step has been autofilled (mode='fill' was used).
  // We track this in state because useDemoAutofill strips ?demo=1 from the
  // URL after applying it, so we can't read filled state off the URL.
  const [activeStepFilled, setActiveStepFilled] = useState(false)
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

  // mode = 'arrive': navigate to step.path with NO autofill (empty form).
  // mode = 'fill':   navigate to step.path?demo=1 to trigger autofill.
  // For non-autofill steps, the two are equivalent.
  function runStoryStep(
    storyId: string,
    stepIdx: number,
    mode: 'arrive' | 'fill' = 'arrive',
  ) {
    const story = STORIES.find((s) => s.id === storyId)
    if (!story) return
    if (stepIdx < 0 || stepIdx >= story.steps.length) return
    const step = story.steps[stepIdx]!
    setActiveStoryId(storyId)
    setActiveStepIndex(stepIdx)
    setActiveStepFilled(mode === 'fill' && !!step.autofill)
    if (step.role !== undefined) {
      if (step.role === null) {
        clearDemoSession()
        setActiveRole(null)
      } else {
        setDemoSession(step.role)
        setActiveRole(step.role)
      }
    }
    // Autofill steps signal via ?demo=0|1 so useDemoAutofill can clear or
    // fill in place. Non-autofill steps just navigate to the bare path.
    let target: string
    if (step.autofill) {
      target = mode === 'fill' ? `${step.path}?demo=1` : `${step.path}?demo=0`
    } else {
      target = step.path
    }
    // Defer navigate so the session state update commits before any layout
    // guard reads it.
    setTimeout(() => navigate(target), 0)
  }

  // Smart forward step: if the active step has autofill and hasn't been
  // filled yet, the next forward action fills in place. Otherwise advance
  // to the next step (arrive mode = empty form).
  function advance() {
    if (activeStoryId === null) return false
    const story = STORIES.find((s) => s.id === activeStoryId)
    if (!story) return false
    const step = story.steps[activeStepIndex]
    if (!step) return false
    if (step.autofill && !activeStepFilled) {
      runStoryStep(activeStoryId, activeStepIndex, 'fill')
      return true
    }
    if (activeStepIndex + 1 < story.steps.length) {
      runStoryStep(activeStoryId, activeStepIndex + 1, 'arrive')
      return true
    }
    return false
  }

  // Smart back step: if the active autofill step has been filled, un-fill
  // (re-run in arrive mode = empty form). Otherwise go back one step.
  function retreat() {
    if (activeStoryId === null) return false
    const story = STORIES.find((s) => s.id === activeStoryId)
    if (!story) return false
    const step = story.steps[activeStepIndex]
    if (!step) return false
    if (step.autofill && activeStepFilled) {
      runStoryStep(activeStoryId, activeStepIndex, 'arrive')
      return true
    }
    if (activeStepIndex > 0) {
      runStoryStep(activeStoryId, activeStepIndex - 1, 'arrive')
      return true
    }
    return false
  }

  // Global keyboard shortcuts:
  //   Cmd/Ctrl + J             toggle the Demo Console
  //   Cmd/Ctrl + ArrowRight    next step in the active story
  //   Cmd/Ctrl + ArrowLeft     previous step
  //   Cmd/Ctrl + ArrowDown     jump to next story (run step 1)
  //   Cmd/Ctrl + ArrowUp       jump to previous story (run step 1)
  // Arrow shortcuts ignored while typing in a form field so they don't
  // fight cursor navigation.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      const key = e.key.toLowerCase()
      const target = e.target as HTMLElement | null
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if (key === 'j') {
        e.preventDefault()
        setOpen((v) => !v)
        return
      }
      if (typing) return

      const currentStoryIdx =
        activeStoryId !== null ? STORIES.findIndex((s) => s.id === activeStoryId) : -1

      if (e.key === 'ArrowRight' && activeStoryId !== null) {
        if (advance()) e.preventDefault()
      } else if (e.key === 'ArrowLeft' && activeStoryId !== null) {
        if (retreat()) e.preventDefault()
      } else if (e.key === 'ArrowDown') {
        // Next story — wraps from last to first. If no active story, start at A.
        const nextIdx = currentStoryIdx < 0 ? 0 : (currentStoryIdx + 1) % STORIES.length
        e.preventDefault()
        const nextStory = STORIES[nextIdx]
        if (nextStory) {
          setExpandedStory(nextStory.id)
          runStoryStep(nextStory.id, 0)
        }
      } else if (e.key === 'ArrowUp') {
        const prevIdx =
          currentStoryIdx < 0
            ? STORIES.length - 1
            : (currentStoryIdx - 1 + STORIES.length) % STORIES.length
        e.preventDefault()
        const prevStory = STORIES[prevIdx]
        if (prevStory) {
          setExpandedStory(prevStory.id)
          runStoryStep(prevStory.id, 0)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoryId, activeStepIndex])

  function go(path: string, autofill = false) {
    const target = autofill ? `${path}?demo=1` : path
    navigate(target)
    setOpen(false)
  }

  function roleLabel(role: Role): string {
    const r = ROLES.find((x) => x.value === role)
    return r ? t(r.label, r.zhLabel) : role
  }

  // Resolve the active story + step for the top-left indicator pill.
  const activeStory =
    activeStoryId !== null ? STORIES.find((s) => s.id === activeStoryId) : null
  const activeStep =
    activeStory && activeStepIndex >= 0 ? activeStory.steps[activeStepIndex] : null
  const activeStoryLetter = activeStory
    ? String.fromCharCode(65 + STORIES.findIndex((s) => s.id === activeStory.id))
    : ''
  const canPrev =
    activeStoryId !== null &&
    activeStory !== null &&
    activeStory !== undefined &&
    // Either un-fill is possible, or there's a previous step.
    ((activeStep?.autofill && activeStepFilled) || activeStepIndex > 0)
  const canNext =
    activeStory !== null &&
    activeStory !== undefined &&
    // Either fill is possible, or there's a next step.
    ((activeStep?.autofill && !activeStepFilled) ||
      activeStepIndex + 1 < activeStory.steps.length)
  const nextActionIsFill = !!activeStep?.autofill && !activeStepFilled

  return (
    <div className="fixed top-4 left-4 z-[100] flex max-h-[calc(100vh-2rem)] w-[420px] flex-col gap-2">
      {/* Toggle bar — always visible. Doubles as the "active step" indicator
          when a story step is running. Click anywhere except the inner
          buttons to expand/collapse the panel. */}
      <div
        className="bg-background border-foreground/12 group hover:bg-foreground/[0.02] flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-2 shadow-[0_2px_24px_-8px_rgba(22,32,64,0.12)] transition-colors"
        role="button"
        tabIndex={0}
        aria-label={
          open
            ? t('Collapse Demo Console', '收起示範控制台')
            : t('Expand Demo Console', '展開示範控制台')
        }
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
      >
        {activeStep && activeStory ? (
          <>
            <span
              className="bg-foreground ml-1 inline-block h-2 w-2 shrink-0"
              aria-hidden="true"
            />
            <span className="text-foreground/55 shrink-0 font-mono text-[10px] tracking-wide uppercase">
              {t('Story', '故事')} {activeStoryLetter} · {activeStepIndex + 1}/
              {activeStory.steps.length}
            </span>
            <span className="text-foreground/20 shrink-0">·</span>
            <span className="text-foreground min-w-0 flex-1 truncate text-xs font-medium tracking-tight">
              {t(activeStep.label, activeStep.zhLabel)}
            </span>
            <div className="border-foreground/10 flex shrink-0 items-center gap-0.5 border-l pl-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  retreat()
                }}
                disabled={!canPrev}
                aria-label={t('Previous', '上一步')}
                className="text-foreground/55 hover:text-foreground hover:bg-foreground/5 rounded-full px-1.5 py-0.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  advance()
                }}
                disabled={!canNext}
                aria-label={nextActionIsFill ? t('Fill', '填寫') : t('Next', '下一步')}
                className="text-foreground/55 hover:text-foreground hover:bg-foreground/5 rounded-full px-1.5 py-0.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-30"
              >
                ›
              </button>
            </div>
          </>
        ) : (
          <>
            <span
              className="bg-foreground text-background ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              aria-hidden="true"
            >
              <Bug className="h-3 w-3" />
            </span>
            <span className="text-foreground min-w-0 flex-1 text-xs font-medium tracking-tight">
              {t('Demo Console', '示範控制台')}
            </span>
            <span className="text-foreground/40 shrink-0 font-mono text-[10px]">⌘J</span>
          </>
        )}
        <span
          className="text-foreground/40 ml-0.5 shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          aria-hidden="true"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </span>
      </div>

      {open && (
        <aside
          role="dialog"
          aria-label={t('Demo Console', '示範控制台')}
          className="bg-background border-foreground/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-2xl"
        >
          <header className="border-foreground/10 flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-base font-medium tracking-tight">
                {t('Demo Console', '示範控制台')}
              </h2>
              <p className="text-foreground/65 mt-0.5 text-xs">
                {t('Dev-only.', '僅供開發。')}{' '}
                {isMockSupabase ? (
                  <span className="bg-foreground/5 text-foreground/80 rounded px-1.5 py-0.5">
                    {t('mock backend', '模擬後端')}
                  </span>
                ) : (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-900">
                    {t('live Supabase', '連線 Supabase')}
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
                {resetArmed
                  ? t('Click again to confirm', '再點一次確認')
                  : t('Reset data', '重置資料')}
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
              {t('Demo flows', '示範流程')}
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
              {t('All routes', '所有路徑')}
            </button>
          </div>

          {/* Active session indicator (always visible) */}
          <section className="border-foreground/10 bg-foreground/[0.02] border-b px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-foreground/65 text-[10px] tracking-[0.04em] uppercase">
                {t('Acting as', '目前身份')}
              </span>
              <span className="text-xs font-medium">
                {activeRole ? roleLabel(activeRole) : t('Anon visitor', '匿名訪客')}
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
                {t('Anon', '匿名')}
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
                  {t(r.label, r.zhLabel)}
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
                              {t('Story', '故事')} {String.fromCharCode(65 + idx)} ·{' '}
                              {story.kicker}
                            </span>
                          </div>
                          <p className="text-sm font-medium tracking-tight">
                            {t(story.title, story.zhTitle)}
                          </p>
                          {!expanded && (
                            <p className="text-foreground/50 mt-1 line-clamp-2 text-xs">
                              {t(story.description, story.zhDescription)}
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
                            {t(story.description, story.zhDescription)}
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
                                      {t(step.label, step.zhLabel)}
                                    </p>
                                    <div className="flex shrink-0 gap-1">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          runStoryStep(story.id, sIdx, 'arrive')
                                        }
                                        className="border-foreground/20 hover:border-foreground/50 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors"
                                      >
                                        {step.autofill
                                          ? t('Open', '前往')
                                          : t('Run', '執行')}
                                      </button>
                                      {step.autofill && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            runStoryStep(story.id, sIdx, 'fill')
                                          }
                                          className="bg-foreground text-background rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-90"
                                        >
                                          {t('Fill', '填寫')}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  {step.note && (
                                    <p className="text-foreground/55 text-[11px] leading-relaxed">
                                      {t(step.note, step.zhNote ?? step.note)}
                                    </p>
                                  )}
                                  <p className="text-foreground/40 font-mono text-[10px]">
                                    {step.role === null
                                      ? `${t('as anon', '以匿名訪客')} · `
                                      : step.role
                                        ? `${t('as', '以')} ${roleLabel(step.role)} · `
                                        : ''}
                                    {step.path}
                                    {step.autofill
                                      ? ` ${t('(autofill)', '（自動填）')}`
                                      : ''}
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
                        <span>{t(s.title, s.zhTitle)}</span>
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
                                    <p className="truncate text-sm">
                                      {t(r.label, r.zhLabel)}
                                    </p>
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
                                      {t('Go', '前往')}
                                    </button>
                                    {r.autofillable && (
                                      <button
                                        type="button"
                                        onClick={() => go(r.path, true)}
                                        className="bg-foreground text-background rounded-full px-2.5 py-1 text-[11px] transition-opacity hover:opacity-90"
                                      >
                                        {t('Go + fill', '前往 + 自動填')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {r.note && (
                                  <p className="text-foreground/50 text-[10px]">
                                    {t(r.note, r.zhNote ?? r.note)}
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

          <footer className="text-foreground/55 border-foreground/10 flex items-center justify-between gap-2 border-t px-5 py-2.5 text-[10px]">
            <span>
              {t('Hidden in production.', '正式環境會隱藏。')}{' '}
              <Link to="/" className="underline underline-offset-4">
                {t('Go to landing', '前往首頁')}
              </Link>
            </span>
            <span className="text-foreground/40 flex shrink-0 items-center gap-1.5 font-mono">
              <kbd className="border-foreground/15 rounded border px-1 py-0.5">⌘J</kbd>
              {t('toggle', '開關')}
              <span className="text-foreground/15">·</span>
              <kbd className="border-foreground/15 rounded border px-1 py-0.5">⌘→</kbd>
              {t('step', '步驟')}
              <span className="text-foreground/15">·</span>
              <kbd className="border-foreground/15 rounded border px-1 py-0.5">⌘↓</kbd>
              {t('story', '故事')}
            </span>
          </footer>
        </aside>
      )}
    </div>
  )
}
