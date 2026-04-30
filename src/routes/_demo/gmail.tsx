import { Link } from 'react-router-dom'
import { Tr, useTr } from '@/components/ui/tr'

/**
 * Mock Gmail interface for the live demo. Shows the "verify your email"
 * message we would send via M365 SMTP in production, opened as if the
 * user just clicked into it from the inbox. The CTA button links to
 * /verify/confirmed, which is what the real auth-callback hop lands on
 * after the token exchange.
 *
 * Standalone — no PWMA layout chrome — so the audience reads it as
 * "Gmail" not "the PWMA app".
 */
export function DemoGmailPage() {
  const t = useTr()
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f6f8fc] text-[#202124]">
      {/* Top bar */}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-[#e5e7eb] bg-white px-4">
        <button
          type="button"
          aria-label="Main menu"
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
        >
          <i className="ph ph-list text-xl" />
        </button>
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-7 w-9" aria-hidden="true">
            <path
              d="M22.05 5.555v12.72a1.5 1.5 0 0 1-1.5 1.5H17.7V9.555L12 13.83l-5.7-4.275V19.775H3.45a1.5 1.5 0 0 1-1.5-1.5V5.555a1.5 1.5 0 0 1 .525-1.155A1.5 1.5 0 0 1 3.45 4.05h.45L12 9.825l8.1-5.775h.45a1.5 1.5 0 0 1 .975.35 1.5 1.5 0 0 1 .525 1.155Z"
              fill="#ea4335"
            />
            <path
              d="M3.9 4.05 12 9.825V19.95l-5.7-4.275V9.555L3.9 11.55Z"
              fill="#fbbc05"
            />
            <path
              d="M20.1 4.05 12 9.825V19.95l5.7-4.275V9.555l2.4 1.995Z"
              fill="#34a853"
            />
            <path d="M12 9.825 3.9 4.05h.45L12 9.825 19.65 4.05h.45Z" fill="#c5221f" />
            <path d="M3.9 4.05 12 9.825 20.1 4.05" fill="none" />
          </svg>
          <span className="text-xl font-normal text-[#5f6368]">Gmail</span>
        </div>
        <div className="ml-6 flex h-12 max-w-[720px] flex-1 items-center gap-3 rounded-lg bg-[#eaf1fb] px-4 transition-colors focus-within:bg-white focus-within:shadow-sm">
          <i className="ph ph-magnifying-glass text-lg text-[#5f6368]" />
          <input
            type="text"
            placeholder={t('Search mail', '搜尋郵件')}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#5f6368]"
            defaultValue=""
          />
          <i className="ph ph-sliders text-lg text-[#5f6368]" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            aria-label="Apps"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
          >
            <i className="ph ph-squares-four text-xl" />
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a73e8] text-sm font-medium text-white"
            aria-label="Account"
          >
            D
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col gap-1 px-3 py-4">
          <button
            type="button"
            className="mb-3 flex items-center gap-4 self-start rounded-2xl bg-[#c2e7ff] px-6 py-4 text-sm font-medium text-[#001d35] shadow-sm hover:shadow"
          >
            <i className="ph ph-pencil-simple text-lg" />
            <Tr en="Compose" zh="撰寫" />
          </button>

          <SidebarItem icon="ph-tray" label="Inbox" zh="收件匣" badge="1" active />
          <SidebarItem icon="ph-star" label="Starred" zh="已加星標" />
          <SidebarItem icon="ph-clock" label="Snoozed" zh="已延後" />
          <SidebarItem icon="ph-paper-plane-tilt" label="Sent" zh="已寄出" />
          <SidebarItem icon="ph-file-text" label="Drafts" zh="草稿" badge="3" />
          <SidebarItem icon="ph-caret-down" label="More" zh="更多" />

          <div className="mt-6 px-4 text-xs font-medium text-[#5f6368]">
            <Tr en="Labels" zh="標籤" />
          </div>
          <SidebarItem icon="ph-tag" label="PWMA" zh="PWMA" />
          <SidebarItem icon="ph-tag" label="Receipts" zh="收據" />
        </aside>

        {/* Email view */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-white">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-[#e5e7eb] bg-white px-4 py-2">
            <Link
              to="/verify"
              aria-label={t('Back to inbox', '返回收件匣')}
              className="flex h-10 w-10 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4]"
            >
              <i className="ph ph-arrow-left text-lg" />
            </Link>
            <ToolbarBtn icon="ph-archive-box" label="Archive" />
            <ToolbarBtn icon="ph-warning-octagon" label="Report spam" />
            <ToolbarBtn icon="ph-trash" label="Delete" />
            <span className="mx-1 h-6 w-px bg-[#e5e7eb]" />
            <ToolbarBtn icon="ph-envelope" label="Mark unread" />
            <ToolbarBtn icon="ph-clock" label="Snooze" />
            <ToolbarBtn icon="ph-folder-simple-plus" label="Move" />
            <ToolbarBtn icon="ph-tag" label="Labels" />
            <span className="ml-auto flex items-center gap-2 text-xs text-[#5f6368]">
              1 of 1
              <ToolbarBtn icon="ph-caret-left" label="Newer" disabled />
              <ToolbarBtn icon="ph-caret-right" label="Older" disabled />
            </span>
          </div>

          {/* Subject */}
          <div className="border-b border-[#e5e7eb] px-12 py-6">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] leading-tight font-normal">
                <Tr
                  en="Verify your email — PWMA Membership"
                  zh="核實你嘅電郵 — PWMA 會籍"
                />
              </h1>
              <span className="rounded border border-[#e5e7eb] bg-[#f1f3f4] px-2 py-0.5 text-xs text-[#5f6368]">
                <Tr en="Inbox" zh="收件匣" />
              </span>
            </div>
          </div>

          {/* Sender row */}
          <div className="flex items-start gap-4 px-12 py-6">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#162040] text-sm font-medium text-white"
              aria-hidden="true"
            >
              P
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-medium">PWMA Membership</span>
                  <span className="ml-2 text-xs text-[#5f6368]">
                    &lt;no-reply@pwma.org.hk&gt;
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-[#5f6368]">
                  <span>{today}</span>
                  <i className="ph ph-star text-base" />
                  <i className="ph ph-arrow-bend-up-left text-base" />
                  <i className="ph ph-dots-three-vertical text-base" />
                </div>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-xs text-[#5f6368]">
                <Tr en="to me" zh="收件人：我" />
                <i className="ph ph-caret-down text-xs" />
              </div>
            </div>
          </div>

          {/* Email body — styled like a transactional email inside Gmail */}
          <div className="px-12 pb-16">
            <div className="mx-auto max-w-[600px] rounded-md border border-[#e5e7eb] bg-white p-10">
              {/* Brand */}
              <div className="mb-8 flex items-center gap-3">
                <div className="relative flex h-7 w-7 items-center justify-center">
                  <div className="absolute left-0 h-5 w-5 rounded-full border border-[#162040]" />
                  <div className="absolute right-0 h-5 w-5 rounded-full border border-[#162040] bg-white" />
                </div>
                <span className="text-base font-medium tracking-tight text-[#162040]">
                  PWMA MMS
                </span>
              </div>

              <h2 className="mb-3 text-2xl font-normal tracking-tight text-[#162040]">
                <Tr en="Confirm your email address" zh="確認你嘅電郵地址" />
              </h2>

              <p className="mb-6 text-sm leading-relaxed text-[#202124]">
                <Tr en="Hi Demo Member," zh="Demo Member 你好，" />
              </p>

              <p className="mb-6 text-sm leading-relaxed text-[#202124]">
                <Tr
                  en="Thanks for signing up to PWMA Membership. To finish creating your account, please confirm your email address by clicking the button below."
                  zh="多謝註冊 PWMA 會籍。為咗完成註冊，請點擊下方按鈕確認你嘅電郵地址。"
                />
              </p>

              <Link
                to="/verify/confirmed"
                className="my-6 inline-block rounded-full bg-[#162040] px-8 py-3.5 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
              >
                <Tr en="Verify email" zh="核實電郵" />
              </Link>

              <p className="mt-6 text-xs leading-relaxed text-[#5f6368]">
                <Tr
                  en="If the button doesn't work, paste this link into your browser:"
                  zh="如按鈕無法正常運作，請將以下連結貼到瀏覽器："
                />
                <br />
                <span className="font-mono text-[11px] break-all text-[#1a73e8]">
                  https://mms.pwma.org.hk/verify/confirmed?token=demo-7f9c3a&hellip;
                </span>
              </p>

              <p className="mt-6 text-xs leading-relaxed text-[#5f6368]">
                <Tr
                  en="This link expires in 24 hours. If you didn't sign up for PWMA Membership, you can safely ignore this email."
                  zh="此連結 24 小時後失效。若你未曾註冊 PWMA 會籍，可忽略此電郵。"
                />
              </p>

              <hr className="my-8 border-t border-[#e5e7eb]" />

              <p className="text-xs leading-relaxed text-[#5f6368]">
                Private Wealth Management Association
                <br />
                Suite 2102, 21/F, Two Pacific Place, 88 Queensway, Hong Kong
                <br />
                <a
                  href="https://www.pwma.org.hk"
                  className="text-[#1a73e8] no-underline hover:underline"
                >
                  www.pwma.org.hk
                </a>
              </p>
            </div>

            {/* Reply / Forward action row */}
            <div className="mx-auto mt-6 flex max-w-[600px] gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-2 text-sm text-[#202124] hover:bg-[#f1f3f4]"
              >
                <i className="ph ph-arrow-bend-up-left text-base" />
                <Tr en="Reply" zh="回覆" />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-2 text-sm text-[#202124] hover:bg-[#f1f3f4]"
              >
                <i className="ph ph-arrow-bend-up-right text-base" />
                <Tr en="Forward" zh="轉寄" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  zh,
  badge,
  active,
}: {
  icon: string
  label: string
  zh: string
  badge?: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={
        active
          ? 'flex items-center gap-4 rounded-r-full bg-[#d3e3fd] px-6 py-2 text-sm font-bold text-[#001d35]'
          : 'flex items-center gap-4 rounded-r-full px-6 py-2 text-sm text-[#202124] hover:bg-[#f1f3f4]'
      }
    >
      <i className={`ph ${icon} text-lg`} />
      <span className="flex-1 text-left">
        <Tr en={label} zh={zh} />
      </span>
      {badge && <span className="text-xs text-[#5f6368]">{badge}</span>}
    </button>
  )
}

function ToolbarBtn({
  icon,
  label,
  disabled,
}: {
  icon: string
  label: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <i className={`ph ${icon} text-lg`} />
    </button>
  )
}
