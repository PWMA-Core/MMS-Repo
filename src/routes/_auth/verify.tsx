import { Link } from 'react-router-dom'
import { Tr } from '@/components/ui/tr'
import { isMockSupabase } from '@/lib/supabase/client'

export function VerifyPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-10">
        <div className="label-small mb-3">
          <Tr en="Almost there" zh="即將完成" />
        </div>
        <h1 className="title-large">
          <Tr en="Check your email" zh="請查閱電郵" />
        </h1>
        <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
          <Tr
            en="We sent a verification link to your inbox. Click it to confirm your account, then wait for PWMA to approve your registration."
            zh="我哋已將核實連結發到你嘅電郵信箱。點擊後確認帳戶，再等 PWMA 批核你嘅申請。"
          />
        </p>
      </div>

      {/* Status — clear "submitted, in queue" signal so the demo arc reads
          as complete without a real email round-trip. */}
      <div className="border-foreground bg-foreground/[0.02] mb-6 rounded-2xl border p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="status-square status-solid h-3 w-3" />
          <span className="label-small">
            <Tr en="Submitted" zh="已提交" />
          </span>
        </div>
        <p className="text-sm font-medium tracking-tight">
          <Tr
            en="Your registration is in PWMA's review queue."
            zh="你嘅註冊申請已交到 PWMA 嘅審批佇列。"
          />
        </p>
        <p className="text-foreground/65 mt-1 text-xs leading-relaxed">
          <Tr
            en="Email auto-confirmed in this demo. In production, you'd click the link in the email to confirm before review begins."
            zh="此示範環境會自動確認電郵。實際運行時，你需要點擊電郵連結確認後，PWMA 先會開始審批。"
          />
        </p>
      </div>

      <div className="border-foreground/15 mb-6 rounded-2xl border p-5">
        <div className="flex items-start gap-3">
          <span className="status-square status-hatched mt-1.5" />
          <div className="flex-1">
            <p className="mb-1 text-sm font-medium">
              <Tr en="No email yet?" zh="未收到電郵？" />
            </p>
            <p className="text-foreground/65 text-xs leading-relaxed">
              <Tr
                en="Check your spam folder. If still nothing after a minute, try signing in again to trigger a resend prompt."
                zh="請先查閱垃圾郵件資料夾。如一分鐘後仍未收到，可嘗試重新登入以觸發重新發送。"
              />
            </p>
          </div>
        </div>
      </div>

      {isMockSupabase && (
        <div className="border-foreground/10 mb-6 flex items-center justify-between gap-4 rounded-2xl border border-dashed p-4">
          <p className="text-foreground/55 font-mono text-[10px] leading-relaxed">
            <Tr
              en="Demo mode · open Gmail to read the email PWMA just sent"
              zh="示範模式 · 開啟 Gmail 查閱 PWMA 剛剛發出嘅電郵"
            />
          </p>
          <Link to="/demo/gmail" className="nexus-pill-primary shrink-0">
            <i className="ph ph-envelope" aria-hidden="true" />
            <Tr en="Open Gmail" zh="開啟 Gmail" />
          </Link>
        </div>
      )}

      <p className="text-center text-sm">
        <Link
          to="/sign-in"
          className="text-foreground/65 hover:text-foreground underline underline-offset-4"
        >
          <Tr en="Back to sign-in" zh="返回登入" />
        </Link>
      </p>
    </div>
  )
}
